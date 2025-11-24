import { ApiService } from "@/app/services/apiService";
import { injectable } from "tsyringe";

@injectable()
export class TransportationProviderRepo {
    constructor(private apiService: ApiService) {}

    async getTransportationProviderById(id: string) {
        try {
            const response = await this.apiService.get(`/getTransportationProvider/${id}`);
            if (!response.success) {
                throw new Error('Failed to fetch transportation provider');
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching transportation provider:', error);
            throw error;
        }
    }
    
    async createTransportationProvider(
        transportationProviderModel: any,
        vehicleMedia: File[],
        licenseMedia: File[]
    ): Promise<any> {
        const formData = new FormData();
        
        formData.append('id', transportationProviderModel.userId || '');
        formData.append('role', 'asdfasdfasd');
        
        formData.append('vehicleType', transportationProviderModel.vehicleType);
        formData.append('seatsAvailable', transportationProviderModel.seatsAvailable.toString());
        
        if (licenseMedia && licenseMedia.length > 0) {
            licenseMedia.forEach(file => {
                formData.append('licenseMedia', file);
            });
        }
        
        if (vehicleMedia && vehicleMedia.length > 0) {
            vehicleMedia.forEach(file => {
                formData.append('vehicleMedia', file);
            });
        }
        
        try {
            const url = `${this.apiService.baseUrl}/createTransportationProvider`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to create transportation provider');
            }
            
            return responseData.data;
        } catch (error: any) {
            console.error('Error creating transportation provider:', error);
            
            let errorMessage = 'Failed to create provider.';
            if (error instanceof Response) {
                errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown server error'}`;
            } else if (error.name === 'TypeError') {
                errorMessage = `Network error: ${error.message || 'Connection failed'}`;
            } else {
                errorMessage = `An unexpected error occurred: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }

    async updateTransportationProvider(
        id: string,
        seatsAvailable: number,
        vehicleType: string,
        vehicleMedia: File[],
        licenseMedia: File[]
    ): Promise<any> {
        const formData = new FormData();
        
        formData.append('seatsAvailable', seatsAvailable.toString());
        formData.append('vehicleType', vehicleType);
        
        if (licenseMedia && licenseMedia.length > 0) {
            licenseMedia.forEach(file => {
                formData.append('licenseMedia', file);
            });
        }
        
        if (vehicleMedia && vehicleMedia.length > 0) {
            vehicleMedia.forEach(file => {
                formData.append('vehicleMedia', file);
            });
        }
        
        try {
            const url = `${this.apiService.baseUrl}/transportation-provider/${id}`;
            const response = await fetch(url, {
                method: 'PUT',
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const responseData = await response.json();
            
            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to update transportation provider');
            }
            
            return responseData.data;
        } catch (error: any) {
            console.error('Error updating transportation provider:', error);
            
            let errorMessage = 'Failed to update provider.';
            if (error instanceof Response) {
                errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown server error'}`;
            } else if (error.name === 'TypeError') {
                errorMessage = `Network error: ${error.message || 'Connection failed'}`;
            } else {
                errorMessage = `An unexpected error occurred: ${error.message}`;
            }
            
            throw new Error(errorMessage);
        }
    }
}