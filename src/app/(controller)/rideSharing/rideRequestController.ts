import { RideRequest } from "@/app/(model)/rideSharing/RideRequest/rideRequestModel";
import { RideRequestRepo } from "@/app/(model)/rideSharing/RideRequest/rideRequestRepo";
import { inject, injectable } from "tsyringe";



@injectable()
export class RideRequestController {
    constructor(@inject(RideRequestRepo) private rideRequestRepository: RideRequestRepo) {}

    async getNearByRideRequests(
        latitude: number,
        longitude: number,
        radius?: number
    ): Promise<RideRequest[]> {
        try {
            const rideRequests = await this.rideRequestRepository.getNearByRideRequests(
                latitude,
                longitude,
                radius
            );
            return rideRequests;
        } catch (error) {
            throw new Error("Error fetching ride requests");
        }
    }
    
}