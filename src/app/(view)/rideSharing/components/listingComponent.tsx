"use client";
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Clock, ArrowRight, X, MessageCircle, Phone } from 'lucide-react';

const ListingComponent = ({ rideListings }) => {
    const [activeTab, setActiveTab] = useState("listings");
    const [selectedListing, setSelectedListing] = useState(null);
    const [isLoading, setIsLoading] = useState(false);





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

    const getPriceDisplay = (priceOrBudget) => {
        if (!priceOrBudget) return "Price not specified";
        if (priceOrBudget.includes("-")) return `$${priceOrBudget}`;
        return `$${priceOrBudget}`;
    };

    const handleBookRide = (listingId) => {
        setIsLoading(true);
    
    };

    const getStatusBadgeStyles = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            default:
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12 bg-light-background dark:bg-dark-background`}>
            <div className="w-full max-w-6xl px-4 md:px-6">
                {/* Tabs */}
                <div className="mb-6 border-b border-light-outline dark:border-dark-outline">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab("listings")}
                            className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "listings"
                                    ? "text-primary"
                                    : "text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface"
                            }`}
                        >
                            Available Rides
                            {activeTab === "listings" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("myRides")}
                            className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${
                                activeTab === "myRides"
                                    ? "text-primary"
                                    : "text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface"
                            }`}
                        >
                            My Rides
                            {activeTab === "myRides" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className={`w-full ${selectedListing ? 'md:w-1/2' : 'md:w-full'} transition-all duration-300`}>
                        <h2 className="text-headline-sm mb-4 text-light-on-surface dark:text-dark-on-surface flex items-center">
                            Available Rides 
                            <span className="ml-2 text-sm font-normal px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {rideListings?.length || 0}
                            </span>
                        </h2>

                        {rideListings && rideListings.length > 0 ? (
                            <div className="space-y-4">
                                {rideListings.map(listing => (
                                    <div
                                        key={listing.id}
                                        className={`card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                            selectedListing?.id === listing.id ? 'border-primary border-2' : 'border border-light-outline dark:border-dark-outline'
                                        } bg-light-surface dark:bg-dark-surface`}
                                        onClick={() => setSelectedListing(listing)}
                                    >
                                        <div className="flex justify-around items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center mb-1">
                                                    <MapPin className="w-4 h-4 text-primary mr-1" />
                                                    <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate mr-2 text-wrap">
                                                        {listing.startLocationText}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 text-primary mr-1" />
                                                    <h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate text-wrap">
                                                        {listing.endLocationText}
                                                    </h3>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeStyles(listing.status)}`}>
                                                {listing.status.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">
                                                {listing.provider?.user?.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                                                    {listing.provider?.user?.name || "Driver"}
                                                </p>
                                                <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                                                    {listing.provider?.vehicleType || "Vehicle"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="divider my-3 border-t border-light-outline dark:border-dark-outline"></div>

                                        <div className="grid grid-cols-2 gap-2 text-body-sm">
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Departure</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{formatDate(listing.departureTime)}</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{formatTime(listing.departureTime)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <ArrowRight className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Distance</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{listing.route_distance_km?.toFixed(1) || "N/A"} km</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Price per seat</p>
                                                    <p className="font-medium text-primary">{getPriceDisplay(listing.pricePerSeat)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant mr-1" />
                                                <div>
                                                    <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats</p>
                                                    <p className="text-light-on-surface dark:text-dark-on-surface">{listing.seatsAvailable} available</p>
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
                                        <Calendar className="w-8 h-8 text-primary" />
                                    </div>
                                </div>
                                <p className="text-body-lg mb-4 text-light-on-surface dark:text-dark-on-surface">No rides available at the moment.</p>
                                <button className="btn-primary py-2 px-4 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors">
                                    Create a Ride Listing
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Details Panel - Only appears when listing is selected */}
                    {selectedListing && (
                        <div className="w-full md:w-1/2 animate-fadeIn">
                            <div className="card p-6 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                                        Ride Details
                                    </h2>
                                    <button 
                                        onClick={() => setSelectedListing(null)}
                                        className="p-1 rounded-full hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
                                        aria-label="Close details"
                                    >
                                        <X className="w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                                    </button>
                                </div>
                                
                                <div className="mb-6">
                                    <div className="flex items-start mb-4">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
                                            <p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedListing.startLocationText}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p>
                                            <p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedListing.endLocationText}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Calendar className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Date</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{formatDate(selectedListing.departureTime)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Clock className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Time</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{formatTime(selectedListing.departureTime)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <DollarSign className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Price per seat</p>
                                        </div>
                                        <p className="text-lg font-medium text-primary">{getPriceDisplay(selectedListing.pricePerSeat)}</p>
                                    </div>
                                    
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                        <div className="flex items-center mb-1">
                                            <Users className="w-4 h-4 text-primary mr-1" />
                                            <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Available seats</p>
                                        </div>
                                        <p className="text-light-on-surface dark:text-dark-on-surface">{selectedListing.seatsAvailable}</p>
                                    </div>
                                </div>
                                
                                <div className="mb-6 p-4 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
                                    <h3 className="text-title-md mb-3 text-light-on-surface dark:text-dark-on-surface">Driver</h3>
                                    <div className="flex items-center">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium text-primary">
                                            {selectedListing.provider?.user?.name?.charAt(0) || "U"}
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-body-lg font-medium text-light-on-surface dark:text-dark-on-surface">
                                                {selectedListing.provider?.user?.name || "Driver"}
                                            </p>
                                            <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                                                {selectedListing.provider?.vehicleType || "Vehicle"}
                                            </p>
                                            <div className="flex items-center mt-1">
                                                <div className="flex items-center mr-3">
                                                    <span className="text-yellow-500">★★★★</span>
                                                    <span className="text-light-outline dark:text-dark-outline">★</span>
                                                    <span className="ml-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">(24)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <button 
                                        className="btn-primary py-3 px-6 rounded-full bg-primary text-white font-medium w-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-70"
                                        onClick={() => handleBookRide(selectedListing.id)}
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
                                            'Book This Ride'
                                        )}
                                    </button>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="btn-outlined py-2 px-4 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface font-medium flex items-center justify-center hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors">
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Message
                                        </button>
                                        <button className="btn-outlined py-2 px-4 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface font-medium flex items-center justify-center hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingComponent;