"use client";

import "reflect-metadata";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  X, 
  MessageCircle, 
  Phone, 
  Star,
  Shield,
  Navigation,
  Heart,
  CheckCircle,
  AlertCircle,
  User,
  Zap,
  RefreshCw,
  Flag,
  Briefcase
} from 'lucide-react';
import { RideRequest } from '../../../(model)/rideSharing/RideRequest/rideRequestModel';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { OfferController } from "@/app/(controller)/rideSharing/offerController";
import { container } from "@/app/lib/diContainer";
import { TransportationOffer } from "@/app/(model)/rideSharing/offer/offerModel";
import ReportRequestButton from '../../components/ReportRequestButton';
import { formatExactTime } from '@/lib/timeUtils';
import { openRouteOnMap } from '@/app/lib/mapUtils';

interface EnhancedRideRequestsProps {
  rideRequests: RideRequest[];
}

const EnhancedRideRequests: React.FC<EnhancedRideRequestsProps> = ({ rideRequests: initialRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allRequests, setAllRequests] = useState(initialRequests || []);
  const [sentOffers, setSentOffers] = useState<TransportationOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const { data: session } = useSession();
  const router = useRouter();
  const userId = (session?.user as any)?.id;

console.log("Initial Requests:", initialRequests);

  useEffect(() => {
    if (selectedRequest) {
      // Only lock scroll on mobile (when lg breakpoint is not active)
      const mediaQuery = window.matchMedia('(max-width: 1023px)');
      
      if (mediaQuery.matches) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedRequest]);

  // Load sent offers from backend
  const loadSentOffers = useCallback(async () => {
    if (!userId) {
      setLoadingOffers(false);
      return;
    }
    
    try {
      const offerController = container.resolve(OfferController);
      const offers = await offerController.getSentOffers(userId);
      setSentOffers(offers);
    } catch (error) {
      console.error("Failed to load sent offers:", error);
      // Don't show alert for initial load failures
    } finally {
      setLoadingOffers(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSentOffers();
  }, [loadSentOffers]);

  // Refresh offers every 30 seconds to check for status updates
  useEffect(() => {
    if (!userId) return;
    
    const interval = setInterval(() => {
      loadSentOffers();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId, loadSentOffers]);

  // Update requests with accepted status based on sent offers
  useEffect(() => {
    const acceptedRequestIds = new Set(
      sentOffers
        .filter(offer => offer.status === 'accepted' && offer.transportationRequestId)
        .map(offer => offer.transportationRequestId!)
    );
    
    const updatedRequests = (initialRequests || []).map(request =>
      acceptedRequestIds.has(request.id)
        ? { ...request, status: 'accepted' as any }
        : request
    );
    setAllRequests(updatedRequests);
  }, [initialRequests, sentOffers]);

  // Filter logic (no search functionality) - optimized with useMemo
  const filteredRequests = useMemo(() => allRequests, [allRequests]);

  const formatDate = useCallback((isoString: string) => {
    if (!isoString) return "TBD";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }, []);

  const formatTime = useCallback((isoString: string) => {
    if (!isoString) return "";
    return formatExactTime(isoString);
  }, []);

  const formatBudget = useCallback((budget: string) => {
    return budget.replace(/[^0-9.]/g, '') ? `$${budget.replace(/[^0-9.]/g, '')}` : 'Flexible';
  }, []);

  const getStatusBadgeStyles = useCallback((status: string) => {
    switch (status) {
      case 'accepted':
        return 'badge badge-success';
      case 'rejected':
        return 'badge badge-error';
      case 'pending':
        return 'badge badge-warning';
      case 'open':
        return 'badge badge-info';
      default:
        return 'badge badge-info';
    }
  }, []);

  const handleAcceptOffer = async (requestToAccept: RideRequest) => {
    if (!userId) {
      alert("Please log in to send an offer.");
      return;
    }

    // Check if user has already sent an offer for this request
    const existingOffer = sentOffers.find(
      offer => offer.transportationRequestId === requestToAccept.id && offer.senderId === userId
    );
    
    if (existingOffer) {
      alert("You have already sent an offer for this request.");
      return;
    }

    // Validate that the request is not from the current user
    if (requestToAccept.travelerId === userId) {
      alert("You cannot send an offer to your own ride request.");
      return;
    }

    setIsLoading(true);
    
    try {
      const offerController = container.resolve(OfferController);
      
      // Extract price from budget string, default to "0" if not a valid number
      const budgetNumeric = requestToAccept.budget.replace(/[^0-9.]/g, '');
      const pricePerSeat = budgetNumeric || "0";
      
      // Create a new offer for this ride request
      const newOffer: Omit<TransportationOffer, 'id' | 'createdAt'> = {
        senderId: userId,
        recipientId: requestToAccept.travelerId,
        pricePerSeat: pricePerSeat,
        seatsRequested: requestToAccept.seatsNeeded,
        message: `I can help you with your ride from ${requestToAccept.startLocationText} to ${requestToAccept.endLocationText}. I have ${requestToAccept.seatsNeeded} seat${requestToAccept.seatsNeeded > 1 ? 's' : ''} available.`,
        status: 'pending',
        transportationListingId: null,
        transportationRequestId: requestToAccept.id
      };
      
      const createdOffer = await offerController.createOffer(newOffer as TransportationOffer);
      
      // Update the sent offers state
      setSentOffers(prev => [...prev, createdOffer]);
      
      alert("Offer sent successfully! The traveler will be notified and can accept or decline your offer.");
    } catch (error: any) {
      console.error("Error creating offer:", error);
      
      // Provide more specific error messages based on the error
      let errorMessage = "There was an error sending your offer. Please try again.";
      
      if (error?.response?.status === 401) {
        errorMessage = "You need to be logged in to send offers.";
      } else if (error?.response?.status === 400) {
        errorMessage = "Invalid offer data. Please check your details and try again.";
      } else if (error?.response?.status === 409) {
        errorMessage = "You have already sent an offer for this request.";
      } else if (error?.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageTraveler = (travelerId: string | undefined) => {
    if (!travelerId) {
      alert("Unable to find traveler information.");
      return;
    }
    if (!userId) {
      alert("Please log in to message the traveler.");
      return;
    }
    router.push(`/chats/${travelerId}`);
  };

  // Enhanced Request Card Component
  const RequestCard = ({ request }: { request: RideRequest }) => {
    const hasOfferForRequest = sentOffers.some(
      offer => offer.transportationRequestId === request.id && offer.senderId === userId
    );
    const offerStatus = sentOffers.find(
      offer => offer.transportationRequestId === request.id && offer.senderId === userId
    )?.status;
    const isSelected = selectedRequest?.id === request.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        onClick={() => setSelectedRequest(request)}
        className={`card group cursor-pointer rounded-large transition-all duration-300 overflow-hidden ${
          isSelected 
            ? 'border-primary shadow-glow-primary scale-[1.02]' 
            : 'hover:border-primary/50 hover:shadow-lg'
        }`}
        style={{
          backgroundColor: 'rgb(var(--surface))',
          borderColor: isSelected ? 'rgb(var(--primary))' : 'rgba(var(--text), 0.1)'
        }}
      >
        {/* Header with Status and Budget */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(hasOfferForRequest ? offerStatus || 'pending' : 'open')}`}>
              <div className={`w-2 h-2 rounded-full ${
                hasOfferForRequest 
                  ? offerStatus === 'accepted' 
                    ? 'bg-success' 
                    : offerStatus === 'rejected'
                    ? 'bg-error'
                    : 'bg-warning animate-pulse'
                  : 'bg-primary animate-pulse'
              }`}></div>
              <span>
                {hasOfferForRequest 
                  ? offerStatus === 'accepted' 
                    ? 'OFFER ACCEPTED' 
                    : offerStatus === 'rejected'
                    ? 'OFFER REJECTED'
                    : 'OFFER PENDING'
                  : 'OPEN REQUEST'
                }
              </span>
            </div>
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="btn-outlined p-2 rounded-full"
                style={{
                  backgroundColor: 'rgba(var(--surface), 0.8)',
                  color: 'rgba(var(--text), 0.6)'
                }}
              >
                <Heart size={16} />
              </motion.button>
              <ReportRequestButton
                requestId={request.id.toString()}
                requestTitle={`ride request from ${request.startLocationText} to ${request.endLocationText}`}
                currentUserId={userId}
                className="p-2 rounded-full opacity-80 hover:opacity-100"
              />
            </div>
          </div>

          {/* Route with Enhanced Design */}
          <div 
            className="space-y-3 mb-4 cursor-pointer group/route hover:bg-secondary/5 dark:hover:bg-secondary/10 rounded-lg p-2 -m-2 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              openRouteOnMap({
                startLocationText: request.startLocationText,
                endLocationText: request.endLocationText,
                startLocationLat: request.startLocationLat,
                startLocationLng: request.startLocationLng,
                endLocationLat: request.endLocationLat,
                endLocationLng: request.endLocationLng
              });
            }}
            title="Click to view route on Google Maps"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-secondary rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-secondary transition-colors">
                  {request.startLocationText}
                </p>
              </div>
              <MapPin size={14} className="text-secondary opacity-0 group-hover/route:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-px h-8 bg-secondary ml-1.5"></div>
              <div className="flex-1 flex items-center space-x-2 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Navigation size={12} />
                <span>{request.distance_km} km journey</span>
                <span>•</span>
                <span>{Math.ceil(request.distance_km / 60)} hr</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-warning rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-secondary transition-colors">
                  {request.endLocationText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Traveler Info Section */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-secondary" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                  { request.user?.username || 'Traveler'}
                </p>
                <div className="flex items-center space-x-2">
                  <Shield size={12} className="text-success" />
                  <span className="text-xs text-success">Verified</span>
                  <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    • Needs {request.seatsNeeded} seats
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatBudget(request.budget)}
              </div>
              <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                budget
              </p>
            </div>
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 px-6 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Calendar size={14} />
                <span>{formatDate(request.departureTime)}</span>
              </div>
              <div className="flex items-center space-x-1 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Clock size={14} />
                <span>{formatTime(request.departureTime)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs bg-light-surface dark:bg-dark-surface px-2 py-1 rounded-lg">
                <Zap size={12} className="text-primary" />
                <span className="text-light-on-surface dark:text-dark-on-surface">
                  {hasOfferForRequest 
                    ? offerStatus === 'accepted' 
                      ? 'Offer Accepted' 
                      : offerStatus === 'rejected'
                      ? 'Offer Rejected'
                      : 'Offer Sent'
                    : 'Help Needed'
                  }
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-primary rounded-full"
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
      <div className={`flex-1 lg:max-w-2xl ${selectedRequest ? 'hidden lg:block' : ''}`}>
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-headline-md font-semibold text-light-on-surface dark:text-dark-on-surface">
            Available Ride Requests
          </h2>
          <button
            onClick={() => loadSentOffers()}
            disabled={loadingOffers}
            className="btn-outlined p-2 rounded-full transition-all hover:bg-primary/10 disabled:opacity-50"
            title="Refresh offers"
          >
            <RefreshCw 
              size={20} 
              className={`text-primary ${loadingOffers ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>
        
        {/* Loading state for offers */}
        {loadingOffers && sentOffers.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Loading offers...
            </span>
          </div>
        )}
        
        {/* Requests Grid */}
        {(!loadingOffers || sentOffers.length > 0) && (
          <div className="space-y-4 overflow-y-auto max-h-full pr-2 scrollbar-hide">
            <AnimatePresence>
            {filteredRequests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                     style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                  <User className="w-8 h-8" style={{ color: 'rgba(var(--text), 0.6)' }} />
                </div>
                <h3 className="text-headline-sm font-semibold mb-2" style={{ color: 'rgb(var(--text))' }}>
                  No Requests Available
                </h3>
                <p style={{ color: 'rgba(var(--text), 0.7)' }}>
                  Check back later for new ride requests from travelers.
                </p>
              </motion.div>
            ) : (
              filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RequestCard request={request} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
          </div>
        )}
      </div>

      {/* Right Side - Details Panel */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed inset-0 bg-white dark:bg-gray-900 z-50 lg:static lg:bg-transparent dark:lg:bg-transparent lg:z-auto lg:w-1/2 overflow-y-auto"
          >
            <div className="h-full lg:card lg:rounded-large lg:shadow-xl lg:overflow-hidden lg:h-fit"
                 style={{ backgroundColor: 'rgb(var(--surface))' }}>
              {/* Header */}
              <div className="p-4 lg:p-6 text-white sticky top-0 z-10" style={{ backgroundColor: 'rgb(var(--primary))' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedRequest(null)} 
                      className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg lg:text-headline-lg font-bold">Request Details</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(null)} 
                    className="hidden lg:block btn-text p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Route */}
                <div 
                  className="space-y-4 cursor-pointer hover:bg-secondary/5 dark:hover:bg-secondary/10 rounded-lg p-3 -m-3 transition-all duration-200 group/route-detail"
                  onClick={() => {
                    if (selectedRequest) {
                      openRouteOnMap({
                        startLocationText: selectedRequest.startLocationText,
                        endLocationText: selectedRequest.endLocationText,
                        startLocationLat: selectedRequest.startLocationLat,
                        startLocationLng: selectedRequest.startLocationLng,
                        endLocationLat: selectedRequest.endLocationLat,
                        endLocationLng: selectedRequest.endLocationLng
                      });
                    }
                  }}
                  title="Click to view route on Google Maps"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center">
                      <Navigation className="w-5 h-5 mr-2 text-secondary" />
                      Route Details
                    </h3>
                    <div className="text-xs text-secondary opacity-0 group-hover/route-detail:opacity-100 transition-opacity bg-secondary/10 px-2 py-1 rounded-full">
                      View on Map
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-secondary/10 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Pickup Location</p>
                      <p className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-secondary transition-colors">
                        {selectedRequest?.startLocationText}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-warning/10 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Destination</p>
                      <p className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-secondary transition-colors">
                        {selectedRequest?.endLocationText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Date</p>
                    </div>
                    <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                      {formatDate(selectedRequest?.departureTime)}
                    </p>
                  </div>
                  <div className="bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Time</p>
                    </div>
                    <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                      {formatTime(selectedRequest?.departureTime)}
                    </p>
                  </div>
                  <div className="bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Budget</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatBudget(selectedRequest?.budget)}
                    </p>
                  </div>
                  <div className="bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats Needed</p>
                    </div>
                    <p className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                      {selectedRequest?.seatsNeeded}
                    </p>
                  </div>
                  <div className="bg-light-surface-variant/50 dark:bg-dark-surface-variant/50 p-4 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Briefcase className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Luggage</p>
                    </div>
                    <p className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                      {selectedRequest?.luggage || 0} bags
                    </p>
                  </div>
                </div>

                {/* Traveler Section */}
                <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Traveler Information
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-secondary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface">
                        { selectedRequest?.user?.username || 'Traveler'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield size={16} className="text-success" />
                        <span className="text-sm text-success">Verified Account</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4">
                    <h4 className="font-medium text-light-on-surface dark:text-dark-on-surface mb-2">Trip Requirements</h4>
                    <ul className="space-y-1 text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      <li>• {selectedRequest?.seatsNeeded} passenger{(selectedRequest?.seatsNeeded || 0) > 1 ? 's' : ''}</li>
                      <li>• Budget: {formatBudget(selectedRequest.budget)}</li>
                      
                      <li>• Non-smoking preferred</li>
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleAcceptOffer(selectedRequest)}
                    disabled={isLoading || sentOffers.some(offer => offer.transportationRequestId === selectedRequest.id && offer.senderId === userId)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Sending Offer...
                      </>
                    ) : (() => {
                      const existingOffer = sentOffers.find(offer => 
                        offer.transportationRequestId === selectedRequest.id && offer.senderId === userId
                      );
                      
                      if (existingOffer) {
                        switch (existingOffer.status) {
                          case 'accepted':
                            return (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Offer Accepted
                              </>
                            );
                          case 'rejected':
                            return (
                              <>
                                <X className="w-5 h-5 mr-2" />
                                Offer Rejected
                              </>
                            );
                          case 'pending':
                            return (
                              <>
                                <Clock className="w-5 h-5 mr-2" />
                                Offer Pending
                              </>
                            );
                          default:
                            return (
                              <>
                                <AlertCircle className="w-5 h-5 mr-2" />
                                Offer Sent
                              </>
                            );
                        }
                      }
                      
                      return (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Send Transportation Offer
                        </>
                      );
                    })()}
                  </motion.button>
                  
                  {/* Report Button */}
                  <div className="flex justify-center">
                    <ReportRequestButton
                      requestId={selectedRequest.id.toString()}
                      requestTitle={`ride request from ${selectedRequest.startLocationText} to ${selectedRequest.endLocationText}`}
                      currentUserId={userId}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-outlined flex items-center justify-center space-x-2 py-3 rounded-button transition-all duration-200"
                      onClick={() => handleMessageTraveler(selectedRequest?.travelerId)}
                    >
                      <MessageCircle size={18} />
                      <span>Message</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-outlined flex items-center justify-center space-x-2 py-3 rounded-button transition-all duration-200"
                      style={{
                        borderColor: 'rgb(var(--success))',
                        color: 'rgb(var(--success))'
                      }}
                    >
                      <Phone size={18} />
                      <span>Call</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedRideRequests;