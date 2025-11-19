export type BookingType = 'transportation' | 'accommodation';

export interface CombinedBooking {
    id: number;
    type: BookingType;
    status: string | null;
    isActive: boolean;
    price?: number;
    createdAt?: string;
    title: string;
    subtitle: string;
    details: Record<string, any>;
    providerId?: string;
    providerImage?: string;
}

const ACTIVE_BOOKING_STATUSES = new Set(['pending', 'confirmed', 'active', 'ongoing', 'in_progress', 'accepted']);

export const isActiveBookingStatus = (status?: string | null): boolean => {
    if (!status) return false;
    return ACTIVE_BOOKING_STATUSES.has(status.toLowerCase());
};

export const formatStatusLabel = (status?: string | null): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

export const toPriceValue = (value?: number | string | null): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};

export const buildCombinedBookings = (
    transportationBookings: any[] = [],
    accommodationBookings: any[] = []
): CombinedBooking[] => {
    const records: CombinedBooking[] = [];

    transportationBookings.forEach((booking) => {
        const startLocation = booking.listing?.startLocationText ?? booking.request?.startLocationText;
        const endLocation = booking.listing?.endLocationText ?? booking.request?.endLocationText;
        const route = startLocation && endLocation ? `${startLocation} → ${endLocation}` : startLocation ?? endLocation ?? 'Ride details pending';
        
        // Get provider information
        const provider = booking.listing?.provider?.user ?? booking.offer?.sender;
        const providerName = provider?.username ?? 'N/A';
        const providerEmail = provider?.email ?? 'N/A';
        const vehicleType = booking.listing?.provider?.vehicleType ?? provider?.transportationProvider?.vehicleType ?? 'N/A';
        const departureTime = booking.listing?.departureTime ?? booking.request?.departureTime;
        const pricePerSeat = booking.listing?.pricePerSeat ?? booking.offer?.pricePerSeat;
        const luggage = booking.listing?.luggage ?? booking.request?.luggage ?? 0;

        records.push({
            id: booking.id,
            type: 'transportation',
            status: booking.status ?? null,
            isActive: isActiveBookingStatus(booking.status),
            price: toPriceValue(booking.totalPrice),
            createdAt: booking.createdAt,
            title: `${startLocation?.split(',')[0] ?? 'Ride'} → ${endLocation?.split(',')[0] ?? 'Destination'}`,
            subtitle: route,
            details: {
                'Seats Booked': booking.seatsBooked ?? 'N/A',
                'Vehicle Type': vehicleType,
                'Price/Seat': pricePerSeat ? `PKR ${Number(pricePerSeat).toLocaleString()}` : 'N/A',
                'Luggage': luggage ? `${luggage} bag${luggage > 1 ? 's' : ''}` : 'No luggage',
                'Departure': departureTime,
                'Booking Source': booking.bookingSource ? booking.bookingSource.charAt(0).toUpperCase() + booking.bookingSource.slice(1) : 'N/A',
                'Provider': providerName,
                'Provider Email': providerEmail,
            },
            providerId: provider?.id,
            providerImage: provider?.mediaUrls?.[0],
        });
    });

    accommodationBookings.forEach((booking) => {
        const propertyName = booking.room?.accommodation?.name ?? 'Accommodation';
        const roomType = booking.room?.roomType ?? 'Room';
        const location = booking.room?.accommodation?.location ?? 'Location not specified';
        const pricePerNight = booking.room?.pricePerNight;
        const capacity = booking.room?.capacity;
        const provider = booking.room?.accommodation?.provider;
        const providerName = provider?.accommodationName;
        const contactNumber = provider?.contactNumber;
        const paymentStatus = booking.payment?.status;
        const paymentMethod = booking.payment?.paymentMethod;

        records.push({
            id: booking.id,
            type: 'accommodation',
            status: booking.status ?? null,
            isActive: isActiveBookingStatus(booking.status),
            price: toPriceValue(booking.totalPrice),
            createdAt: booking.createdAt,
            title: `${propertyName}`,
            subtitle: location,
            details: {
                'Room Type': roomType,
                'Capacity': capacity ? `${capacity} guest${capacity > 1 ? 's' : ''}` : 'N/A',
                'Price/Night': pricePerNight ? `PKR ${Number(pricePerNight).toLocaleString()}` : 'N/A',
                'Provider': providerName ?? 'N/A',
                'Contact': contactNumber ?? 'N/A',
                'Payment Status': paymentStatus ? paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1) : 'Unpaid',
                'Payment Method': paymentMethod ? paymentMethod.toUpperCase() : 'N/A',
                CheckIn: booking.checkInDate,
                CheckOut: booking.checkOutDate,
            },
            providerId: provider?.providerId,
            providerImage: provider?.mediaUrls?.[0],
        });
    });

    return records;
};

export const formatBookingDateLabel = (
    booking: CombinedBooking,
    formatDate: (value?: string | null | undefined) => string
): string => {
    const checkIn = booking.details.CheckIn;
    const checkOut = booking.details.CheckOut;

    if (checkIn || checkOut) {
        return `${formatDate(checkIn)} → ${formatDate(checkOut)}`;
    }

    if (booking.createdAt) {
        return formatDate(booking.createdAt);
    }

    return 'Date TBD';
};
