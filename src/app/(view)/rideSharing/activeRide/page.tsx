'use client';
import "reflect-metadata";
import React, { useEffect, useState } from 'react';
import { TruckIcon, MapPinIcon, CheckCircleIcon, CalendarIcon, UserIcon, ChatBubbleLeftRightIcon, UserCircleIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";
import Link from "next/link";

import { BookingController } from '../../../(controller)/rideSharing/bookingController';
import { ReportController } from '../../../(controller)/report/reportController';
import type { CreateReportData, ReportableType } from '../../../(model)/report/reportModel';
import { container } from '@/app/lib/diContainer';
import { ResponseModel } from '@/Types/types';
import { Booking } from "@/app/(model)/rideSharing/booking/bookingModel";
import OtherAvatarPic from '../../components/otherAvatarPic';

// A normalized structure for ride details, making the UI logic clean.
type NormalizedRideDetails = {
    id: string;
    status: string;
    startLocationText: string;
    endLocationText: string;
    departureTime: string;
    seatsBooked: number;
    totalPrice: string;
    createdAt?: string;
    pickupNotes?: string;
    dropoffNotes?: string;
    vehicleType?: string;
    vehicleMediaUrls?: string[];
    pricePerSeat?: string;
};

// A structure for the other user's profile details.
type OtherUserDetails = {
    id: string;
    username: string;
    mediaUrls?: string[];
    phoneNumber?: string;
    email?: string;
    rating?: number;
};

const ActiveRidePage = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user?.id;

    const [activeRides, setActiveRides] = useState<Array<{
        ride: NormalizedRideDetails;
        otherUser: OtherUserDetails | null;
        otherUserId: string | null;
        booking: Booking;
    }>>([]);
    const [userRole, setUserRole] = useState<'driver' | 'traveler' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states for cancellation
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);

    useEffect(() => {
        async function fetchActiveRide() {
            if (sessionStatus === 'loading') return;
            if (!userId) {
                setIsLoading(false);
                setError("User not identified. Please log in.");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const bookingController = container.resolve(BookingController);
                const travelerResponse = await bookingController.getBookingsForTraveler(userId);
                const driverResponse = await bookingController.getBookingsForDriver(userId);
                
                const allRidesData: Array<{
                    ride: NormalizedRideDetails;
                    otherUser: OtherUserDetails | null;
                    otherUserId: string | null;
                    booking: Booking;
                }> = [];
                
                let role: 'traveler' | 'driver' | null = null;

                // Process traveler bookings
                if (travelerResponse.success && Array.isArray(travelerResponse.data) && travelerResponse.data.length > 0) {
                    const pendingBookings = travelerResponse.data.filter((b: any) => b.status === 'pending');
                    
                    if (pendingBookings.length > 0) {
                        role = 'traveler';
                        
                        pendingBookings.forEach((booking: any) => {
                            const normalized = normalizeBookingData(booking, 'traveler');
                            if (normalized) {
                                allRidesData.push(normalized);
                            }
                        });
                    }
                }

                // Process driver bookings (only if not already a traveler with pending rides)
                if (driverResponse.success && Array.isArray(driverResponse.data) && driverResponse.data.length > 0 && role !== 'traveler') {
                    const pendingBookings = driverResponse.data.filter((b: any) => b.status === 'pending');
                    
                    if (pendingBookings.length > 0) {
                        role = 'driver';
                        
                        pendingBookings.forEach((booking: any) => {
                            const normalized = normalizeBookingData(booking, 'driver');
                            if (normalized) {
                                allRidesData.push(normalized);
                            }
                        });
                    }
                }

                setActiveRides(allRidesData);
                setUserRole(role);
                
            } catch (err) {
                console.error("Error fetching active ride:", err);
                setError("An error occurred while checking for an active ride.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchActiveRide();
    }, [userId, sessionStatus]);

    // Helper function to normalize booking data
    const normalizeBookingData = (booking: any, userRole: 'traveler' | 'driver') => {
        let normalized: NormalizedRideDetails | null = null;
        let otherUser: OtherUserDetails | null = null;
        let otherUserId: string | null = null;

        try {
            if (booking.bookingSource === 'request' && booking.request) {
                normalized = {
                    id: String(booking.id),
                    status: booking.status,
                    seatsBooked: booking.seatsBooked,
                    totalPrice: booking.totalPrice,
                    startLocationText: booking.request.startLocationText,
                    endLocationText: booking.request.endLocationText,
                    departureTime: booking.request.departureTime,
                    createdAt: booking.createdAt,
                    pickupNotes: booking.request.pickupNotes,
                    dropoffNotes: booking.request.dropoffNotes,
                };
                
                if (userRole === 'driver') {
                    otherUserId = booking.travelerId;
                    // Extract traveler data if available
                    if (booking.traveler) {
                        otherUser = {
                            id: booking.traveler.id || booking.travelerId,
                            username: booking.traveler.username || 'Traveler',
                            mediaUrls: booking.traveler.mediaUrls,
                            phoneNumber: booking.traveler.phoneNumber,
                            email: booking.traveler.email,
                        };
                    }
                }
            } else if (booking.listing) {
                normalized = {
                    id: String(booking.id),
                    status: booking.status,
                    seatsBooked: booking.seatsBooked,
                    totalPrice: booking.totalPrice,
                    startLocationText: booking.listing.startLocationText,
                    endLocationText: booking.listing.endLocationText,
                    departureTime: booking.listing.departureTime,
                    createdAt: booking.createdAt,
                    pricePerSeat: booking.listing.pricePerSeat,
                    vehicleType: booking.listing.provider?.vehicleType,
                    vehicleMediaUrls: booking.listing.provider?.vehicleMediaUrls,
                };
                
                if (userRole === 'traveler') {
                    otherUserId = booking.listing.providerId;
                    if (booking.listing.provider) {
                        otherUser = {
                            id: booking.listing.provider.userId || booking.listing.providerId,
                            username: booking.listing.provider.user?.username || 'Driver',
                            mediaUrls: booking.listing.provider.user?.mediaUrls,
                            phoneNumber: booking.listing.provider.user?.phoneNumber,
                            email: booking.listing.provider.user?.email,
                        };
                    }
                } else {
                    otherUserId = booking.travelerId;
                    // Extract traveler data if available
                    if (booking.traveler) {
                        otherUser = {
                            id: booking.traveler.id || booking.travelerId,
                            username: booking.traveler.username || 'Traveler',
                            mediaUrls: booking.traveler.mediaUrls,
                            phoneNumber: booking.traveler.phoneNumber,
                            email: booking.traveler.email,
                        };
                    }
                }
            }

            if (normalized) {
                return {
                    ride: normalized,
                    otherUser,
                    otherUserId,
                    booking
                };
            }
        } catch (err) {
            console.error("Error normalizing booking:", err);
        }
        
        return null;
    };


   const handleMarkAsComplete = async (rideId: string) => {
        try {
            const bookingController = container.resolve(BookingController);
            const response = await bookingController.updateBookingStatus(rideId, 'complete');
            if (response.success) {
                window.location.reload();
            } else {
                setError("Failed to mark ride as complete.");
            }
        } catch (err) {
            console.error("Error updating booking status:", err);
            setError("An error occurred while completing the ride.");
        }
    };

    const handleCancelRide = async (rideId: string) => {
        if (!userId) return;
        setIsCancelling(true);
        setCancelError(null);
        try {
            const bookingController = container.resolve(BookingController);
            const statusResp = await bookingController.updateBookingStatus(rideId, 'cancelled');
            if (!statusResp?.success) {
                throw new Error('Failed to cancel the ride.');
            }

            // Auto-generate a report for the cancellation
            const reportController = container.resolve(ReportController) as ReportController;
            const description = cancelReason && cancelReason.trim().length > 0
                ? cancelReason.trim()
                : `Ride was cancelled by ${userRole ?? 'user'}.`;
            const reportData: CreateReportData = {
                reporterId: userId,
                reportableType: 'TRANSPORTATION_BOOKING' as ReportableType,
                reportReason: 'Ride cancelled',
                description,
                transportationBookingId: parseInt(rideId.toString())
            };
            const validation = reportController.validateReportData(reportData);
            if (!validation.isValid) {
                console.warn('Report validation failed:', validation.errors);
            } else {
                await reportController.createReport(reportData);
            }

            setShowCancelModal(false);
            setCancelReason('');
            window.location.reload();
        } catch (err: any) {
            console.error('Error cancelling ride:', err);
            setCancelError(err?.message || 'An error occurred while cancelling.');
        } finally {
            setIsCancelling(false);
        }
    };

    // --- Helper Functions (formatDate, getStatusColor) ---
    const formatDate = (dateString: string) => !dateString ? "Not specified" : new Date(dateString).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case 'complete': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
        }
    };

    // --- Loading State ---
    if (isLoading || sessionStatus === 'loading') {
        return (
            <main className="min-h-screen bg-light-background dark:bg-dark-background flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-body-md text-light-on-background dark:text-dark-on-background">Loading your ride...</p>
                </div>
            </main>
        );
    }

    // --- Main Render ---
    return (
        <main className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 p-4">
            <div className=" pt-8">
                {activeRides.length > 0 ? (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <TruckIcon className="mx-auto h-16 w-16 text-success mb-4" />
                            <h1 className="text-display-md font-bold text-light-on-background dark:text-dark-on-background">
                                {activeRides.length === 1 ? 'You Have an Active Ride' : `You Have ${activeRides.length} Active Rides`}
                            </h1>
                            {userRole && <p className="mt-2 text-headline-sm text-light-on-background/80 dark:text-dark-on-background/80">Your Role: <span className="font-semibold text-primary">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span></p>}
                        </div>

                        {/* Render Each Ride */}
                        {activeRides.map((rideData, index) => (
                            <div key={rideData.ride.id} className="space-y-6">
                                {activeRides.length > 1 && (
                                    <h2 className="text-headline-lg font-bold text-light-on-background dark:text-dark-on-background">
                                        Ride {index + 1}
                                    </h2>
                                )}
                                
                                {/* Ride Details Card */}
                                <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">Ride Details</h2>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium ${getStatusColor(rideData.ride.status)}`}>{rideData.ride.status.charAt(0).toUpperCase() + rideData.ride.status.slice(1)}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Booking ID</p>
                                            <p className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">#{rideData.ride.id}</p>
                                            {rideData.ride.createdAt && (
                                                <p className="text-body-xs text-light-on-surface/60 dark:text-dark-on-surface/60 mt-1">
                                                    Booked: {new Date(rideData.ride.createdAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Vehicle Info (for travelers viewing driver's listing) */}
                                    {userRole === 'traveler' && rideData.ride.vehicleType && (
                                        <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                                            <h3 className="text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">Vehicle Information</h3>
                                            <div className="flex items-center gap-2">
                                                <TruckIcon className="h-5 w-5 text-primary" />
                                                <span className="text-body-md text-light-on-surface dark:text-dark-on-surface capitalize">{rideData.ride.vehicleType}</span>
                                            </div>
                                            {rideData.ride.pricePerSeat && (
                                                <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70 mt-2">
                                                    Price per seat: <span className="font-semibold text-primary">PKR {rideData.ride.pricePerSeat}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-start space-x-3"><MapPinIcon className="h-5 w-5 text-primary mt-1 shrink-0" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">From</p><p className="text-body-md text-light-on-surface dark:text-dark-on-surface">{rideData.ride.startLocationText}</p></div></div>
                                        <div className="flex items-start space-x-3"><MapPinIcon className="h-5 w-5 text-error mt-1 shrink-0" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">To</p><p className="text-body-md text-light-on-surface dark:text-dark-on-surface">{rideData.ride.endLocationText}</p></div></div>
                                        
                                        {/* Pickup Notes */}
                                        {rideData.ride.pickupNotes && (
                                            <div className="flex items-start space-x-3 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                                <div className="text-body-sm">
                                                    <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">Pickup Notes:</p>
                                                    <p className="text-light-on-surface/80 dark:text-dark-on-surface/80">{rideData.ride.pickupNotes}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Dropoff Notes */}
                                        {rideData.ride.dropoffNotes && (
                                            <div className="flex items-start space-x-3 bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                                                <div className="text-body-sm">
                                                    <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">Dropoff Notes:</p>
                                                    <p className="text-light-on-surface/80 dark:text-dark-on-surface/80">{rideData.ride.dropoffNotes}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center space-x-3"><CalendarIcon className="h-6 w-6 text-primary" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Departure</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{formatDate(rideData.ride.departureTime)}</p></div></div>
                                        <div className="flex items-center space-x-3"><UserIcon className="h-6 w-6 text-primary" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Seats Booked</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{rideData.ride.seatsBooked}</p></div></div>
                                        <div className="flex items-center space-x-3"><p className="text-body-lg font-bold text-primary">PKR</p><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Total Price</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{rideData.ride.totalPrice}</p></div></div>
                                    </div>
                                </div>

                                {/* Other User Details Card */}
                                {rideData.otherUser && (
                                    <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 space-y-4">
                                        <h2 className="text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4">
                                            Your {userRole === 'traveler' ? 'Driver' : 'Traveler'}
                                        </h2>
                                        
                                        {/* User Profile Section */}
                                        <div className="flex items-start space-x-4">
                                            {rideData.otherUser.mediaUrls && rideData.otherUser.mediaUrls.length > 0 ? (
                                                <OtherAvatarPic imageUrl={rideData.otherUser.mediaUrls[0]} otherUserId={rideData.otherUser.id} />
                                            ) : (
                                                <UserCircleIcon className="h-16 w-16 text-gray-400" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">{rideData.otherUser.username}</p>
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">
                                                        <span className="font-medium">User ID:</span> {rideData.otherUser.id.substring(0, 8)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Contact Information Section */}
                                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                            <h3 className="text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-3">
                                                Contact Information
                                            </h3>
                                            
                                            {/* Phone Number with Call Button */}
                                            {rideData.otherUser.phoneNumber && (
                                                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <PhoneIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                        <div>
                                                            <p className="text-body-xs text-light-on-surface/70 dark:text-dark-on-surface/70">Phone Number</p>
                                                            <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                                                {rideData.otherUser.phoneNumber}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={`tel:${rideData.otherUser.phoneNumber}`}
                                                        className="btn-primary px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 transition-colors duration-200"
                                                    >
                                                        <PhoneIcon className="h-4 w-4" />
                                                        <span className="font-medium">Call</span>
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {/* Email with Email Button */}
                                            {rideData.otherUser.email && (
                                                <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <EnvelopeIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                        <div>
                                                            <p className="text-body-xs text-light-on-surface/70 dark:text-dark-on-surface/70">Email Address</p>
                                                            <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate max-w-[200px]">
                                                                {rideData.otherUser.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={`mailto:${rideData.otherUser.email}`}
                                                        className="btn-primary px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2 transition-colors duration-200"
                                                    >
                                                        <EnvelopeIcon className="h-4 w-4" />
                                                        <span className="font-medium">Email</span>
                                                    </a>
                                                </div>
                                            )}
                                            
                                            {/* If no contact info available */}
                                            {!rideData.otherUser.phoneNumber && !rideData.otherUser.email && (
                                                <p className="text-body-sm text-light-on-surface/50 dark:text-dark-on-surface/50 italic text-center py-2">
                                                    No contact information available
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Link href={rideData.otherUserId ? `/rideSharing/activeRide/map/${rideData.otherUserId}` : '#'} passHref className="flex-1"><button disabled={!rideData.otherUserId} className="btn-outlined w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><MapPinIcon className="h-5 w-5" /><span>Check Location</span></button></Link>
                                        <Link href={rideData.otherUserId ? `/chats/${rideData.otherUserId}` : '#'} passHref className="flex-1"><button disabled={!rideData.otherUserId} className="btn-outlined w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><ChatBubbleLeftRightIcon className="h-5 w-5" /><span>Chat with {userRole === 'traveler' ? 'Driver' : 'Traveler'}</span></button></Link>
                                        {userRole === 'driver' && (
                                            <button onClick={() => handleMarkAsComplete(rideData.ride.id)} className="btn-primary flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-success text-white hover:bg-success/90 transition-colors duration-200 font-medium"><CheckCircleIcon className="h-5 w-5" /><span>Mark as Complete</span></button>
                                        )}
                                        <button onClick={() => { setSelectedRideId(rideData.ride.id); setShowCancelModal(true); }} className="flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 font-medium"><ExclamationTriangleIcon className="h-5 w-5" /><span>Cancel Ride</span></button>
                                    </div>
                                </div>

                                {/* Divider between rides if there are multiple */}
                                {index < activeRides.length - 1 && (
                                    <div className="border-t-4 border-primary/20 my-8"></div>
                                )}
                            </div>
                        ))}

                    </div>
                ) : (
                    // "No Active Ride Found" view
                    <div className="text-center pt-16">
                        <TruckIcon className="mx-auto h-16 w-16 text-primary" />
                        <h1 className="mt-4 text-display-md font-bold text-light-on-background dark:text-dark-on-background">No Active Ride Found</h1>
                        {error && <p className="mt-4 rounded-md bg-red-100 p-3 text-body-sm text-red-700 dark:bg-red-900/50 dark:text-red-300">{error}</p>}
                        <p className="mt-8 text-body-md text-light-on-background/70 dark:text-dark-on-background/70">You can browse for new rides or check your ride listings.</p>
                    </div>
                )}
            </div>

            {/* Cancel Ride Modal */}
            {showCancelModal && selectedRideId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-md bg-white dark:bg-dark-surface p-6 shadow-xl">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mt-1" />
                            <div>
                                <h3 className="text-headline-md font-semibold text-light-on-surface dark:text-dark-on-surface">Confirm Cancellation</h3>
                                <p className="mt-1 text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Cancelling a ride affects trust on the platform. Continuous cancellations may lead to temporary or permanent account restrictions.</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2 text-body-sm text-light-on-surface/80 dark:text-dark-on-surface/80">Tell us why you are cancelling (optional)</label>
                            <textarea
                                className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-dark-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                                rows={4}
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="E.g., emergency, change of plans, incorrect booking, etc."
                            />
                            {cancelError && <p className="mt-2 text-sm text-red-600">{cancelError}</p>}
                        </div>
                        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                            <button onClick={() => { if (!isCancelling) { setShowCancelModal(false); setSelectedRideId(null); setCancelReason(''); setCancelError(null); } }} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-light-on-surface dark:text-dark-on-surface hover:bg-gray-50 dark:hover:bg-gray-800">Keep Ride</button>
                            <button onClick={() => handleCancelRide(selectedRideId)} disabled={isCancelling} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">{isCancelling ? 'Cancelling...' : 'Yes, Cancel Ride'}</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ActiveRidePage;