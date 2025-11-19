import { AccommodationRepo } from "@/app/(model)/accommodation/accommodationRepo";
import { inject, injectable } from "tsyringe";
import { Accommodation, AccommodationFilters, PaginatedAccommodations, Room } from "@/app/(model)/accommodation/accommodationModel";

@injectable()
export class AccommodationController {
    constructor(@inject(AccommodationRepo) private accommodationRepo: AccommodationRepo) {}

    async getAllAccommodations(filters?: AccommodationFilters) {
        try {
            // Validate filters if provided
            if (filters) {
                if (filters.minPrice !== undefined && filters.minPrice < 0) {
                    throw new Error('Minimum price cannot be negative');
                }
                if (filters.maxPrice !== undefined && filters.maxPrice < 0) {
                    throw new Error('Maximum price cannot be negative');
                }
                if (filters.minPrice !== undefined && filters.maxPrice !== undefined && filters.minPrice > filters.maxPrice) {
                    throw new Error('Minimum price cannot be greater than maximum price');
                }
                if (filters.page !== undefined && filters.page < 1) {
                    throw new Error('Page number must be at least 1');
                }
                if (filters.pageSize !== undefined && filters.pageSize < 1) {
                    throw new Error('Page size must be at least 1');
                }
            }

            const result = await this.accommodationRepo.getAllAccommodations(filters);
            return result;
        } catch (error) {
            console.error("Error fetching accommodations:", error);
            throw error;
        }
    }

    async searchAccommodationsByLocation(location: string, page?: number, pageSize?: number) {
        try {
            if (!location || location.trim().length === 0) {
                throw new Error('Location is required for search');
            }

            if (page !== undefined && page < 1) {
                throw new Error('Page number must be at least 1');
            }

            if (pageSize !== undefined && pageSize < 1) {
                throw new Error('Page size must be at least 1');
            }

            const result = await this.accommodationRepo.searchAccommodationsByLocation(
                location.trim(),
                page,
                pageSize
            );
            return result;
        } catch (error) {
            console.error("Error searching accommodations by location:", error);
            throw error;
        }
    }

    async getAccommodationById(id: number) {
        try {
            if (!id || id < 1) {
                throw new Error('Valid accommodation ID is required');
            }

            const result = await this.accommodationRepo.getAccommodationById(id);
            return result;
        } catch (error) {
            console.error("Error fetching accommodation by ID:", error);
            throw error;
        }
    }

    // Helper method to get minimum price from rooms
    getMinPrice(accommodation: Accommodation): number | null {
        if (!accommodation.rooms || accommodation.rooms.length === 0) return null;
        return Math.min(...accommodation.rooms.map(room => parseFloat(room.pricePerNight.toString())));
    }

    // Helper method to get maximum price from rooms
    getMaxPrice(accommodation: Accommodation): number | null {
        if (!accommodation.rooms || accommodation.rooms.length === 0) return null;
        return Math.max(...accommodation.rooms.map(room => parseFloat(room.pricePerNight.toString())));
    }

    // Helper method to get maximum capacity from rooms
    getMaxCapacity(accommodation: Accommodation): number | null {
        if (!accommodation.rooms || accommodation.rooms.length === 0) return null;
        return Math.max(...accommodation.rooms.map(room => room.capacity));
    }

    async getRoomsByAccommodationId(accommodationId: number) {
        try {
            if (!accommodationId || accommodationId < 1) {
                throw new Error('Valid accommodation ID is required');
            }
            const rooms = await this.accommodationRepo.getRoomsByAccommodationId(accommodationId);
            return { success: true, data: rooms };
        } catch (error) {
            console.error("Error fetching rooms:", error);
            throw error;
        }
    }

    async getTravelerBookings(travelerId: string, page?: number, pageSize?: number) {
        try {
            if (!travelerId || travelerId.trim().length === 0) {
                throw new Error('Traveler ID is required');
            }
            const bookings = await this.accommodationRepo.getTravelerBookings(travelerId, page, pageSize);
            return { success: true, data: bookings };
        } catch (error) {
            console.error("Error fetching traveler bookings:", error);
            throw error;
        }
    }

    async createBooking(payload: {
        travelerId: string;
        roomId: number;
        checkInDate: string;
        checkOutDate: string;
        totalPrice: number;
    }) {
        try {
            // Validation
            if (!payload.travelerId || payload.travelerId.trim().length === 0) {
                throw new Error('Traveler ID is required');
            }
            if (!payload.roomId || payload.roomId < 1) {
                throw new Error('Valid room ID is required');
            }
            if (!payload.checkInDate || !payload.checkOutDate) {
                throw new Error('Check-in and check-out dates are required');
            }
            if (new Date(payload.checkInDate) >= new Date(payload.checkOutDate)) {
                throw new Error('Check-out date must be after check-in date');
            }
            if (!payload.totalPrice || payload.totalPrice <= 0) {
                throw new Error('Valid total price is required');
            }

            const booking = await this.accommodationRepo.createAccommodationBooking(payload);
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error creating booking:", error);
            throw error;
        }
    }

    async createConfirmedBooking(payload: {
        travelerId: string;
        roomId: number;
        checkInDate: string;
        checkOutDate: string;
        totalPrice: number;
        paymentId: string;
    }) {
        try {
            // Validation
            if (!payload.travelerId || payload.travelerId.trim().length === 0) {
                throw new Error('Traveler ID is required');
            }
            if (!payload.roomId || payload.roomId < 1) {
                throw new Error('Valid room ID is required');
            }
            if (!payload.checkInDate || !payload.checkOutDate) {
                throw new Error('Check-in and check-out dates are required');
            }
            if (new Date(payload.checkInDate) >= new Date(payload.checkOutDate)) {
                throw new Error('Check-out date must be after check-in date');
            }
            if (!payload.totalPrice || payload.totalPrice <= 0) {
                throw new Error('Valid total price is required');
            }
            if (!payload.paymentId || payload.paymentId.trim().length === 0) {
                throw new Error('Payment ID is required');
            }

            const booking = await this.accommodationRepo.createConfirmedBooking(payload);
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error creating confirmed booking:", error);
            throw error;
        }
    }

    async confirmBooking(bookingId: number, paymentId: number) {
        try {
            if (!bookingId || bookingId < 1) {
                throw new Error('Valid booking ID is required');
            }
            if (!paymentId || paymentId < 1) {
                throw new Error('Valid payment ID is required');
            }

            const booking = await this.accommodationRepo.confirmBooking(bookingId, paymentId);
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error confirming booking:", error);
            throw error;
        }
    }

    async cancelUnpaidBooking(bookingId: number) {
        try {
            if (!bookingId || bookingId < 1) {
                throw new Error('Valid booking ID is required');
            }

            const booking = await this.accommodationRepo.cancelUnpaidBooking(bookingId);
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error cancelling booking:", error);
            throw error;
        }
    }

    async requestRefund(bookingId: number) {
        try {
            if (!bookingId || bookingId < 1) {
                throw new Error('Valid booking ID is required');
            }

            const booking = await this.accommodationRepo.requestRefund(bookingId);
            return { success: true, data: booking };
        } catch (error) {
            console.error("Error requesting refund:", error);
            throw error;
        }
    }

    async createPayment(payload: {
        accommodationBookingId: number;
        amount: number;
        paymentMethod: string;
        transactionId: string;
        status?: string;
    }) {
        try {
            if (!payload.accommodationBookingId || payload.accommodationBookingId < 1) {
                throw new Error('Valid booking ID is required');
            }
            if (!payload.amount || payload.amount <= 0) {
                throw new Error('Valid amount is required');
            }
            if (!payload.paymentMethod || payload.paymentMethod.trim().length === 0) {
                throw new Error('Payment method is required');
            }
            if (!payload.transactionId || payload.transactionId.trim().length === 0) {
                throw new Error('Transaction ID is required');
            }

            const payment = await this.accommodationRepo.createPayment(payload);
            return { success: true, data: payment };
        } catch (error) {
            console.error("Error creating payment:", error);
            throw error;
        }
    }
}
