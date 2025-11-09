
// This file defines the TypeScript interfaces for the Trip Planner feature.

export interface TransportProvider {
  user?: {
    name?: string;
  };
}

export interface TransportOption {
  id: number;
  vehicleType: string;
  providerName?: string;
  provider?: TransportProvider;
  departureTime: string;
  seatsAvailable: number;
  totalCost: number;
  avgRating?: number;
}

export interface Room {
  id: number;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  totalCost?: number;
}

export interface RoomAllocation {
  roomId: number;
  numberOfRooms: number;
  totalCost?: number;
  pricePerNight?: number;
  room?: Room;
  roomType?: string;
  capacity?: number;
}

export interface AccommodationOption {
  id: number;
  propertyName: string;
  name?: string;
  location: string;
  numberOfNights: number;
  avgRating?: number;
  totalCost: number;
  propertyType?: string;
  roomAllocations?: RoomAllocation[];
  images?: string[];
  mediaUrls?: string[];
}

export interface Activity {
  id: number;
  title: string;
  description: string;
  estimatedCost: number;
  time?: string;
  type?: string;
  location?: { name?: string } | string;
  placeDetails?: {
    photos?: string[];
  };
  tips?: string;
  name?: string;
}

export interface ItineraryDay {
  day: number;
  date: string;
  dayOfWeek: string;
  theme?: string;
  title?: string;
  totalEstimatedCost: number;
  activities: Activity[];
}

export interface EstimatedTotalCost {
  transportation: number;
  accommodation: number;
  activities: number;
  meals: number;
  total: number;
}

export interface TripSummary {
  estimatedTotalCost: EstimatedTotalCost;
  budgetStatus?: 'over_budget' | 'within_budget';
}

export interface OptimalPlan {
  planName?: string;
  outboundTransport?: { id: number };
  transportation?: { outbound?: { id: number }, return?: { id: number } };
  transportationOption?: { id: number };
  transportOptions?: { outbound?: { id: number }, return?: { id: number } };
  returnTransport?: { id: number };
  accommodation?: { id: number };
  accommodationOption?: { id: number };
  stayOption?: { id: number };
  selectedRoomAllocations?: { roomId: number }[];
  costs?: { total: number };
  optimizationScore?: number;
}

export interface AvailableOptions {
  outboundTransportation: TransportOption[];
  returnTransportation: TransportOption[];
  accommodations: AccommodationOption[];
  activities: Activity[];
}

export interface PlanSearchData {
  availableOptions?: AvailableOptions;
  transportationOptions?: {
    outbound: TransportOption[];
    return: TransportOption[];
  };
  accommodationOptions?: AccommodationOption[];
  activities?: Activity[];
  itinerary?: ItineraryDay[];
  tripSummary?: TripSummary;
  optimalPlan?: OptimalPlan;
  data?: any; // For nested data property
}

export interface SavedPlan {
  id: number;
  userId: string;
  planName: string;
  status: 'draft' | 'booked';
  description?: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  endTime: string;
  numberOfTravelers: number;
  budget: number | string;
  interests?: string[];
  needsReturnTransport: boolean;
  selectedOutboundId?: number | null;
  selectedOutboundTransportId?: number | null;
  selectedReturnId?: number | null;
  selectedReturnTransportId?: number | null;
  selectedAccommodationId?: number | null;
  totalCost: number;
  originalSearchParams?: any;
  planData?: any;
  searchResultsData?: any;
  SavedPlanRoomAllocation?: RoomAllocation[];
  selectedRoomAllocations?: RoomAllocation[];
  roomAllocations?: RoomAllocation[];
}
