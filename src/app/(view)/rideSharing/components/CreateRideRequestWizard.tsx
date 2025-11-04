"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Package,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Navigation,
  UserCheck,
  Info,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { container } from 'tsyringe';
import { RideRequestController } from '@/app/(controller)/rideSharing/rideRequestController';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import { useSession } from "next-auth/react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

interface RequestFormData {
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  departureDate: string;
  departureTime: string;
  seatsNeeded: number;
  maxBudget: number;
  luggageRequirement: number;
  notes: string;
}

const steps = [
  { id: 1, title: 'Route', description: 'Where do you need to go?' },
  { id: 2, title: 'Schedule', description: 'When do you need to travel?' },
  { id: 3, title: 'Requirements', description: 'Seats, budget & preferences' },
  { id: 4, title: 'Submit', description: 'Review & submit request' }
];

export default function CreateRideRequestWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  // Map click functionality
  const [mapClickMode, setMapClickMode] = useState<'pickup' | 'dropoff' | null>(null);
  const modeRef = useRef<'pickup' | 'dropoff' | null>(null);
  const [pickupMarker, setPickupMarker] = useState<google.maps.Marker | null>(null);
  const [dropoffMarker, setDropoffMarker] = useState<google.maps.Marker | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<RequestFormData>({
    pickupLocation: null,
    dropoffLocation: null,
    departureDate: '',
    departureTime: '09:00',
    seatsNeeded: 1,
    maxBudget: 1000,
    luggageRequirement: 1,
    notes: ''
  });

  // Get today as minimum date
  const today = new Date().toISOString().split('T')[0];

  const updateMapWithLocations = useCallback((newLocation: LocationData, type: 'pickup' | 'dropoff') => {
    if (!map) return;

    // Create or update marker
    const marker = new window.google.maps.Marker({
      position: { lat: newLocation.lat, lng: newLocation.lng },
      map: map,
      title: type === 'pickup' ? 'Pickup Location' : 'Dropoff Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: type === 'pickup' ? '#10B981' : '#EF4444',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8
      }
    });

    // Remove old marker and update state
    if (type === 'pickup') {
      if (pickupMarker) pickupMarker.setMap(null);
      setPickupMarker(marker);
    } else {
      if (dropoffMarker) dropoffMarker.setMap(null);
      setDropoffMarker(marker);
    }

    // Fit bounds if both locations exist
    const pickupLoc = type === 'pickup' ? newLocation : formData.pickupLocation;
    const dropoffLoc = type === 'dropoff' ? newLocation : formData.dropoffLocation;

    if (pickupLoc && dropoffLoc) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(pickupLoc);
      bounds.extend(dropoffLoc);
      map.fitBounds(bounds);
    } else {
      map.setCenter({ lat: newLocation.lat, lng: newLocation.lng });
      map.setZoom(15);
    }
  }, [map, pickupMarker, dropoffMarker, formData.pickupLocation, formData.dropoffLocation]);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || map) return;

      // Center on Pakistan (between Islamabad and Lahore)
      const pakistanCenter = { lat: 32.0853, lng: 72.7033 };
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: pakistanCenter,
        zoom: 8,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const newGeocoder = new window.google.maps.Geocoder();

      // Add map click listener - copied from working browse listings
      newMap.addListener('click', (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const currentMode = modeRef.current;
        console.log(`Current mode: ${currentMode}, Location: lat ${lat}, lng ${lng}`);

        // Reverse geocode to get address
        newGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const address = result.formatted_address;
            
            // Check if the clicked location is in Pakistan (more flexible validation)
            const isValidLocation = result.address_components?.some(component => {
              const name = component.long_name.toLowerCase();
              const types = component.types;
              
              // Check for major Pakistani cities
              const majorCities = [
                'islamabad', 'lahore', 'karachi', 'peshawar', 'quetta', 
                'multan', 'faisalabad', 'rawalpindi', 'gujranwala', 'sialkot',
                'bahawalpur', 'sargodha', 'sukkur', 'larkana', 'hyderabad',
                'mardan', 'mingora', 'dera ghazi khan', 'sahiwal', 'okara',
                'wah cantonment', 'dera ismail khan', 'mirpur', 'gujrat',
                'sheikhupura', 'jhang', 'sadiqabad', 'abbottabad', 'kohat',
                'muridke', 'pak pattan', 'kasur', 'vehari', 'mandi bahauddin'
              ];
              
              // Check for Pakistani provinces/areas
              const provinces = [
                'punjab', 'sindh', 'khyber pakhtunkhwa', 'kpk', 'balochistan',
                'azad kashmir', 'gilgit-baltistan', 'islamabad capital territory'
              ];
              
              if (types.includes('locality') || types.includes('sublocality')) {
                return majorCities.some(city => name.includes(city) || city.includes(name));
              }
              
              if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
                return provinces.some(province => name.includes(province) || province.includes(name));
              }
              
              // Also check for Pakistan country
              if (types.includes('country')) {
                return name.includes('pakistan');
              }
              
              return false;
            });

            if (!isValidLocation) {
              alert('Please select a location within Pakistan.');
              return;
            }
            
            if (currentMode === 'pickup') {
              setFormData(prev => ({
                ...prev,
                pickupLocation: { lat, lng, address, placeId: result.place_id }
              }));
              if (pickupInputRef.current) {
                pickupInputRef.current.value = address;
              }
              setMapClickMode('dropoff');
              modeRef.current = 'dropoff';
              console.log('Switching to dropoff mode');
            } else if (currentMode === 'dropoff') {
              setFormData(prev => ({
                ...prev,
                dropoffLocation: { lat, lng, address, placeId: result.place_id }
              }));
              if (dropoffInputRef.current) {
                dropoffInputRef.current.value = address;
              }
              console.log('Setting dropoff location');
            }
          } else {
            console.error('Geocoding failed:', status);
            alert('Unable to determine location. Please try again.');
          }
        });
      });

      // Pakistan bounds (covering entire Pakistan)
      const pakistanBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(23.5, 60.0), // Southwest
        new window.google.maps.LatLng(37.0, 77.0)  // Northeast
      );

      // Setup autocomplete for pickup with location restrictions
      if (pickupInputRef.current) {
        const pickupAc = new window.google.maps.places.Autocomplete(pickupInputRef.current, {
          bounds: pakistanBounds,
          componentRestrictions: { country: 'pk' },
          strictBounds: false, // Make it less strict
          types: ['geocode'] // Allow more types of places
        });
        pickupAc.addListener('place_changed', () => {
          const place = pickupAc.getPlace();
          
          if (!place.geometry?.location) {
            console.error('No geometry found for place');
            return;
          }

          // Check if location is in Pakistan (more flexible validation)
          const isValidLocation = place.address_components?.some(component => {
            const name = component.long_name.toLowerCase();
            const types = component.types;
            
            // Check for major Pakistani cities
            const majorCities = [
              'islamabad', 'lahore', 'karachi', 'peshawar', 'quetta', 
              'multan', 'faisalabad', 'rawalpindi', 'gujranwala', 'sialkot',
              'bahawalpur', 'sargodha', 'sukkur', 'larkana', 'hyderabad',
              'mardan', 'mingora', 'dera ghazi khan', 'sahiwal', 'okara',
              'wah cantonment', 'dera ismail khan', 'mirpur', 'gujrat',
              'sheikhupura', 'jhang', 'sadiqabad', 'abbottabad', 'kohat',
              'muridke', 'pak pattan', 'kasur', 'vehari', 'mandi bahauddin'
            ];
            
            // Check for Pakistani provinces/areas
            const provinces = [
              'punjab', 'sindh', 'khyber pakhtunkhwa', 'kpk', 'balochistan',
              'azad kashmir', 'gilgit-baltistan', 'islamabad capital territory'
            ];
            
            if (types.includes('locality') || types.includes('sublocality')) {
              return majorCities.some(city => name.includes(city) || city.includes(name));
            }
            
            if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
              return provinces.some(province => name.includes(province) || province.includes(name));
            }
            
            // Also check for Pakistan country
            if (types.includes('country')) {
              return name.includes('pakistan');
            }
            
            return false;
          });

          if (!isValidLocation) {
            alert('Please select a location within Pakistan.');
            if (pickupInputRef.current) {
              pickupInputRef.current.value = '';
            }
            return;
          }

          const locationData: LocationData = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || '',
            placeId: place.place_id
          };

          setFormData(prev => ({
            ...prev,
            pickupLocation: locationData
          }));

          if (pickupInputRef.current) {
            pickupInputRef.current.value = locationData.address;
          }

          updateMapWithLocations(locationData, 'pickup');
        });
        setPickupAutocomplete(pickupAc);
      }

      // Setup autocomplete for dropoff with location restrictions
      if (dropoffInputRef.current) {
        const dropoffAc = new window.google.maps.places.Autocomplete(dropoffInputRef.current, {
          bounds: pakistanBounds,
          componentRestrictions: { country: 'pk' },
          strictBounds: false, // Make it less strict
          types: ['geocode'] // Allow more types of places
        });
        dropoffAc.addListener('place_changed', () => {
          const place = dropoffAc.getPlace();
          
          if (!place.geometry?.location) {
            console.error('No geometry found for place');
            return;
          }

          // Check if location is in Pakistan (more flexible validation)
          const isValidLocation = place.address_components?.some(component => {
            const name = component.long_name.toLowerCase();
            const types = component.types;
            
            // Check for major Pakistani cities
            const majorCities = [
              'islamabad', 'lahore', 'karachi', 'peshawar', 'quetta', 
              'multan', 'faisalabad', 'rawalpindi', 'gujranwala', 'sialkot',
              'bahawalpur', 'sargodha', 'sukkur', 'larkana', 'hyderabad',
              'mardan', 'mingora', 'dera ghazi khan', 'sahiwal', 'okara',
              'wah cantonment', 'dera ismail khan', 'mirpur', 'gujrat',
              'sheikhupura', 'jhang', 'sadiqabad', 'abbottabad', 'kohat',
              'muridke', 'pak pattan', 'kasur', 'vehari', 'mandi bahauddin'
            ];
            
            // Check for Pakistani provinces/areas
            const provinces = [
              'punjab', 'sindh', 'khyber pakhtunkhwa', 'kpk', 'balochistan',
              'azad kashmir', 'gilgit-baltistan', 'islamabad capital territory'
            ];
            
            if (types.includes('locality') || types.includes('sublocality')) {
              return majorCities.some(city => name.includes(city) || city.includes(name));
            }
            
            if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) {
              return provinces.some(province => name.includes(province) || province.includes(name));
            }
            
            // Also check for Pakistan country
            if (types.includes('country')) {
              return name.includes('pakistan');
            }
            
            return false;
          });

          if (!isValidLocation) {
            alert('Please select a location within Pakistan.');
            if (dropoffInputRef.current) {
              dropoffInputRef.current.value = '';
            }
            return;
          }

          const locationData: LocationData = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || place.name || '',
            placeId: place.place_id
          };

          setFormData(prev => ({
            ...prev,
            dropoffLocation: locationData
          }));

          if (dropoffInputRef.current) {
            dropoffInputRef.current.value = locationData.address;
          }

          updateMapWithLocations(locationData, 'dropoff');
        });
        setDropoffAutocomplete(dropoffAc);
      }

      setMap(newMap);
      setGeocoder(newGeocoder);
    };

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured');
      return;
    }

    if (window.google?.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = (error) => console.error('Failed to load Google Maps:', error);

    document.head.appendChild(script);
    return () => {
      if (!window.google?.maps && document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [map, updateMapWithLocations, geocoder, mapClickMode]);

  // Update map cursor when mapClickMode changes
  useEffect(() => {
    if (map) {
      if (mapClickMode) {
        map.setOptions({
          draggableCursor: 'crosshair',
          clickableIcons: false,
          disableDoubleClickZoom: true
        });
      } else {
        map.setOptions({
          draggableCursor: 'grab',
          clickableIcons: true,
          disableDoubleClickZoom: false
        });
      }
    }
  }, [mapClickMode, map]);

  // Marker management - copied from browse listings page
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    if ((map as any).pickupMarker) (map as any).pickupMarker.setMap(null);
    if ((map as any).dropoffMarker) (map as any).dropoffMarker.setMap(null);
    
    // Add pickup marker if location exists
    if (formData.pickupLocation) {
      (map as any).pickupMarker = new window.google.maps.Marker({
        position: { lat: formData.pickupLocation.lat, lng: formData.pickupLocation.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'Pickup Location'
      });
    }
    
    // Add dropoff marker if location exists
    if (formData.dropoffLocation) {
      (map as any).dropoffMarker = new window.google.maps.Marker({
        position: { lat: formData.dropoffLocation.lat, lng: formData.dropoffLocation.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'Dropoff Location'
      });
    }
  }, [map, formData.pickupLocation, formData.dropoffLocation]);

  const enableMapClickMode = (mode: 'pickup' | 'dropoff') => {
    setMapClickMode(mode);
    modeRef.current = mode; // Sync the ref
    // Cursor will be updated by useEffect
  };

  const disableMapClickMode = () => {
    setMapClickMode(null);
    modeRef.current = null; // Sync the ref
    // Cursor will be updated by useEffect
  };

  const handlePlaceSelect = (autocomplete: google.maps.places.Autocomplete, type: 'pickup' | 'dropoff') => {
    const place = autocomplete.getPlace();
    
    if (!place.geometry?.location) {
      console.error('No geometry found for place');
      return;
    }

    // Check if location is in Islamabad or Lahore
    const isValidLocation = place.address_components?.some(component => 
      component.types.includes('locality') && 
      (component.long_name.toLowerCase().includes('islamabad') || 
       component.long_name.toLowerCase().includes('lahore'))
    );

    if (!isValidLocation) {
      alert('Please select a location within Islamabad or Lahore only.');
      // Clear the input
      const inputRef = type === 'pickup' ? pickupInputRef : dropoffInputRef;
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    const locationData: LocationData = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      address: place.formatted_address || place.name || '',
      placeId: place.place_id
    };

    setFormData(prev => ({
      ...prev,
      [type === 'pickup' ? 'pickupLocation' : 'dropoffLocation']: locationData
    }));

    updateMapWithLocations(locationData, type);
  };

  const handleInputChange = (field: keyof RequestFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isDateTimeInPast = (): boolean => {
    if (!formData.departureDate || !formData.departureTime) return false;
    
    const selectedDateTime = new Date(`${formData.departureDate}T${formData.departureTime}`);
    const now = new Date();
    
    return selectedDateTime < now;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.pickupLocation && formData.dropoffLocation);
      case 2:
        return !!(formData.departureDate && formData.departureTime) && !isDateTimeInPast();
      case 3:
        return formData.seatsNeeded > 0 && formData.maxBudget > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!session?.user || !(session.user as any).id) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const rideRequestController = container.resolve(RideRequestController);
      const result = await rideRequestController.createRideRequest({
        id: '',
        travelerId: (session.user as any).id,
        startLocationText: formData.pickupLocation!.address,
        endLocationText: formData.dropoffLocation!.address,
        departureTime: `${formData.departureDate}T${formData.departureTime}:00.000Z`,
        startLocationLat: formData.pickupLocation!.lat,
        startLocationLng: formData.pickupLocation!.lng,
        endLocationLat: formData.dropoffLocation!.lat,
        endLocationLng: formData.dropoffLocation!.lng,
        seatsNeeded: formData.seatsNeeded,
        budget: formData.maxBudget,
        createdAt: new Date().toISOString(),
        distance_km: 0,
      } as unknown as RideRequest);
        alert('Ride request created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating ride request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] py-8 px-4">
      <div className="">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">
            Request a Ride
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Find someone traveling your route and book a seat
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step.id 
                    ? 'bg-[rgb(var(--success))] border-[rgb(var(--success))] text-white' 
                    : currentStep === step.id 
                    ? 'bg-[rgb(var(--primary))] border-[rgb(var(--primary))] text-white' 
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle size={20} />
                  ) : (
                    <span className="text-sm font-semibold">{step.id}</span>
                  )}
                </div>
                
                <div className="ml-3">
                  <p className={`text-sm font-semibold ${
                    currentStep >= step.id ? 'text-[rgb(var(--text))]' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-secondary))]">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${
                    currentStep > step.id ? 'bg-[rgb(var(--success))]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-[rgb(var(--surface))] rounded-xl shadow-lg overflow-hidden">
          {/* Step 1: Route Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Navigation className="mr-2 text-[rgb(var(--primary))]" />
                Where do you need to go?
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={pickupInputRef}
                      type="text"
                      placeholder="Where should the driver pick you up?"
                      className="input w-full pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Dropoff Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={dropoffInputRef}
                      type="text"
                      placeholder="Where do you want to go?"
                      className="input w-full pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Map Click Mode Buttons */}
              <div className="mb-4">
                <p className="text-sm font-medium text-[rgb(var(--text))] mb-3">Or click on the map to select locations:</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => enableMapClickMode('pickup')}
                    disabled={mapClickMode === 'pickup'}
                    className={`btn flex-1 flex items-center justify-center gap-2 ${
                      mapClickMode === 'pickup' 
                        ? 'bg-[rgb(var(--success))] text-white' 
                        : formData.pickupLocation 
                        ? 'border-[rgb(var(--success))] text-[rgb(var(--success))]' 
                        : ''
                    }`}
                  >
                    <MapPin size={16} />
                    {mapClickMode === 'pickup' ? 'Click on map...' : 'Set Pickup'}
                    {formData.pickupLocation && <CheckCircle size={16} />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => enableMapClickMode('dropoff')}
                    disabled={mapClickMode === 'dropoff'}
                    className={`btn flex-1 flex items-center justify-center gap-2 ${
                      mapClickMode === 'dropoff' 
                        ? 'bg-[rgb(var(--error))] text-white' 
                        : formData.dropoffLocation 
                        ? 'border-[rgb(var(--error))] text-[rgb(var(--error))]' 
                        : ''
                    }`}
                  >
                    <MapPin size={16} />
                    {mapClickMode === 'dropoff' ? 'Click on map...' : 'Set Dropoff'}
                    {formData.dropoffLocation && <CheckCircle size={16} />}
                  </button>
                  
                  {mapClickMode && (
                    <button
                      type="button"
                      onClick={disableMapClickMode}
                      className="btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div 
                ref={mapRef}
                className={`w-full h-80 rounded-lg border border-gray-200 dark:border-gray-600 transition-all ${
                  mapClickMode ? 'cursor-crosshair ring-2 ring-[rgb(var(--primary))] ring-opacity-50' : 'cursor-default'
                }`}
              />

              {formData.pickupLocation && formData.dropoffLocation && (
                <div className="mt-4 p-4 bg-[rgba(var(--success),0.1)] rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-[rgb(var(--success))] mr-2" size={20} />
                    <span className="font-medium text-[rgb(var(--success))]">Route Selected</span>
                  </div>
                  <div className="text-sm text-[rgb(var(--text))]">
                    <p><strong>From:</strong> {formData.pickupLocation.address}</p>
                    <p><strong>To:</strong> {formData.dropoffLocation.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Calendar className="mr-2 text-[rgb(var(--primary))]" />
                When do you need to travel?
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={formData.departureDate}
                      onChange={(e) => handleInputChange('departureDate', e.target.value)}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                      Preferred Time
                    </label>
                    <input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => handleInputChange('departureTime', e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>

                {formData.departureDate && formData.departureTime && (
                  <>
                    {isDateTimeInPast() ? (
                      <div className="p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
                        <div className="flex items-center">
                          <AlertCircle className="text-[rgb(var(--error))] mr-2" size={20} />
                          <span className="font-medium text-[rgb(var(--error))]">
                            The selected date and time is in the past. Please choose a future time.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-[rgba(var(--primary),0.1)] rounded-lg">
                        <div className="flex items-center">
                          <Clock className="text-[rgb(var(--primary))] mr-2" size={20} />
                          <span className="font-medium text-[rgb(var(--primary))]">
                            Travel: {new Date(`${formData.departureDate}T${formData.departureTime}`).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Requirements */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <UserCheck className="mr-2 text-[rgb(var(--primary))]" />
                Your Requirements
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Seats Needed
                  </label>
                  <div className="flex items-center">
                    <Users className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.seatsNeeded}
                      onChange={(e) => handleInputChange('seatsNeeded', parseInt(e.target.value))}
                      className="input w-full pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Maximum Budget (PKR)
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={formData.maxBudget}
                      onChange={(e) => handleInputChange('maxBudget', parseInt(e.target.value))}
                      className="input w-full pl-8"
                    />
                  </div>
                  <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">Per person</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Luggage Requirement
                  </label>
                  <div className="flex items-center">
                    <Package className="text-gray-400 mr-2" size={20} />
                    <select
                      value={formData.luggageRequirement}
                      onChange={(e) => handleInputChange('luggageRequirement', parseInt(e.target.value))}
                      className="input w-full pl-8"
                    >
                      <option value={1}>Small bag only</option>
                      <option value={2}>Medium bag</option>
                      <option value={3}>Large bag</option>
                      <option value={4}>Extra large</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Budget Estimate */}
              <div className="mb-6 p-4 bg-[rgba(var(--info),0.1)] rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="text-[rgb(var(--info))] mr-2" size={20} />
                  <span className="font-medium text-[rgb(var(--info))]">Estimated Cost</span>
                </div>
                <div className="text-sm text-[rgb(var(--text))]">
                  <p>Total for {formData.seatsNeeded} seat{formData.seatsNeeded > 1 ? 's' : ''}: PKR {formData.maxBudget * formData.seatsNeeded}</p>
                  <p className="text-xs mt-1 text-[rgb(var(--text-secondary))]">This is your maximum budget. You might pay less!</p>
                </div>
              </div>

              <div className='hiddine'>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  placeholder="Any specific requirements or information for drivers..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <CheckCircle className="mr-2 text-[rgb(var(--primary))]" />
                Review Your Ride Request
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <Navigation className="mr-2 text-[rgb(var(--success))]" size={18} />
                    Route
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>From:</strong> {formData.pickupLocation?.address}</p>
                  <p className="text-[rgb(var(--text))]"><strong>To:</strong> {formData.dropoffLocation?.address}</p>
                </div>

                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <Calendar className="mr-2 text-[rgb(var(--primary))]" size={18} />
                    Schedule
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>Date:</strong> {new Date(formData.departureDate).toLocaleDateString()}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Time:</strong> {formData.departureTime}</p>
                </div>

                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <UserCheck className="mr-2 text-[rgb(var(--secondary))]" size={18} />
                    Requirements
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>Seats Needed:</strong> {formData.seatsNeeded}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Maximum Budget:</strong> PKR {formData.maxBudget} per seat</p>
                  <p className="text-[rgb(var(--text))]"><strong>Total Budget:</strong> PKR {formData.maxBudget * formData.seatsNeeded}</p>
                </div>

                {formData.notes && (
                  <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                      <Info className="mr-2 text-[rgb(var(--info))]" size={18} />
                      Additional Notes
                    </h3>
                    <p className="text-[rgb(var(--text))]">{formData.notes}</p>
                  </div>
                )}

                <div className="p-4 bg-[rgba(var(--warning),0.1)] rounded-lg border border-[rgba(var(--warning),0.3)]">
                  <div className="flex items-start">
                    <AlertCircle className="text-[rgb(var(--warning))] mr-2 mt-0.5" size={18} />
                    <div className="text-sm">
                      <p className="font-medium text-[rgb(var(--warning))] mb-1">
                        What happens next?
                      </p>
                      <ul className="text-[rgb(var(--text))] space-y-1 text-xs">
                        <li>• Your request will be visible to drivers traveling this route</li>
                        <li>• Drivers can contact you directly to arrange pickup</li>
                        <li>• You'll receive notifications when drivers are interested</li>
                        <li>• You can view and choose from available ride offers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-[rgba(var(--surface),0.5)] border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="btn flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNextStep}
                disabled={!isStepValid(currentStep)}
                className="btn btn-primary flex items-center"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid(currentStep)}
                className="btn btn-primary flex items-center"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
                {!isLoading && <CheckCircle size={20} className="ml-2" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}