"use client";
import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  ArrowRight,
  CheckCircle,
  Search,
  Navigation,
  X,
  Loader2
} from 'lucide-react';

interface LocationData {
  lat: number;
  lng: number;
  address: string;
  placeId?: string;
}

interface StartLocationWizardProps {
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  initialLocation?: LocationData | null;
}

export default function StartLocationWizard({ 
  onLocationSelect, 
  onClose,
  initialLocation = null 
}: StartLocationWizardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  
  // Map click functionality
  const [mapClickMode, setMapClickMode] = useState<boolean>(true);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(initialLocation);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current || map) return;

      // Center on Pakistan (between Islamabad and Lahore)
      const pakistanCenter = { lat: 32.0853, lng: 72.7033 };
      
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: initialLocation || pakistanCenter,
        zoom: initialLocation ? 12 : 8,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      const newGeocoder = new window.google.maps.Geocoder();

      // Add map click listener
      newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (!mapClickMode || !e.latLng) return;
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        console.log(`Map clicked: lat ${lat}, lng ${lng}`);

        // Reverse geocode to get address
        newGeocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const result = results[0];
            const address = result.formatted_address;
            
            // Check if the clicked location is in Islamabad or Lahore only
            const isValidLocation = result.address_components?.some(component => {
              const name = component.long_name.toLowerCase();
              const types = component.types;
              
              // Only allow Islamabad and Lahore for trip planner
              const allowedCities = ['islamabad', 'lahore'];
              
              if (types.includes('locality') || types.includes('sublocality') || 
                  types.includes('administrative_area_level_2')) {
                return allowedCities.some(city => name.includes(city) || city.includes(name));
              }
              
              return false;
            });

            if (!isValidLocation) {
              alert('Please select a location within Islamabad or Lahore only.');
              return;
            }
            
            const locationData: LocationData = {
              lat,
              lng,
              address,
              placeId: result.place_id
            };

            setSelectedLocation(locationData);
            if (inputRef.current) {
              inputRef.current.value = address;
            }

            // Update marker
            updateMarker(locationData, newMap);
          } else {
            console.error('Geocoding failed:', status);
            alert('Unable to determine location. Please try again.');
          }
        });
      });

      // Pakistan bounds
      const pakistanBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(23.5, 60.0), // Southwest
        new window.google.maps.LatLng(37.0, 77.0)  // Northeast
      );

      // Setup autocomplete with location restrictions - Islamabad and Lahore only
      if (inputRef.current) {
        const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
          bounds: pakistanBounds,
          componentRestrictions: { country: 'pk' },
          strictBounds: false,
          types: ['(cities)']  // Only cities, not addresses
        });
        
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          
          if (!place.geometry?.location) {
            console.error('No geometry found for place');
            return;
          }

          // Check if location is in Islamabad or Lahore only
          const isValidLocation = place.address_components?.some(component => {
            const name = component.long_name.toLowerCase();
            const types = component.types;
            
            // Only allow Islamabad and Lahore for trip planner
            const allowedCities = ['islamabad', 'lahore'];
            
            if (types.includes('locality') || types.includes('sublocality') || 
                types.includes('administrative_area_level_2')) {
              return allowedCities.some(city => name.includes(city) || city.includes(name));
            }
            
            return false;
          });

          if (!isValidLocation) {
            alert('Please select a location within Islamabad or Lahore only.');
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

          setSelectedLocation(locationData);
          if (inputRef.current) {
            inputRef.current.value = locationData.address;
          }

          // Update marker
          updateMarker(locationData, newMap);
        });
        
        setAutocomplete(ac);
      }

      setMap(newMap);
      setGeocoder(newGeocoder);

      // Set initial marker if location provided
      if (initialLocation) {
        updateMarker(initialLocation, newMap);
      }
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

  // Update map cursor based on mapClickMode
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

  const updateMarker = (location: LocationData, targetMap: google.maps.Map) => {
    // Remove existing marker
    if (marker) {
      marker.setMap(null);
    }

    // Create new marker
    const newMarker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: targetMap,
      title: 'Starting Location',
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF',
        scale: 10
      }
    });

    setMarker(newMarker);

    // Center map on marker
    targetMap.setCenter({ lat: location.lat, lng: location.lng });
    targetMap.setZoom(12);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      setIsLoading(true);
      onLocationSelect(selectedLocation);
      setTimeout(() => {
        setIsLoading(false);
        if (onClose) onClose();
      }, 300);
    }
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Reverse geocode to get address
          if (geocoder) {
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
              if (status === 'OK' && results && results[0]) {
                const locationData: LocationData = {
                  lat,
                  lng,
                  address: results[0].formatted_address,
                  placeId: results[0].place_id
                };

                setSelectedLocation(locationData);
                if (inputRef.current) {
                  inputRef.current.value = locationData.address;
                }

                if (map) {
                  updateMarker(locationData, map);
                }
              }
              setIsLoading(false);
            });
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please select manually.');
          setIsLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[rgb(var(--surface))] rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[rgba(var(--success),0.1)] flex items-center justify-center">
              <MapPin className="text-[rgb(var(--success))]" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[rgb(var(--text))]">
                Select Starting City
              </h2>
              <p className="text-sm text-[rgb(var(--text-secondary))]">
                Choose Islamabad or Lahore as your starting point
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Search Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[rgb(var(--text))] mb-2">
              Search for a city
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type Islamabad or Lahore..."
                className="input w-full pl-10"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4 flex gap-3">
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={isLoading}
              className="btn flex items-center gap-2 flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation size={16} />
                  Use My Location
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => setMapClickMode(!mapClickMode)}
              className={`btn flex items-center gap-2 flex-1 ${
                mapClickMode 
                  ? 'bg-[rgb(var(--success))] text-white' 
                  : ''
              }`}
            >
              <MapPin size={16} />
              {mapClickMode ? 'Click on Map (Active)' : 'Enable Map Click'}
            </button>
          </div>

          {/* Map */}
          <div 
            ref={mapRef}
            className={`w-full h-96 rounded-lg border border-gray-200 dark:border-gray-600 transition-all ${
              mapClickMode ? 'cursor-crosshair ring-2 ring-[rgb(var(--success))] ring-opacity-50' : 'cursor-default'
            }`}
          />

          {/* Selected Location Display */}
          {selectedLocation && (
            <div className="mt-4 p-4 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-[rgb(var(--success))] flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-[rgb(var(--success))] mb-1">
                    Location Selected
                  </p>
                  <p className="text-sm text-[rgb(var(--text))]">
                    {selectedLocation.address}
                  </p>
                  <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 p-4 bg-[rgba(var(--info),0.1)] rounded-lg border border-[rgba(var(--info),0.3)]">
            <p className="text-sm text-[rgb(var(--text))]">
              <strong>How to select:</strong>
            </p>
            <ul className="text-sm text-[rgb(var(--text-secondary))] mt-2 space-y-1 ml-4 list-disc">
              <li>Type "Islamabad" or "Lahore" in the search box</li>
              <li>Click the "Use My Location" button if you're in one of these cities</li>
              <li>Enable "Map Click" and click on Islamabad or Lahore on the map</li>
            </ul>
            <p className="text-xs text-[rgb(var(--warning))] mt-3 font-semibold">
              ⚠️ Only Islamabad and Lahore are available for trip planning
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="btn"
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedLocation || isLoading}
            className="btn btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                Confirm Location
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
