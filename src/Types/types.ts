export interface ResponseModel<T> {
  success: boolean;
  count: number;
  data: T[] | T;
}

// Payment-related types
export interface Payment {
  id: number;
  amount: number;
  paymentMethod: 'stripe' | 'paypal' | 'credit_card';
  transactionId: string;
  accommodationBookingId?: number | null;
  rideBookingId?: number | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}