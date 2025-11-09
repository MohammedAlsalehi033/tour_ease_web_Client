
export interface RideRequest {
  id: number;
  travelerId: string;
  startLocationLat: number;
  startLocationLng: number;
  startLocationText: string;
  endLocationLat: number;
  endLocationLng: number;
  endLocationText: string;
  departureTime: string;
  seatsNeeded: number;
  budget: string;
  createdAt: string;
  distance_km: number;
  luggage?: number;
  sender: {
    id: string;
    username: string;
    mediaUrls: string[];
  }
}

