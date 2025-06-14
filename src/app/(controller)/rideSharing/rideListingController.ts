import { RideListing } from "@/app/(model)/rideSharing/RideListting/rideListtingModel";
import { RideListingRepo } from "@/app/(model)/rideSharing/RideListting/rideListtingRepo";
import { inject, injectable } from 'tsyringe';

@injectable()
export class RideListingController {

    constructor(@inject(RideListingRepo) private rideListingRepo: RideListingRepo) { }

    async getNearByRideListing(
        latitude: number,
        longitude: number,
        radius: number,
        dropLoationLatitude: number,
        dropLoationLongitude: number,
        date: string,
        timeRange: { start: string; end: string },
        priceRange: { min: number; max: number },
        travelers: number,
        luggage: number
    ): Promise<RideListing[]> {
        try {
            const rideListings = await this.rideListingRepo.getNearbyListings(
                latitude,
                longitude,
                radius,
                dropLoationLatitude,
                dropLoationLongitude,
                date,
                timeRange,
                priceRange,
                travelers,
                luggage
            );
            return rideListings;
        } catch (error) {
            console.error('Error fetching nearby ride listings:', error);
            throw new Error('Error fetching ride listings');
        }
    }

    async createRideListing(
        rideListing: RideListing
    ): Promise<RideListing> {
        try {
            const createdRideListing = await this.rideListingRepo.createRideListing(rideListing);
            return createdRideListing;
        } catch (error) {
            console.error('Error creating ride listing:', error);
            throw new Error('Error creating ride listing');
        }
    }
}
