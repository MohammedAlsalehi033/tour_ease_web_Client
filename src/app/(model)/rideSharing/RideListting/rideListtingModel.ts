import { User } from "next-auth";

// Provider model interface
export interface Provider {
  providerId: string;
  licenseMmediaUrls: string[];
  vehicleMediaUrls: string[];
  vehicleType: string;
  seatsAvailable: number;
  createdAt: string;
  accountStatus: 'active' | 'blocked' | 'pending';
  user: User;
}

// Ride Listing model interface
export interface RideListing {
  id: number;
  providerId: string;
  startLocationLat: number;
  startLocationLng: number;
  startLocationText: string;
  endLocationLat: number;
  endLocationLng: number;
  endLocationText: string;
  departureTime: string;
  seatsAvailable: number;
  pricePerSeat: string;
  status: 'active' | 'pending' | 'complete' | 'cancelled';
  mediaUrls: string[];
  createdAt: string;
  distance_km: number;
  luggage?: number;
  provider: Provider;
}

