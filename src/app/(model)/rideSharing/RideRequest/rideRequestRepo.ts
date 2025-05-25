import { ResponseModel } from "@/Types/types";
import { RideRequest } from "./rideRequestModel";
import { injectable } from 'tsyringe';
import { ApiService } from "@/app/services/apiService";


@injectable()
export class RideRequestRepo {
    constructor(private apiService: ApiService) {}


    async getNearByRideRequests(
        latitude: number,
        longitude: number,
        radius?: number,
    ): Promise<RideRequest[]> {
        try {
            let endpoint = `/searchForNearByRequests?lat=${latitude}&lng=${longitude}`;

            if (radius) {
                endpoint += `&radiusKm=${radius}`;
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
}