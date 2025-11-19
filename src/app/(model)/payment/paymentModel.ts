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

export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  bookingId?: number;
  customerEmail?: string;
}

export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: 'stripe' | 'paypal' | 'credit_card';
  transactionId: string;
  accommodationBookingId?: number;
  rideBookingId?: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface UpdatePaymentStatusRequest {
  status: 'pending' | 'completed' | 'failed' | 'refunded';
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: 'stripe' | 'paypal' | 'credit_card';
  startDate?: string;
  endDate?: string;
}

export interface PaymentSummary {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  averagePaymentAmount: number;
  paymentMethodBreakdown: {
    stripe: number;
    paypal: number;
    credit_card: number;
  };
}

export interface PaginatedPayments {
  payments: Payment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
