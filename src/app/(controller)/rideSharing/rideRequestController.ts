import { RideRequest } from "@/app/(model)/rideSharing/RideRequest/rideRequestModel";
import { RideRequestRepo } from "@/app/(model)/rideSharing/RideRequest/rideRequestRepo";
import { inject, injectable } from "tsyringe";



@injectable()
export class RideRequestController {
    constructor(@inject(RideRequestRepo) private rideRequestRepository: RideRequestRepo) {}

    async getNearByRideRequests(
        latitude: number,
        longitude: number,
        radius?: number,
        dropLocationLatitude?: number,
        dropLocationLongitude?: number,
        date?: string,
        startTime?: string,
        endTime?: string,
        minBudget?: number,
        maxBudget?: number,
        maxSeatsNeeded?: number,
        luggage?: number,
        sortBy?: 'distance' | 'budget_asc' | 'budget_desc' | 'time_asc' | 'time_desc'
    ): Promise<RideRequest[]> {
        try {
            const rideRequests = await this.rideRequestRepository.getNearByRideRequests(
                latitude, 
                longitude, 
                radius,
                date,
                startTime,
                endTime,
                dropLocationLatitude,
                dropLocationLongitude,
                minBudget,
                maxBudget,
                maxSeatsNeeded,
                luggage,
                sortBy
            );
            return rideRequests;
        } catch (error) {
            throw new Error("Error fetching ride requests");
        }
    }

    async createRideRequest(rideRequest: RideRequest): Promise<RideRequest> {
        try {
            console.log("Creating ride request:", rideRequest);
            const createdRideRequest = await this.rideRequestRepository.createRideRequest(rideRequest);
            return createdRideRequest;
        } catch (error) {
            throw new Error("Error creating ride request");
        }
    }
    
}