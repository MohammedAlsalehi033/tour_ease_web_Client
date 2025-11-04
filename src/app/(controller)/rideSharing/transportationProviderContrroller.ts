import { inject, injectable } from 'tsyringe';
import { TransportationProviderRepo } from '../../(model)/rideSharing/transformationProvider/transformationProvider';

@injectable()
export class TransformationProviderController {


    constructor(@inject(TransportationProviderRepo) private transformationProviderRepo: TransportationProviderRepo) {}
    
    async getTransformationProviderById(id: string) {
        try {
            const transformationProvider = await this.transformationProviderRepo.getTransportationProviderById(id);
            return transformationProvider;
        } catch (error) {
            console.error('Error fetching transformation provider:', error);
            throw error;
        }
    }


    async createTransformationProvider(   transportationProviderModel: any,
        vehicleMedia: File[],
        licenseMedia: File[]) {
        try {
            const response = await this.transformationProviderRepo.createTransportationProvider(
                transportationProviderModel,
                vehicleMedia,
                licenseMedia
            );
            return response;
        } catch (error) {
            console.error('Error creating transformation provider:', error);
            throw error;
        }
    
    }
}