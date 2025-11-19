import 'reflect-metadata';
import { PaymentRepo } from "@/app/(model)/payment/paymentRepo";
import { inject, injectable } from "tsyringe";
import {
  CreatePaymentIntentRequest,
  CreatePaymentRequest,
  UpdatePaymentStatusRequest,
  PaymentFilters
} from "@/app/(model)/payment/paymentModel";

@injectable()
export class PaymentController {
  constructor(@inject(PaymentRepo) private paymentRepo: PaymentRepo) {}

  /**
   * Create a payment intent with Stripe
   * This is the first step in the payment flow
   */
  async createPaymentIntent(data: CreatePaymentIntentRequest) {
    try {
      const result = await this.paymentRepo.createPaymentIntent(data);
      return result;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  }

  /**
   * Create a payment record in the database
   * This is called after successful Stripe payment
   */
  async createPayment(data: CreatePaymentRequest) {
    try {
      const result = await this.paymentRepo.createPayment(data);
      return result;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  /**
   * Get all payments with optional filters
   */
  async getAllPayments(filters?: PaymentFilters) {
    try {
      const result = await this.paymentRepo.getAllPayments(filters);
      return result;
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  }

  /**
   * Get a specific payment by ID
   */
  async getPaymentById(paymentId: number) {
    try {
      const result = await this.paymentRepo.getPaymentById(paymentId);
      return result;
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a payment by Stripe transaction ID
   */
  async getPaymentByTransactionId(transactionId: string) {
    try {
      const result = await this.paymentRepo.getPaymentByTransactionId(transactionId);
      return result;
    } catch (error) {
      console.error(`Error fetching payment by transaction ${transactionId}:`, error);
      throw error;
    }
  }

  /**
   * Get all payments for a specific accommodation booking
   */
  async getPaymentsByAccommodationBookingId(bookingId: number) {
    try {
      const result = await this.paymentRepo.getPaymentsByAccommodationBookingId(bookingId);
      return result;
    } catch (error) {
      console.error(`Error fetching payments for booking ${bookingId}:`, error);
      throw error;
    }
  }

  /**
   * Get payment summary statistics
   */
  async getPaymentSummary(startDate?: string, endDate?: string) {
    try {
      const result = await this.paymentRepo.getPaymentSummary(startDate, endDate);
      return result;
    } catch (error) {
      console.error("Error fetching payment summary:", error);
      throw error;
    }
  }

  /**
   * Update payment status (e.g., mark as refunded)
   */
  async updatePaymentStatus(paymentId: number, data: UpdatePaymentStatusRequest) {
    try {
      const result = await this.paymentRepo.updatePaymentStatus(paymentId, data);
      return result;
    } catch (error) {
      console.error(`Error updating payment status for ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a payment record
   */
  async deletePayment(paymentId: number) {
    try {
      const result = await this.paymentRepo.deletePayment(paymentId);
      return result;
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw error;
    }
  }
}
