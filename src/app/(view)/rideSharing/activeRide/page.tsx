'use client';
import "reflect-metadata";
import React, { useEffect, useState } from 'react';
import { TruckIcon, MapPinIcon, CheckCircleIcon, CalendarIcon, UserIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSession } from "next-auth/react";
import Link from "next/link";

import { BookingController } from '../../../(controller)/rideSharing/bookingController';
import { ReportController } from '../../../(controller)/report/reportController';
import type { CreateReportData, ReportableType } from '../../../(model)/report/reportModel';
import { container } from '@/app/lib/diContainer';
import { ResponseModel } from '@/Types/types';
import { Booking } from "@/app/(model)/rideSharing/booking/bookingModel";
import ReviewSubmissionModal from '../../components/ReviewSubmissionModal';
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
};

// A structure for the other user's profile details.
type OtherUserDetails = {
    id: string;
    username: string;
    mediaUrls?: string[];
};

const ActiveRidePage = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user?.id;

    const [activeRideDetails, setActiveRideDetails] = useState<NormalizedRideDetails | null>(null);
    const [otherUserDetails, setOtherUserDetails] = useState<OtherUserDetails | null>(null);
    const [userRole, setUserRole] = useState<'driver' | 'traveler' | null>(null);
    const [otherUserId, setOtherUserId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
    const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [rideData, setRideData] = useState<Booking | null>(null);

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
                // Fetch both as before
                const travelerResponse = await bookingController.getBookingsForTraveler(userId);
                let rideData: Booking | null = null;
                let role: 'traveler' | 'driver' | null = null;

                // Find first pending booking for traveler
                if (travelerResponse.success && travelerResponse.data?.length > 0) {
                    const pending = travelerResponse.data.find((b: Booking) => b.status === 'pending');
                    if (pending) {
                        rideData = pending;
                        role = 'traveler';
                    }
                }
                // If not found, check for driver
                if (!rideData) {
                    const driverResponse = await bookingController.getBookingsForDriver(userId);
                    if (driverResponse.success && driverResponse.data?.length > 0) {
                        const pending = driverResponse.data.find((b: Booking) => b.status === 'pending');
                        if (pending) {
                            rideData = pending;
                            role = 'driver';
                        }
                    }
                }

                if (rideData && role) {
                    let normalizedDetails: NormalizedRideDetails | null = null;
                    let otherUser: OtherUserDetails | null = null;

                    if (rideData.bookingSource === 'request' && rideData.request) {
                        normalizedDetails = { id: rideData.id, status: rideData.status, seatsBooked: rideData.seatsBooked, totalPrice: rideData.totalPrice, startLocationText: rideData.request.startLocationText, endLocationText: rideData.request.endLocationText, departureTime: rideData.request.departureTime };
                        setOtherUserId(rideData.travelerId);
                        if (rideData.traveler) otherUser = rideData.traveler;
                    } else if (rideData.listing) {
                        normalizedDetails = { id: rideData.id, status: rideData.status, seatsBooked: rideData.seatsBooked, totalPrice: rideData.totalPrice, startLocationText: rideData.listing.startLocationText, endLocationText: rideData.listing.endLocationText, departureTime: rideData.listing.departureTime };
                        if (role === 'traveler') {
                            setOtherUserId(rideData.listing.providerId);
                            if (rideData.listing.provider) otherUser = rideData.listing.provider;
                        } else {
                            setOtherUserId(rideData.travelerId);
                            if (rideData.traveler) otherUser = rideData.traveler;
                        }
                    }

                    if (normalizedDetails) {
                        setActiveRideDetails(normalizedDetails);
                        setOtherUserDetails(otherUser);
                        setUserRole(role);
                        setRideData(rideData);
                    } else {
                        setError("Could not parse ride details.");
                    }
                } else {
                    setActiveRideDetails(null);
                    setOtherUserDetails(null);
                    setUserRole(null);
                    setRideData(null);
                    setError(null); // No error, just no active ride
                }
            } catch (err) {
                console.error("Error fetching active ride:", err);
                setError("An error occurred while checking for an active ride.");
            } finally {
                setIsLoading(false);
            }
        }

        fetchActiveRide();
    }, [userId, sessionStatus]);


   const handleMarkAsComplete = async () => {
        if (!activeRideDetails) return;
        try {
            const bookingController = container.resolve(BookingController);
            const response = await bookingController.updateBookingStatus(activeRideDetails.id, 'complete');
            if (response.success) {
                window.location.reload();
            } else {
                setError(response.message || "Failed to mark ride as complete.");
            }
        } catch (err) {
            console.error("Error updating booking status:", err);
            setError("An error occurred while completing the ride.");
        }
    };

    const handleReviewSubmit = () => {
        // After review is submitted, mark the ride as complete
        handleMarkAsComplete();
    };

    const handleCancelRide = async () => {
        if (!activeRideDetails || !userId) return;
        setIsCancelling(true);
        setCancelError(null);
        try {
            const bookingController = container.resolve(BookingController);
            const statusResp = await bookingController.updateBookingStatus(activeRideDetails.id, 'cancelled');
            if (!statusResp?.success) {
                throw new Error(statusResp?.message || 'Failed to cancel the ride.');
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
                transportationBookingId: parseInt(activeRideDetails.id.toString())
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

    const getReviewTitle = () => {
        if (!rideData) return '';
        
        if (rideData.listing) {
            return `${rideData.listing.startLocationText} → ${rideData.listing.endLocationText}`;
        } else if (rideData.request) {
            return `${rideData.request.startLocationText} → ${rideData.request.endLocationText}`;
        }
        return 'Transportation Service';
    };

    // --- Helper Functions (formatDate, getStatusColor) ---
    const formatDate = (dateString: string) => !dateString ? "Not specified" : new Date(dateString).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const getStatusColor = (status: string) => { /* ... implementation from previous response ... */ };

    // --- Loading State ---
    if (isLoading || sessionStatus === 'loading') { /* ... implementation from previous response ... */ }

    // --- Main Render ---
    return (
        <main className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 p-4">
            <div className=" pt-8">
                {activeRideDetails ? (
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <TruckIcon className="mx-auto h-16 w-16 text-success mb-4" />
                            <h1 className="text-display-md font-bold text-light-on-background dark:text-dark-on-background">You Have an Active Ride</h1>
                            {userRole && <p className="mt-2 text-headline-sm text-light-on-background/80 dark:text-dark-on-background/80">Your Role: <span className="font-semibold text-primary">{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span></p>}
                        </div>

                        {/* Ride Details Card */}
                        <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">Ride Details</h2>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium ${getStatusColor(activeRideDetails.status)}`}>{activeRideDetails.status.charAt(0).toUpperCase() + activeRideDetails.status.slice(1)}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Booking ID</p>
                                    <p className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">#{activeRideDetails.id}...</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3"><MapPinIcon className="h-5 w-5 text-primary mt-1 shrink-0" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">From</p><p className="text-body-md text-light-on-surface dark:text-dark-on-surface">{activeRideDetails.startLocationText}</p></div></div>
                                <div className="flex items-start space-x-3"><MapPinIcon className="h-5 w-5 text-error mt-1 shrink-0" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">To</p><p className="text-body-md text-light-on-surface dark:text-dark-on-surface">{activeRideDetails.endLocationText}</p></div></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-3"><CalendarIcon className="h-6 w-6 text-primary" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Departure</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{formatDate(activeRideDetails.departureTime)}</p></div></div>
                                <div className="flex items-center space-x-3"><UserIcon className="h-6 w-6 text-primary" /><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Seats Booked</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{activeRideDetails.seatsBooked}</p></div></div>
                                <div className="flex items-center space-x-3"><p className="text-body-lg font-bold text-primary">PKR</p><div><p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Total Price</p><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{activeRideDetails.totalPrice}</p></div></div>
                            </div>
                        </div>

                        {/* Other User Details Card */}
                        {otherUserDetails && (
                            <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                                <h2 className="text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4">
                                    Your {userRole === 'traveler' ? 'Driver' : 'Traveler'}
                                </h2>
                                <div className="flex items-center space-x-4">
                                    {otherUserDetails.mediaUrls && otherUserDetails.mediaUrls.length > 0 ? (
                                        <OtherAvatarPic imageUrl={otherUserDetails.mediaUrls[0]} otherUserId={otherUserDetails.id} />
                                    ) : (
                                        <UserCircleIcon className="h-16 w-16 text-gray-400" />
                                    )}
                                    <div>
                                        <p className="text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">{otherUserDetails.username}</p>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">ID: {otherUserDetails.id}...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href={otherUserId ? `/rideSharing/activeRide/map/${otherUserId}` : '#'} passHref className="flex-1"><button disabled={!otherUserId} className="btn-outlined w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><MapPinIcon className="h-5 w-5" /><span>Check Location</span></button></Link>
                                <Link href={otherUserId ? `/chats/${otherUserId}` : '#'} passHref className="flex-1"><button disabled={!otherUserId} className="btn-outlined w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><ChatBubbleLeftRightIcon className="h-5 w-5" /><span>Chat with {userRole === 'traveler' ? 'Driver' : 'Traveler'}</span></button></Link>
                                {userRole === 'driver' && (
                                    <button onClick={() => setShowReviewModal(true)} className="btn-primary flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-success text-white hover:bg-success/90 transition-colors duration-200 font-medium"><CheckCircleIcon className="h-5 w-5" /><span>Mark as Complete</span></button>
                                )}
                                <button onClick={() => setShowCancelModal(true)} className="flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 font-medium"><ExclamationTriangleIcon className="h-5 w-5" /><span>Cancel Ride</span></button>
                            </div>
                        </div>

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

            {/* Review Submission Modal */}
            {rideData && (
                <ReviewSubmissionModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleReviewSubmit}
                    reviewableType="TRANSPORTATION_BOOKING"
                    reviewableId={parseInt(rideData.id.toString())}
                    title={getReviewTitle()}
                />
            )}
            {/* Cancel Ride Modal */}
            {showCancelModal && (
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
                            <button onClick={() => { if (!isCancelling) { setShowCancelModal(false); setCancelReason(''); setCancelError(null); } }} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-light-on-surface dark:text-dark-on-surface hover:bg-gray-50 dark:hover:bg-gray-800">Keep Ride</button>
                            <button onClick={handleCancelRide} disabled={isCancelling} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">{isCancelling ? 'Cancelling...' : 'Yes, Cancel Ride'}</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default ActiveRidePage;