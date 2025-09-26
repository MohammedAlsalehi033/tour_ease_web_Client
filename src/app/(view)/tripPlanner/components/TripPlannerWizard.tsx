"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Package,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Search,
  Navigation,
  Info,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

interface TripPlanFormData {
  fromLocation: LocationData | null;
  toLocation: LocationData | null;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  requirements: string;
  selectedActivities: string[];
}

const steps = [
  { id: 1, title: 'Destinations', description: 'Where are you traveling?' },
  { id: 2, title: 'Dates & Budget', description: 'When and how much?' },
  { id: 3, title: 'Activities', description: 'What interests you?' },
  { id: 4, title: 'Review', description: 'Confirm your plan' }
];

const activities = [
  { name: 'Sightseeing', icon: 'fa-solid fa-eye' },
  { name: 'Hiking', icon: 'fa-solid fa-mountain' },
  { name: 'Dining', icon: 'fa-solid fa-utensils' },
  { name: 'Shopping', icon: 'fa-solid fa-bag-shopping' },
  { name: 'Cultural Tours', icon: 'fa-solid fa-theater-masks' },
  { name: 'Adventure Sports', icon: 'fa-solid fa-bolt' },
  { name: 'Relaxation', icon: 'fa-solid fa-spa' },
  { name: 'Wildlife Safari', icon: 'fa-solid fa-paw' },
];

export default function TripPlannerWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [fromAutocomplete, setFromAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [toAutocomplete, setToAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  // Map click functionality  
  const [mapClickMode, setMapClickMode] = useState<'from' | 'to' | null>(null);
  const modeRef = useRef<'from' | 'to' | null>(null);
  const [fromMarker, setFromMarker] = useState<google.maps.Marker | null>(null);
  const [toMarker, setToMarker] = useState<google.maps.Marker | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TripPlanFormData>({
    fromLocation: null,
    toLocation: null,
    startDate: '',
    endDate: '',
    budget: 1000,
    travelers: 1,
    requirements: '',
    selectedActivities: []
  });

  // Get today as minimum date
  const today = new Date().toISOString().split('T')[0];

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
            const address = results[0].formatted_address;
            
            if (currentMode === 'from') {
              setFormData(prev => ({
                ...prev,
                fromLocation: { lat, lng, address, placeId: results[0].place_id }
              }));
              if (fromInputRef.current) {
                fromInputRef.current.value = address;
              }
              setMapClickMode('to');
              modeRef.current = 'to';
              console.log('Switching to destination mode');
            } else if (currentMode === 'to') {
              setFormData(prev => ({
                ...prev,
                toLocation: { lat, lng, address, placeId: results[0].place_id }
              }));
              if (toInputRef.current) {
                toInputRef.current.value = address;
              }
              console.log('Setting destination location');
            }
          } else {
            alert('Unable to determine location. Please try again.');
          }
        });
      });

      // Pakistan bounds (covering entire Pakistan)
      const pakistanBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(23.5, 60.0), // Southwest
        new window.google.maps.LatLng(37.0, 77.0)  // Northeast
      );

      // Setup autocomplete for from location with country restriction
      if (fromInputRef.current) {
        const fromAc = new window.google.maps.places.Autocomplete(fromInputRef.current, {
          bounds: pakistanBounds,
          componentRestrictions: { country: 'pk' },
          strictBounds: true,
          types: ['(cities)']
        });
        fromAc.addListener('place_changed', () => handleAutocompleteSelect(fromAc, 'from'));
        setFromAutocomplete(fromAc);
      }

      // Setup autocomplete for to location with country restriction  
      if (toInputRef.current) {
        const toAc = new window.google.maps.places.Autocomplete(toInputRef.current, {
          bounds: pakistanBounds,
          componentRestrictions: { country: 'pk' },
          strictBounds: true,
          types: ['(cities)']
        });
        toAc.addListener('place_changed', () => handleAutocompleteSelect(toAc, 'to'));
        setToAutocomplete(toAc);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional

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
    if ((map as any).fromMarker) (map as any).fromMarker.setMap(null);
    if ((map as any).toMarker) (map as any).toMarker.setMap(null);
    
    // Add from marker if location exists
    if (formData.fromLocation) {
      (map as any).fromMarker = new window.google.maps.Marker({
        position: { lat: formData.fromLocation.lat, lng: formData.fromLocation.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'From Location'
      });
    }
    
    // Add to marker if location exists
    if (formData.toLocation) {
      (map as any).toMarker = new window.google.maps.Marker({
        position: { lat: formData.toLocation.lat, lng: formData.toLocation.lng },
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'To Location'
      });
    }
  }, [map, formData.fromLocation, formData.toLocation]);

  const initMap = () => {
    if (!mapRef.current || map) return;

    // Center map on Pakistan (between Islamabad and Lahore)
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
          const address = results[0].formatted_address;
          
          if (currentMode === 'from') {
            setFormData(prev => ({
              ...prev,
              fromLocation: { lat, lng, address, placeId: results[0].place_id }
            }));
            if (fromInputRef.current) {
              fromInputRef.current.value = address;
            }
            setMapClickMode('to');
            modeRef.current = 'to';
            console.log('Switching to destination mode');
          } else if (currentMode === 'to') {
            setFormData(prev => ({
              ...prev,
              toLocation: { lat, lng, address, placeId: results[0].place_id }
            }));
            if (toInputRef.current) {
              toInputRef.current.value = address;
            }
            console.log('Setting destination location');
          }
        }
      });
    });

    // Pakistan bounds (covering entire Pakistan)
    const pakistanBounds = new window.google.maps.LatLngBounds(
      new window.google.maps.LatLng(23.5, 60.0), // Southwest
      new window.google.maps.LatLng(37.0, 77.0)  // Northeast
    );

    // Setup autocomplete for from location with country restriction
    if (fromInputRef.current) {
      const fromAc = new window.google.maps.places.Autocomplete(fromInputRef.current, {
        bounds: pakistanBounds,
        componentRestrictions: { country: 'pk' },
        strictBounds: true,
        types: ['(cities)']
      });
      fromAc.addListener('place_changed', () => handleAutocompleteSelect(fromAc, 'from'));
      setFromAutocomplete(fromAc);
    }

    // Setup autocomplete for to location with country restriction  
    if (toInputRef.current) {
      const toAc = new window.google.maps.places.Autocomplete(toInputRef.current, {
        bounds: pakistanBounds,
        componentRestrictions: { country: 'pk' },
        strictBounds: true,
        types: ['(cities)']
      });
      toAc.addListener('place_changed', () => handleAutocompleteSelect(toAc, 'to'));
      setToAutocomplete(toAc);
    }

    setMap(newMap);
    setGeocoder(newGeocoder);
  };

  const updateMapCursor = () => {
    if (!map) return;
    
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
  };

  const handleMapClickEvent = (event: google.maps.MapMouseEvent) => {
    if (!mapClickMode || !event.latLng || !geocoder) {
      return;
    }

    // Prevent default map behavior
    event.stop();

    const position = { lat: event.latLng.lat(), lng: event.latLng.lng() };

    // Reverse geocode to get address
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        
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

        const locationData: LocationData = {
          lat: position.lat,
          lng: position.lng,
          address: result.formatted_address,
          placeId: result.place_id
        };

        // Update form data and input
        updateLocationData(locationData, mapClickMode);
        
        // Exit click mode
        setMapClickMode(null);
      } else {
        console.error('Geocoding failed:', status);
        alert('Unable to determine location. Please try again.');
      }
    });
  };

  const handleAutocompleteSelect = (autocomplete: google.maps.places.Autocomplete, type: 'from' | 'to') => {
    const place = autocomplete.getPlace();
    
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
      // Clear the input
      const inputRef = type === 'from' ? fromInputRef : toInputRef;
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

    updateLocationData(locationData, type);
  };

  const updateLocationData = (locationData: LocationData, type: 'from' | 'to') => {
    // Update form data
    setFormData(prev => ({
      ...prev,
      [type === 'from' ? 'fromLocation' : 'toLocation']: locationData
    }));

    // Update input field
    const inputRef = type === 'from' ? fromInputRef : toInputRef;
    if (inputRef.current) {
      inputRef.current.value = locationData.address;
    }

    // Update map markers
    updateMapMarkers(locationData, type);
  };

  const updateMapMarkers = (newLocation: LocationData, type: 'from' | 'to') => {
    if (!map) return;

    // Remove existing marker
    const existingMarker = type === 'from' ? fromMarker : toMarker;
    if (existingMarker) {
      existingMarker.setMap(null);
    }

    // Create new marker
    const marker = new window.google.maps.Marker({
      position: { lat: newLocation.lat, lng: newLocation.lng },
      map: map,
      title: type === 'from' ? 'Starting Location' : 'Destination',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: type === 'from' ? 'rgb(var(--success))' : 'rgb(var(--primary))',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
        scale: 8
      }
    });

    // Update marker state
    if (type === 'from') {
      setFromMarker(marker);
    } else {
      setToMarker(marker);
    }

    // Fit map bounds if both locations exist
    const fromLoc = type === 'from' ? newLocation : formData.fromLocation;
    const toLoc = type === 'to' ? newLocation : formData.toLocation;
    
    if (fromLoc && toLoc) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(fromLoc);
      bounds.extend(toLoc);
      map.fitBounds(bounds);
    } else {
      map.setCenter({ lat: newLocation.lat, lng: newLocation.lng });
      map.setZoom(10);
    }
  };

  const enableMapClickMode = (mode: 'from' | 'to') => {
    setMapClickMode(mode);
    modeRef.current = mode; // Sync the ref
    // Cursor will be updated by useEffect
  };

  const disableMapClickMode = () => {
    setMapClickMode(null);
    modeRef.current = null; // Sync the ref
    // Cursor will be updated by useEffect
  };

  const handleInputChange = (field: keyof TripPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityToggle = (activityName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activityName)
        ? prev.selectedActivities.filter(a => a !== activityName)
        : [...prev.selectedActivities, activityName]
    }));
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

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.fromLocation && formData.toLocation);
      case 2:
        return !!(formData.startDate && formData.endDate && formData.budget > 0 && formData.travelers > 0);
      case 3:
        return formData.selectedActivities.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Here you would typically send the data to your backend
      console.log('Trip Plan Data:', formData);
      
      // Navigate to success page or trip details
      router.push('/tripPlanner?success=plan-created');
    } catch (error) {
      console.error('Error creating trip plan:', error);
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
            Plan Your Trip
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Create your perfect travel itinerary step by step
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
          {/* Step 1: Destinations */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Navigation className="mr-2 text-[rgb(var(--primary))]" />
                Where are you traveling?
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Starting Location
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={fromInputRef}
                      type="text"
                      placeholder="Where are you starting from?"
                      className="input w-full pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      ref={toInputRef}
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
                    onClick={() => enableMapClickMode('from')}
                    disabled={mapClickMode === 'from'}
                    className={`btn flex-1 flex items-center justify-center gap-2 ${
                      mapClickMode === 'from' 
                        ? 'bg-[rgb(var(--success))] text-white' 
                        : formData.fromLocation 
                        ? 'border-[rgb(var(--success))] text-[rgb(var(--success))]' 
                        : ''
                    }`}
                  >
                    <MapPin size={16} />
                    {mapClickMode === 'from' ? 'Click on map...' : 'Set Starting Point'}
                    {formData.fromLocation && <CheckCircle size={16} />}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => enableMapClickMode('to')}
                    disabled={mapClickMode === 'to'}
                    className={`btn flex-1 flex items-center justify-center gap-2 ${
                      mapClickMode === 'to' 
                        ? 'bg-[rgb(var(--primary))] text-white' 
                        : formData.toLocation 
                        ? 'border-[rgb(var(--primary))] text-[rgb(var(--primary))]' 
                        : ''
                    }`}
                  >
                    <MapPin size={16} />
                    {mapClickMode === 'to' ? 'Click on map...' : 'Set Destination'}
                    {formData.toLocation && <CheckCircle size={16} />}
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

              {formData.fromLocation && formData.toLocation && (
                <div className="mt-4 p-4 bg-[rgba(var(--success),0.1)] rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-[rgb(var(--success))] mr-2" size={20} />
                    <span className="font-medium text-[rgb(var(--success))]">Destinations Selected</span>
                  </div>
                  <div className="text-sm text-[rgb(var(--text))]">
                    <p><strong>From:</strong> {formData.fromLocation.address}</p>
                    <p><strong>To:</strong> {formData.toLocation.address}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Dates & Budget */}
          {currentStep === 2 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Calendar className="mr-2 text-[rgb(var(--primary))]" />
                When and how much?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Budget (USD)
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="1"
                      step="100"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', parseInt(e.target.value))}
                      className="input w-full pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                    Number of Travelers
                  </label>
                  <div className="flex items-center">
                    <Users className="text-gray-400 mr-2" size={20} />
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.travelers}
                      onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                      className="input w-full pl-8"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
                  Special Requirements (Optional)
                </label>
                <textarea
                  placeholder="Any special requirements or preferences..."
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  rows={3}
                  className="input w-full resize-none"
                />
              </div>

              {formData.startDate && formData.endDate && (
                <div className="mt-4 p-4 bg-[rgba(var(--info),0.1)] rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="text-[rgb(var(--info))] mr-2" size={20} />
                    <span className="font-medium text-[rgb(var(--info))]">Trip Summary</span>
                  </div>
                  <div className="text-sm text-[rgb(var(--text))]">
                    <p>Duration: {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24))} days</p>
                    <p>Budget per person: ${Math.round(formData.budget / formData.travelers)}</p>
                    <p>Total budget: ${formData.budget}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Activities */}
          {currentStep === 3 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <Activity className="mr-2 text-[rgb(var(--primary))]" />
                What interests you?
              </h2>

              <p className="text-[rgb(var(--text-secondary))] mb-4">
                Select the activities and experiences you'd like to include in your trip:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {activities.map((activity) => (
                  <button
                    key={activity.name}
                    type="button"
                    onClick={() => handleActivityToggle(activity.name)}
                    className={`btn flex flex-col items-center space-y-2 p-4 ${
                      formData.selectedActivities.includes(activity.name) 
                        ? 'btn-primary' 
                        : 'btn-outlined'
                    }`}
                  >
                    <i className={`${activity.icon} text-xl`}></i>
                    <span className="text-sm text-center">{activity.name}</span>
                    {formData.selectedActivities.includes(activity.name) && (
                      <CheckCircle size={16} />
                    )}
                  </button>
                ))}
              </div>

              {formData.selectedActivities.length > 0 && (
                <div className="mt-6 p-4 bg-[rgba(var(--success),0.1)] rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="text-[rgb(var(--success))] mr-2" size={20} />
                    <span className="font-medium text-[rgb(var(--success))]">
                      {formData.selectedActivities.length} activities selected
                    </span>
                  </div>
                  <div className="text-sm text-[rgb(var(--text))]">
                    {formData.selectedActivities.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-[rgb(var(--text))]">
                <CheckCircle className="mr-2 text-[rgb(var(--primary))]" />
                Review Your Trip Plan
              </h2>

              <div className="space-y-6">
                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <Navigation className="mr-2 text-[rgb(var(--success))]" size={18} />
                    Destinations
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>From:</strong> {formData.fromLocation?.address}</p>
                  <p className="text-[rgb(var(--text))]"><strong>To:</strong> {formData.toLocation?.address}</p>
                </div>

                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <Calendar className="mr-2 text-[rgb(var(--primary))]" size={18} />
                    Travel Details
                  </h3>
                  <p className="text-[rgb(var(--text))]"><strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}</p>
                  <p className="text-[rgb(var(--text))]"><strong>End Date:</strong> {new Date(formData.endDate).toLocaleDateString()}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Duration:</strong> {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 3600 * 24))} days</p>
                  <p className="text-[rgb(var(--text))]"><strong>Travelers:</strong> {formData.travelers}</p>
                  <p className="text-[rgb(var(--text))]"><strong>Budget:</strong> ${formData.budget}</p>
                </div>

                <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                    <Activity className="mr-2 text-[rgb(var(--secondary))]" size={18} />
                    Selected Activities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedActivities.map((activity) => (
                      <span
                        key={activity}
                        className="px-3 py-1 bg-[rgba(var(--primary),0.1)] text-[rgb(var(--primary))] rounded-full text-sm"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>

                {formData.requirements && (
                  <div className="p-4 bg-[rgba(var(--surface),0.8)] border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center text-[rgb(var(--text))]">
                      <Info className="mr-2 text-[rgb(var(--info))]" size={18} />
                      Special Requirements
                    </h3>
                    <p className="text-[rgb(var(--text))]">{formData.requirements}</p>
                  </div>
                )}
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
                {isLoading ? 'Creating Plan...' : 'Create Trip Plan'}
                {!isLoading && <CheckCircle size={20} className="ml-2" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}