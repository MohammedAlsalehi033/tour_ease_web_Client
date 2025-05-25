import { injectable } from 'tsyringe';
import { ApiService } from '@/app/services/apiService';
import { RideListing } from './rideListtingModel';
import { ResponseModel } from '@/Types/types';


@injectable()
export class RideListingRepo {
  constructor(private apiService: ApiService) {}

  async getNearbyListings(
    latitude: number,
    longitude: number,
    radius?: number,
     dropLoationLatitude?: number,
        dropLoationLongitude?: number
  ): Promise<RideListing[]> {
    try {
      let endpoint = `/searchForNearByListing?lat=${latitude}&lng=${longitude}`;
      
      if (radius) {
        endpoint += `&radius=${radius}`;
      }
      
      const response = await this.apiService.get<ResponseModel<RideListing>>(endpoint);
      
      if (!response.success) {
        throw new Error('Failed to fetch nearby ride listings');
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
      
      const dataTosend= {
        providerId : rideListing.providerId,
        startLocationText : rideListing.startLocationText,
        endLocationText : rideListing.endLocationText,
        startLocationLat : rideListing.startLocationLat,
        startLocationLng : rideListing.startLocationLng,
        endLocationLat : rideListing.endLocationLat,
        endLocationLng : rideListing.endLocationLng,
        departureTime : rideListing.departureTime,
        pricePerSeat : rideListing.pricePerSeat,
        seatsAvailable : rideListing.seatsAvailable,
        mediaUrls : [],
      }


      console.log(JSON.stringify(dataTosend, null, 2));
      const response = await this.apiService.post<ResponseModel<RideListing>>(
        '/createRideSharingListing',
        dataTosend
      );

      if (!response.success) {
        throw new Error('Failed to create ride listing');
      }

      return response.data;
    } catch (error) {
      console.error('Error creating ride listing:', error);
      throw error;
    }
  }
}