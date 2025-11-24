"use client";
import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Users, Package, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GoogleMapComponent() {
const router = useRouter();

  const [pickLocation, setPickLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [pickAddress, setPickAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [mode, setMode] = useState('pick'); 
  const modeRef = useRef('pick');

  const [selectedDate, setSelectedDate] = useState('');
  const [timeRange, setTimeRange] = useState({ start: '09:00', end: '17:00' });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(0);

  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [map, setMap] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [geocoder, setGeocoder] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  
  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateString = maxDate.toISOString().split('T')[0];

  // Validation functions
  const validateForm = () => {
    const newErrors = {};
    
    if (!pickLocation) {
      newErrors.pickLocation = 'Please select a pick-up location';
    }
    
    if (!dropLocation) {
      newErrors.dropLocation = 'Please select a drop-off location';
    }
    
    if (!selectedDate) {
      newErrors.selectedDate = 'Please select a travel date';
    } else if (selectedDate < today) {
      newErrors.selectedDate = 'Travel date cannot be in the past';
    }
    
    if (timeRange.start >= timeRange.end) {
      newErrors.timeRange = 'End time must be after start time';
    }
    
    if (priceRange.min >= priceRange.max) {
      newErrors.priceRange = 'Maximum price must be greater than minimum price';
    }
    
    if (travelers < 1 || travelers > 8) {
      newErrors.travelers = 'Number of travelers must be between 1 and 8';
    }
    
    if (luggage < 0 || luggage > 20) {
      newErrors.luggage = 'Number of luggage pieces must be between 0 and 20';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Error getting user location:', error);
          // Fall back to default location (Pakistan) if geolocation fails
          setUserLocation({ lat: 33.6844, lng: 73.0479 });
        }
      );
    } else {
      // Geolocation not supported, use default location
      setUserLocation({ lat: 33.6844, lng: 73.0479 });
    }
  }, []);

  useEffect(() => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    // Wait for user location to be available
    if (!userLocation) return;

    if (window.google?.maps) {
      initMap();
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
    };
    
    document.head.appendChild(script);
    
    return () => {
      if (!window.google?.maps) {
        document.head.removeChild(script);
      }
    };
  }, [userLocation]);
  
  const initMap = () => {
    if (!mapRef.current || loaded || !userLocation) return;

    const mapOptions = {
      center: userLocation,
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    };

    const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
    const newGeocoder = new window.google.maps.Geocoder();

    newMap.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      const currentMode = modeRef.current;
      console.log(`Current mode: ${currentMode}, Location: lat ${lat}, lng ${lng}`);

      // Reverse geocode to get address
      newGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          
          if (currentMode === 'pick') {
            setPickLocation({ lat, lng });
            setPickAddress(address);
            clearError('pickLocation');
            setMode('drop');
            modeRef.current = 'drop';
            console.log('Switching to drop mode');
          } else if (currentMode === 'drop') {
            setDropLocation({ lat, lng });
            setDropAddress(address);
            clearError('dropLocation');
            console.log('Setting drop location');
          }
        }
      });
    });

    setMap(newMap);
    setGeocoder(newGeocoder);
    setLoaded(true);
  };
  
  useEffect(() => {
    if (!map) return;
    
    if (map.pickMarker) map.pickMarker.setMap(null);
    if (map.dropMarker) map.dropMarker.setMap(null);
    
    if (pickLocation) {
      map.pickMarker = new window.google.maps.Marker({
        position: pickLocation,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'Pick-up Location'
      });
    }
    
    if (dropLocation) {
      map.dropMarker = new window.google.maps.Marker({
        position: dropLocation,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 10
        },
        title: 'Drop-off Location'
      });
    }
  }, [map, pickLocation, dropLocation]);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    modeRef.current = newMode; 
  };

  const resetLocations = () => {
    setPickLocation(null);
    setDropLocation(null);
    setPickAddress('');
    setDropAddress('');
    setMode('pick');
    modeRef.current = 'pick';
  };

  // Validation and sanitization functions
  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    clearError('selectedDate');
    if (inputDate >= today && inputDate <= maxDateString) {
      setSelectedDate(inputDate);
    }
  };

  const handleTravelersChange = (e) => {
    const value = Math.max(1, Math.min(8, parseInt(e.target.value) || 1));
    setTravelers(value);
    clearError('travelers');
  };

  const handleLuggageChange = (e) => {
    const value = Math.max(0, Math.min(20, parseInt(e.target.value) || 0));
    setLuggage(value);
    clearError('luggage');
  };

  const handlePriceChange = (type, value) => {
    const numValue = Math.max(0, Math.min(1000000, parseFloat(value) || 0));
    clearError('priceRange');
    
    if (type === 'min') {
      setPriceRange(prev => ({ ...prev, min: Math.min(numValue, prev.max - 1000) }));
    } else {
      setPriceRange(prev => ({ ...prev, max: Math.max(numValue, prev.min + 1000) }));
    }
  };

  const handleTimeChange = (type, value) => {
    clearError('timeRange');
    setTimeRange(prev => {
      const newRange = { ...prev, [type]: value };
      
      // Ensure valid time range
      if (type === 'start' && value >= prev.end) {
        const [hours, minutes] = value.split(':');
        const endHours = Math.min(23, parseInt(hours) + 1);
        newRange.end = `${endHours.toString().padStart(2, '0')}:${minutes}`;
      }
      if (type === 'end' && value <= prev.start) {
        const [hours, minutes] = value.split(':');
        const startHours = Math.max(0, parseInt(hours) - 1);
        newRange.start = `${startHours.toString().padStart(2, '0')}:${minutes}`;
      }
      return newRange;
    });
  };

const handleSearch = () => {
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    const params = new URLSearchParams({
      pickLat: pickLocation.lat.toString(),
      pickLng: pickLocation.lng.toString(),
      pickAddress: pickAddress, 
      dropLat: dropLocation.lat.toString(),
      dropLng: dropLocation.lng.toString(),
      dropAddress: dropAddress, 
      date: selectedDate,
      timeStart: timeRange.start,
      timeEnd: timeRange.end,
      priceMin: priceRange.min.toString(),
      priceMax: priceRange.max.toString(),
      travelers: travelers.toString(),
      luggage: luggage.toString(),
      timestamp: new Date().toISOString() 
    });
    
    router.push(`/rideSharing?${params.toString()}`);
  } catch (error) {
    console.error('Search error:', error);
    setIsSubmitting(false);
  }
};

  const isSearchReady = pickLocation && dropLocation && selectedDate;

  return (
    <div className='mt-4'>
      <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4">
        {/* Left Panel - Form Controls */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <div className="card p-4 h-full flex flex-col">
            {/* Compact Header */}
            <div className="text-center mb-4">
              <h1 className="text-xl lg:text-2xl font-bold text-light-on-surface dark:text-dark-on-surface mb-1">
                Find Your Ride
              </h1>
              <p className="text-xs lg:text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Set locations and preferences
              </p>
            </div>

            {/* Location Selection - Compact */}
            <div className="mb-3 lg:mb-4">
              <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-3 flex items-center">
                <MapPin className="mr-2 text-primary" size={18} />
                Locations
              </h3>
              
              {/* Mode buttons - more compact */}
              <div className="flex gap-1 lg:gap-2 mb-2 lg:mb-3">
                <button
                  className={`flex-1 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center justify-center space-x-1 ${
                    mode === 'pick' 
                      ? 'bg-primary text-white' 
                      : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface dark:text-dark-on-surface'
                  }`}
                  onClick={() => handleModeChange('pick')}
                >
                  <div className={`w-2 h-2 rounded-full ${pickLocation ? 'bg-success' : 'bg-current opacity-50'}`}></div>
                  <span>Pickup</span>
                </button>
                
                <button
                  className={`flex-1 px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-medium transition-all flex items-center justify-center space-x-1 ${
                    mode === 'drop' 
                      ? 'bg-primary text-white' 
                      : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface dark:text-dark-on-surface'
                  }`}
                  onClick={() => handleModeChange('drop')}
                >
                  <div className={`w-2 h-2 rounded-full ${dropLocation ? 'bg-error' : 'bg-current opacity-50'}`}></div>
                  <span>Dropoff</span>
                </button>
                
                {(pickLocation || dropLocation) && (
                  <button
                    className="px-2 lg:px-3 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface dark:text-dark-on-surface"
                    onClick={resetLocations}
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Compact instruction */}
              <p className={`text-xs p-2 rounded border ${
                mode === 'pick' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-error bg-error/5 text-error'
              }`}>
                {mode === 'pick' ? "📍 Click map for pickup" : "🎯 Click map for dropoff"}
              </p>

              {/* Error display for locations */}
              {(errors.pickLocation || errors.dropLocation) && (
                <div className="mt-2 p-2 bg-error/10 border border-error/20 rounded text-xs flex items-center">
                  <AlertCircle className="text-error mr-1" size={12} />
                  <span className="text-error">{errors.pickLocation || errors.dropLocation}</span>
                </div>
              )}
            </div>

            {/* Trip Details - Compact Grid */}
            <div className="flex-1 overflow-y-auto">
              <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-3 flex items-center">
                <Calendar className="mr-2 text-primary" size={18} />
                Trip Details
              </h3>

              <div className="space-y-2 lg:space-y-3">
                {/* Date */}
                <div>
                  <label className="block text-xs lg:text-sm font-medium mb-1">Travel Date *</label>
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    max={maxDateString}
                    onChange={handleDateChange}
                    className={`input w-full text-xs lg:text-sm ${errors.selectedDate ? 'border-error' : ''}`}
                  />
                  {errors.selectedDate && (
                    <p className="text-xs text-error mt-1">{errors.selectedDate}</p>
                  )}
                </div>

                {/* Time Range */}
                <div>
                  <label className="block text-xs lg:text-sm font-medium mb-1">Time Range *</label>
                  <div className="flex space-x-2">
                    <input
                      type="time"
                      value={timeRange.start}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                      className={`input flex-1 text-xs lg:text-sm ${errors.timeRange ? 'border-error' : ''}`}
                    />
                    <input
                      type="time"
                      value={timeRange.end}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                      className={`input flex-1 text-xs lg:text-sm ${errors.timeRange ? 'border-error' : ''}`}
                    />
                  </div>
                  {errors.timeRange && (
                    <p className="text-xs text-error mt-1">{errors.timeRange}</p>
                  )}
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-xs lg:text-sm font-medium mb-1">Budget (PKR) *</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      className={`input flex-1 text-xs lg:text-sm ${errors.priceRange ? 'border-error' : ''}`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      className={`input flex-1 text-xs lg:text-sm ${errors.priceRange ? 'border-error' : ''}`}
                    />
                  </div>
                  {errors.priceRange && (
                    <p className="text-xs text-error mt-1">{errors.priceRange}</p>
                  )}
                </div>

                {/* Travelers & Luggage */}
                <div className="grid grid-cols-2 gap-2 lg:gap-3">
                  <div>
                    <label className="block text-xs lg:text-sm font-medium mb-1">Travelers *</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={travelers}
                      onChange={handleTravelersChange}
                      className={`input w-full text-xs lg:text-sm ${errors.travelers ? 'border-error' : ''}`}
                    />
                    {errors.travelers && (
                      <p className="text-xs text-error mt-1">{errors.travelers}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs lg:text-sm font-medium mb-1">Luggage</label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={luggage}
                      onChange={handleLuggageChange}
                      className={`input w-full text-xs lg:text-sm ${errors.luggage ? 'border-error' : ''}`}
                    />
                    {errors.luggage && (
                      <p className="text-xs text-error mt-1">{errors.luggage}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button - Fixed at bottom */}
            <div className="mt-3 lg:mt-4">
              <button
                onClick={handleSearch}
                disabled={!pickLocation || !dropLocation || !selectedDate || Object.keys(errors).length > 0 || isSubmitting}
                className={`w-full py-2 lg:py-3 rounded-lg font-semibold text-sm lg:text-base transition-all duration-300 flex items-center justify-center space-x-2 ${
                  pickLocation && dropLocation && selectedDate && Object.keys(errors).length === 0 && !isSubmitting
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span>Searching...</span>
                  </>
                ) : pickLocation && dropLocation && selectedDate && Object.keys(errors).length === 0 ? (
                  <>
                    <Navigation size={16} />
                    <span>Find Rides</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <span>Complete Fields</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Map and Selected Locations */}
        <div className="w-full lg:w-2/3 flex flex-col min-h-0">
          <div className="card p-3 lg:p-4 h-full flex flex-col">
            {/* Map */}
            <div className="flex-1 relative min-h-[300px] lg:min-h-0">
              <div
                ref={mapRef}
                className="h-full w-full rounded-lg shadow-lg border-2 border-light-outline dark:border-dark-outline"
              />
              {!loaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-6 lg:h-8 w-6 lg:w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-xs lg:text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Loading map...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Locations - Compact Display */}
            <div className="mt-3 lg:mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-3">
              <div className={`p-2 lg:p-3 rounded-lg border-2 transition-all ${
                pickLocation 
                  ? 'border-success bg-success/5' 
                  : 'border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background'
              }`}>
                <div className="flex items-center mb-1 lg:mb-2">
                  <div className="w-2 lg:w-3 h-2 lg:h-3 bg-primary rounded-full mr-2"></div>
                  <span className="text-xs lg:text-sm font-semibold">Pickup Location</span>
                  {pickLocation && <CheckCircle2 className="text-success ml-auto" size={14} />}
                </div>
                {pickLocation ? (
                  <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                    {pickAddress}
                  </p>
                ) : (
                  <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Click on map to select
                  </p>
                )}
              </div>

              <div className={`p-2 lg:p-3 rounded-lg border-2 transition-all ${
                dropLocation 
                  ? 'border-success bg-success/5' 
                  : 'border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background'
              }`}>
                <div className="flex items-center mb-1 lg:mb-2">
                  <div className="w-2 lg:w-3 h-2 lg:h-3 bg-error rounded-full mr-2"></div>
                  <span className="text-xs lg:text-sm font-semibold">Dropoff Location</span>
                  {dropLocation && <CheckCircle2 className="text-success ml-auto" size={14} />}
                </div>
                {dropLocation ? (
                  <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                    {dropAddress}
                  </p>
                ) : (
                  <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Click on map to select
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}