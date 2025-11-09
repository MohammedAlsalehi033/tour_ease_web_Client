"use client"
import 'reflect-metadata';

import { CheckCircle } from 'lucide-react'
import React, { use, useRef } from 'react'
import { container } from '@/app/lib/diContainer';
import { OfferController } from '@/app/(controller)/rideSharing/offerController';

const AcceptButton = ({ offer } ) => {
    const offerController = container.resolve(OfferController)

    const buttonRef = useRef<HTMLButtonElement>(null);
    let isLoading = false;


    const handleAcceptOffer = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!offer || !offer.id) return;

        try {
            if (buttonRef.current) {
                buttonRef.current.disabled = true; // Disable button to prevent multiple clicks
                isLoading = true; // Set loading state
            }
            const acceptedOffer = await offerController.acceptOffer(offer.id);
            window.location.reload(); // Reload the page to reflect changes
        } catch (error) {
            console.error('Error accepting offer:', error);
        } finally {
            if (buttonRef.current) {
                isLoading = false; // Reset loading state
                buttonRef.current.disabled = false; // Re-enable button after operation
            }
        }

    };
  return (
            <div>
                <button ref={buttonRef} disabled={isLoading} onClick={handleAcceptOffer} className="w-full btn-primary py-3 px-4 rounded-full bg-green-600 text-white font-medium flex items-center justify-center hover:bg-green-700 transition-colors">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Offer
                </button>
            </div>
  )
}

export default AcceptButton