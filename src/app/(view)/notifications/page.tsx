import 'reflect-metadata';

import React from 'react'

import { container } from '@/app/lib/diContainer';
import { OfferController } from '../../(controller)/rideSharing/offerController';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';
import OrganizedNotifications from './components/OrganizedNotifications';

const page = async () => {
  const offerController = container.resolve(OfferController);
  const session = await getServerSession(authOptions);
  
  let offers: (TransportationOffer & {
    isOutDated?: boolean;
    sender?: {
      username?: string;
      mediaUrls?: string[];
    };
  })[] = [];
  
  try {
    console.log('Received offers:', offers);
    const receivedOffers = await offerController.getReceivedOffers((session?.user as any)?.id);

    offers = receivedOffers.map(offer => ({
      ...offer,
      isOutDated: new Date(offer.listing?.departureTime ?? '') < new Date(Date.now()) 
        && offer.status === 'pending',
      // Add mock sender data - in real app, this would come from the API
      sender: {
        username: `User${offer.senderId}`,
        mediaUrls: []
      }
    }));
  } catch (error)   {
    console.error('Error fetching offers:', error);
  }

  return <OrganizedNotifications initialOffers={offers} />;
}

export default page;