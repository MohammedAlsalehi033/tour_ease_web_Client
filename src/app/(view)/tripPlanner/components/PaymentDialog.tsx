"use client";

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { PaymentController } from '@/app/(controller)/payment/paymentController';
import { container } from '@/app/lib/diContainer';
import { Loader2, X, CreditCard } from 'lucide-react';
import { useSession } from 'next-auth/react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentSuccess: (paymentIntentId: string) => void;
  bookingSummary: {
    transportCost: number;
    accommodationCost: number;
    nightsCount: number;
    accommodationName?: string;
    outboundTransport?: string;
    returnTransport?: string;
  };
}

const PaymentForm = ({
  totalAmount,
  onSuccess,
  onCancel,
  bookingSummary,
}: {
  totalAmount: number;
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
  bookingSummary: PaymentDialogProps['bookingSummary'];
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { data: session } = useSession();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paymentController = container.resolve(PaymentController);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent
      const intentResult = await paymentController.createPaymentIntent({
        amount: totalAmount,
        currency: 'pkr',
        customerEmail: session?.user?.email || '',
      });

      if (!intentResult.success) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = intentResult.data as any;

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
          },
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        // Payment successful
        onSuccess(paymentIntentId);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-sm mb-3">Booking Summary</h4>
        
        {bookingSummary.outboundTransport && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Outbound Transport:</span>
            <span>{bookingSummary.outboundTransport}</span>
          </div>
        )}
        
        {bookingSummary.returnTransport && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Return Transport:</span>
            <span>{bookingSummary.returnTransport}</span>
          </div>
        )}
        
        {bookingSummary.accommodationName && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Accommodation:</span>
            <span>{bookingSummary.accommodationName}</span>
          </div>
        )}
        
        {bookingSummary.nightsCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Nights:</span>
            <span>{bookingSummary.nightsCount}</span>
          </div>
        )}
        
        <div className="pt-3 mt-3 border-t border-light-outline dark:border-dark-outline">
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Transport Cost:</span>
            <span>PKR {bookingSummary.transportCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="opacity-70">Accommodation Cost:</span>
            <span>PKR {bookingSummary.accommodationCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Total Amount:</span>
            <span className="text-primary">PKR {totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="w-4 h-4" />
          Card Details
        </label>
        <div className="p-4 border-2 border-light-outline dark:border-dark-outline rounded-lg bg-white dark:bg-dark-surface">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  fontFamily: '"Inter", system-ui, sans-serif',
                  '::placeholder': { color: '#aab7c4' },
                  iconColor: '#424770',
                },
                invalid: {
                  color: '#9e2146',
                  iconColor: '#9e2146',
                },
              },
              hidePostalCode: false,
            }}
          />
        </div>
        <p className="text-xs opacity-60">
          Your payment is secure and encrypted. We use Stripe for payment processing.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 py-3 rounded-lg border border-light-outline dark:border-dark-outline hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors disabled:opacity-50 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1 btn-primary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {processing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Pay PKR {totalAmount.toLocaleString()}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentDialog: React.FC<PaymentDialogProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentSuccess,
  bookingSummary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-light-surface dark:bg-dark-surface border-b border-light-outline dark:border-dark-outline px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">Complete Payment</h3>
            <p className="text-sm opacity-70 mt-1">Secure payment for your trip booking</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant flex items-center justify-center transition-colors"
            aria-label="Close payment dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <Elements stripe={stripePromise}>
            <PaymentForm
              totalAmount={totalAmount}
              onSuccess={onPaymentSuccess}
              onCancel={onClose}
              bookingSummary={bookingSummary}
            />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaymentDialog;
