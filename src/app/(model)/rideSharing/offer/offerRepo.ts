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
}

