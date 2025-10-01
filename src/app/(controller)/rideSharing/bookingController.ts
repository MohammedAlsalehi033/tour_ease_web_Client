import 'reflect-metadata';
import { BookingRepo } from "@/app/(model)/rideSharing/booking/bookingRepo";
import { inject, injectable } from "tsyringe";

@injectable()
export class BookingController {


    constructor(@inject(BookingRepo) private bookingRepo: BookingRepo ) {}


    async getBookingsForTraveler(travelerId: string) {
        try {
            const bookings = await this.bookingRepo.getBookingsForTravler(travelerId);
            return bookings;
        } catch (error) {
            console.error("Error fetching bookings for traveler:", error);
            throw error;
        }
    }
    async getBookingsForDriver(providerId: string) {
        try {
            const bookings = await this.bookingRepo.getBookingsForDriver(providerId);
            return bookings;
        } catch (error) {
            console.error("Error fetching bookings for driver:", error);
            throw error;
        }
    }

    async updateBookingStatus(id: string, statusHere: string) {
        try {
            const updatedBooking = await this.bookingRepo.updateState(id, statusHere);
            return updatedBooking;
        } catch (error) {
            console.error("Error updating booking status:", error);
            throw error;
        }
    }
    
}