import { inject, injectable } from 'tsyringe';
import { OfferRepo } from '@/app/(model)/rideSharing/offer/offerRepo';

@injectable()
export class OfferController {


    constructor(@inject(OfferRepo) private offerRepo: OfferRepo) {}

    async getReceivedOffers(id: string) {
        try {
            const offers = await this.offerRepo.getReceivedOffers(id);
            return offers;
        } catch (error) {
            console.error('Error fetching received offers:', error);
            throw error;
        }
    
    }
    async getSentOffers(id: string) {
        try {
            const offers = await this.offerRepo.getSentOffers(id);
            return offers;
        } catch (error) {
            console.error('Error fetching sent offers:', error);
            throw error;
        }
    
    }
}