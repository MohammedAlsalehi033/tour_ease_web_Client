import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";
import { injectable } from "tsyringe";
import { TransportationOffer } from "./offerModel";

@injectable()
export class OfferRepo {
    constructor(private apiService: ApiService) {}


    async getReceivedOffers(id: string) : Promise<TransportationOffer[]> {
        try{
            
            const response = await this.apiService.get<ResponseModel<TransportationOffer>>(`/users/${id}/received-offers`);
            return response.data;
        } catch (error) {
            console.error("Error fetching offer by ID:", error);
            throw error;
        }

    }

    async getSentOffers(id: string) : Promise<TransportationOffer[]> {
        try{
            
            const response = await this.apiService.get<ResponseModel<TransportationOffer>>(`/users/${id}/sent-offers`);
            return response.data;
        } catch (error) {
            console.error("Error fetching offer by ID:", error);
            throw error;
        }

    }

    async createOffer(offer: TransportationOffer): Promise<TransportationOffer> {
        try {
            const response = await this.apiService.post<ResponseModel<TransportationOffer>>("/offers", offer);
            return response.data as TransportationOffer;
        } catch (error) {
            console.error("Error creating offer:", error);
            throw error;
        }
    }

    async acceptOffer(offerId: number): Promise<TransportationOffer> {
        try {
            const response = await this.apiService.put<ResponseModel<TransportationOffer>>(`/offers/${offerId}/accept`);
            return response.data as TransportationOffer;
        } catch (error) {
            console.error("Error accepting offer:", error);
            throw error;
        }
    }
    async rejectOffer(offerId: number): Promise<TransportationOffer> {
        try {
            const response = await this.apiService.put<ResponseModel<TransportationOffer>>(`/offers/${offerId}/reject`);
            return response.data as TransportationOffer;
        } catch (error) {
            console.error("Error rejecting offer:", error);
            throw error;
        }
    }
}

