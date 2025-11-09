import { RideListing } from "../RideListting/rideListtingModel";
import { RideRequest } from "../RideRequest/rideRequestModel";


export interface TransportationOffer {
  id: number;
  senderId: string;
  recipientId: string;
  pricePerSeat: string;
  seatsRequested: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string; // ISO date string
  
  transportationListingId: number | null;
  transportationRequestId: number | null;
  
  listing?: RideListing;
  request?: RideRequest;
}

