import { RideListing } from "@/app/(model)/rideSharing/RideListting/rideListtingModel";
import { RideListingRepo } from "@/app/(model)/rideSharing/RideListting/rideListtingRepo";

import { inject, injectable } from 'tsyringe';

@injectable()
export class RideListingController {

    constructor( @inject (RideListingRepo) private rideListingRepo: RideListingRepo) {}

  async getNearByRideListing(
    latitude: number,
    longitude: number,
    radius?: number
  ): Promise<RideListing[]> {
    try {
      const rideRequests = await this.rideListingRepo.getNearbyListings( 
        latitude,
        longitude,
        radius
      );
      return rideRequests;
    } catch (error) {
      throw new Error('Error fetching ride requests');
    }
  }

//   async getRideRequestById(id: number): Promise<RideRequest | null> {
//     try {
//       const rideRequest = await this.rideRequestRepository.getRideRequestById(id);
//       return rideRequest;
//     } catch (error) {
//       throw new Error('Error fetching ride request');
//     }
//   }
} 