export interface Review {
  id: number;
  reviewerId: string;
  reviewableType: 'TRANSPORTATION_LISTING' | 'ACCOMMODATION' | 'ROOM' | 'TRANSPORTATION_BOOKING' | 'ACCOMMODATION_BOOKING';
  reviewableId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  reviewer?: {
    id: string;
    username: string;
    mediaUrls?: string[];
  };
  transportationListing?: {
    id: number;
    startLocationText: string;
    endLocationText: string;
    departureTime: string;
  };
  transportationBooking?: {
    id: number;
    startLocationText: string;
    endLocationText: string;
    departureTime: string;
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: string]: number;
  };
}

export interface CreateReviewData {
  reviewableType: 'TRANSPORTATION_LISTING' | 'ACCOMMODATION' | 'ROOM' | 'TRANSPORTATION_BOOKING' | 'ACCOMMODATION_BOOKING';
  reviewableId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ReviewFilters {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating';
  reviewableType?: string;
  minRating?: number;
  maxRating?: number;
}
