import { RideListing } from "@/app/(model)/rideSharing/RideListting/rideListtingModel";
import { RideListingRepo } from "@/app/(model)/rideSharing/RideListting/rideListtingRepo";

import { inject, injectable } from 'tsyringe';

@injectable()
export class RideListingController {

    constructor( @inject (RideListingRepo) private rideListingRepo: RideListingRepo) {}

  async getNearByRideListing(
    latitude: number,
    longitude: number,
    radius?: number,
     dropLoationLatitude?: number,
        dropLoationLongitude?: number
    
  ): Promise<RideListing[]> {
    try {
      const rideRequests = await this.rideListingRepo.getNearbyListings( 
        latitude,
        longitude,
        radius,
        dropLoationLatitude,
        dropLoationLongitude

      );
      return rideRequests;
    } catch (error) {
      throw new Error('Error fetching ride requests');
    }
  }

async createRideListing(
    rideListing: RideListing
  ): Promise<RideListing> {
    try {
      const createdRideListing = await this.rideListingRepo.createRideListing(rideListing);
      return createdRideListing;
    } catch (error) {
      throw new Error('Error creating ride listing');
    }
  }
} 