import { injectable } from 'tsyringe';
import { ApiService } from '@/app/services/apiService';
import { ResponseModel } from '@/Types/types';
import {
  TripPlannerSearchParams,
  TripPlannerResponse,
  BookingRequest,
  BookingConfirmation,
  SavedPlanRequest,
  SavedPlan,
  SavedPlanDetails
} from './tripPlannerModel';

interface RefineRequest {
  originalRequest: TripPlannerSearchParams;
  currentResults: any;
  userMessage: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

interface RefineResponse {
  refinedPlans: TripPlannerResponse['data'];
  refinedRequest: TripPlannerSearchParams;
  aiExplanation: string;
  changesMade: string[];
  conversationHistory: Array<{ role: string; content: string }>;
}

@injectable()
export class TripPlannerRepo {
  constructor(private apiService: ApiService) {}

  // Generate trip plans
  async generateTripPlans(params: TripPlannerSearchParams): Promise<TripPlannerResponse> {
    try {
      const response = await this.apiService.post<{ 
        success: boolean; 
        data: TripPlannerResponse['data'];
        metadata?: any;
        message?: string;
      }>(
        '/planner/generate',
        params
      );
      
      return {
        success: response.success,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating trip plans:', error);
      throw new Error('Failed to generate trip plans');
    }
  }

  // Refine trip plans based on user feedback
  async refineTripPlans(refineRequest: {
    originalRequest: TripPlannerSearchParams;
    currentResults: any;
    userMessage: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<any> {
    try {
      const response = await this.apiService.post<{ success: boolean; data: RefineResponse }>(
        '/planner/refine',
        refineRequest
      );
      return response.data;
    } catch (error) {
      console.error('Error refining trip plans:', error);
      throw new Error('Failed to refine trip plans');
    }
  }

  // Confirm booking
  async confirmBooking(bookingRequest: BookingRequest): Promise<BookingConfirmation> {
    try {
      const response = await this.apiService.post<BookingConfirmation>(
        '/planner/confirm',
        bookingRequest
      );
      return response;
    } catch (error) {
      console.error('Error confirming booking:', error);
      throw new Error('Failed to confirm booking');
    }
  }

  // Save trip plan
  async saveTripPlan(planRequest: SavedPlanRequest & {
    startLocation: string;
    endLocation: string;
    startTime: string;
    endTime: string;
    numberOfTravelers: number;
    budget: number;
    interests?: string[];
    needsReturnTransport?: boolean;
    selectedOutboundTransportId?: number;
    selectedReturnTransportId?: number;
    selectedAccommodationId?: number;
    seatsNeeded?: number;
    planData?: any;
    notes?: string;
  }): Promise<SavedPlan> {
    try {
      const response = await this.apiService.post<{ success: boolean; data: SavedPlan; message: string }>(
        '/planner/saved',
        planRequest
      );
      return response.data;
    } catch (error) {
      console.error('Error saving trip plan:', error);
      throw new Error('Failed to save trip plan');
    }
  }

  // Get all saved plans
  async getSavedPlans(filters?: {
    status?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SavedPlan[]> {
    try {
      const queryParams = new URLSearchParams(filters as any).toString();
      const url = `/planner/saved${queryParams ? `?${queryParams}` : ''}`;
      const response = await this.apiService.get<{ success: boolean; data: SavedPlan[]; count: number }>(url);
      
      // Backend returns { success: true, data: [...], count: 1 }
      return response.data || [];
    } catch (error) {
      console.error('Error fetching saved plans:', error);
      throw new Error('Failed to fetch saved plans');
    }
  }

  // Get saved plan by ID
  async getSavedPlanById(id: number): Promise<SavedPlanDetails> {
    try {
      const response = await this.apiService.get<{ success: boolean; data: SavedPlanDetails }>(
        `/planner/saved/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching saved plan:', error);
      throw new Error('Failed to fetch saved plan');
    }
  }

  // Update saved plan
  async updateSavedPlan(id: number, updates: Partial<SavedPlanRequest & {
    startLocation?: string;
    endLocation?: string;
    startTime?: string;
    endTime?: string;
    numberOfTravelers?: number;
    budget?: number;
    interests?: string[];
    needsReturnTransport?: boolean;
    selectedOutboundTransportId?: number;
    selectedReturnTransportId?: number;
    selectedAccommodationId?: number;
    seatsNeeded?: number;
    planData?: any;
    notes?: string;
    status?: string;
  }>): Promise<SavedPlan> {
    try {
      const response = await this.apiService.put<{ success: boolean; data: SavedPlan; message: string }>(
        `/planner/saved/${id}`,
        updates
      );
      return response.data;
    } catch (error) {
      console.error('Error updating saved plan:', error);
      throw new Error('Failed to update saved plan');
    }
  }

  // Delete saved plan
  async deleteSavedPlan(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.apiService.delete<{ success: boolean; message: string }>(
        `/planner/saved/${id}`
      );
      return response;
    } catch (error) {
      console.error('Error deleting saved plan:', error);
      throw new Error('Failed to delete saved plan');
    }
  }

  // Book saved plan
  async bookSavedPlan(id: number): Promise<BookingConfirmation> {
    try {
      const response = await this.apiService.post<BookingConfirmation>(
        `/planner/saved/${id}/book`,
        {}
      );
      return response;
    } catch (error) {
      console.error('Error booking saved plan:', error);
      throw new Error('Failed to book saved plan');
    }
  }
}
