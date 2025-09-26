"use client";

import "reflect-metadata";
import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';
import { RideRequest } from '../../../(model)/rideSharing/RideRequest/rideRequestModel';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { OfferController } from "@/app/(controller)/rideSharing/offerController";
import { container } from "@/app/lib/diContainer";
import { TransportationOffer } from "@/app/(model)/rideSharing/offer/offerModel";

interface EnhancedRideRequestsProps {
  rideRequests: RideRequest[];
}

const EnhancedRideRequests: React.FC<EnhancedRideRequestsProps> = ({ rideRequests: initialRequests }) => {
  const [selectedRequest, setSelectedRequest] = useState<RideRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allRequests, setAllRequests] = useState(initialRequests || []);
  const [myAcceptedOffers, setMyAcceptedOffers] = useState<RideRequest[]>([]);

  const { data: session } = useSession();
  const router = useRouter();
  const userId = (session?.user as any)?.id;

  // Body scroll lock for mobile detail view
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

  // Load accepted offers from localStorage
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

  // Update requests with accepted status
  useEffect(() => {
    const acceptedRequestIds = new Set(myAcceptedOffers.map(r => r.id));
    const updatedRequests = (initialRequests || []).map(request =>
      acceptedRequestIds.has(request.id)
        ? { ...request, status: 'accepted' as any }
        : request
    );
    setAllRequests(updatedRequests);
  }, [initialRequests, myAcceptedOffers]);

  // Filter logic (no search functionality)
  const filteredRequests = allRequests;

  const formatDate = (isoString: string) => {
    if (!isoString) return "TBD";
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatBudget = (budget: string) => {
    return budget.replace(/[^0-9.]/g, '') ? `$${budget.replace(/[^0-9.]/g, '')}` : 'Flexible';
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      default:
        return 'badge badge-info';
    }
  };

  const handleAcceptOffer = async (requestToAccept: RideRequest) => {
    if (!userId) {
      alert("Please log in to accept this offer.");
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual offer acceptance logic
      const newAcceptedOffers = [...myAcceptedOffers, requestToAccept];
      setMyAcceptedOffers(newAcceptedOffers);
      localStorage.setItem('myAcceptedOffers', JSON.stringify(newAcceptedOffers));
      
      setIsLoading(false);
      alert("Offer accepted successfully!");
    } catch (error) {
      console.error("Error accepting offer:", error);
      setIsLoading(false);
      alert("There was an error accepting the offer. Please try again.");
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
    const isAccepted = myAcceptedOffers.some(offer => offer.id === request.id);
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
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(isAccepted ? 'accepted' : 'open')}`}>
              <div className={`w-2 h-2 rounded-full ${isAccepted ? 'bg-success' : 'bg-primary animate-pulse'}`}></div>
              <span>{isAccepted ? 'ACCEPTED' : 'OPEN REQUEST'}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="btn-outlined p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all"
              style={{
                backgroundColor: 'rgba(var(--surface), 0.8)',
                color: 'rgba(var(--text), 0.6)'
              }}
            >
              <Heart size={16} />
            </motion.button>
          </div>

          {/* Route with Enhanced Design */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-secondary rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {request.startLocationText}
                </p>
              </div>
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
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
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
                  Traveler
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
                  {isAccepted ? 'Accepted' : 'Help Needed'}
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
        {/* Requests Grid */}
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
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-secondary/10 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">Pickup Location</p>
                      <p className="text-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
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
                      <p className="text-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
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
                        Anonymous Traveler
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
                      <li>• Flexible with timing</li>
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
                    disabled={isLoading || myAcceptedOffers.some(offer => offer.id === selectedRequest.id)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : myAcceptedOffers.some(offer => offer.id === selectedRequest.id) ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Offer Accepted
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Accept This Request
                      </>
                    )}
                  </motion.button>
                  
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