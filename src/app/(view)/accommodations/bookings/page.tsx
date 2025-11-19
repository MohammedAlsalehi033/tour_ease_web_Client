"use client";

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Bed,
  Banknote,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { container } from '@/app/lib/diContainer';
import { AccommodationController } from '@/app/(controller)/accommodation/accommodationController';

const API_MEDIA_BASE = 'https://api.tourease.me/api/';
const DEFAULT_BOOKING_IMAGE = 'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?auto=format&fit=crop&w=400&q=80';

const resolveMediaUrl = (value?: string): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.startsWith('http') ? trimmed : `${API_MEDIA_BASE}${trimmed}`;
};

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded';

interface BookingAccommodation {
  id: number;
  providerId: string;
  name: string;
  location: string;
  description?: string;
  mediaUrls?: string[];
}

interface BookingRoom {
  id: number;
  accommodationId: number;
  roomType: string;
  pricePerNight: string | number;
  capacity: number;
  mediaUrls: string[];
  accommodation?: BookingAccommodation;
}

interface AccommodationBooking {
  id: number;
  travelerId: string;
  roomId: number;
  accommodationId?: number;
  status: BookingStatus;
  totalPrice: number;
  numberOfRooms: number;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt?: string;
  room?: BookingRoom;
}
interface AccommodationBooking {
  id: number;
  travelerId: string;
  roomId: number;
  accommodationId?: number;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  totalPrice: number;
  numberOfRooms: number;
  checkInDate?: string;
  checkOutDate?: string;
  createdAt?: string;
}

export default function BookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<AccommodationBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const accommodationController = container.resolve(AccommodationController);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      setLoading(true);
      setError(null);

      const result = await accommodationController.getTravelerBookings(
        (session.user as any).id,
        1,
        20
      );

      if (result.success) {
        setBookings(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setActionLoading(bookingId);

      const result = await accommodationController.cancelUnpaidBooking(bookingId);

      if (result.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
        alert('Booking cancelled successfully');
      }
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRefund = async (bookingId: number) => {
    if (!confirm('Are you sure you want to request a refund for this booking?')) {
      return;
    }

    try {
      setActionLoading(bookingId);

      const result = await accommodationController.requestRefund(bookingId);

      if (result.success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? { ...b, status: 'refunded' } : b
        ));
        alert('Refund requested successfully');
      }
    } catch (err: any) {
      console.error('Error requesting refund:', err);
      alert(err.message || 'Failed to request refund');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-info" />;
      default:
        return <AlertCircle className="w-5 h-5 text-light-on-surface-variant" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-error/10 text-error border-error/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'refunded':
        return 'bg-info/10 text-info border-info/20';
      default:
        return 'bg-light-surface-variant dark:bg-dark-surface-variant';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Header */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-outline dark:border-dark-outline">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-display text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
            My Bookings
          </h1>
          <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            Manage your accommodation bookings
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card shadow-lg rounded-lg border border-error/20 bg-error/10 p-4 mb-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-error flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-display text-headline-sm font-bold text-error mb-1">
                  Error Loading Bookings
                </h3>
                <p className="text-body-sm text-light-on-surface dark:text-dark-on-surface">
                  {error}
                </p>
                <button
                  onClick={fetchBookings}
                  className="btn-primary mt-3 px-4 py-2 rounded-lg text-body-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bookings List */}
        {!error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking, index) => {
              const room = booking.room;
              const property = room?.accommodation;
              const rawImage = room?.mediaUrls?.[0] ?? property?.mediaUrls?.[0];
              const optimizedImage = resolveMediaUrl(rawImage) ?? DEFAULT_BOOKING_IMAGE;
              const parsedRoomPrice =
                room?.pricePerNight !== undefined
                  ? typeof room.pricePerNight === 'number'
                    ? room.pricePerNight
                    : Number.parseFloat(room.pricePerNight)
                  : NaN;
              const propertyId = booking.accommodationId ?? property?.id;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface">
                            Booking #{booking.id}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-body-xs font-medium border ${getStatusColor(booking.status)}`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          Created on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      {getStatusIcon(booking.status)}
                    </div>

                    <div className="border-b border-light-outline dark:border-dark-outline pb-4 mb-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="h-24 w-full rounded-2xl bg-light-surface dark:bg-dark-surface overflow-hidden md:w-32">
                          <Image
                            src={optimizedImage}
                            alt={property?.name ?? 'Booking image'}
                            width={320}
                            height={192}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-body-xs uppercase tracking-wide text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Property
                          </p>
                          <p className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {property?.name ?? 'Accommodation details pending'}
                          </p>
                          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {property?.location ?? 'Location will be provided once booked'}
                          </p>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {room?.roomType ?? 'Room'} · {room?.capacity ?? 1} guest(s)
                          </p>
                          {Number.isFinite(parsedRoomPrice) && (
                            <p className="text-body-sm font-semibold text-primary">
                              PKR {parsedRoomPrice.toLocaleString()} · per night
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Check-in
                          </p>
                          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                            {formatDate(booking.checkInDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Check-out
                          </p>
                          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                            {formatDate(booking.checkOutDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Bed className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Rooms
                          </p>
                          <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                            {booking.numberOfRooms}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Banknote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Total Price
                          </p>
                          <p className="text-body-sm font-bold text-primary">
                            PKR {booking.totalPrice.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-light-outline dark:border-dark-outline">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="btn-secondary px-4 py-2 rounded-lg text-body-sm flex items-center space-x-2 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Cancelling...</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>Cancel Booking</span>
                            </>
                          )}
                        </button>
                      )}

                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleRequestRefund(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="btn-secondary px-4 py-2 rounded-lg text-body-sm flex items-center space-x-2 disabled:opacity-50"
                        >
                          {actionLoading === booking.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Requesting...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Request Refund</span>
                            </>
                          )}
                        </button>
                      )}

                      {propertyId && (
                        <button
                          onClick={() => router.push(`/accommodations/${propertyId}`)}
                          className="btn-primary px-4 py-2 rounded-lg text-body-sm flex items-center space-x-2"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>View Property</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!error && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline p-12 text-center"
          >
            <Bed className="w-16 h-16 mx-auto mb-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
              No Bookings Yet
            </h3>
            <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mb-6">
              You haven't made any accommodation bookings yet. Start exploring amazing places to stay!
            </p>
            <button
              onClick={() => router.push('/accommodations')}
              className="btn-primary px-6 py-3 rounded-lg"
            >
              Browse Accommodations
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
