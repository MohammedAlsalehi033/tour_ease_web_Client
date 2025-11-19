import { ApiService } from "@/app/services/apiService";
import { injectable } from "tsyringe";
import {
  Accommodation,
  AccommodationFilters,
  Room,
} from "./accommodationModel";

interface AccommodationApiResponse {
  success: boolean;
  data: Accommodation[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

type RawBookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "refunded"
  | "refund";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "refunded";

interface Payment {
  id: number;
  accommodationBookingId: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: string;
  createdAt?: string;
}

interface AccommodationBookingResponse {
  id: number;
  travelerId: string;
  roomId: number;
  accommodationId?: number;
  status: RawBookingStatus;
  totalPrice: string | number;
  numberOfRooms?: number;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt?: string;
  room?: Room;
  payment?: Payment | null;
}

interface AccommodationBooking {
  id: number;
  travelerId: string;
  roomId: number;
  accommodationId?: number;
  status: BookingStatus;
  totalPrice: number;
  numberOfRooms: number;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt?: string;
  room?: Room;
  payment?: Payment | null;
}

interface CreateBookingPayload {
  travelerId: string;
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
}

@injectable()
export class AccommodationRepo {
  constructor(private apiService: ApiService) {}

  async getAllAccommodations(
    filters?: AccommodationFilters
  ): Promise<AccommodationApiResponse> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }
      const url = params.toString()
        ? `/accommodations?${params}`
        : "/accommodations";
      const response = await this.apiService.get<AccommodationApiResponse>(url);
      return response;
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      throw new Error("Failed to retrieve accommodations.");
    }
  }

  async searchAccommodationsByLocation(
    location: string,
    page?: number,
    pageSize?: number
  ): Promise<AccommodationApiResponse> {
    try {
      const params = new URLSearchParams();
      params.append("location", location);
      if (page !== undefined && page !== null) {
        params.append("page", page.toString());
      }
      if (pageSize !== undefined && pageSize !== null) {
        params.append("pageSize", pageSize.toString());
      }

      const queryString = params.toString();
      const url = queryString
        ? `/accommodations/search?${queryString}`
        : "/accommodations/search";

      const response = await this.apiService.get<AccommodationApiResponse>(
        url
      );
      return response;
    } catch (error) {
      console.error(
        `Error searching accommodations by location "${location}":`,
        error
      );
      throw new Error("Failed to search accommodations by location.");
    }
  }

  async getAccommodationById(
    id: number
  ): Promise<{ success: boolean; data: Accommodation }> {
    try {
      const response = await this.apiService.get<{
        success: boolean;
        data: Accommodation;
      }>(`/accommodations/${id}`);
      return response;
    } catch (error) {
      console.error(`Error fetching accommodation ${id}:`, error);
      throw new Error("Failed to retrieve accommodation.");
    }
  }

  /**
   * Return all rooms that belong to an accommodation.
   * Filters are sent via query params so page-level cache + filters remain consistent with the backend.
   */
  async getRoomsByAccommodationId(id: number): Promise<Room[]> {
    try {
      const params = this.buildQueryString({ accommodationId: id });
      const url = params ? `/rooms?${params}` : "/rooms";
      const response = await this.apiService.get<{
        success: boolean;
        data: Room[];
      }>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching rooms for accommodation ${id}:`, error);
      throw new Error("Failed to retrieve rooms.");
    }
  }

  /**
   * Lists all bookings for a traveler, optionally paged.
   */
  async getTravelerBookings(
    travelerId: string,
    page?: number,
    pageSize?: number
  ): Promise<AccommodationBooking[]> {
    try {
      const params = this.buildQueryString({ page, pageSize });
      const url = params
        ? `/accommodation-bookings/traveler/${travelerId}?${params}`
        : `/accommodation-bookings/traveler/${travelerId}`;
      const response = await this.apiService.get<{
        success: boolean;
        data: AccommodationBookingResponse[];
      }>(url);
      return response.data.map(normalizeBooking);
    } catch (error) {
      console.error(`Error fetching bookings for traveler ${travelerId}:`, error);
      throw new Error("Failed to retrieve traveler bookings.");
    }
  }

  /**
   * Creates a booking request for a traveler and returns the persisted reservation.
   */
  async createAccommodationBooking(
    payload: CreateBookingPayload
  ): Promise<AccommodationBooking> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: AccommodationBookingResponse;
      }>("/accommodation-bookings", payload);
      return normalizeBooking(response.data);
    } catch (error) {
      console.error("Error creating accommodation booking:", error);
      throw new Error("Failed to create booking.");
    }
  }

  /**
   * Creates a confirmed booking directly after successful payment.
   */
  async createConfirmedBooking(
    payload: CreateBookingPayload & { paymentId: string }
  ): Promise<AccommodationBooking> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: AccommodationBookingResponse;
      }>("/accommodation-bookings/create-confirmed", payload);
      return normalizeBooking(response.data);
    } catch (error) {
      console.error("Error creating confirmed booking:", error);
      throw new Error("Failed to create confirmed booking.");
    }
  }

  /**
   * Confirms an unpaid booking after the payment succeeds.
   */
  async confirmBooking(
    bookingId: number,
    paymentId: number
  ): Promise<AccommodationBooking> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: AccommodationBookingResponse;
      }>(`/accommodation-bookings/${bookingId}/confirm`, {
        paymentId,
      });
      return normalizeBooking(response.data);
    } catch (error) {
      console.error(`Error confirming booking ${bookingId}:`, error);
      throw new Error("Failed to confirm booking.");
    }
  }

  /**
   * Cancels a (still pending) booking that never hit the payment step.
   */
  async cancelUnpaidBooking(bookingId: number): Promise<AccommodationBooking> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: AccommodationBookingResponse;
      }>(`/accommodation-bookings/${bookingId}/cancel-unpaid`, {});
      return normalizeBooking(response.data);
    } catch (error) {
      console.error(`Error cancelling booking ${bookingId}:`, error);
      throw new Error("Failed to cancel booking.");
    }
  }

  /**
   * Requests a full refund for a confirmed booking.
   */
  async requestRefund(bookingId: number): Promise<AccommodationBooking> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: AccommodationBookingResponse;
      }>(`/accommodation-bookings/${bookingId}/refund`, {});
      return normalizeBooking(response.data);
    } catch (error) {
      console.error(`Error requesting refund for ${bookingId}:`, error);
      throw new Error("Failed to request refund.");
    }
  }

  /**
   * Creates a payment record tied to an accommodation booking.
   */
  async createPayment(
    payload: {
      accommodationBookingId: number;
      amount: number;
      paymentMethod: string;
      transactionId: string;
      status?: string;
    }
  ): Promise<Payment> {
    try {
      const response = await this.apiService.post<{
        success: boolean;
        data: Payment;
      }>("/payments", payload);
      return response.data;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment.");
    }
  }

  private buildQueryString(
    params: Record<string, string | number | undefined | null>
  ): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value.toString());
      }
    });
    return query.toString();
  }
}

function normalizeBookingStatus(status: RawBookingStatus): BookingStatus {
  return status === "refund" ? "refunded" : status;
}

function parseNumericValue(value: string | number | undefined | null): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeBooking(booking: AccommodationBookingResponse): AccommodationBooking {
  const {
    status,
    totalPrice: rawTotalPrice,
    numberOfRooms,
    accommodationId,
    room,
    payment,
    ...rest
  } = booking;

  return {
    ...rest,
    status: normalizeBookingStatus(status),
    totalPrice: parseNumericValue(rawTotalPrice),
    numberOfRooms: numberOfRooms ?? 1,
    accommodationId: accommodationId ?? room?.accommodation?.id,
    room,
    payment: payment ?? null,
  };
}
