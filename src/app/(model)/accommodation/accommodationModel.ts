export interface Room {
  id: number;
  accommodationId: number;
  roomType: string;
  capacity: number;
  pricePerNight: string | number; // API returns string, we'll parse it
  mediaUrls: string[];
  createdAt: string;
  accommodation?: Accommodation;
}

export interface AccommodationProvider {
  providerId: string;
  accommodationName: string;
  address: string;
  contactNumber: string;
  mediaUrls: string[];
  createdAt: string;
}

export interface Accommodation {
  id: number;
  providerId: string;
  name: string;
  location: string;
  description: string;
  mediaUrls: string[];
  createdAt: string;
  rooms?: Room[];
  averageRating?: number;
  reviewCount?: number;
  provider?: AccommodationProvider;
}

export interface AccommodationFilters {
  name?: string;
  location?: string;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface PaginatedAccommodations {
  accommodations: Accommodation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
