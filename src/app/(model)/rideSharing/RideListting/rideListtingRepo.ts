import { injectable, inject } from 'tsyringe';
import { ApiService } from '@/app/services/apiService';
import { RideListing } from './rideListtingModel';
import { ResponseModel } from '@/Types/types';
import { createExactDateTime } from '@/app/lib/timeUtils';

@injectable()
export class RideListingRepo {
  constructor(@inject(ApiService) private apiService: ApiService) {}

  async getNearbyListings(
    latitude: number,
    longitude: number,
    radius: number,
    dropLoationLatitude: number,
    dropLoationLongitude: number,
    date: string,
    timeRange: { start: string; end: string },
    priceRange: { min: number; max: number },
    travelers: number,
    luggage: number // This parameter is unused for now but kept for signature consistency
  ): Promise<RideListing[]> {
    try {
      let endpoint = `/searchForNearByListing?lat=${latitude}&lng=${longitude}`;

      if (dropLoationLatitude && dropLoationLongitude) {
          endpoint += `&endLat=${dropLoationLatitude}&endLng=${dropLoationLongitude}`;
      }
      if (radius) {
        endpoint += `&radiusKm=${radius}`;
      }
      if (travelers) {
        endpoint += `&minSeats=${travelers}`;
      }
      if (priceRange && priceRange.max) {
        endpoint += `&maxPrice=${priceRange.max}`;
      }
      // Combine date and time to create exact time filters (no timezone conversion)
      if (date && timeRange.start && timeRange.end) {
        const departureAfter = createExactDateTime(date, timeRange.start);
        const departureBefore = createExactDateTime(date, timeRange.end);
        endpoint += `&departureAfter=${encodeURIComponent(departureAfter)}`;
        endpoint += `&departureBefore=${encodeURIComponent(departureBefore)}`;
      }
      console.log('Fetching nearby listings with endpoint:', endpoint);
      const response = await this.apiService.get<ResponseModel<RideListing[]>>(endpoint);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch nearby ride listings');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby ride listings:', error);
      throw error;
    }
  }

  async createRideListing(
    rideListing: RideListing
  ): Promise<RideListing> {
    try {
      const dataToSend = {
        providerId: rideListing.providerId,
        startLocationText: rideListing.startLocationText,
        endLocationText: rideListing.endLocationText,
        startLocationLat: rideListing.startLocationLat,
        startLocationLng: rideListing.startLocationLng,
        endLocationLat: rideListing.endLocationLat,
        endLocationLng: rideListing.endLocationLng,
        departureTime: rideListing.departureTime,
        pricePerSeat: rideListing.pricePerSeat,
        seatsAvailable: rideListing.seatsAvailable,
        mediaUrls: [],
      };

      console.log(JSON.stringify(dataToSend, null, 2));
      const response = await this.apiService.post<ResponseModel<RideListing>>(
        '/createRideSharingListing',
        dataToSend
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to create ride listing');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating ride listing:', error);
      throw error;
    }
  }
}
