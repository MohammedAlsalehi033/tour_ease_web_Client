'use client';
import "reflect-metadata";
import React, { useEffect, useState } from 'react';
import { TruckIcon, MapPinIcon, CheckCircleIcon, CalendarIcon, UserIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { useSession } from "next-auth/react";
import Link from "next/link";

import { BookingController } from '../../../(controller)/rideSharing/bookingController';
import { container } from '@/app/lib/diContainer';
import { ResponseModel } from '@/Types/types';
import { Booking } from "@/app/(model)/rideSharing/booking/bookingModel";
import ReviewSubmissionModal from '../../components/ReviewSubmissionModal';

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
                const travelerResponse = await bookingController.getBookingsForTraveler(userId);

                let rideData: Booking | null = null;
                let role: 'traveler' | 'driver' | null = null;

                if (travelerResponse.success && travelerResponse.data?.length > 0) {
                    rideData = travelerResponse.data[0];
                    role = 'traveler';
                } else {
                    const driverResponse = await bookingController.getBookingsForDriver(userId);
                    if (driverResponse.success && driverResponse.data?.length > 0) {
                        rideData = driverResponse.data[0];
                        role = 'driver';
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
                    setError("No active ride found.");
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
            <div className="max-w-4xl mx-auto pt-8">
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
                                        <img src={otherUserDetails.mediaUrls[0]} alt="Profile" className="h-16 w-16 rounded-full object-cover" />
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
                                <button disabled={!otherUserId} className="btn-outlined flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"><ChatBubbleLeftRightIcon className="h-5 w-5" /><span>Chat with {userRole === 'traveler' ? 'Driver' : 'Traveler'}</span></button>
                                <button onClick={() => setShowReviewModal(true)} className="btn-primary flex-1 w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-success text-white hover:bg-success/90 transition-colors duration-200 font-medium"><CheckCircleIcon className="h-5 w-5" /><span>Mark as Complete</span></button>
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
        </main>
    );
};

export default ActiveRidePage;