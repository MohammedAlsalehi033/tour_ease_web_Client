import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';
import { OfferController } from '@/app/(controller)/rideSharing/offerController';
import { container } from '@/app/lib/diContainer';

// Extend the session type to include the id property
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firebaseToken?: string;
    }
  }
}

/**
 * Enhanced useRideData hook with real API integration
 * 
 * Features:
 * - Real API calls for booking rides and accepting offers
 * - User authentication validation
 * - Better error handling and loading states
 * - Optional success callbacks and data refresh triggers
 * - TypeScript support with proper types
 * 
 * Usage Example:
 * ```tsx
 * const rideData = useRideData(listings, requests, {
 *   onBookingSuccess: (listing, offer) => {
 *     console.log('Booking successful!', offer);
 *     showSuccessNotification('Ride booked successfully!');
 *   },
 *   onAcceptOfferSuccess: (request, offer) => {
 *     console.log('Offer sent!', offer);
 *     showSuccessNotification('Offer sent to traveler!');
 *   },
 *   onRefreshNeeded: async () => {
 *     // Refresh data from server
 *     await refetchListings();
 *     await refetchRequests();
 *   }
 * });
 * 
 * // Error handling
 * useEffect(() => {
 *   if (rideData.error) {
 *     showErrorNotification(rideData.error);
 *     rideData.clearError();
 *   }
 * }, [rideData.error]);
 * ```
 */

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

export interface UseRideDataOptions {
  onBookingSuccess?: (listing: RideListing, offer: TransportationOffer) => void;
  onAcceptOfferSuccess?: (request: RideRequest, offer: TransportationOffer) => void;
  onAcceptExistingOfferSuccess?: (offer: TransportationOffer) => void;
  onRefreshNeeded?: () => void;
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
  clearError: () => void;
  
  // Actions
  bookRide: (listing: RideListing) => Promise<void>;
  acceptOffer: (request: RideRequest) => Promise<void>; // Creates offer for a request
  acceptExistingOffer: (offerId: number) => Promise<void>; // Accepts an existing offer
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
  initialRequests: RideRequest[] = [],
  options: UseRideDataOptions = {}
): UseRideDataReturn => {
  const { data: session } = useSession();
  const { onBookingSuccess, onAcceptOfferSuccess, onAcceptExistingOfferSuccess, onRefreshNeeded } = options;
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

  const clearError = () => {
    setError(null);
  };

  const bookRide = async (listing: RideListing) => {
    if (!session?.user?.id) {
      setError('You must be logged in to book a ride');
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const offerController = container.resolve(OfferController);
      
      // Create transportation offer for the ride listing
      const offer: TransportationOffer = {
        id: 0, // Backend will generate this
        senderId: session.user.id,
        recipientId: listing.providerId,
        pricePerSeat: listing.pricePerSeat,
        seatsRequested: 1, // Default to 1 seat, you might want to make this configurable
        transportationListingId: listing.id,
        transportationRequestId: null,
        message: "I'd like to book a seat for this ride.",
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Send the offer to the backend
      const createdOffer = await offerController.createOffer(offer);
      
      // Update local state with the booking
      const newMyRides = [...myRides, listing];
      setMyRides(newMyRides);
      localStorage.setItem('myRides', JSON.stringify(newMyRides));
      
      // Update listing status to show it has a pending booking
      setRideListings(prev =>
        prev.map(l => l.id === listing.id ? { ...l, status: 'pending' as const } : l)
      );

      // Call success callback to notify parent component
      onBookingSuccess?.(listing, createdOffer);
      
      // Trigger data refresh if callback provided
      onRefreshNeeded?.();

      console.log('Ride booking offer created successfully:', createdOffer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to book ride';
      setError(errorMessage);
      console.error('Error booking ride:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptOffer = async (request: RideRequest) => {
    if (!session?.user?.id) {
      setError('You must be logged in to accept a request');
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const offerController = container.resolve(OfferController);
      
      // Create an offer to fulfill the ride request (as a driver responding to passenger request)
      const offer: TransportationOffer = {
        id: 0, // Backend will generate this
        senderId: session.user.id, // Driver/provider is the sender
        recipientId: request.travelerId, // Traveler is the recipient
        pricePerSeat: request.budget, // Offer at the traveler's budget price
        seatsRequested: request.seatsNeeded,
        transportationListingId: null,
        transportationRequestId: request.id, // Link to the original request
        message: "I can fulfill your ride request.",
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Send the offer to the backend
      const createdOffer = await offerController.createOffer(offer);
      
      // Update local state - add to accepted offers
      const newAcceptedOffers = [...myAcceptedOffers, request];
      setMyAcceptedOffers(newAcceptedOffers);
      localStorage.setItem('myAcceptedOffers', JSON.stringify(newAcceptedOffers));
      
      // Update request status to show it has a pending offer
      setRideRequests(prev =>
        prev.map(r => r.id === request.id ? { ...r, status: 'pending' as any } : r)
      );

      // Call success callback to notify parent component
      onAcceptOfferSuccess?.(request, createdOffer);
      
      // Trigger data refresh if callback provided
      onRefreshNeeded?.();

      console.log('Offer created for ride request successfully:', createdOffer);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept request';
      setError(errorMessage);
      console.error('Error creating offer for request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptExistingOffer = async (offerId: number) => {
    if (!session?.user?.id) {
      setError('You must be logged in to accept an offer');
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const offerController = container.resolve(OfferController);
      
      // Accept the existing offer
      const acceptedOffer = await offerController.acceptOffer(offerId);
      
      // Call success callback to notify parent component
      onAcceptExistingOfferSuccess?.(acceptedOffer);
      
      // Trigger data refresh if callback provided
      onRefreshNeeded?.();
      
      console.log('Offer accepted successfully:', acceptedOffer);
      
      // You might want to refresh the data or update local state based on the accepted offer
      // This depends on your app's data flow and what data needs to be updated
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept offer';
      setError(errorMessage);
      console.error('Error accepting offer:', err);
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
    clearError,
    bookRide,
    acceptOffer,
    acceptExistingOffer,
  };
};