"use client";
import "reflect-metadata";
import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, DollarSign, Clock, ArrowRight, X, CheckCircle, AlertCircle, Phone, MessageCircle } from 'lucide-react';
import { RideRequest } from '../../../(model)/rideSharing/RideRequest/rideRequestModel';
import { useSession } from 'next-auth/react';
import { OfferController } from "@/app/(controller)/rideSharing/offerController";
import { container } from "@/app/lib/diContainer";
import { TransportationOffer } from "@/app/(model)/rideSharing/offer/offerModel";

const RideRequestComponent = ({ rideRequests: initialRequests }) => {
    const [activeTab, setActiveTab] = useState("requests");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [allRequests, setAllRequests] = useState(initialRequests || []);
    const [myAcceptedOffers, setMyAcceptedOffers] = useState([]);

    const { data: session } = useSession();
    const userId = session?.user?.id;

    // Load accepted offers from localStorage on initial render
    useEffect(() => {
        try {
            const storedOffers = JSON.parse(localStorage.getItem('myAcceptedOffers') || '[]');
            if (Array.isArray(storedOffers)) {
                setMyAcceptedOffers(storedOffers);
            }
        } catch (error) {
            console.error("Failed to parse myAcceptedOffers from localStorage", error);
        }
    }, []);

    // Update the main request list with correct statuses
    useEffect(() => {
        const acceptedRequestIds = new Set(myAcceptedOffers.map(r => r.id));
        const updatedRequests = (initialRequests || []).map(request =>
            acceptedRequestIds.has(request.id)
                ? { ...request, status: 'accepted' }
                : request
        );
        setAllRequests(updatedRequests);
    }, [initialRequests, myAcceptedOffers]);


    const formatDate = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (isoString) => {
        if (!isoString) return "N/A";
        const date = new Date(isoString);
        return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    };

    const formatBudget = (budget) => {
        if (!budget) return "Not specified";
        if (typeof budget === 'string' && budget.includes('-')) return `$${budget}`;
        const numBudget = parseFloat(budget);
        if (isNaN(numBudget)) return budget;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numBudget);
    };

    const handleAcceptRequest = (requestToAccept) => {
        if (!userId) {
            alert("You must be logged in to accept a request.");
            return;
        }
        setIsLoading(true);
        const offerController = container.resolve(OfferController);

        // This would be the driver's offer to the traveler
        const offer = {
            id: 0, // Backend will generate
            senderId: userId, // The driver is the sender
            recipientId: requestToAccept.travelerId, // The traveler is the recipient
            pricePerSeat: parseFloat(requestToAccept.budget) || 0, // Offer the traveler's budget price
            seatsRequested: requestToAccept.seatsNeeded,
            transportationRequestId: requestToAccept.id, // Link to the original request
            message: "I can fulfill your ride request.",
            status: 'accepted', // Driver accepts
            createdAt: new Date().toISOString(),
        };

        
        console.log("Creating offer:", offer);
        const response = offerController.createOffer(offer)
        setTimeout(() => {
             const newAcceptedOffers = [...myAcceptedOffers, requestToAccept];
             setMyAcceptedOffers(newAcceptedOffers);
             localStorage.setItem('myAcceptedOffers', JSON.stringify(newAcceptedOffers));
             
             setIsLoading(false);
             setSelectedRequest(null);
             alert("You have accepted the ride request! The traveler will be notified.");
        }, 1500);
    };

    const getStatusBadgeStyles = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
            case 'pending':
                 return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
        }
    };
    
    const renderRequestList = (requests) => {
        if (!requests || requests.length === 0) {
            return (
                 <div className="card p-8 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface">
                    <div className="mb-4 flex justify-center"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Users className="w-8 h-8 text-primary" /></div></div>
                    <p className="text-body-lg mb-4 text-light-on-surface dark:text-dark-on-surface">No ride requests here.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {requests.map(request => (
                    <div key={request.id} className={`card p-4 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedRequest?.id === request.id ? 'border-primary border-2' : 'border border-light-outline dark:border-dark-outline'} bg-light-surface dark:bg-dark-surface`} onClick={() => setSelectedRequest(request)}>
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1"><MapPin className="w-4 h-4 text-primary mr-2 flex-shrink-0" /><h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate">{request.startLocationText}</h3></div>
                                <div className="flex items-center"><MapPin className="w-4 h-4 text-primary mr-2 flex-shrink-0" /><h3 className="text-title-md font-medium text-light-on-surface dark:text-dark-on-surface truncate">{request.endLocationText}</h3></div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusBadgeStyles(request.status)}`}>
                                {request.status?.toUpperCase() || 'REQUEST'}
                            </span>
                        </div>
                        <div className="divider my-3 border-t border-light-outline dark:border-dark-outline"></div>
                        <div className="flex items-center justify-between text-body-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium">{request.traveler?.user?.name?.charAt(0) || "T"}</div>
                                <div><p className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">{request.traveler?.user?.name || "Traveler"}</p><div className="flex items-center"><span className="text-yellow-500 text-xs">★★★★★</span><span className="ml-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">({request.traveler?.user?.reviewCount || 0})</span></div></div>
                            </div>
                            <div className="text-right">
                                <p className="font-medium text-lg text-primary">{formatBudget(request.budget)}</p>
                                <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">budget</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
            <div className={`min-h-screen transition-colors duration-300 flex flex-col items-center justify-start bg-light-background dark:bg-dark-background`}>
            <div className="w-full">
                <div className="mb-6 border-b border-light-outline dark:border-dark-outline">
                    <div className="flex space-x-1">
                        <button onClick={() => setActiveTab("requests")} className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${activeTab === "requests" ? "text-primary" : "text-light-on-surface-variant dark:text-dark-on-surface-variant"}`}>
                            Ride Requests
                            {activeTab === "requests" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
                        </button>
                        <button onClick={() => setActiveTab("myOffers")} className={`py-3 px-4 text-sm font-medium transition-colors duration-200 relative ${activeTab === "myOffers" ? "text-primary" : "text-light-on-surface-variant dark:text-dark-on-surface-variant"}`}>
                            My Accepted Offers
                            {activeTab === "myOffers" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></span>}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className={`w-full ${selectedRequest ? 'md:w-1/2' : 'md:w-full'} transition-all duration-300`}>
                        <h2 className="text-headline-sm mb-4 text-light-on-surface dark:text-dark-on-surface flex items-center">
                            {activeTab === 'requests' ? 'Ride Requests' : 'My Accepted Offers'}
                            <span className="ml-2 text-sm font-normal px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                {activeTab === 'requests' ? allRequests.filter(r => r.status !== 'accepted').length : myAcceptedOffers.length}
                            </span>
                        </h2>
                        {activeTab === 'requests' ? renderRequestList(allRequests.filter(r => r.status !== 'accepted')) : renderRequestList(myAcceptedOffers)}
                    </div>

                    {selectedRequest && (
                        <div className="w-full md:w-1/2 animate-fadeIn">
                            <div className="card p-6 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface dark:bg-dark-surface sticky top-24">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-headline-sm text-light-on-surface dark:text-dark-on-surface">Request Details</h2>
                                    <button onClick={() => setSelectedRequest(null)} className="p-1 rounded-full hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant" aria-label="Close details"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="mb-6">
                                    <div className="flex items-start mb-4"><div className="bg-primary/10 p-2 rounded-full mr-3"><MapPin className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p><p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedRequest.startLocationText}</p></div></div>
                                    <div className="flex items-start"><div className="bg-primary/10 p-2 rounded-full mr-3"><MapPin className="w-5 h-5 text-primary" /></div><div><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p><p className="text-lg font-medium text-light-on-surface dark:text-dark-on-surface">{selectedRequest.endLocationText}</p></div></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"><div className="flex items-center mb-1"><Calendar className="w-4 h-4 text-primary mr-1" /><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Date</p></div><p>{formatDate(selectedRequest.departureTime)}</p></div>
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"><div className="flex items-center mb-1"><Clock className="w-4 h-4 text-primary mr-1" /><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Time</p></div><p>{formatTime(selectedRequest.departureTime)}</p></div>
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"><div className="flex items-center mb-1"><DollarSign className="w-4 h-4 text-primary mr-1" /><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Budget</p></div><p className="text-lg font-medium text-primary">{formatBudget(selectedRequest.budget)}</p></div>
                                    <div className="p-3 rounded-lg bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"><div className="flex items-center mb-1"><Users className="w-4 h-4 text-primary mr-1" /><p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats</p></div><p>{selectedRequest.seatsNeeded}</p></div>
                                </div>
                                <div className="space-y-3">
                                    <button className="btn-primary py-3 px-6 rounded-full bg-green-500 text-white font-medium w-full flex items-center justify-center hover:bg-green-600 transition-colors disabled:opacity-70" onClick={() => handleAcceptRequest(selectedRequest)} disabled={isLoading || myAcceptedOffers.some(r => r.id === selectedRequest.id)}>
                                        {isLoading ? 'Processing...' : (myAcceptedOffers.some(r => r.id === selectedRequest.id) ? 'Offer Sent' : 'Accept & Offer Ride')}
                                    </button>
                                     <button className="btn-outlined py-2 px-4 rounded-full border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface font-medium flex items-center justify-center w-full"><MessageCircle className="w-4 h-4 mr-2" />Chat with Traveler</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RideRequestComponent;
