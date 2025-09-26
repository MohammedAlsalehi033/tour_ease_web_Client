import { useState, useEffect, useMemo } from 'react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';

export interface FilterOptions {
  searchQuery: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  priceRange: {
    min: number;
    max: number;
  };
  seatsRange: {
    min: number;
    max: number;
  };
  sortBy: 'date' | 'price' | 'seats' | 'distance';
  sortOrder: 'asc' | 'desc';
}

export interface UseRideDataReturn {
  // Data
  rideListings: RideListing[];
  rideRequests: RideRequest[];
  myRides: RideListing[];
  myAcceptedOffers: RideRequest[];
  
  // Filtering and Search
  filteredListings: RideListing[];
  filteredRequests: RideRequest[];
  filters: FilterOptions;
  setFilters: (filters: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;
  resetFilters: () => void;
  
  // State Management
  isLoading: boolean;
  error: string | null;
  
  // Actions
  bookRide: (listing: RideListing) => Promise<void>;
  acceptOffer: (request: RideRequest) => Promise<void>;
}

const defaultFilters: FilterOptions = {
  searchQuery: '',
  dateRange: { start: null, end: null },
  priceRange: { min: 0, max: 1000 },
  seatsRange: { min: 1, max: 8 },
  sortBy: 'date',
  sortOrder: 'asc',
};

export const useRideData = (
  initialListings: RideListing[] = [],
  initialRequests: RideRequest[] = []
): UseRideDataReturn => {
  const [rideListings, setRideListings] = useState<RideListing[]>(initialListings);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>(initialRequests);
  const [myRides, setMyRides] = useState<RideListing[]>([]);
  const [myAcceptedOffers, setMyAcceptedOffers] = useState<RideRequest[]>([]);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load persisted data on mount
  useEffect(() => {
    try {
      const storedMyRides = JSON.parse(localStorage.getItem('myRides') || '[]');
      const storedOffers = JSON.parse(localStorage.getItem('myAcceptedOffers') || '[]');
      
      if (Array.isArray(storedMyRides)) setMyRides(storedMyRides);
      if (Array.isArray(storedOffers)) setMyAcceptedOffers(storedOffers);
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  }, []);

  // Update data when props change
  useEffect(() => {
    setRideListings(initialListings);
  }, [initialListings]);

  useEffect(() => {
    setRideRequests(initialRequests);
  }, [initialRequests]);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let result = [...rideListings];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(listing =>
        listing.startLocationText.toLowerCase().includes(query) ||
        listing.endLocationText.toLowerCase().includes(query) ||
        listing.provider?.user?.name?.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(listing => {
        const departureDate = new Date(listing.departureTime);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        return (!startDate || departureDate >= startDate) && 
               (!endDate || departureDate <= endDate);
      });
    }

    // Price filter
    const priceNum = (price: string) => parseFloat(price.replace(/[^0-9.]/g, '')) || 0;
    result = result.filter(listing => {
      const price = priceNum(listing.pricePerSeat);
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Seats filter
    result = result.filter(listing =>
      listing.seatsAvailable >= filters.seatsRange.min &&
      listing.seatsAvailable <= filters.seatsRange.max
    );

    // Sorting
    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'date':
          compareValue = new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
          break;
        case 'price':
          compareValue = priceNum(a.pricePerSeat) - priceNum(b.pricePerSeat);
          break;
        case 'seats':
          compareValue = a.seatsAvailable - b.seatsAvailable;
          break;
        case 'distance':
          compareValue = a.distance_km - b.distance_km;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return result;
  }, [rideListings, filters]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    let result = [...rideRequests];

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(request =>
        request.startLocationText.toLowerCase().includes(query) ||
        request.endLocationText.toLowerCase().includes(query)
      );
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter(request => {
        const departureDate = new Date(request.departureTime);
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
        
        return (!startDate || departureDate >= startDate) && 
               (!endDate || departureDate <= endDate);
      });
    }

    // Price filter (using budget for requests)
    const budgetNum = (budget: string) => parseFloat(budget.replace(/[^0-9.]/g, '')) || 0;
    result = result.filter(request => {
      const budget = budgetNum(request.budget);
      return budget >= filters.priceRange.min && budget <= filters.priceRange.max;
    });

    // Seats filter
    result = result.filter(request =>
      request.seatsNeeded >= filters.seatsRange.min &&
      request.seatsNeeded <= filters.seatsRange.max
    );

    // Sorting
    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (filters.sortBy) {
        case 'date':
          compareValue = new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
          break;
        case 'price':
          compareValue = budgetNum(a.budget) - budgetNum(b.budget);
          break;
        case 'seats':
          compareValue = a.seatsNeeded - b.seatsNeeded;
          break;
        case 'distance':
          compareValue = a.distance_km - b.distance_km;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return result;
  }, [rideRequests, filters]);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const bookRide = async (listing: RideListing) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add your booking logic here
      const newMyRides = [...myRides, listing];
      setMyRides(newMyRides);
      localStorage.setItem('myRides', JSON.stringify(newMyRides));
      
      // Update listing status
      setRideListings(prev =>
        prev.map(l => l.id === listing.id ? { ...l, status: 'pending' as const } : l)
      );
    } catch (err) {
      setError('Failed to book ride');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOffer = async (request: RideRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add your accept offer logic here
      const newAcceptedOffers = [...myAcceptedOffers, request];
      setMyAcceptedOffers(newAcceptedOffers);
      localStorage.setItem('myAcceptedOffers', JSON.stringify(newAcceptedOffers));
      
      // Update request status
      setRideRequests(prev =>
        prev.map(r => r.id === request.id ? { ...r, status: 'accepted' as any } : r)
      );
    } catch (err) {
      setError('Failed to accept offer');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    rideListings,
    rideRequests,
    myRides,
    myAcceptedOffers,
    filteredListings,
    filteredRequests,
    filters,
    setFilters,
    resetFilters,
    isLoading,
    error,
    bookRide,
    acceptOffer,
  };
};