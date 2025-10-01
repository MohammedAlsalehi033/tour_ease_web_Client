/**
 * Utility functions for map operations
 */

export interface LocationData {
  startLocationText?: string;
  endLocationText?: string;
  startLocationLat?: number;
  startLocationLng?: number;
  endLocationLat?: number;
  endLocationLng?: number;
}

/**
 * Opens Google Maps with directions between two locations
 * @param origin - Starting location data
 * @param destination - Ending location data
 */
export const openGoogleMapsDirections = (
  startLocation: string | { lat: number; lng: number },
  endLocation: string | { lat: number; lng: number }
) => {
  let origin: string;
  let destination: string;

  // Handle start location
  if (typeof startLocation === 'string') {
    origin = encodeURIComponent(startLocation);
  } else {
    origin = `${startLocation.lat},${startLocation.lng}`;
  }

  // Handle end location
  if (typeof endLocation === 'string') {
    destination = encodeURIComponent(endLocation);
  } else {
    destination = `${endLocation.lat},${endLocation.lng}`;
  }

  const url = `https://www.google.com/maps/dir/${origin}/${destination}`;
  window.open(url, '_blank');
};

/**
 * Opens Google Maps with directions for a ride listing or request
 * @param locationData - Location data from listing/request
 */
export const openRouteOnMap = (locationData: LocationData) => {
  const {
    startLocationText,
    endLocationText,
    startLocationLat,
    startLocationLng,
    endLocationLat,
    endLocationLng
  } = locationData;

  // Prefer coordinates if available, fall back to text
  const startLocation = (startLocationLat !== undefined && startLocationLng !== undefined)
    ? { lat: startLocationLat, lng: startLocationLng }
    : startLocationText || '';

  const endLocation = (endLocationLat !== undefined && endLocationLng !== undefined)
    ? { lat: endLocationLat, lng: endLocationLng }
    : endLocationText || '';

  if (startLocation && endLocation) {
    openGoogleMapsDirections(startLocation, endLocation);
  } else {
    console.warn('Insufficient location data to open route on map');
  }
};

/**
 * Shows a single location on Google Maps
 * @param location - Location to show
 */
export const openLocationOnMap = (location: string | { lat: number; lng: number }) => {
  let locationParam: string;

  if (typeof location === 'string') {
    locationParam = encodeURIComponent(location);
  } else {
    locationParam = `${location.lat},${location.lng}`;
  }

  const url = `https://www.google.com/maps/search/${locationParam}`;
  window.open(url, '_blank');
};