"use client";
import "reflect-metadata";
import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Users, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { container } from 'tsyringe';
import { RideListingController } from '@/app/(controller)/rideSharing/rideListingController';
import { RideListing } from '../../../../(model)/rideSharing/RideListting/rideListtingModel';
import { useSession } from "next-auth/react";

export default function GoogleMapComponent() {
  const router = useRouter();

  const [pickLocation, setPickLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [pickAddress, setPickAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [mode, setMode] = useState('pick');
  const modeRef = useRef('pick');

  const [selectedDate, setSelectedDate] = useState('');
  const [time, setTime] = useState('11:41:00.000Z');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [travelers, setTravelers] = useState(1);
  const [luggage, setLuggage] = useState(0);

  const [map, setMap] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [geocoder, setGeocoder] = useState(null);
  const mapRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
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
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error);
    };

    document.head.appendChild(script);

    return () => {
      if (!window.google?.maps) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current || loaded) return;

    const pakistanLocation = { lat: 33.6844, lng: 73.0479 };
    const mapOptions = {
      center: pakistanLocation,
      zoom: 12,
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
            setMode('drop');
            modeRef.current = 'drop';
            console.log('Switching to drop mode');
          } else if (currentMode === 'drop') {
            setDropLocation({ lat, lng });
            setDropAddress(address);
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

  const handleDateChange = (e) => {
    const inputDate = e.target.value;
    if (inputDate >= today) {
      setSelectedDate(inputDate);
    }
  };

  const handleTravelersChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setTravelers(value);
  };

  const handleLuggageChange = (e) => {
    const value = Math.max(0, parseInt(e.target.value) || 0);
    setLuggage(value);
  };

  const handlePriceChange = (type, value) => {
    const numValue = Math.max(0, parseFloat(value) || 0);
    if (type === 'min') {
      setPriceRange(prev => ({ ...prev, min: Math.min(numValue, prev.max) }));
    } else {
      setPriceRange(prev => ({ ...prev, max: Math.max(numValue, prev.min) }));
    }
  };

  const handleTimeChange = (type, value) => {
    setTime(value)


  };


  const { data: session } = useSession();


  const handleSearch = async () =>  {
const rideListingController =  container.resolve(RideListingController)

setLoaded(false);
const result = await rideListingController.createRideListing({
   providerId: session?.user?.id,
   startLocationText: pickAddress,
   endLocationText: dropAddress,
   departureTime: new Date(`${selectedDate}T${time}`).toISOString(),
   startLocationLat: pickLocation.lat,
    startLocationLng: pickLocation.lng,
    endLocationLat: dropLocation.lat,
    endLocationLng: dropLocation.lng,
    seatsAvailable: travelers,
    pricePerSeat: priceRange.min.toString(),
    mediaUrls: [], // Assuming no media URLs for now
    status: 'active',
    createdAt: new Date().toISOString(),


    } as RideListing);

setLoaded(true);

  };

  const isSearchReady = pickLocation && dropLocation && selectedDate;

  return (
    <div className='mt-10 '>
      <div className="card w-full p-4 mb-8">
        <h2 className="mb-4 text-center w-full">Create your own Liting</h2>

        <div className="mb-6">
          <h3 className="text-title-md mb-4 flex items-center">
            <MapPin className="mr-2" size={20} />
            Location Selector
          </h3>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              className={`btn-${mode === 'pick' ? 'primary' : 'outlined'}`}
              onClick={() => handleModeChange('pick')}
            >
              Pick-up Location {pickLocation ? '✓' : ''}
            </button>
            <button
              className={`btn-${mode === 'drop' ? 'primary' : 'outlined'}`}
              onClick={() => handleModeChange('drop')}
            >
              Drop-off Location {dropLocation ? '✓' : ''}
            </button>
            {(pickLocation || dropLocation) && (
              <button
                className="btn-outlined"
                onClick={resetLocations}
              >
                Reset All
              </button>
            )}
          </div>

          <p className="text-body-md mb-4">
            {mode === 'pick'
              ? "Click on the map to select your pick-up location"
              : "Click on the map to select your drop-off location"}
          </p>

          <div
            ref={mapRef}
            className="h-64 w-full rounded-lg mb-4"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-light-background dark:bg-dark-background rounded">
              <h4 className="text-title-sm mb-2">Pick-up Location</h4>
              {pickLocation ? (
                <div>
                  <p className="text-body-sm mb-1">{pickAddress}</p>
                  <p className="text-body-xs">{`${pickLocation.lat.toFixed(6)}, ${pickLocation.lng.toFixed(6)}`}</p>
                </div>
              ) : (
                <p className="text-body-sm text-gray-500">Click on map to select</p>
              )}
            </div>

            <div className="p-3 bg-light-background dark:bg-dark-background rounded">
              <h4 className="text-title-sm mb-2">Drop-off Location</h4>
              {dropLocation ? (
                <div>
                  <p className="text-body-sm mb-1">{dropAddress}</p>
                  <p className="text-body-xs">{`${dropLocation.lat.toFixed(6)}, ${dropLocation.lng.toFixed(6)}`}</p>
                </div>
              ) : (
                <p className="text-body-sm text-gray-500">Click on map to select</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="flex items-center text-title-sm">
              <Calendar className="mr-2" size={18} />
              Travel Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              onChange={handleDateChange}
              className="input w-full"
            />
          </div>

          {/* Time Range */}
          <div className="space-y-2">
            <label className="flex items-center text-title-sm">
              <Clock className="mr-2" size={18} />
              Time Range
            </label>
            <div className="flex space-x-2">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className="input flex-1"
              />

            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="flex items-center text-title-sm">
              <DollarSign className="mr-2" size={18} />
              Price Range ($)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                min="0"
                step="200"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', e.target.value)}
                className="input flex-1"
              />
              <span className="self-center text-body-md">-</span>

            </div>
          </div>

          {/* Number of Travelers */}
          <div className="space-y-2">
            <label className="flex items-center text-title-sm">
              <Users className="mr-2" size={18} />
              Travelers
            </label>
            <input
              type="number"
              min="1"
              value={travelers}
              onChange={handleTravelersChange}
              className="input w-full"
            />
          </div>

          {/* Luggage */}
          <div className="space-y-2">
            <label className="flex items-center text-title-sm">
              <Package className="mr-2" size={18} />
              Luggage Pieces
            </label>
            <input
              type="number"
              min="0"
              value={luggage}
              onChange={handleLuggageChange}
              className="input w-full"
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSearch}
            disabled={!isSearchReady}
            className={`btn-${isSearchReady ? 'primary' : 'outlined'} px-8 py-3`}
          >
            {isSearchReady ? 'Search Trips' : 'Complete Required Fields'}
          </button>
        </div>

        {/* Status Info */}
        {!isSearchReady && (
          <div className="mt-4 p-4 bg-light-background dark:bg-dark-background rounded-lg">
            <p className="text-body-sm">
              <strong>Missing:</strong> {!pickLocation && 'Pick-up location'}
              {!pickLocation && !dropLocation && ', '}
              {!dropLocation && 'Drop-off location'}
              {(!pickLocation || !dropLocation) && !selectedDate && ', '}
              {!selectedDate && 'Travel date'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}