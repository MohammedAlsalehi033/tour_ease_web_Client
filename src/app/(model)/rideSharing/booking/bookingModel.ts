import { TransportationOffer } from "../offer/offerModel";
import { RideListing } from "../RideListting/rideListtingModel";
import { RideRequest } from "../RideRequest/rideRequestModel";


export interface Booking {
  id: number;
    travelerId: string;
    seatsBooked: number;
    luggage: string | null;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'complete';
    totalPrice: string;
    createdAt: string;
    bookingSource: 'listing' | 'request';
    transportationListingId: number | null;
    transportationRequestId: number | null;
    offerId: number;
    listing: RideListing | null; 
    request: RideRequest | null;
    offer: TransportationOffer | null;
}


 