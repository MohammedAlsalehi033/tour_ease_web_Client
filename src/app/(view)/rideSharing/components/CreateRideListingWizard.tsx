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
  Car,
  Info,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { container } from 'tsyringe';
import { RideListingController } from '@/app/(controller)/rideSharing/rideListingController';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { useSession } from "next-auth/react";

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

interface FormData {
  pickupLocation: LocationData | null;
  dropoffLocation: LocationData | null;
  departureDate: string;
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: number;
  luggageSpace: number;
  description: string;
}

const steps = [
  { id: 1, title: 'Route', description: 'Select pickup & dropoff' },
  { id: 2, title: 'Schedule', description: 'Date & time' },
  { id: 3, title: 'Details', description: 'Seats & pricing' },
  { id: 4, title: 'Review', description: 'Confirm & publish' }
];

export default function CreateRideListingWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [mapClickMode, setMapClickMode] = useState<'pickup' | 'dropoff' | null>(null);
  const modeRef = useRef<'pickup' | 'dropoff' | null>(null);
  const [pickupMarker, setPickupMarker] = useState<google.maps.Marker | null>(null);
  const [dropoffMarker, setDropoffMarker] = useState<google.maps.Marker | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    pickupLocation: null,
    dropoffLocation: null,
    departureDate: '',
    departureTime: '09:00',
    seatsAvailable: 1,
    pricePerSeat: 500,
    luggageSpace: 2,
    description: ''
  });

  // Get tomorrow as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const updateMapWithLocations = useCallback((newLocation: LocationData, type: 'pickup' | 'dropoff') => {
    if (!map) return;

    // Remove existing markers - improved pattern from maps page
    if ((map as any).pickupMarker) (map as any).pickupMarker.setMap(null);
    if ((map as any).dropoffMarker) (map as any).dropoffMarker.setMap(null);

    // Get current locations
    const pickupLoc = type === 'pickup' ? newLocation : formData.pickupLocation;
    const dropoffLoc = type === 'dropoff' ? newLocation : formData.dropoffLocation;

    // Create pickup marker if location exists
    if (pickupLoc) {
      (map as any).pickupMarker = new window.google.maps.Marker({
        position: { lat: pickupLoc.lat, lng: pickupLoc.lng },
        map: map,
        title: 'Pickup Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        }
      });
    }

    // Create dropoff marker if location exists  
    if (dropoffLoc) {
      (map as any).dropoffMarker = new window.google.maps.Marker({
        position: { lat: dropoffLoc.lat, lng: dropoffLoc.lng },
        map: map,
        title: 'Dropoff Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        }
      });
    }

    // Fit bounds if both locations exist
    if (pickupLoc && dropoffLoc) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: pickupLoc.lat, lng: pickupLoc.lng });
      bounds.extend({ lat: dropoffLoc.lat, lng: dropoffLoc.lng });
      map.fitBounds(bounds);
    } else {
      map.setCenter({ lat: newLocation.lat, lng: newLocation.lng });
      map.setZoom(15);
    }
  }, [map, formData.pickupLocation, formData.dropoffLocation]);

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

      // Add map click listener using the improved logic from maps page
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
              setFormData(prev => ({ ...prev, pickupLocation: { lat, lng, address, placeId: result.place_id } }));
              if (pickupInputRef.current) {
                pickupInputRef.current.value = address;
              }
              // Auto-switch to dropoff mode after selecting pickup
              setMapClickMode('dropoff');
              modeRef.current = 'dropoff';
              console.log('Switching to dropoff mode');
            } else if (currentMode === 'dropoff') {
              setFormData(prev => ({ ...prev, dropoffLocation: { lat, lng, address, placeId: result.place_id } }));
              if (dropoffInputRef.current) {
                dropoffInputRef.current.value = address;
              }
              // Exit click mode after selecting dropoff
              setMapClickMode(null);
              modeRef.current = null;
              console.log('Completed location selection');
            }
          } else {
            alert('Unable to determine location. Please try again.');
          }
        });
      });

      // Pakistan bounds (expanded to cover more of the country)
      const pakistanBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(23.5, 60.5), // Southwest (covers Karachi area)
        new window.google.maps.LatLng(37.0, 77.0)  // Northeast (covers northern areas)
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
              'punjub', 'sindh', 'khyber pakhtunkhwa', 'kpk', 'balochistan',
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

  const resetLocations = () => {
    setFormData(prev => ({
      ...prev,
      pickupLocation: null,
      dropoffLocation: null
    }));
    
    // Clear input fields
    if (pickupInputRef.current) {
      pickupInputRef.current.value = '';
    }
    if (dropoffInputRef.current) {
      dropoffInputRef.current.value = '';
    }
    
    // Clear markers
    if (map) {
      if ((map as any).pickupMarker) {
        (map as any).pickupMarker.setMap(null);
        (map as any).pickupMarker = null;
      }
      if ((map as any).dropoffMarker) {
        (map as any).dropoffMarker.setMap(null);
        (map as any).dropoffMarker = null;
      }
    }
    
    // Reset to pickup mode
    setMapClickMode('pickup');
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
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
        return formData.seatsAvailable > 0 && formData.pricePerSeat > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!(session?.user as any)?.id) {
      console.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      const rideListingController = container.resolve(RideListingController);
      const result = await rideListingController.createRideListing({
        providerId: (session!.user as any).id,
        startLocationText: formData.pickupLocation!.address,
        endLocationText: formData.dropoffLocation!.address,
        departureTime: `${formData.departureDate}T${formData.departureTime}:00.000Z`,
        startLocationLat: formData.pickupLocation!.lat,
        startLocationLng: formData.pickupLocation!.lng,
        endLocationLat: formData.dropoffLocation!.lat,
        endLocationLng: formData.dropoffLocation!.lng,
        seatsAvailable: formData.seatsAvailable,
        pricePerSeat: formData.pricePerSeat.toString(),
        mediaUrls: [],
        status: 'active',
        createdAt: new Date().toISOString(),
      } as unknown as RideListing);

      alert('Ride listing created successfully!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating ride listing:', error);
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
            Offer a Ride
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your journey and earn money by offering rides to fellow travelers
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
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 transition-colors ${
                    currentStep > step.id ? 'bg-[rgb(var(--success))]' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="card">
          {/* Step 1: Route Selection */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Navigation className="mr-2 text-[rgb(var(--primary))]" />
                Where are you traveling?
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Pickup Location
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        ref={pickupInputRef}
                        type="text"
                        placeholder="Search or click map to select pickup location..."
                        className="input w-full pl-10 pr-4"
                      />
                    </div>
                    <button
                      onClick={() => mapClickMode === 'pickup' ? disableMapClickMode() : enableMapClickMode('pickup')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        mapClickMode === 'pickup'
                          ? 'border-[rgb(var(--primary))] bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))]'
                          : 'border-gray-300 hover:border-[rgb(var(--primary))] text-gray-600'
                      }`}
                    >
                      <MapPin size={20} />
                    </button>
                  </div>
                  {mapClickMode === 'pickup' && (
                    <p className="text-sm text-[rgb(var(--primary))] mt-1">Click on the map to select pickup location</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Dropoff Location
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        ref={dropoffInputRef}
                        type="text"
                        placeholder="Search or click map to select dropoff location..."
                        className="input w-full pl-10 pr-4"
                      />
                    </div>
                    <button
                      onClick={() => mapClickMode === 'dropoff' ? disableMapClickMode() : enableMapClickMode('dropoff')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        mapClickMode === 'dropoff'
                          ? 'border-[rgb(var(--error))] bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))]'
                          : 'border-gray-300 hover:border-[rgb(var(--error))] text-gray-600'
                      }`}
                    >
                      <MapPin size={20} />
                    </button>
                  </div>
                  {mapClickMode === 'dropoff' && (
                    <p className="text-sm text-[rgb(var(--error))] mt-1">Click on the map to select dropoff location</p>
                  )}
                </div>
                
                {/* Reset button - inspired by maps page */}
                {(formData.pickupLocation || formData.dropoffLocation) && (
                  <div className="flex justify-center mt-4">
                    <button
                      onClick={resetLocations}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Reset All Locations
                    </button>
                  </div>
                )}
              </div>

              <div 
                ref={mapRef}
                className={`w-full h-80 rounded-lg border border-gray-300 transition-all ${
                  mapClickMode ? 'cursor-crosshair ring-2 ring-[rgb(var(--primary))] ring-opacity-50' : 'cursor-default'
                }`}
              />

              {mapClickMode && (
                <div className="mt-3 p-3 bg-[rgba(var(--info),0.1)] border border-[rgba(var(--info),0.3)] rounded-lg">
                  <div className="flex items-center text-[rgb(var(--info))]">
                    <Info size={16} className="mr-2" />
                    <span className="text-sm">
                      {mapClickMode === 'pickup' ? 'Click anywhere on the map to set pickup location' : 'Click anywhere on the map to set dropoff location'}
                    </span>
                    <button
                      onClick={disableMapClickMode}
                      className="ml-auto text-xs px-2 py-1 bg-white rounded border hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {formData.pickupLocation && formData.dropoffLocation && (
                <div className="mt-4 p-4 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)] rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-[rgb(var(--success))] mr-2" size={20} />
                    <span className="font-medium text-[rgb(var(--success))]">Route Selected</span>
                  </div>
                  <div className="text-sm text-[rgb(var(--success))]">
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
                When are you leaving?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={formData.departureDate}
                    onChange={(e) => handleInputChange('departureDate', e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Departure Time
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
                    <div className="mt-6 p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
                      <div className="flex items-center">
                        <AlertCircle className="text-[rgb(var(--error))] mr-2" size={20} />
                        <span className="font-medium text-[rgb(var(--error))]">
                          The selected date and time is in the past. Please choose a future time.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 p-4 bg-[rgba(var(--primary),0.1)] border border-[rgba(var(--primary),0.3)] rounded-lg">
                      <div className="flex items-center">
                        <Clock className="text-[rgb(var(--primary))] mr-2" size={20} />
                        <span className="font-medium text-[rgb(var(--primary))]">
                          Departure: {new Date(`${formData.departureDate}T${formData.departureTime}`).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Car className="mr-2 text-[rgb(var(--primary))]" />
                Ride Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Available Seats
                  </label>
                  <div className="flex items-center">
                    <Users className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={formData.seatsAvailable}
                      onChange={(e) => handleInputChange('seatsAvailable', parseInt(e.target.value))}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Price per Seat (PKR)
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="50"
                      step="50"
                      value={formData.pricePerSeat}
                      onChange={(e) => handleInputChange('pricePerSeat', parseInt(e.target.value))}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Luggage Space
                  </label>
                  <div className="flex items-center">
                    <Package className="text-gray-400 mr-2" size={20} />
                    <select
                      value={formData.luggageSpace}
                      onChange={(e) => handleInputChange('luggageSpace', parseInt(e.target.value))}
                      className="input w-full"
                    >
                      <option value={1}>one bag</option>
                      <option value={2}>two bags</option>
                      <option value={3}>three bags</option>
                      <option value={4}>four bags</option>
                    </select>
                  </div>
                </div>
              </div>

            
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <CheckCircle className="mr-2 text-[rgb(var(--primary))]" />
                Review Your Ride Offer
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
                    <Car className="mr-2 text-[rgb(var(--secondary))]" size={18} />
                    Ride Details
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>Available Seats:</strong> {formData.seatsAvailable}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Price per Seat:</strong> PKR {formData.pricePerSeat}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Total Earning:</strong> PKR {formData.pricePerSeat * formData.seatsAvailable}</p>
                </div>

                {formData.description && (
                  <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                      <Info className="mr-2 text-[rgb(var(--info))]" size={18} />
                      Additional Information
                    </h3>
                    <p className="text-[rgb(var(--text))]">{formData.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-6 py-4 bg-[rgb(var(--surface))] border-t border-gray-200 dark:border-gray-600 flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center px-4 py-2 text-[rgb(var(--text))] hover:text-[rgb(var(--primary))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={handleNextStep}
                disabled={!isStepValid(currentStep)}
                className="btn-primary flex items-center"
              >
                Next
                <ArrowRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading || !isStepValid(currentStep)}
                className="flex items-center px-6 py-2 bg-[rgb(var(--success))] text-white rounded-lg hover:bg-[rgba(var(--success),0.8)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? 'Creating...' : 'Publish Ride'}
                {!isLoading && <CheckCircle size={20} className="ml-2" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}