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
  ArrowRight, 
  X, 
  MessageCircle, 
  Phone, 
  Star,
  Shield,
  Car,
  Navigation,
  Heart,
  Share2,
  Filter
} from 'lucide-react';
import { RideListing } from '../../../(model)/rideSharing/RideListting/rideListtingModel';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { OfferController } from "@/app/(controller)/rideSharing/offerController";
import { container } from "@/app/lib/diContainer";
import { TransportationOffer } from "@/app/(model)/rideSharing/offer/offerModel";
import ReportListingButton from '../../components/ReportListingButton';
import RatingDisplay from '../../components/RatingDisplay';
import { useReviewStatsOptimized, preloadReviewStats } from '../../components/useReviewStatsOptimized';
import DriverReviewsCompactOptimized from '../../components/DriverReviewsCompactOptimized';
import OtherAvatarPic from '../../components/otherAvatarPic';
import { openRouteOnMap } from '@/app/lib/mapUtils';

interface EnhancedRideListingsProps {
  rideListings: RideListing[];
}

const EnhancedRideListings: React.FC<EnhancedRideListingsProps> = ({ rideListings: initialListings }) => {
  const [selectedListing, setSelectedListing] = useState<RideListing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending'>('all');
  const [allListings, setAllListings] = useState(initialListings || []);
  const [myRides, setMyRides] = useState<RideListing[]>([]);
  const [reviewsPreloaded, setReviewsPreloaded] = useState(false);

console.log(allListings);
  const { data: session } = useSession();
  const router = useRouter();
  const userId = (session?.user as any)?.id;

  // Body scroll lock for mobile detail view
  useEffect(() => {
    if (selectedListing) {
      // Only lock scroll on mobile (when lg breakpoint is not active)
      const mediaQuery = window.matchMedia('(max-width: 1023px)');
      
      if (mediaQuery.matches) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedListing]);

  // Preload review stats for better performance
  useEffect(() => {
    const preloadReviews = async () => {
      if (!allListings.length || reviewsPreloaded) return;
      
      try {
        // Extract unique listing IDs for preloading
        const reviewItems = allListings
          .filter(listing => listing.id && !isNaN(Number(listing.id)))
          .map(listing => ({ 
            type: 'TRANSPORTATION_LISTING', 
            id: Number(listing.id) 
          }));
        
        if (reviewItems.length > 0) {
          await preloadReviewStats(reviewItems);
          setReviewsPreloaded(true);
        }
      } catch (error) {
        console.warn('Failed to preload review stats:', error);
      }
    };

    // Debounce preloading to avoid excessive calls
    const timeoutId = setTimeout(preloadReviews, 500);
    return () => clearTimeout(timeoutId);
  }, [allListings, reviewsPreloaded]);

  // Load myRides from localStorage
  useEffect(() => {
    try {
      const storedMyRides = JSON.parse(localStorage.getItem('myRides') || '[]');
      if (Array.isArray(storedMyRides)) {
        setMyRides(storedMyRides);
      }
    } catch (error) {
      console.error("Failed to parse myRides from localStorage", error);
      setMyRides([]);
    }
  }, []);

  // Update allListings when props change
  useEffect(() => {
    const myRideIds = new Set(myRides.map(r => r.id));
    const updatedListings = (initialListings || []).map(listing =>
      myRideIds.has(listing.id)
        ? { ...listing, status: 'pending' as const }
        : listing
    );
    setAllListings(updatedListings);
  }, [initialListings, myRides]);

  // Filter logic (removed search functionality) - optimized with useMemo
  const filteredListings = useMemo(() => {
    return allListings.filter(listing => {
      const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
      return matchesFilter;
    });
  }, [allListings, filterStatus]);

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
    return new Date(isoString).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const getPriceDisplay = useCallback((price: string) => {
    return price.replace(/[^0-9.]/g, '') ? `$${price.replace(/[^0-9.]/g, '')}` : 'Free';
  }, []);

  const getStatusBadgeStyles = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'complete':
        return 'badge badge-info';
      default:
        return 'badge';
    }
  }, []);

  const handleBookRide = useCallback(async (listingToBook: RideListing) => {
    if (!userId) {
      alert("Please log in to book a ride.");
      return;
    }

    setIsLoading(true);
    
    const offer: TransportationOffer = {
      id: 0,
      senderId: userId,
      recipientId: listingToBook.provider?.user?.id || '',
      transportationListingId: listingToBook.id,
      transportationRequestId: null,
      seatsRequested: 1,
      pricePerSeat: listingToBook.pricePerSeat,
      message: "I'd like to book this ride.",
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    try {
      const offerController = container.resolve(OfferController);
      await offerController.createOffer(offer);
      
      const newMyRides = [...myRides, listingToBook];
      setMyRides(newMyRides);
      localStorage.setItem('myRides', JSON.stringify(newMyRides));
      
      setIsLoading(false);
      alert("Ride request sent successfully!");
    } catch (error) {
      console.error("Error booking ride:", error);
      setIsLoading(false);
      alert("There was an error sending your ride request. Please try again.");
    }
  }, [userId, myRides]);

  const handleMessageDriver = useCallback((driverId: string | undefined) => {
    if (!driverId) {
      alert("Unable to find driver information.");
      return;
    }
    if (!userId) {
      alert("Please log in to message the driver.");
      return;
    }
    router.push(`/chats/${driverId}`);
  }, [userId, router]);

  // Enhanced Ride Card Component
  const RideCard = React.memo(({ listing }: { listing: RideListing }) => {
    const { stats } = useReviewStatsOptimized('TRANSPORTATION_LISTING', listing.id);
    const isBooked = myRides.some(ride => ride.id === listing.id);
    const isSelected = selectedListing?.id === listing.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ y: -2 }}
        onClick={() => setSelectedListing(listing)}
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
        {/* Header with Status and Price */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(listing.status)}`}>
              <div className={`w-2 h-2 rounded-full ${listing.status === 'active' ? 'bg-success animate-pulse' : listing.status === 'pending' ? 'bg-warning' : 'bg-info'}`}></div>
              <span>{listing.status?.toUpperCase() || 'UNKNOWN'}</span>
            </div>
            <div className="flex items-center space-x-2">
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
              <ReportListingButton 
                listingId={listing.id.toString()}
                listingTitle={`${listing.startLocationText} → ${listing.endLocationText}`}
                currentUserId={userId}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          {/* Route with Enhanced Design */}
          <div 
            className="space-y-3 mb-4 cursor-pointer group/route hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg p-2 -m-2 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              openRouteOnMap({
                startLocationText: listing.startLocationText,
                endLocationText: listing.endLocationText,
                startLocationLat: listing.startLocationLat,
                startLocationLng: listing.startLocationLng,
                endLocationLat: listing.endLocationLat,
                endLocationLng: listing.endLocationLng
              });
            }}
            title="Click to view route on Google Maps"
          >
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-primary transition-colors">
                  {listing.startLocationText}
                </p>
              </div>
              <MapPin size={14} className="text-primary opacity-0 group-hover/route:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-px h-8 bg-light-outline dark:bg-dark-outline ml-1.5"></div>
              <div className="flex-1 flex items-center space-x-2 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Navigation size={12} />
                <span>{Math.round(listing.route_distance_km)+1} km journey</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-error rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-primary transition-colors">
                  {listing.endLocationText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info Section */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <OtherAvatarPic 
                otherUserId={listing.provider?.user?.id} 
                imageUrl={listing.provider?.user?.mediaUrls[0] || undefined} 
                userName={listing.provider?.user?.username || "Driver"} 
              />
              <div className="min-w-0">
                <p className="font-semibold text-light-on-surface dark:text-dark-on-surface truncate">
                  {listing.provider?.user?.username || "Driver"}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                    {listing.provider?.vehicleType || "Vehicle"}
                  </p>
                  {stats && stats.totalReviews > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {stats.averageRating.toFixed(1)} ({stats.totalReviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {getPriceDisplay(listing.pricePerSeat)}
              </div>
              <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                per seat
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
                <span>{formatDate(listing.departureTime)}</span>
              </div>
              <div className="flex items-center space-x-1 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Clock size={14} />
                <span>{formatTime(listing.departureTime)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg"
                   style={{ backgroundColor: 'rgb(var(--surface))' }}>
                <Users size={14} style={{ color: 'rgb(var(--primary))' }} />
                <span className="text-body-md font-medium" style={{ color: 'rgb(var(--text))' }}>
                  {listing.seatsAvailable}
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
  });
  
  RideCard.displayName = 'RideCard';

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-200px)]">
      {/* Left Side - Listings */}
      <div className={`flex-1 lg:max-w-2xl ${selectedListing ? 'hidden lg:block' : ''}`}>
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-2">
            {['all', 'active', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`btn rounded-button font-medium transition-all duration-200 capitalize ${
                  filterStatus === status
                    ? 'btn-primary'
                    : 'btn-outlined'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Listings Grid */}
        <div className="space-y-4 overflow-y-auto max-h-full pr-2 scrollbar-hide">
          <AnimatePresence>
            {filteredListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-full flex items-center justify-center">
                  <Car className="w-8 h-8 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                </div>
                <h3 className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
                  No rides found
                </h3>
                <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Try adjusting your search or filter criteria
                </p>
              </motion.div>
            ) : (
              filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RideCard listing={listing} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Details Panel */}
      <AnimatePresence>
        {selectedListing && (
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
                      onClick={() => setSelectedListing(null)} 
                      className="lg:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h2 className="text-xl lg:text-2xl font-bold">Ride Details</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedListing(null)} 
                    className="hidden lg:block p-2 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Route */}
                <div 
                  className="space-y-4 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg p-3 -m-3 transition-all duration-200 group/route-detail"
                  onClick={() => {
                    openRouteOnMap({
                      startLocationText: selectedListing.startLocationText,
                      endLocationText: selectedListing.endLocationText,
                      startLocationLat: selectedListing.startLocationLat,
                      startLocationLng: selectedListing.startLocationLng,
                      endLocationLat: selectedListing.endLocationLat,
                      endLocationLng: selectedListing.endLocationLng
                    });
                  }}
                  title="Click to view route on Google Maps"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center">
                      <Navigation className="w-5 h-5 mr-2 text-primary" />
                      Route Details
                    </h3>
                    <div className="text-xs text-primary opacity-0 group-hover/route-detail:opacity-100 transition-opacity bg-primary/10 px-2 py-1 rounded-full">
                      View on Map
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
                      <p className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-primary transition-colors">
                        {selectedListing.startLocationText}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-error/10 p-3 rounded-full mr-4">
                      <MapPin className="w-6 h-6 text-error" />
                    </div>
                    <div>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p>
                      <p className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-primary transition-colors">
                        {selectedListing.endLocationText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Trip Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-5 h-5 mr-2" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-body-sm" style={{ color: 'rgba(var(--text), 0.7)' }}>Date</p>
                    </div>
                    <p className="text-body-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {formatDate(selectedListing.departureTime)}
                    </p>
                  </div>
                  <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-2">
                      <Clock className="w-5 h-5 mr-2" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-body-sm" style={{ color: 'rgba(var(--text), 0.7)' }}>Time</p>
                    </div>
                    <p className="text-body-lg font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {formatTime(selectedListing.departureTime)}
                    </p>
                  </div>
                  <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-2">
                      <DollarSign className="w-5 h-5 mr-2" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-body-sm" style={{ color: 'rgba(var(--text), 0.7)' }}>Price</p>
                    </div>
                    <p className="text-headline-md font-bold" style={{ color: 'rgb(var(--primary))' }}>
                      {getPriceDisplay(selectedListing.pricePerSeat)}
                    </p>
                  </div>
                  <div className="p-4 rounded-button" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-2">
                      <Users className="w-5 h-5 text-primary mr-2" />
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">Available Seats</p>
                    </div>
                    <p className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
                      {selectedListing.seatsAvailable}
                    </p>
                  </div>
                </div>

                {/* Driver Section */}
                <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary" />
                    Driver Information
                  </h3>
                  
                  <div className="flex items-center mb-4">
                    <OtherAvatarPic 
                      otherUserId={selectedListing.provider?.user?.id} 
                      imageUrl={selectedListing.provider?.user?.mediaUrls[0] || undefined} 
                      userName={selectedListing.provider?.user?.username || "Driver"} 
                    />
                    <div className="ml-4">
                      <p className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {selectedListing.provider?.user?.username || "Driver"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Car size={16} className="text-primary" />
                        <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                          {selectedListing.provider?.vehicleType || "Vehicle"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Driver Reviews */}
                  <DriverReviewsCompactOptimized 
                    driverId={selectedListing.provider?.user?.id}
                    driverName={selectedListing.provider?.user?.name || "Driver"}
                    showStats={true}
                    maxReviews={3}
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleBookRide(selectedListing)}
                    disabled={isLoading || myRides.some(ride => ride.id === selectedListing.id)}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Processing...
                      </>
                    ) : myRides.some(ride => ride.id === selectedListing.id) ? (
                      <>
                        <Shield className="w-5 h-5 mr-2" />
                        Request Sent
                      </>
                    ) : (
                      <>
                        <Car className="w-5 h-5 mr-2" />
                        Book This Ride
                      </>
                    )}
                  </motion.button>
                  
                  {/* Report Button */}
                  <div className="flex justify-center">
                    <ReportListingButton
                      listingId={selectedListing.id.toString()}
                      listingTitle={`ride from ${selectedListing.startLocationText} to ${selectedListing.endLocationText}`}
                      currentUserId={userId}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-outlined flex items-center justify-center space-x-2 py-3 rounded-button transition-all duration-200"
                      onClick={() => handleMessageDriver(selectedListing.provider?.user?.id)}
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

export default EnhancedRideListings;