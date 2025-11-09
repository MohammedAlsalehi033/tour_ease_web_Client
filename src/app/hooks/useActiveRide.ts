'use client';

import 'reflect-metadata';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { container } from '@/app/lib/diContainer';
import { BookingController } from '@/app/(controller)/rideSharing/bookingController';
import { Booking } from '@/app/(model)/rideSharing/booking/bookingModel';

export interface ActiveRideDetails {
  id: string;
  status: string;
  startLocationText: string;
  endLocationText: string;
  departureTime: string;
  seatsBooked: number;
  totalPrice: string;
  userRole: 'driver' | 'traveler';
  otherUserId: string;
  otherUserDetails?: {
    id: string;
    username: string;
    mediaUrls?: string[];
  };
}

export const useActiveRide = () => {
  const { data: session, status: sessionStatus } = useSession();
  const [activeRide, setActiveRide] = useState<ActiveRideDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed to false to prevent auto-loading
  const [error, setError] = useState<string | null>(null);
  const lastCheckedRef = useRef<number>(0);

  const fetchActiveRide = useCallback(async (force = false) => {
    if (sessionStatus === 'loading') return;
    if (!session?.user?.id) {
      setIsLoading(false);
      return;
    }

    // Avoid too frequent checks unless forced
    const now = Date.now();
    if (!force && now - lastCheckedRef.current < 15000) {
      console.log('Active ride check throttled, last check was', Math.round((now - lastCheckedRef.current) / 1000), 'seconds ago');
      return; // 15 seconds throttle
    }
    
    console.log('Fetching active ride status...');
    lastCheckedRef.current = now;
    
    try {
      const bookingController = container.resolve(BookingController);
      let rideData: Booking | null = null;
      let role: 'traveler' | 'driver' | null = null;

      // Check for pending booking as traveler
      const travelerResponse = await bookingController.getBookingsForTraveler(session.user.id);
      if (travelerResponse.success && travelerResponse.data?.length > 0) {
        const bookings = travelerResponse.data as Booking[];
        const pending = bookings.find((b: Booking) => b.status === 'pending');
        if (pending) {
          rideData = pending;
          role = 'traveler';
        }
      }

      // If not found, check for pending booking as driver
      if (!rideData) {
        const driverResponse = await bookingController.getBookingsForDriver(session.user.id);
        if (driverResponse.success && driverResponse.data?.length > 0) {
          const bookings = driverResponse.data as Booking[];
          const pending = bookings.find((b: Booking) => b.status === 'pending');
          if (pending) {
            rideData = pending;
            role = 'driver';
          }
        }
      }

      if (rideData && role) {
        let normalizedDetails: ActiveRideDetails | null = null;
        let otherUser: any = null;
        let otherUserId: string | null = null;

        if (rideData.bookingSource === 'request' && rideData.request) {
          normalizedDetails = {
            id: rideData.id.toString(),
            status: rideData.status,
            seatsBooked: rideData.seatsBooked,
            totalPrice: rideData.totalPrice,
            startLocationText: rideData.request.startLocationText,
            endLocationText: rideData.request.endLocationText,
            departureTime: rideData.request.departureTime,
            userRole: role,
            otherUserId: role === 'driver' ? rideData.travelerId : rideData.request.travelerId,
          };
          
          if (role === 'driver') {
            otherUserId = rideData.travelerId;
            // Note: traveler details might not be available in the booking object
            // You may need to fetch user details separately if needed
            otherUser = { id: rideData.travelerId, username: 'Traveler', mediaUrls: [] };
          } else {
            otherUserId = rideData.request.travelerId;
            if (rideData.request.sender) otherUser = rideData.request.sender;
          }
        } else if (rideData.listing) {
          normalizedDetails = {
            id: rideData.id.toString(),
            status: rideData.status,
            seatsBooked: rideData.seatsBooked,
            totalPrice: rideData.totalPrice,
            startLocationText: rideData.listing.startLocationText,
            endLocationText: rideData.listing.endLocationText,
            departureTime: rideData.listing.departureTime,
            userRole: role,
            otherUserId: role === 'traveler' ? rideData.listing.providerId : rideData.travelerId,
          };

          if (role === 'traveler') {
            otherUserId = rideData.listing.providerId;
            if (rideData.listing.provider) otherUser = rideData.listing.provider;
          } else {
            otherUserId = rideData.travelerId;
            // Note: traveler details might not be available in the booking object
            // You may need to fetch user details separately if needed
            otherUser = { id: rideData.travelerId, username: 'Traveler', mediaUrls: [] };
          }
        }

        if (normalizedDetails && otherUser) {
          normalizedDetails.otherUserDetails = {
            id: otherUser.id,
            username: otherUser.username || otherUser.name || 'Unknown User',
            mediaUrls: otherUser.mediaUrls || []
          };
        }

        setActiveRide(normalizedDetails);
        setError(null);
      } else {
        setActiveRide(null);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching active ride:', err);
      setError('Failed to check active ride status');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, sessionStatus]);

  // TEMPORARILY DISABLED - Initial fetch to prevent infinite loop
  // useEffect(() => {
  //   if (sessionStatus === 'authenticated' && session?.user?.id) {
  //     fetchActiveRide(true);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [session?.user?.id, sessionStatus]); // Intentionally excluding fetchActiveRide to prevent loops

  // TEMPORARILY DISABLED - Periodic refresh to prevent infinite loop
  // useEffect(() => {
  //   if (!session?.user?.id) return;

  //   const interval = setInterval(() => {
  //     fetchActiveRide();
  //   }, 30000); // 30 seconds

  //   return () => clearInterval(interval);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [session?.user?.id]); // Intentionally excluding fetchActiveRide to prevent recreation

  // Manual refresh function
  const refreshActiveRide = useCallback(() => {
    setIsLoading(true);
    fetchActiveRide(true);
  }, [fetchActiveRide]);

  return {
    activeRide,
    hasActiveRide: !!activeRide,
    isLoading,
    error,
    refreshActiveRide,
  };
};