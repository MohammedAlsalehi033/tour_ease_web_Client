"use client"
import 'reflect-metadata';

import { XCircle } from 'lucide-react'
import React, { useRef } from 'react'
import { CheckCircle } from 'lucide-react'
import { container } from '@/app/lib/diContainer';
import { OfferController } from '@/app/(controller)/rideSharing/offerController';

const RejectButton = ({ offer }) => {
    const offerController = container.resolve(OfferController)

    const buttonRef = useRef<HTMLButtonElement>(null);
    let isLoading = false;


    const handleRejectOffer = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!offer || !offer.id) return;

        try {
            if (buttonRef.current) {
                buttonRef.current.disabled = true; // Disable button to prevent multiple clicks
                isLoading = true; // Set loading state
            }
            const acceptedOffer = await offerController.rejectOffer(offer.id);
            window.location.reload(); // Reload the page to reflect changes
        } catch (error) {
            console.error('Error accepting offer:', error);
        } finally {
            if (buttonRef.current) {
                isLoading = false; // Reset loading state
                buttonRef.current.disabled = false; // Re-enable button after operation
            }
        }

      
    }
      return (
            <div>
                <button
                    onClick={handleRejectOffer}
                    className="w-full btn-outlined py-3 px-4 rounded-full border border-red-300 text-red-600 dark:text-red-400 dark:border-red-600 font-medium flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <XCircle className="w-4 h-4 mr-2" />
                    Decline
                </button>
            </div>
        )
}

export default RejectButton;
