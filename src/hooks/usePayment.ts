import { useState } from 'react';
import { container } from '@/app/lib/diContainer';
import { PaymentController } from '@/app/(controller)/payment/paymentController';
import {
  Payment,
  PaymentIntent,
  CreatePaymentIntentRequest,
  CreatePaymentRequest,
  PaymentFilters,
  PaymentSummary,
  PaginatedPayments,
} from '@/app/(model)/payment/paymentModel';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentController = container.resolve(PaymentController);

  /**
   * Create a payment intent with Stripe
   * This is the first step in the payment flow
   */
  const createPaymentIntent = async (
    data: CreatePaymentIntentRequest
  ): Promise<PaymentIntent | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.createPaymentIntent(data);
      if (result.success) {
        return result.data as PaymentIntent;
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create payment intent');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a payment record in the database
   * Called after successful Stripe payment
   */
  const createPayment = async (
    data: CreatePaymentRequest
  ): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.createPayment(data);
      if (result.success) {
        return result.data as Payment;
      } else {
        throw new Error('Failed to create payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all payments with optional filters
   */
  const getAllPayments = async (
    filters?: PaymentFilters
  ): Promise<PaginatedPayments | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.getAllPayments(filters);
      if (result.success) {
        return result.data as PaginatedPayments;
      } else {
        throw new Error('Failed to fetch payments');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a payment by ID
   */
  const getPaymentById = async (paymentId: number): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.getPaymentById(paymentId);
      if (result.success) {
        return result.data as Payment;
      } else {
        throw new Error('Failed to fetch payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get a payment by Stripe transaction ID
   */
  const getPaymentByTransactionId = async (
    transactionId: string
  ): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.getPaymentByTransactionId(transactionId);
      if (result.success) {
        return result.data as Payment;
      } else {
        throw new Error('Failed to fetch payment');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get all payments for a specific accommodation booking
   */
  const getPaymentsByBookingId = async (
    bookingId: number
  ): Promise<Payment[] | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.getPaymentsByAccommodationBookingId(bookingId);
      if (result.success) {
        return result.data as Payment[];
      } else {
        throw new Error('Failed to fetch payments');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get payment summary statistics
   */
  const getPaymentSummary = async (
    startDate?: string,
    endDate?: string
  ): Promise<PaymentSummary | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.getPaymentSummary(startDate, endDate);
      if (result.success) {
        return result.data as PaymentSummary;
      } else {
        throw new Error('Failed to fetch payment summary');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment summary');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update payment status
   */
  const updatePaymentStatus = async (
    paymentId: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<Payment | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.updatePaymentStatus(paymentId, { status });
      if (result.success) {
        return result.data as Payment;
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a payment
   */
  const deletePayment = async (paymentId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentController.deletePayment(paymentId);
      return result.success;
    } catch (err: any) {
      setError(err.message || 'Failed to delete payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createPaymentIntent,
    createPayment,
    getAllPayments,
    getPaymentById,
    getPaymentByTransactionId,
    getPaymentsByBookingId,
    getPaymentSummary,
    updatePaymentStatus,
    deletePayment,
  };
};
