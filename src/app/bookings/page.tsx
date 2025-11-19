"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, RefreshCw, Car, Home, Calendar, MapPin, DollarSign, ChevronRight, Filter, Search, Clock, CheckCircle2, XCircle, AlertCircle, User } from 'lucide-react';
import { container } from '@/app/lib/diContainer';
import { BookingController } from '@/app/(controller)/rideSharing/bookingController';
import { AccommodationController } from '@/app/(controller)/accommodation/accommodationController';
import CombinedBookingCard from '@/app/(view)/components/CombinedBookingCard';
import { buildCombinedBookings, CombinedBooking } from '@/app/(view)/users/bookingHelpers';
import { Booking } from '@/app/(model)/rideSharing/booking/bookingModel';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
});

const formatDate = (value?: string | null | undefined) => {
    if (!value) return 'TBD';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'TBD';
    return DATE_FORMATTER.format(date);
};

const BookingsPage = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    const travelerId = session?.user?.id as string | undefined;

    const [transportationBookings, setTransportationBookings] = useState<Booking[]>([]);
    const [accommodationBookings, setAccommodationBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'transportation' | 'accommodation'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<CombinedBooking | null>(null);

    const bookingController = useMemo(() => container.resolve(BookingController), []);
    const accommodationController = useMemo(() => container.resolve(AccommodationController), []);

    const fetchBookings = useCallback(async () => {
        if (!travelerId) return;

        try {
            setLoading(true);
            setError(null);

                const [rideResult, accommodationResult] = await Promise.all([
                bookingController.getBookingsForTraveler(travelerId),
                accommodationController.getTravelerBookings(travelerId, 1, 50),
            ]);

                if (!rideResult.success || !accommodationResult.success) {
                    throw new Error('Unable to load booking data.');
            }

                const rides = (Array.isArray(rideResult.data) ? rideResult.data : [rideResult.data]) as Booking[];

            setTransportationBookings(rides);
                setAccommodationBookings(accommodationResult.data);
        } catch (err: any) {
            console.error('Error loading combined bookings:', err);
            setError(err?.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    }, [travelerId, bookingController, accommodationController]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated' && travelerId) {
            fetchBookings();
        }
    }, [fetchBookings, router, status, travelerId]);

    const combinedBookings = useMemo<CombinedBooking[]>(() => {
        return buildCombinedBookings(transportationBookings, accommodationBookings);
    }, [transportationBookings, accommodationBookings]);

    // Filter and search functionality
    const filteredBookings = useMemo(() => {
        let result = combinedBookings;

        // Apply type filter
        if (filterType !== 'all') {
            result = result.filter(booking => booking.type === filterType);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(booking => 
                booking.title.toLowerCase().includes(query) ||
                booking.subtitle.toLowerCase().includes(query) ||
                booking.status?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [combinedBookings, filterType, searchQuery]);

    const activeBookings = filteredBookings.filter((booking) => booking.isActive);
    const pastBookings = filteredBookings.filter((booking) => !booking.isActive);

    // Status icon helper
    const getStatusIcon = (status: string | null) => {
        if (!status) return <AlertCircle className="w-4 h-4" />;
        const statusLower = status.toLowerCase();
        if (['confirmed', 'active', 'accepted'].includes(statusLower)) {
            return <CheckCircle2 className="w-4 h-4 text-success" />;
        } else if (['cancelled', 'rejected', 'failed'].includes(statusLower)) {
            return <XCircle className="w-4 h-4 text-error" />;
        } else if (['pending'].includes(statusLower)) {
            return <Clock className="w-4 h-4 text-warning" />;
        }
        return <AlertCircle className="w-4 h-4" />;
    };

    const handleBookingClick = (booking: CombinedBooking) => {
        setSelectedBooking(booking);
    };

    return (
        <div className="min-h-screen bg-light-background dark:bg-dark-background">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10 space-y-6">
                {/* Header Section */}
                <motion.header 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4 rounded-3xl border border-light-outline dark:border-dark-outline bg-gradient-to-br from-light-surface/80 to-light-surface/60 dark:from-dark-surface/80 dark:to-dark-surface/60 backdrop-blur-sm p-6 sm:p-8 shadow-xl"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-2xl">
                                    <Calendar className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-sm font-bold uppercase tracking-widest text-primary">Travel Center</p>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold text-light-on-surface dark:text-dark-on-surface">
                                My Bookings
                            </h1>
                            <p className="text-sm sm:text-base text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                Manage all your travel bookings in one place
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={fetchBookings}
                            disabled={loading}
                            className="btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Refreshing...</span>
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="h-5 w-5" />
                                    <span>Refresh</span>
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                        >
                            <p className="text-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Total</p>
                            <p className="text-3xl font-bold text-light-on-surface dark:text-dark-on-surface">{combinedBookings.length}</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-success/20"
                        >
                            <p className="text-sm font-medium text-success mb-1">Active</p>
                            <p className="text-3xl font-bold text-success">{activeBookings.length}</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-info/20"
                        >
                            <p className="text-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Rides</p>
                            <p className="text-3xl font-bold text-info">{transportationBookings.length}</p>
                        </motion.div>
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-warning/20"
                        >
                            <p className="text-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Stays</p>
                            <p className="text-3xl font-bold text-warning">{accommodationBookings.length}</p>
                        </motion.div>
                    </div>
                </motion.header>

                {/* Filters and Search */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center"
                >
                    {/* Search Bar */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex gap-2 bg-light-surface dark:bg-dark-surface rounded-2xl p-1.5 border border-light-outline dark:border-dark-outline">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filterType === 'all'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-background dark:hover:bg-dark-background'
                            }`}
                        >
                            <Filter className="w-4 h-4 inline mr-1.5" />
                            All
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('transportation')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filterType === 'transportation'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-background dark:hover:bg-dark-background'
                            }`}
                        >
                            <Car className="w-4 h-4 inline mr-1.5" />
                            Rides
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType('accommodation')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                filterType === 'accommodation'
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-background dark:hover:bg-dark-background'
                            }`}
                        >
                            <Home className="w-4 h-4 inline mr-1.5" />
                            Stays
                        </motion.button>
                    </div>
                </motion.div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5 flex items-start gap-3"
                        >
                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <strong className="block font-semibold text-red-700 dark:text-red-400 mb-1">Oops! Something went wrong</strong>
                                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={fetchBookings} 
                                    className="mt-3 text-xs font-bold uppercase tracking-wide text-primary hover:text-primary-dark transition-colors"
                                >
                                    Try again →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-lg font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Loading your bookings...
                        </p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    /* Empty State */
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-3xl border-2 border-dashed border-light-outline dark:border-dark-outline bg-light-surface/60 dark:bg-dark-surface/60 p-12 text-center"
                    >
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                                {searchQuery || filterType !== 'all' ? 'No bookings found' : 'No bookings yet'}
                            </h3>
                            <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                {searchQuery || filterType !== 'all' 
                                    ? 'Try adjusting your filters or search query' 
                                    : 'Start exploring rides and accommodations to plan your next adventure!'}
                            </p>

                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* Active Bookings Section */}
                        {activeBookings.length > 0 && (
                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-light-on-surface dark:text-dark-on-surface">
                                            Current & Upcoming
                                        </h2>
                                        <p className="text-base text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                            {activeBookings.length} active booking{activeBookings.length === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full">
                                        <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                                        <span className="text-sm font-semibold uppercase tracking-wide text-success">Live</span>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                                    {activeBookings.map((booking, index) => (
                                        <motion.div
                                            key={`active-${booking.type}-${booking.id}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleBookingClick(booking)}
                                            className="cursor-pointer"
                                        >
                                            <EnhancedBookingCard booking={booking} formatDate={formatDate} getStatusIcon={getStatusIcon} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* Past Bookings Section */}
                        {pastBookings.length > 0 && (
                            <motion.section 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: activeBookings.length > 0 ? 0.4 : 0.2 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-display font-bold text-light-on-surface dark:text-dark-on-surface">
                                            Past Journeys
                                        </h2>
                                        <p className="text-base text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                            {pastBookings.length} completed booking{pastBookings.length === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                                    {pastBookings.map((booking, index) => (
                                        <motion.div
                                            key={`past-${booking.type}-${booking.id}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => handleBookingClick(booking)}
                                            className="cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                                        >
                                            <EnhancedBookingCard booking={booking} formatDate={formatDate} getStatusIcon={getStatusIcon} />
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedBooking(null)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-light-surface dark:bg-dark-surface rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-2xl ${selectedBooking.type === 'transportation' ? 'bg-info/10' : 'bg-warning/10'}`}>
                                        {selectedBooking.type === 'transportation' ? (
                                            <Car className="w-6 h-6 text-info" />
                                        ) : (
                                            <Home className="w-6 h-6 text-warning" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                                            {selectedBooking.title}
                                        </h3>
                                        <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                            {selectedBooking.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedBooking(null)}
                                    className="p-2 hover:bg-light-background dark:hover:bg-dark-background rounded-full transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedBooking.status)}
                                    <span className="text-base font-semibold px-4 py-2 rounded-full bg-primary/10 text-primary">
                                        {selectedBooking.status || 'Unknown'}
                                    </span>
                                </div>

                                {selectedBooking.price !== undefined && (
                                    <div className="flex items-center gap-2 text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                                        <DollarSign className="w-6 h-6" />
                                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(selectedBooking.price)}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    {Object.entries(selectedBooking.details).map(([key, value]) => (
                                        <div key={key} className="bg-light-background dark:bg-dark-background rounded-2xl p-4 border border-light-outline dark:border-dark-outline">
                                            <p className="text-sm uppercase tracking-wide text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
                                                {key}
                                            </p>
                                            <p className="text-base font-semibold text-light-on-surface dark:text-dark-on-surface">
                                                {value ?? 'N/A'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end pt-6">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedBooking(null)}
                                        className="btn-primary rounded-2xl px-8 py-3"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Enhanced Booking Card Component
const EnhancedBookingCard: React.FC<{
    booking: CombinedBooking;
    formatDate: (value?: string | null | undefined) => string;
    getStatusIcon: (status: string | null) => React.ReactNode;
}> = ({ booking, formatDate, getStatusIcon }) => {
    const router = useRouter();
    const dateLabel = booking.details.CheckIn || booking.details.CheckOut
        ? `${formatDate(booking.details.CheckIn)} → ${formatDate(booking.details.CheckOut)}`
        : booking.details.Departure
        ? formatDate(booking.details.Departure)
        : booking.createdAt
        ? formatDate(booking.createdAt)
        : 'Date TBD';

    const handleProviderClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (booking.providerId) {
            router.push(`/profile/${booking.providerId}`);
        }
    };

    return (
        <div className="group bg-gradient-to-br from-light-surface to-light-surface/80 dark:from-dark-surface dark:to-dark-surface/80 rounded-3xl border border-light-outline dark:border-dark-outline shadow-lg hover:shadow-2xl transition-all duration-300 p-5 sm:p-6 space-y-4 overflow-hidden relative">
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-2xl flex-shrink-0 ${
                            booking.type === 'transportation' 
                                ? 'bg-info/10 text-info' 
                                : 'bg-warning/10 text-warning'
                        }`}>
                            {booking.type === 'transportation' ? (
                                <Car className="w-5 h-5" />
                            ) : (
                                <Home className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
                                {booking.type === 'transportation' ? 'Ride Booking' : 'Accommodation Booking'}
                            </p>
                            <h3 className="text-xl sm:text-2xl font-bold text-light-on-surface dark:text-dark-on-surface truncate">
                                {booking.title}
                            </h3>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                        {getStatusIcon(booking.status)}
                        <span className="text-sm font-semibold capitalize">
                            {booking.status || 'Unknown'}
                        </span>
                    </div>
                </div>

                {/* Provider Info - for all bookings with provider data */}
                {booking.providerId && (
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        onClick={handleProviderClick}
                        className="flex items-center gap-3 p-3 rounded-xl bg-light-background/50 dark:bg-dark-background/50 border border-light-outline/30 dark:border-dark-outline/30 cursor-pointer hover:border-primary/50 transition-all"
                    >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-primary/20">
                            {booking.providerImage && booking.providerImage.startsWith('http') ? (
                                <Image
                                    src={booking.providerImage}
                                    alt="Provider"
                                    fill
                                    className="object-cover"
                                />
                            ) : booking.providerImage && process.env.NEXT_PUBLIC_API_BASE_URL ? (
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${booking.providerImage}`}
                                    alt="Provider"
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {booking.details.Provider ? booking.details.Provider.charAt(0).toUpperCase() : 'P'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                {booking.type === 'transportation' ? 'Service Provider' : 'Property Manager'}
                            </p>
                            <p className="text-sm font-bold text-light-on-surface dark:text-dark-on-surface truncate">
                                {booking.details.Provider || 'View Profile'}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                    </motion.div>
                )}

                {/* Subtitle with location */}
                <div className="flex items-start gap-2 text-base text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{booking.subtitle}</p>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-base text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    <Calendar className="w-5 h-5" />
                    <span>{dateLabel}</span>
                </div>

                {/* Price */}
                {booking.price !== undefined && (
                    <div className="flex items-center gap-2 text-xl font-bold text-light-on-surface dark:text-dark-on-surface">
                        <DollarSign className="w-6 h-6 text-success" />
                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(booking.price)}
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.entries(booking.details)
                        .filter(([key]) => !['CheckIn', 'CheckOut', 'Departure', 'Provider', 'Provider Email'].includes(key))
                        .slice(0, 6)
                        .map(([key, value]) => (
                            <div key={key} className="bg-light-background/50 dark:bg-dark-background/50 backdrop-blur-sm rounded-xl p-3 border border-light-outline/30 dark:border-dark-outline/30">
                                <p className="text-xs uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
                                    {key}
                                </p>
                                <p className="text-sm font-semibold text-light-on-surface dark:text-dark-on-surface truncate">
                                    {value ?? 'N/A'}
                                </p>
                            </div>
                        ))}
                </div>

                {/* Click indicator */}
                <div className="flex items-center justify-end gap-2 text-base font-medium text-primary pt-2 group-hover:gap-3 transition-all">
                    <span>Click for details</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;
