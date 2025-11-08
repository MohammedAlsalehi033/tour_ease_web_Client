// Trip Planner Model Types

export interface TravelerInfo {
  id: number;
  name: string;
  age: 'adult' | 'child';
  type: 'solo' | 'couple' | 'family';
  preferences?: string[];
}

export interface TripPlannerSearchParams {
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  interests?: string[];
  budget: number;
  numberOfTravelers: number;
  travelers?: TravelerInfo[];
  needsReturnTransport?: boolean;
  useAIOptimization?: boolean;
  maxIterations?: number;
}

export interface TransportOption {
  id: number;
  listingId: number;
  providerName: string;
  vehicleType: string;
  pricePerSeat: number;
  seatsAvailable: number;
  departureTime: string;
  arrivalTime?: string;
  avgRating: number;
  totalCost: number;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export interface RoomInfo {
  roomId: number;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  amenities?: string[];
}

export interface RoomAllocation {
  roomId: number;
  roomType: string;
  pricePerNight: number;
  capacity: number;
  numberOfRooms: number;
  guestsAllocated: number;
  totalCost: number;
  travelers?: TravelerInfo[];
}

export interface AccommodationOption {
  id: number;
  accommodationId: number;
  name: string;
  location: string;
  avgRating: number;
  rating?: number; // For compatibility
  totalCost: number;
  numberOfNights: number;
  roomAllocations: RoomAllocation[];
  availableRooms?: RoomInfo[];
  amenities?: string[];
  images?: string[];
}

export interface Activity {
  id?: number;
  title: string;
  description: string;
  upvotes?: number;
  source?: string;
  location?: string;
  estimatedCost?: number;
  rating?: number;
}

export interface PlanCosts {
  transportation: number;
  accommodation: number;
  activities: number;
  total: number;
}

export interface RecommendedPlan {
  optionId: string;
  planName: string;
  description: string;
  isOptimal: boolean;
  optimizationScore?: number;
  outboundTransport: TransportOption | null;
  transport?: TransportOption | null; // For compatibility
  returnTransport: TransportOption | null;
  accommodation: AccommodationOption | null;
  activities: Activity[];
  costs: PlanCosts;
  warnings: string[];
}

export interface AvailableOptions {
  outboundTransportation: TransportOption[];
  returnTransportation: TransportOption[];
  accommodations: AccommodationOption[];
  activities: Activity[];
}

export interface TripPlannerResponse {
  success: boolean;
  data: {
    requestSummary: {
      startLocation: string;
      endLocation: string;
      budget: number;
      numberOfTravelers: number;
      startTime: string;
      endTime: string;
    };
    availableOptions: AvailableOptions;
    recommendedPlans: RecommendedPlan[];
    optimalPlan: RecommendedPlan | null;
  };
  error?: string;
}

export interface BookingRequest {
  optionId?: string;
  outboundTransportId: number;
  transport?: { id: number }; // For compatibility
  returnTransportId?: number;
  seatsNeeded: number;
  accommodationId: number;
  accommodation?: { id: number; roomAllocations: RoomAllocation[] }; // For compatibility
  selectedRoomAllocations: { roomId: number; numberOfRooms: number }[];
  checkInDate: string;
  checkOutDate: string;
  selectedActivities?: number[];
}

export interface TransportBooking {
  id: number;
  status: 'pending' | 'confirmed' | 'rejected';
  totalPrice: number;
  offerId?: number;
}

export interface AccommodationBooking {
  id: number;
  roomId: number;
  status: 'confirmed' | 'cancelled';
  totalPrice: number;
  numberOfRooms: number;
}

export interface BookingConfirmation {
  success: boolean;
  bookings: {
    transportationBookings: {
      outbound: TransportBooking;
      return?: TransportBooking;
    };
    accommodationBookings: AccommodationBooking[];
  };
  totalCost: number;
  message: string;
}

export interface SavedPlanRequest {
  planName: string;
  description?: string;
  selectedOutboundId: number;
  selectedReturnId?: number;
  selectedAccommodationId: number;
  selectedRoomAllocations: { roomId: number; quantity: number }[];
  selectedActivities?: number[];
  totalCost: number;
  tags?: string[];
  originalSearchParams: TripPlannerSearchParams;
  // Save the entire search results data (includes itinerary, all transport options, all accommodations, etc.)
  searchResultsData?: any;
}

export interface SavedPlan {
  id: number;
  userId: string;
  planName: string;
  description?: string;
  status: 'draft' | 'booked' | 'expired';
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  numberOfTravelers: number;
  budget: string | number;
  interests: string[];
  needsReturnTransport: boolean;
  selectedOutboundTransportId: number | null;
  selectedReturnTransportId: number | null;
  selectedAccommodationId: number;
  seatsNeeded: number | null;
  selectedOutboundId: number;
  selectedReturnId?: number;
  selectedActivities?: number[];
  totalCost: number;
  tags?: string[];
  notes?: string | null;
  originalSearchParams: TripPlannerSearchParams;
  bookedAt?: string;
  createdAt: string;
  updatedAt: string;
  lastViewedAt?: string | null;
  savedAt?: string;
  // The entire search results data saved with the plan
  planData?: {
    itinerary?: any[];
    optimalPlan?: RecommendedPlan;
    tripSummary?: any;
    requestSummary?: any;
    availableOptions?: AvailableOptions;
    recommendedPlans?: RecommendedPlan[];
    accommodationOptions?: AccommodationOption[];
    transportationOptions?: {
      outbound?: TransportOption[];
      return?: TransportOption[];
    };
  };
  searchResultsData?: any;
  // Related entities
  Accommodation?: {
    id: number;
    providerId: string;
    name: string;
    location: string;
    description: string;
    mediaUrls: string[];
    createdAt: string;
    rooms?: {
      id: number;
      accommodationId: number;
      roomType: string;
      pricePerNight: string | number;
      capacity: number;
      mediaUrls: string[];
      createdAt: string;
    }[];
  };
  SavedPlanRoomAllocation?: {
    id: number;
    savedPlanId: number;
    roomId: number;
    numberOfRooms: number;
    checkInDate: string;
    checkOutDate: string;
    Room?: {
      id: number;
      accommodationId: number;
      roomType: string;
      pricePerNight: string | number;
      capacity: number;
      mediaUrls: string[];
      createdAt: string;
    };
  }[];
  TransportationListing_SavedTripPlan_selectedOutboundTransportIdToTransportationListing?: any;
  TransportationListing_SavedTripPlan_selectedReturnTransportIdToTransportationListing?: any;
}

export interface SavedPlanDetails extends SavedPlan {
  outboundTransportation: TransportOption;
  returnTransportation?: TransportOption;
  accommodation: AccommodationOption;
  roomAllocations: { room: any; quantity: number }[];
  activities: Activity[];
}

export interface SavedPlansResponse {
  success: boolean;
  data: SavedPlan[];
  count: number;
}
