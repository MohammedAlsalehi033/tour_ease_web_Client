import 'reflect-metadata';
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";
import { injectable } from "tsyringe";
import { Booking } from './bookingModel';

@injectable()
export class BookingRepo {
    constructor(private apiService: ApiService) {}

    async getBookingsForTravler(
        travelerId: string
    ): Promise<ResponseModel<Booking[]>> {
        try {
            
            const response = await this.apiService.get<ResponseModel<Booking[]>>(`/booking/traveler/${travelerId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching bookings for traveler ${travelerId}:`, error);
            throw new Error('Failed to retrieve traveler bookings.');
        }
    }

    async getBookingsForDriver(
        providerId: string
    ): Promise<ResponseModel<Booking[]>> {
        try {
            return await this.apiService.get<ResponseModel<Booking[]>>(`/booking/provider/${providerId}`);
        } catch (error) {
            console.error(`Error fetching bookings for driver ${providerId}:`, error);
            throw new Error('Failed to retrieve driver bookings.');
        }
    }

    async updateState(id: string, status: string): Promise<ResponseModel<Booking>> {
        try {
            return await this.apiService.post<ResponseModel<Booking>>(`/booking/status?bookingId=${id}&status=${status}`);
        } catch (error) {
            console.error(`Error updating state for booking ${id}:`, error);
            throw new Error("Failed to update the booking's status.");
        }
    }
}