import { injectable, inject } from 'tsyringe';
import { TripPlannerRepo } from '@/app/(model)/tripPlanner/tripPlannerRepo';
import {
  TripPlannerSearchParams,
  TripPlannerResponse,
  BookingRequest,
  BookingConfirmation,
  SavedPlanRequest,
  SavedPlan,
  SavedPlansResponse,
  SavedPlanDetails,
  RecommendedPlan,
  AccommodationOption,
  RoomAllocation,
  TravelerInfo
} from '@/app/(model)/tripPlanner/tripPlannerModel';

@injectable()
export class TripPlannerController {
  constructor(
    @inject(TripPlannerRepo) private tripPlannerRepo: TripPlannerRepo
  ) {
    // Bind methods to maintain context
    this.generateTripPlans = this.generateTripPlans.bind(this);
    this.refineTripPlans = this.refineTripPlans.bind(this);
    this.confirmBooking = this.confirmBooking.bind(this);
    this.saveTripPlan = this.saveTripPlan.bind(this);
    this.getSavedPlans = this.getSavedPlans.bind(this);
    this.getSavedPlanById = this.getSavedPlanById.bind(this);
    this.updateSavedPlan = this.updateSavedPlan.bind(this);
    this.deleteSavedPlan = this.deleteSavedPlan.bind(this);
    this.bookSavedPlan = this.bookSavedPlan.bind(this);
  }

  /**
   * Generate trip plans with optimized recommendations
   */
  async generateTripPlans(params: TripPlannerSearchParams): Promise<TripPlannerResponse> {
    // Get results from backend
    const response = await this.tripPlannerRepo.generateTripPlans(params);
    
    // Apply optimization to recommended plans
    if (response.data.recommendedPlans) {
      response.data.recommendedPlans = response.data.recommendedPlans.map(plan =>
        this.optimizePlan(plan, params)
      );
    }

    // Apply optimization to optimal plan
    if (response.data.optimalPlan) {
      response.data.optimalPlan = this.optimizePlan(response.data.optimalPlan, params);
    }

    return response;
  }

  /**
   * Refine trip plans based on conversational user feedback
   */
  async refineTripPlans(refineRequest: {
    originalRequest: TripPlannerSearchParams;
    currentResults: any;
    userMessage: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<any> {
    return await this.tripPlannerRepo.refineTripPlans(refineRequest);
  }

  /**
   * Optimize a trip plan using scoring algorithm
   * Scoring: Cost (40%) + Rating (30%) + Completeness (30%)
   */
  private optimizePlan(plan: RecommendedPlan, params: TripPlannerSearchParams): RecommendedPlan {
    // Calculate scores
    const costScore = this.calculateCostScore(plan.costs.total, params.budget);
    const ratingScore = this.calculateRatingScore(plan);
    const completenessScore = this.calculateCompletenessScore(plan);

    // Weighted optimization score
    const optimizationScore = 
      costScore * 0.4 + 
      ratingScore * 0.3 + 
      completenessScore * 0.3;

    return {
      ...plan,
      optimizationScore: Math.round(optimizationScore * 100) / 100
    };
  }

  /**
   * Calculate cost score (0-100)
   * Lower cost relative to budget = higher score
   */
  private calculateCostScore(totalCost: number, budget: number): number {
    if (totalCost > budget) {
      // Penalize over-budget plans
      const overBudgetRatio = totalCost / budget;
      return Math.max(0, 100 - (overBudgetRatio - 1) * 200);
    }
    
    // Reward efficient use of budget
    const usageRatio = totalCost / budget;
    return 100 - Math.abs(usageRatio - 0.85) * 100;
  }

  /**
   * Calculate rating score (0-100)
   * Average rating of all components
   */
  private calculateRatingScore(plan: RecommendedPlan): number {
    const ratings: number[] = [];

    if (plan.outboundTransport?.avgRating) ratings.push(plan.outboundTransport.avgRating);
    if (plan.returnTransport?.avgRating) ratings.push(plan.returnTransport.avgRating);
    if (plan.accommodation?.avgRating) ratings.push(plan.accommodation.avgRating);
    if (plan.activities) {
      plan.activities.forEach(activity => {
        if (activity.rating) ratings.push(activity.rating);
      });
    }

    if (ratings.length === 0) return 50; // Default neutral score

    const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    return (avgRating / 5) * 100; // Convert 5-star to 0-100
  }

  /**
   * Calculate completeness score (0-100)
   * Checks if all required components are present
   */
  private calculateCompletenessScore(plan: RecommendedPlan): number {
    let score = 0;
    
    if (plan.outboundTransport) score += 40;
    if (plan.accommodation) score += 40;
    if (plan.activities && plan.activities.length > 0) score += 20;

    return score;
  }

  /**
   * Allocate travelers to rooms efficiently
   * Room Allocation Algorithm:
   * 1. Group travelers by preferences (couples, families, solo)
   * 2. Allocate rooms to minimize cost while respecting preferences
   * 3. Ensure all travelers are accommodated
   */
  allocateRooms(
    travelers: TravelerInfo[],
    accommodation: AccommodationOption
  ): RoomAllocation[] {
    const allocations: RoomAllocation[] = [];
    const unallocated = [...travelers];
    const availableRooms = accommodation.availableRooms ? [...accommodation.availableRooms] : [];

    if (availableRooms.length === 0) {
      throw new Error('No available rooms for allocation');
    }

    // Sort travelers: couples first, then families, then adults, then children
    unallocated.sort((a, b) => {
      if (a.type === 'couple' && b.type !== 'couple') return -1;
      if (a.type !== 'couple' && b.type === 'couple') return 1;
      if (a.age === 'adult' && b.age !== 'adult') return -1;
      if (a.age !== 'adult' && b.age === 'adult') return 1;
      return 0;
    });

    // Sort rooms: larger capacity first
    availableRooms.sort((a, b) => b.capacity - a.capacity);

    let roomIndex = 0;

    while (unallocated.length > 0 && roomIndex < availableRooms.length) {
      const room = availableRooms[roomIndex];
      const allocation: RoomAllocation = {
        roomId: room.roomId,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        capacity: room.capacity,
        numberOfRooms: 1,
        guestsAllocated: 0,
        totalCost: room.pricePerNight,
        travelers: []
      };

      let remainingCapacity = room.capacity;

      // Try to fill this room
      for (let i = unallocated.length - 1; i >= 0 && remainingCapacity > 0; i--) {
        const traveler = unallocated[i];
        
        // Check if traveler fits
        const travelerSize = traveler.type === 'couple' ? 2 : 1;
        
        if (travelerSize <= remainingCapacity) {
          allocation.travelers!.push(traveler);
          allocation.guestsAllocated += travelerSize;
          remainingCapacity -= travelerSize;
          unallocated.splice(i, 1);
        }
      }

      if (allocation.travelers && allocation.travelers.length > 0) {
        allocations.push(allocation);
      }

      roomIndex++;
    }

    // Check if all travelers are allocated
    if (unallocated.length > 0) {
      throw new Error(`Unable to allocate rooms for ${unallocated.length} traveler(s)`);
    }

    return allocations;
  }

  /**
   * Confirm booking with validation
   */
  async confirmBooking(bookingRequest: BookingRequest): Promise<BookingConfirmation> {
    // Validate booking request
    this.validateBookingRequest(bookingRequest);

    return await this.tripPlannerRepo.confirmBooking(bookingRequest);
  }

  /**
   * Validate booking request
   */
  private validateBookingRequest(request: BookingRequest): void {
    if (!request.outboundTransportId && !request.accommodationId) {
      throw new Error('At least one of transport or accommodation must be selected');
    }

    if (request.accommodationId) {
      if (!request.selectedRoomAllocations || request.selectedRoomAllocations.length === 0) {
        throw new Error('Room allocations are required for accommodation booking');
      }

      // Payment is required when booking accommodation
      if (!request.paymentMethod || !request.stripePaymentIntentId) {
        throw new Error('Payment information is required for accommodation booking');
      }
    }
  }

  /**
   * Save trip plan
   */
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
    return await this.tripPlannerRepo.saveTripPlan(planRequest);
  }

  /**
   * Get all saved plans with filters
   */
  async getSavedPlans(filters?: {
    status?: string;
    tag?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SavedPlan[] | SavedPlansResponse> {
    return await this.tripPlannerRepo.getSavedPlans(filters);
  }

  /**
   * Get saved plan by ID
   */
  async getSavedPlanById(id: number): Promise<SavedPlanDetails> {
    return await this.tripPlannerRepo.getSavedPlanById(id);
  }

  /**
   * Update saved plan
   */
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
    return await this.tripPlannerRepo.updateSavedPlan(id, updates);
  }

  /**
   * Delete saved plan
   */
  async deleteSavedPlan(id: number): Promise<{ success: boolean; message: string }> {
    return await this.tripPlannerRepo.deleteSavedPlan(id);
  }

  /**
   * Book saved plan
   */
  async bookSavedPlan(id: number): Promise<BookingConfirmation> {
    return await this.tripPlannerRepo.bookSavedPlan(id);
  }
}
