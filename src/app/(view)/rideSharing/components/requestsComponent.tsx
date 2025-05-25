"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Clock, ArrowRight, X, CheckCircle, AlertCircle } from 'lucide-react';
import { RideListing } from '../../../(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '../../../(model)/rideSharing/RideRequest/rideRequestModel';

const RideRequestComponent = ({ rideRequests} : {rideRequests : RideRequest[]}) => {
    const [activeTab, setActiveTab] = useState("requests");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionStatus, setActionStatus] = useState(null); // 'accepted', 'rejected', null





    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatBudget = (budget) => {
        if (!budget) return "Not specified";
        
        if (typeof budget === 'string' && budget.includes('-')) {
            return `$${budget}`;
        }
        
        const numBudget = parseFloat(budget);
        if (isNaN(numBudget)) return budget;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numBudget);
    };

    const handleAcceptRequest = (requestId) => {
        setIsLoading(true);
        setTimeout(() => {
            console.log(`Accepting request ${requestId}`);
            setIsLoading(false);
            setActionStatus('accepted');
        }, 1500);
    };

    const handleRejectRequest = (requestId) => {
        setIsLoading(true);
        setTimeout(() => {
            console.log(`Rejecting request ${requestId}`);
            setIsLoading(false);
            setActionStatus('rejected');
        }, 1500);
    };

   
    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12 bg-light-background dark:bg-dark-background`}>
            <div className="w-full max-w-6xl px-4 md:px-6">
                {/* Tabs */}
                <div className="mb-6 border-b border-light-outline dark:border-dark-outline">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "requests"
                                    ? "text-primary"
                                    : "text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface"
                            }`}
                        >
                            Ride Requests
                            {activeTab === "requests" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("myOffers")}
                            className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "myOffers"
                                    ? "text-primary"
                                    : "text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface"
                            }`}
                        >
                            My Offers
                            {activeTab === "myOffers" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Requests Panel */}
                    <div className={`w-full ${selectedRequest ? 'md:w-1/2' : 'md:w-full'} transition-all duration-300`}>
                        <h2 className="text-headline-sm mb-4 text-light-on-surface dark:text-dark-on-surface flex items-center">
                            Ride Requests 
                            <span className="ml-2 text-sm font-normal px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {rideRequests?.length || 0}
                            </span>
                        </h2>

                        {rideRequests && rideRequests.length > 0 ? (
                            <div className="space-y-4">
                                {rideRequests.map(request => (
                                    <div
                                        key={request.id}
                                        className={`card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                            selectedRequest?.id === request.id ? 'border-primary border-2' : 'border border-light-outline dark:border-dark-outline'
                                        } bg-light-surface dark:bg-dark-surface`}
                                        onClick={() => setSelectedRequest(request)}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    <MapPin className="w-4 h-4 text-primary mr-1" />
                                                    <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate mr-2 text-wrap">
                                                        {request.startLocationText}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 text-primary mr-1" />
                                                    <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate text-wrap">
                                                        {request.endLocationText}
                                                    </h3>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                                REQUEST
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                                                {request.traveler?.user?.name?.charAt(0) || "T"}
                                            </div>
                                            <div>
                                                <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                                    {request.traveler?.user?.name || "Traveler"}
                                                </p>
                                                <div className="flex items-center">
                                                    <span className="text-yellow-500 text-xs">★★★★★</span>
                                                    <span className="ml-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                                        ({request.traveler?.user?.reviewCount || 0})
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="divider my-3 border-t border-light-outline dark:border-dark-outline"></div>

                                        <div className="grid grid-cols-2 gap-2 text-body-sm">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Requested Date</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{formatDate(request.departureTime)}</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{formatTime(request.departureTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{request.seatsNeeded} needed</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Budget</p>
                                                    <p className="font-medium text-primary">{formatBudget(request.budget)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ArrowRight className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Distance</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{request.distance_to_start_km?.toFixed(1) || "N/A"} km</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card p-8 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface">
                                <div className="mb-4 flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Users className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <p className="text-body-lg mb-4 text-light-on-surface dark:text-dark-on-surface">No ride requests available at the moment.</p>
                                <button className="btn-primary py-2 px-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                                    Create Your Own Listing
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Details Panel - Only appears when request is selected */}
                    {selectedRequest && (
                        <div className="w-full md:w-1/2 animate-fadeIn">
                            <div className="card p-6 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                                        Request Details
                                    </h2>
                                    <button 
                                        onClick={() => setSelectedRequest(null)}
                                        className="p-1 rounded-full hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                                        aria-label="Close details"
                                    >
                                        <X className="w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                                    </button>
                                </div>
                                
                                {/* Status notification for actions */}
                                {actionStatus && (
                                    <div className={`mb-4 p-3 rounded-lg flex items-start ${
                                        actionStatus === 'accepted' 
                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
                                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100'
                                    }`}>
                                        {actionStatus === 'accepted' ? (
                                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className="font-medium">{actionStatus === 'accepted' ? 'Request Accepted' : 'Request Declined'}</p>
                                            <p className="text-sm mt-1">
                                                {actionStatus === 'accepted' 
                                                    ? 'You have accepted this ride request. The traveler will be notified.' 
                                                    : 'You have declined this ride request.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mb-6">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
                                            <p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedRequest.startLocationText}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p>
                                            <p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedRequest.endLocationText}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Calendar className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Requested Date</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{formatDate(selectedRequest.departureTime)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Clock className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Requested Time</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{formatTime(selectedRequest.departureTime)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <DollarSign className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Traveler's Budget</p>
                                        </div>
                                        <p className="text-lg font-medium text-primary">{formatBudget(selectedRequest.budget)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Users className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats Needed</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{selectedRequest.seatsNeeded}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-6 p-4 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                    <h3 className="text-title-md mb-3 text-light-on-surface dark:text-dark-on-surface">Traveler</h3>
                                    <div className="flex items-center">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium text-primary">
                                            {selectedRequest.traveler?.user?.name?.charAt(0) || "T"}
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-body-lg font-medium text-light-on-surface dark:text-dark-on-surface">
                                                {selectedRequest.traveler?.user?.name || "Traveler"}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center mr-3">
                                                    <span className="text-yellow-500">★★★★★</span>
                                                    <span className="ml-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                                        ({selectedRequest.traveler?.user?.reviewCount || 0})
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                                                Request created on {new Date(selectedRequest.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                {!actionStatus && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Offer a ride to this traveler?</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                className="btn-primary py-3 px-6 rounded-full bg-primary text-white font-medium w-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70"
                                                onClick={() => handleAcceptRequest(selectedRequest.id)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    'Place Offer For Traveler'
                                                )}
                                            </button>
                                            <button className='btn-primary py-3 px-6 rounded-full bg-primary text-white font-medium w-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70'>Chat with Traveler</button>
                                         
                                        </div>
                                    </div>
                                )}
                                
                                {actionStatus === 'accepted' && (
                                    <div className="mt-4">
                                        <button className="btn-outlined py-2 px-4 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface font-medium flex items-center justify-center hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors w-full">
                                            Contact Traveler
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RideRequestComponent;