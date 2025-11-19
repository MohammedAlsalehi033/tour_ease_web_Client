import 'reflect-metadata';
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";
import { injectable } from "tsyringe";
import {
  Payment,
  PaymentIntent,
  CreatePaymentIntentRequest,
  CreatePaymentRequest,
  UpdatePaymentStatusRequest,
  PaymentFilters,
  PaymentSummary,
  PaginatedPayments
} from './paymentModel';

@injectable()
export class PaymentRepo {
  constructor(private apiService: ApiService) {}

  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<ResponseModel<PaymentIntent>> {
    try {
      const response = await this.apiService.post<ResponseModel<PaymentIntent>>(
        '/payments/create-payment-intent',
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent.');
    }
  }

  /**
   * Create a payment record
   */
  async createPayment(
    data: CreatePaymentRequest
  ): Promise<ResponseModel<Payment>> {
    try {
      const response = await this.apiService.post<ResponseModel<Payment>>(
        '/payments',
        data
      );
      return response;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment.');
    }
  }

  /**
   * Get all payments with filters
   */
  async getAllPayments(
    filters?: PaymentFilters
  ): Promise<ResponseModel<PaginatedPayments>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.page) queryParams.append('page', filters.page.toString());
      if (filters?.limit) queryParams.append('limit', filters.limit.toString());
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters?.startDate) queryParams.append('startDate', filters.startDate);
      if (filters?.endDate) queryParams.append('endDate', filters.endDate);

      const url = `/payments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.apiService.get<ResponseModel<PaginatedPayments>>(url);
      return response;
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error('Failed to retrieve payments.');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: number): Promise<ResponseModel<Payment>> {
    try {
      const response = await this.apiService.get<ResponseModel<Payment>>(
        `/payments/${paymentId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw new Error('Failed to retrieve payment.');
    }
  }

  /**
   * Get payment by transaction ID
   */
  async getPaymentByTransactionId(
    transactionId: string
  ): Promise<ResponseModel<Payment>> {
    try {
      const response = await this.apiService.get<ResponseModel<Payment>>(
        `/payments/transaction/${transactionId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching payment by transaction ${transactionId}:`, error);
      throw new Error('Failed to retrieve payment by transaction ID.');
    }
  }

  /**
   * Get payments by accommodation booking ID
   */
  async getPaymentsByAccommodationBookingId(
    bookingId: number
  ): Promise<ResponseModel<Payment[]>> {
    try {
      const response = await this.apiService.get<ResponseModel<Payment[]>>(
        `/payments/booking/${bookingId}`
      );
      return response;
    } catch (error) {
      console.error(`Error fetching payments for booking ${bookingId}:`, error);
      throw new Error('Failed to retrieve payments for booking.');
    }
  }

  /**
   * Get payment summary statistics
   */
  async getPaymentSummary(
    startDate?: string,
    endDate?: string
  ): Promise<ResponseModel<PaymentSummary>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const url = `/payments/summary/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await this.apiService.get<ResponseModel<PaymentSummary>>(url);
      return response;
    } catch (error) {
      console.error('Error fetching payment summary:', error);
      throw new Error('Failed to retrieve payment summary.');
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    paymentId: number,
    data: UpdatePaymentStatusRequest
  ): Promise<ResponseModel<Payment>> {
    try {
      const response = await this.apiService.patch<ResponseModel<Payment>>(
        `/payments/${paymentId}/status`,
        data
      );
      return response;
    } catch (error) {
      console.error(`Error updating payment status for ${paymentId}:`, error);
      throw new Error('Failed to update payment status.');
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(paymentId: number): Promise<ResponseModel<void>> {
    try {
      const response = await this.apiService.delete<ResponseModel<void>>(
        `/payments/${paymentId}`
      );
      return response;
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw new Error('Failed to delete payment.');
    }
  }
}
