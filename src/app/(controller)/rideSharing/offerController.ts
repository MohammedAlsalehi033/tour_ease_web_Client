import { inject, injectable } from 'tsyringe';
import { OfferRepo } from '@/app/(model)/rideSharing/offer/offerRepo';
import { promises } from 'dns';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';

@injectable()
export class OfferController {


    constructor(@inject(OfferRepo) private offerRepo: OfferRepo) {}

    async getReceivedOffers(id: string) : Promise <TransportationOffer[]> {
        try {
            const offers = await this.offerRepo.getReceivedOffers(id);
            console.log(offers)
            return offers;
        } catch (error) {
            console.error('Error fetching received offers:', error);
            throw error;
        }
    
    }
    async getSentOffers(id: string) : Promise <TransportationOffer[]>{
        try {
            const offers = await this.offerRepo.getSentOffers(id);
            return offers;
        } catch (error) {
            console.error('Error fetching sent offers:', error);
            throw error;
        }
    
    }

    async createOffer(offer: TransportationOffer): Promise<TransportationOffer> {
        try {
            const createdOffer = await this.offerRepo.createOffer(offer);
            return createdOffer;
        } catch (error) {
            console.error('Error creating offer:', error);
            throw error;
        }
    }
}