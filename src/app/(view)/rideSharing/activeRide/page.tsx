'use client';
import "reflect-metadata";
import React, { useEffect, useState } from 'react';
import { TruckIcon, MapPinIcon, CheckCircleIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/solid';
import { useSession } from "next-auth/react";

import { BookingController } from '../../../(controller)/rideSharing/bookingController';
import { container } from '@/app/lib/diContainer';
import { ResponseModel } from '@/Types/types';
import { Booking } from "@/app/(model)/rideSharing/booking/bookingModel";
import Link from "next/link";
import { RideListing } from '../../../(model)/rideSharing/RideListting/rideListtingModel';

const ActiveRidePage = () => {
    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user?.id;
const [otherUserId, setOtherUserId] = useState<string | null>(null);    const [activeRideDetails, setActiveRideDetails] = useState<Booking[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchActiveRide() {
            if (!userId) {
                if (sessionStatus === 'loading') {
                    setIsLoading(true);
                    return;
                }
                setIsLoading(false);
                setError("User not identified. Cannot fetch active ride.");
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const bookingController = container.resolve(BookingController);
                const response: ResponseModel<Booking[]> = await bookingController.getBookingsForTraveler(userId as string);
                const response2: ResponseModel<Booking[]> = await bookingController.getBookingsForDriver(userId as string);

                console.log('Active Ride Respfgufgufhjonse:', response2);

const providerId = response.data[0]?.listing?.providerId;
setOtherUserId(providerId || null); // Set the ID or null if not found
                

                if (response.success && response.data) {
                    setActiveRideDetails(response.data.length > 0 ? response.data : null);
                     if (!(response.data.length > 0)) {
                        setError("No active ride found.");
                    }
                } else {
                    setActiveRideDetails(null);
                    setError(response.message || "Could not find an active ride.");
                }
            } catch (err) {
                setError("An error occurred while checking for an active ride.");
                setActiveRideDetails(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchActiveRide();
    }, [userId, sessionStatus]);

    const handleMarkAsComplete = () => {
                        const bookingController = container.resolve(BookingController);
                        const response = bookingController.updateBookingStatus(activeRideDetails[0].id, 'completed');
        if (response.success) {
            setActiveRideDetails(null);
            setError(null);
            console.log('Ride marked as complete successfully.');
        window.location.reload(); // Reload the page to reflect changes
        }


    };

    const handleCheckLocation = () => {
        // No logic for now - as requested
        console.log('Check location clicked');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'text-warning bg-yellow-50';
            case 'accepted': return 'text-success bg-green-50';
            case 'active': return 'text-info bg-blue-50';
            case 'completed': return 'text-success bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (sessionStatus === 'loading') {
        return (
            <main className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-headline-md text-light-on-background dark:text-dark-on-background">Loading session...</p>
                </div>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 flex items-center justify-center p-4">
                <div className="text-center">
                    <TruckIcon className="mx-auto h-16 w-16 text-primary animate-pulse" />
                    <p className="mt-4 text-headline-md text-light-on-background dark:text-dark-on-background">Checking for active ride...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 p-4">
            <div className="max-w-4xl mx-auto pt-8">
                {activeRideDetails && activeRideDetails.length > 0 ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <TruckIcon className="mx-auto h-16 w-16 text-success mb-4" />
                            <h1 className="text-display-md font-bold text-light-on-background dark:text-dark-on-background">
                                You Have an Active Ride
                            </h1>
                            {userId && (
                                <p className="mt-2 text-body-sm text-light-on-background/70 dark:text-dark-on-background/70">
                                    For User ID: {userId}
                                    other user ID: {otherUserId}
                                </p>
                            )}
                        </div>

                        {/* Ride Details Card */}
                        <div className="card bg-light-surface dark:bg-dark-surface rounded-lg shadow-lg p-6 space-y-6">
                            {/* Status Badge */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
                                        Ride Details
                                    </h2>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-body-sm font-medium ${getStatusColor(activeRideDetails[0].status)}`}>
                                        {activeRideDetails[0].status.charAt(0).toUpperCase() + activeRideDetails[0].status.slice(1)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Booking ID</p>
                                    <p className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                                        #{activeRideDetails[0].id}
                                    </p>
                                </div>
                            </div>

                            {/* Route Information */}
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <MapPinIcon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">From</p>
                                        <p className="text-body-md text-light-on-surface dark:text-dark-on-surface">
                                            {activeRideDetails[0].listing?.startLocationText}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start space-x-3">
                                    <MapPinIcon className="h-5 w-5 text-error mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">To</p>
                                        <p className="text-body-md text-light-on-surface dark:text-dark-on-surface">
                                            {activeRideDetails[0].listing?.endLocationText}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Departure</p>
                                        <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                            {formatDate(activeRideDetails[0].listing?.departureTime)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <UserIcon className="h-5 w-5 text-primary" />
                                    <div>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Seats Booked</p>
                                        <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                            {activeRideDetails[0].seatsBooked}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                    <div>
                                        <p className="text-body-sm text-light-on-surface/70 dark:text-dark-on-surface/70">Total Price</p>
                                        <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                            PKR {activeRideDetails[0].totalPrice}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button 
                                        onClick={handleCheckLocation}
                                        className="btn-outlined flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium"
                                    >
                                        <MapPinIcon className="h-5 w-5" />
                                        <Link href={`/rideSharing/activeRide/map/${otherUserId}`}>Check Location</Link>
                                    </button>
                                    <button 
                                        onClick={handleCheckLocation}
                                        className="btn-outlined flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium"
                                    >
                                        <MapPinIcon className="h-5 w-5" />
                                        <span>Chat with Driver</span>
                                    </button>
                                    
                                    <button 
                                        onClick={handleMarkAsComplete}
                                        className="btn-primary flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-success text-white hover:bg-success/90 transition-colors duration-200 font-medium"
                                    >
                                        <CheckCircleIcon className="h-5 w-5" />
                                        <span>Mark as Complete</span>
                                    </button>
                                    
                                </div>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="text-center">
                            <p className="text-body-md text-light-on-background/70 dark:text-dark-on-background/70">
                                Please manage or complete your current trip before starting a new one.
                            </p>
                        </div>

            
                    </div>
                ) : (
                    <div className="text-center">
                        <TruckIcon className="mx-auto h-16 w-16 text-primary" />
                        <h1 className="mt-4 text-display-md font-bold text-light-on-background dark:text-dark-on-background">
                            No Active Ride Found
                        </h1>
                        {error && (
                            <p className="mt-4 rounded-md bg-red-100 p-3 text-body-sm text-red-700">{error}</p>
                        )}
                        {!error && (
                            <p className="mt-4 text-body-md text-light-on-background/70 dark:text-dark-on-background/70">
                                You currently do not have any active rides.
                            </p>
                        )}
                        <p className="mt-8 text-body-md text-light-on-background/70 dark:text-dark-on-background/70">
                            Feel free to browse and book a new ride!
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ActiveRidePage;