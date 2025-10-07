import { ResponseModel } from "@/Types/types";
import { RideRequest } from "./rideRequestModel";
import { injectable } from 'tsyringe';
import { ApiService } from "@/app/services/apiService";


@injectable()
export class RideRequestRepo {
    constructor(private apiService: ApiService) {}

    //  radiusKm: radiusKm ? Number(radiusKm) : 30,
    //     endLat: latEnd && lngEnd ? Number(latEnd) : undefined,
    //     endLng: latEnd && lngEnd ? Number(lngEnd) : undefined,
    //     date: date ? String(date) : undefined,
    //     startTime: startTime ? String(startTime) : undefined,
    //     endTime: endTime ? String(endTime) : undefined,
    //     minBudget: minBudget ? Number(minBudget) : undefined,
    //     maxBudget: maxBudget ? Number(maxBudget) : undefined,
    //     maxSeatsNeeded: maxSeatsNeeded ? Number(maxSeatsNeeded) : undefined,
    //     sortBy: (sortBy ? String(sortBy) : 'distance') as 'distance' | 'budget_asc' | 'budget_desc' | 'time_asc' | 'time_desc'


    async getNearByRideRequests(
        latitude: number,
        longitude: number,
        radius?: number,
        date?: string,
        startTime?: string,
        endTime?: string,
        dropLocationLatitude?: number,
        dropLocationLongitude?: number,
        minBudget?: number,
        maxBudget?: number,
        maxSeatsNeeded?: number,
        luggage?: number,
        sortBy?: 'distance' | 'budget_asc' | 'budget_desc' | 'time_asc' | 'time_desc'
    ): Promise<RideRequest[]> {
        try {
            let endpoint = `/searchForNearByRequests?lat=${latitude}&lng=${longitude}&date=${date || ''}&startTime=${startTime || ''}&endTime=${endTime || ''}&latEnd=${dropLocationLatitude || ''}&lngEnd=${dropLocationLongitude || ''}`;

            if (radius) {
                endpoint += `&radiusKm=${radius}`;
            }

            // Add minBudget (default to 0 if not provided)
            if (minBudget !== undefined) {
                endpoint += `&minBudget=${minBudget}`;
            } else {
                endpoint += `&minBudget=0`;
            }

            // Add maxBudget if provided
            if (maxBudget !== undefined) {
                endpoint += `&maxBudget=${maxBudget}`;
            }

            // Add maxSeatsNeeded if provided (optional)
            if (maxSeatsNeeded !== undefined) {
                endpoint += `&maxSeatsNeeded=${maxSeatsNeeded}`;
            }

            // Add luggage if provided (optional)
            if (luggage !== undefined) {
                endpoint += `&luggage=${luggage}`;
            }

            // Add sortBy if provided
            if (sortBy) {
                endpoint += `&sortBy=${sortBy}`;
            }

            const response = await this.apiService.get<ResponseModel<RideRequest>>(endpoint);

            if (!response.success) {
                throw new Error('Failed to fetch nearby ride requests');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching nearby ride requests:', error);
            throw error;
        }
    }


    async createRideRequest(
        rideRequest: RideRequest
    ): Promise<RideRequest> {
        try {
            const response = await this.apiService.post<ResponseModel<RideRequest>>('/createRideSharingRequest', rideRequest);

            if (!response.success) {
                throw new Error('Failed to create ride request');
            }

            return response.data;
        } catch (error) {
            console.error('Error creating ride request:', error);
            throw error;
        }
    }
}