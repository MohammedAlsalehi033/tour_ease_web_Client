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
}