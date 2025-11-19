'use client'
import 'reflect-metadata';
import { useParams } from 'next/navigation'
import React, { useState, useEffect, useMemo } from 'react'
import { container } from "@/app/lib/diContainer";
import { UserController } from '@/app/(controller)/user/userController';

const ACTIVE_BOOKING_STATUSES = new Set(['pending', 'confirmed', 'active', 'ongoing', 'in_progress']);

type BookingType = 'transportation' | 'accommodation';

interface CombinedBooking {
    id: number;
    type: BookingType;
    status: string | null;
    isActive: boolean;
    price?: number;
    createdAt?: string;
    title: string;
    subtitle: string;
    details: Record<string, any>;
}

const isActiveBookingStatus = (status?: string | null): boolean => {
    if (!status) return false;
    return ACTIVE_BOOKING_STATUSES.has(status.toLowerCase());
};

const formatStatusLabel = (status?: string | null): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
};

const toPriceValue = (value?: number | string | null): number | undefined => {
    if (value === undefined || value === null) return undefined;
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
};



const UserProfilePage = () => {
    const params = useParams();
    const id = params?.id as string | undefined;
    const [user, setUser] = useState<any | null>(null); 
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isBlocking, setIsBlocking] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');
    const tabs: Array<'overview' | 'bookings'> = ['overview', 'bookings'];

    const combinedBookings = useMemo<CombinedBooking[]>(() => {
        if (!user) return [];
        const records: CombinedBooking[] = [];

        (user.transportationBookings || []).forEach((booking: any) => {
            const startLocation = booking.listing?.startLocationText ?? booking.request?.startLocationText;
            const endLocation = booking.listing?.endLocationText ?? booking.request?.endLocationText;
            const route = startLocation && endLocation ? `${startLocation} → ${endLocation}` : startLocation ?? endLocation ?? 'Ride details pending';

            records.push({
                id: booking.id,
                type: 'transportation',
                status: booking.status ?? null,
                isActive: isActiveBookingStatus(booking.status),
                price: toPriceValue(booking.totalPrice),
                createdAt: booking.createdAt,
                title: `Ride ${booking.id}`,
                subtitle: route,
                details: {
                    Seats: booking.seatsBooked ?? 'N/A',
                    Source: booking.bookingSource ?? 'N/A',
                    Listing: booking.listing?.id ? `Listing #${booking.listing.id}` : 'N/A',
                    Request: booking.request?.id ? `Request #${booking.request.id}` : 'N/A',
                },
            });
        });

        (user.accommodationBookings || []).forEach((booking: any) => {
            const propertyName = booking.room?.accommodation?.name ?? 'Accommodation';
            const roomType = booking.room?.roomType ?? 'Room';

            records.push({
                id: booking.id,
                type: 'accommodation',
                status: booking.status ?? null,
                isActive: isActiveBookingStatus(booking.status),
                price: toPriceValue(booking.totalPrice),
                createdAt: booking.createdAt,
                title: `${propertyName}`,
                subtitle: `${roomType} · ${booking.numberOfRooms ?? 1} room(s)`,
                details: {
                    CheckIn: booking.checkInDate,
                    CheckOut: booking.checkOutDate,
                    'Room ID': booking.roomId,
                    'Provider': booking.room?.accommodation?.providerId ?? 'N/A',
                },
            });
        });

        return records;
    }, [user]);

    const activeBookings = combinedBookings.filter(booking => booking.isActive);
    const pastBookings = combinedBookings.filter(booking => !booking.isActive);

    useEffect(() => {
        const fetchUser = async () => {
            if (!id) {
                setError("User ID is missing.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const userController = container.resolve(UserController) as any;
                const response = await userController.getUserById(id);
                const normalized = response?.data ?? response;

                if (normalized && normalized.id) {
                    setUser(normalized);
                } else {
                    setError("User data not found in expected format.");
                    setUser(null);
                }
            } catch (err: any) {
                setError(err.message || "An error occurred while fetching user data.");
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    const handleBlockUser = async () => {
        if (!id || isBlocking) return;
        const confirmBlock = window.confirm(`Are you sure you want to block this user?`);
        if (!confirmBlock) return;
        setIsBlocking(true);
        try {
            const userController = container.resolve(UserController) as any;
            const blockResponse = await userController.blockUser(id);
            alert(blockResponse?.message || "User status updated.");

            const normalizedBlock = blockResponse?.data ?? blockResponse;
            if (blockResponse?.success && normalizedBlock && normalizedBlock.id) {
                setUser(normalizedBlock);
            } else {
                const updatedUser = await userController.getUserById(id);
                const normalizedUpdate = updatedUser?.data ?? updatedUser;
                if (normalizedUpdate && normalizedUpdate.id) {
                    setUser(normalizedUpdate);
                }
            }
        } catch (err: any) {
            alert(`Failed to block user: ${err.message}`);
        } finally {
             setIsBlocking(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading user profile...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">User not found.</div>;
    }

    const roleNames = user.roles && user.roles.length > 0
        ? user.roles.map((role: any) => role.role?.roleName || 'Unknown Role').join(', ')
        : 'No roles assigned';

    const formatDate = (dateString: string | null | undefined) => {
        return dateString ? new Date(dateString).toLocaleString() : 'N/A';
    }

    const renderListItem = (label: string, value: any) => (
        <p className="text-body-md truncate"><strong>{label}:</strong> {value ?? 'N/A'}</p>
    );

     const renderDetailItemCard = (item: any, index: number, title: string, details: Record<string, any>) => (
         <div key={`${title}-${item.id}-${index}`} className="border border-light-outline dark:border-dark-outline rounded-md p-3 mb-3">
             <h4 className="text-title-sm font-medium mb-1">{title} #{item.id}</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                 {Object.entries(details).map(([key, value]) => (
                     <div key={key} className="text-body-sm truncate">
                         <span className="font-medium">{key}:</span> {value ?? 'N/A'}
                     </div>
                 ))}
             </div>
         </div>
     );

    const renderTransportationBookingsSection = () => {
        if (!user.transportationBookings || user.transportationBookings.length === 0) {
            return null;
        }
        return (
            <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Transportation Bookings ({user.transportationBookings.length})</h2>
                <div>
                    {user.transportationBookings.map((booking: any, index: number) => renderDetailItemCard(booking, index, 'Booking', {
                        Status: booking.status,
                        Price: `PKR ${booking.totalPrice}`,
                        Seats: booking.seatsBooked,
                        Source: booking.bookingSource,
                        Listing: booking.listing ? `(${booking.listing.id}) ${booking.listing.startLocationText} -> ${booking.listing.endLocationText}` : 'N/A',
                        Request: booking.request ? `(${booking.request.id}) ${booking.request.startLocationText} -> ${booking.request.endLocationText}` : 'N/A',
                        Date: formatDate(booking.createdAt),
                    }))}
                </div>
            </div>
        );
    };

    const renderAccommodationBookingsSection = () => {
        if (!user.accommodationBookings || user.accommodationBookings.length === 0) {
            return null;
        }
        return (
            <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Accommodation Bookings ({user.accommodationBookings.length})</h2>
                <div>
                    {user.accommodationBookings.map((booking: any, index: number) => renderDetailItemCard(booking, index, 'Booking', {
                        Status: booking.status,
                        Price: `PKR ${booking.totalPrice}`,
                        CheckIn: formatDate(booking.checkInDate),
                        CheckOut: formatDate(booking.checkOutDate),
                        RoomType: booking.room?.roomType,
                        Accommodation: booking.room?.accommodation?.name,
                        Date: formatDate(booking.createdAt),
                    }))}
                </div>
            </div>
        );
    };

    const formatBookingDateLabel = (booking: CombinedBooking) => {
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

    const renderBookingCard = (booking: CombinedBooking) => {
        return (
            <div key={`${booking.type}-${booking.id}`} className="card bg-light-surface dark:bg-dark-surface p-4 rounded-lg shadow-lg border border-light-outline dark:border-dark-outline">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                        <p className="text-body-sm font-semibold text-light-on-surface dark:text-dark-on-surface">{booking.title}</p>
                        <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                            {booking.subtitle}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-body-xs font-medium border ${booking.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-light-surface-variant dark:bg-dark-surface-variant border-light-outline dark:border-dark-outline'}`}>
                        {formatStatusLabel(booking.status)}
                    </span>
                </div>
                <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-2">
                    {formatBookingDateLabel(booking)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-body-sm">
                    <span className="text-primary font-semibold">
                        {booking.price ? `PKR ${booking.price.toLocaleString()}` : 'Price TBD'}
                    </span>
                    <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {booking.type === 'transportation' ? 'Ride' : 'Stay'} booking
                    </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {Object.entries(booking.details).map(([key, value]) => (
                        <div key={key} className="truncate">
                            <span className="font-medium text-light-on-surface dark:text-dark-on-surface">{key}:</span> {value ?? 'N/A'}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const hasAnyBookings = combinedBookings.length > 0;

    return (
        <div className="text-light-onSurface dark:text-dark-onSurface">

            <div className="max-w-4xl w-full px-4 md:px-6 mt-16 space-y-8 mb-12">
                <h1 className="text-headline-md font-semibold mb-6 text-center">User Profile</h1>

                {/* User Details Card */}
                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">User Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                        {renderListItem("ID", user.id)}
                        {renderListItem("Username", user.username)}
                        {renderListItem("Email", user.email)}
                        <div>
                            <p className="text-body-md">
                                <strong>Account Status:</strong>
                                <span className={`ml-2 px-2 py-0.5 rounded text-sm font-medium ${user.accountStatus === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {user.accountStatus}
                                </span>
                            </p>
                        </div>
                        {renderListItem("Created At", formatDate(user.createdAt))}
                        {renderListItem("Updated At", formatDate(user.updatedAt))}
                        <div className="md:col-span-2">{renderListItem("Roles", roleNames)}</div>
                    </div>
                     <div className="mt-6 flex justify-end">
                         <button
                             onClick={handleBlockUser}
                             disabled={isBlocking || user.accountStatus === 'blocked'}
                             className={`btn-primary px-4 py-2 rounded text-white font-medium transition ${
                                 isBlocking || user.accountStatus === 'blocked'
                                 ? 'bg-gray-400 cursor-not-allowed'
                                 : 'bg-red-600 hover:bg-red-700'
                             }`}
                         >
                             {isBlocking ? 'Blocking...' : (user.accountStatus === 'blocked' ? 'User Blocked' : 'Block User')}
                         </button>
                     </div>
                </div>

                 {/* Transportation Provider Card */}
                 {user.transportationProvider && (
                     <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                         <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Transportation Provider Details</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                             {renderListItem("Vehicle Type", user.transportationProvider.vehicleType)}
                             {renderListItem("Seats Available", user.transportationProvider.seatsAvailable)}
                             {renderListItem("Provider Status", user.transportationProvider.accountStatus)}
                             {renderListItem("License Media", `${user.transportationProvider.licenseMmediaUrls?.length || 0} file(s)`)}
                             {renderListItem("Vehicle Media", `${user.transportationProvider.vehicleMediaUrls?.length || 0} file(s)`)}
                         </div>
                     </div>
                 )}

                  {/* Accommodation Provider Card */}
                 {user.accommodationProvider && (
                     <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                         <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Accommodation Provider Details</h2>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                             {renderListItem("Accommodation Name", user.accommodationProvider.accommodationName)}
                             {renderListItem("Address", user.accommodationProvider.address)}
                             {renderListItem("Contact Number", user.accommodationProvider.contactNumber)}
                             {renderListItem("Media", `${user.accommodationProvider.mediaUrls?.length || 0} file(s)`)}
                         </div>
                     </div>
                 )}

                {/* --- Detailed Lists --- */}
                <div className="mt-8 flex justify-center">
                    <div className="inline-flex items-center rounded-full border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
                        {tabs.map((tab, index) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 text-sm font-semibold transition ${
                                    activeTab === tab
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant'
                                } ${index < tabs.length - 1 ? 'border-r border-light-outline dark:border-dark-outline' : ''}`}
                            >
                                {tab === 'overview' ? 'Overview' : 'Bookings'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6 mt-6">
                    {activeTab === 'overview' && (
                        <>
                            {renderTransportationBookingsSection()}
                            {renderAccommodationBookingsSection()}

                            {/* Questions */}
                            {user.questions && user.questions.length > 0 && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Questions Asked ({user.questions.length})</h2>
                                    <div>
                                        {user.questions.map((q: any, index: number) => renderDetailItemCard(q, index, 'Question', {
                                            Title: q.title,
                                            Upvotes: q.upvotes,
                                            Downvotes: q.downvotes,
                                            Comments: q.comments?.length || 0,
                                            Tags: q.tags?.join(', '),
                                            Date: formatDate(q.createdAt),
                                        }))}
                                    </div>
                                </div>
                            )}

                            {/* Offers Received */}
                            {user.receivedOffers && user.receivedOffers.length > 0 && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Offers Received ({user.receivedOffers.length})</h2>
                                    <div>
                                        {user.receivedOffers.map((offer: any, index: number) => renderDetailItemCard(offer, index, 'Offer', {
                                            Status: offer.status,
                                            Price: `PKR ${offer.pricePerSeat}/seat`,
                                            Seats: offer.seatsRequested,
                                            Listing: offer.listing?.id ? `Listing #${offer.listing.id}` : 'N/A',
                                            Request: offer.request?.id ? `Request #${offer.request.id}` : 'N/A',
                                            Date: formatDate(offer.createdAt),
                                        }))}
                                    </div>
                                </div>
                            )}

                            {/* Offers Sent */}
                            {user.sentOffers && user.sentOffers.length > 0 && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Offers Sent ({user.sentOffers.length})</h2>
                                    <div>
                                        {user.sentOffers.map((offer: any, index: number) => renderDetailItemCard(offer, index, 'Offer', {
                                            Status: offer.status,
                                            Price: `PKR ${offer.pricePerSeat}/seat`,
                                            Seats: offer.seatsRequested,
                                            Listing: offer.listing?.id ? `Listing #${offer.listing.id}` : 'N/A',
                                            Request: offer.request?.id ? `Request #${offer.request.id}` : 'N/A',
                                            Date: formatDate(offer.createdAt),
                                        }))}
                                    </div>
                                </div>
                            )}

                            {/* Transportation Requests */}
                            {user.TransportationRequest && user.TransportationRequest.length > 0 && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Transportation Requests ({user.TransportationRequest.length})</h2>
                                    <div>
                                        {user.TransportationRequest.map((req: any, index: number) => renderDetailItemCard(req, index, 'Request', {
                                            From: req.startLocationText,
                                            To: req.endLocationText,
                                            Time: formatDate(req.departureTime),
                                            Seats: req.seatsNeeded,
                                            Budget: `$${req.budget}`,
                                            Offers: req.offers?.length || 0,
                                            Bookings: req.bookings?.length || 0,
                                            Date: formatDate(req.createdAt),
                                        }))}
                                    </div>
                                </div>
                            )}

                            {/* Reviews */}
                            {user.reviews && user.reviews.length > 0 && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-4 md:p-6 rounded-lg shadow-md">
                                    <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Reviews Written ({user.reviews.length})</h2>
                                    <div>
                                        {user.reviews.map((review: any, index: number) => renderDetailItemCard(review, index, 'Review', {
                                            Rating: `${review.rating} / 5`,
                                            Type: review.reviewableType,
                                            Comment: review.comment,
                                            TargetID: review.transportationListingId || review.accommodationId || review.roomId || review.transportationBookingId || review.accommodationBookingId || 'N/A',
                                            Date: formatDate(review.createdAt),
                                        }))}
                                    </div>
                                </div>
                            )}

                            {/* Add similar sections for Trips, Votes, Comments, Messages, Notifications as needed */}
                        </>
                    )}

                    {activeTab === 'bookings' && (
                        <>
                            {!hasAnyBookings && (
                                <div className="card bg-light-surface dark:bg-dark-surface p-6 rounded-lg shadow-md text-center">
                                    <p className="text-body-md text-light-on-surface dark:text-dark-on-surface-variant">
                                        This user does not have any bookings yet.
                                    </p>
                                </div>
                            )}

                            {hasAnyBookings && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Current & Upcoming Bookings ({activeBookings.length})</h2>
                                        {activeBookings.length === 0 ? (
                                            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">No active bookings right now.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {activeBookings.map(renderBookingCard)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-title-lg font-medium mb-4 border-b pb-2 border-light-outline dark:border-dark-outline">Past Bookings ({pastBookings.length})</h2>
                                        {pastBookings.length === 0 ? (
                                            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">No past bookings yet.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {pastBookings.map(renderBookingCard)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;