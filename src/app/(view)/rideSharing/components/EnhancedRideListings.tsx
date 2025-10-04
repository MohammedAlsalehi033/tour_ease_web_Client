"use client";

import "reflect-metadata";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Banknote, 
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
import { formatExactTime, formatLocalDate } from '@/app/lib/timeUtils';
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
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [bookingMessage, setBookingMessage] = useState("");

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
    return formatLocalDate(isoString);
  }, []);

  const formatTime = useCallback((isoString: string) => {
    if (!isoString) return "";
    return formatExactTime(isoString); // Use exact time without timezone conversion
  }, []);

  const getPriceDisplay = useCallback((price: string) => {
    return price.replace(/[^0-9.]/g, '') ? `PKR ${price.replace(/[^0-9.]/g, '')}` : 'Free';
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
      seatsRequested: selectedSeats,
      pricePerSeat: listingToBook.pricePerSeat,
      message: bookingMessage || "I'd like to book this ride.",
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
      setShowBookingModal(false);
      setSelectedSeats(1);
      setBookingMessage("");
      alert("Ride request sent successfully!");
    } catch (error) {
      console.error("Error booking ride:", error);
      setIsLoading(false);
      alert("There was an error sending your ride request. Please try again.");
    }
  }, [userId, myRides, selectedSeats, bookingMessage]);

  const openBookingModal = () => {
    setSelectedSeats(1);
    setBookingMessage("");
    setShowBookingModal(true);
  };

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
    const isBooked = myRides.some(ride => ride.id === listing.id);
    const isSelected = selectedListing?.id === listing.id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        whileHover={{ y: -1 }}
        onClick={() => setSelectedListing(listing)}
        className={`card group cursor-pointer rounded-lg transition-all duration-200 overflow-hidden ${
          isSelected 
            ? 'border-primary shadow-glow-primary scale-[1.01]' 
            : 'hover:border-primary/50 hover:shadow-md'
        }`}
        style={{
          backgroundColor: 'rgb(var(--surface))',
          borderColor: isSelected ? 'rgb(var(--primary))' : 'rgba(var(--text), 0.1)'
        }}
      >
        {/* Compact Header with Status and Price */}
        <div className="p-4 pb-3">
          <div className="flex justify-between items-start mb-3">
            <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(listing.status)}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${listing.status === 'active' ? 'bg-success animate-pulse' : listing.status === 'pending' ? 'bg-warning' : 'bg-info'}`}></div>
              <span>{listing.status?.toUpperCase() || 'UNKNOWN'}</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {getPriceDisplay(listing.pricePerSeat)}
              </div>
              <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                per seat
              </p>
            </div>
          </div>

          {/* Compact Route */}
          <div 
            className="space-y-2 mb-3 cursor-pointer group/route hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg p-2 -m-2 transition-all duration-200"
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
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-primary transition-colors">
                  {listing.startLocationText}
                </p>
              </div>
              <MapPin size={12} className="text-primary opacity-0 group-hover/route:opacity-100 transition-opacity" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-px h-6 bg-light-outline dark:bg-dark-outline ml-1.25"></div>
              <div className="flex-1 flex items-center space-x-1.5 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Navigation size={10} />
                <span>{Math.round(listing.route_distance_km)+1} km</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-error rounded-full shadow-sm"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate group-hover/route:text-primary transition-colors">
                  {listing.endLocationText}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Driver Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <OtherAvatarPic 
                otherUserId={listing.provider?.user?.id} 
                imageUrl={listing.provider?.user?.mediaUrls[0] || undefined} 
                userName={listing.provider?.user?.username || "Driver"}
                className="w-8 h-8"
              />
              <div className="min-w-0">
                <p className="font-semibold text-light-on-surface dark:text-dark-on-surface truncate text-sm">
                  {listing.provider?.user?.username || "Driver"}
                </p>
                <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                  {listing.provider?.vehicleType || "Vehicle"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Calendar size={12} />
                <span>{formatDate(listing.departureTime)}</span>
              </div>
              <div className="flex items-center space-x-1 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <Clock size={12} />
                <span>{formatTime(listing.departureTime)}</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 rounded-lg"
                   style={{ backgroundColor: 'rgb(var(--surface))' }}>
                <Users size={12} style={{ color: 'rgb(var(--primary))' }} />
                <span className="text-xs font-medium" style={{ color: 'rgb(var(--text))' }}>
                  {listing.seatsAvailable}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  });
  
  RideCard.displayName = 'RideCard';

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Left Side - Listings */}
      <div className={`flex-1 lg:max-w-2xl ${selectedListing ? 'hidden lg:block' : ''}`}>
        {/* Listings Grid - Compact */}
        <div className="space-y-3 overflow-y-auto max-h-full pr-2 scrollbar-hide">
          <AnimatePresence>
            {filteredListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-light-surface-variant dark:bg-dark-surface-variant rounded-full flex items-center justify-center">
                  <Car className="w-6 h-6 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                </div>
                <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  No rides found
                </h3>
                <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Try adjusting your search criteria
                </p>
              </motion.div>
            ) : (
              filteredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
            <div className="h-full lg:card lg:rounded-lg lg:shadow-lg lg:overflow-hidden lg:h-fit"
                 style={{ backgroundColor: 'rgb(var(--surface))' }}>
              {/* Compact Header */}
              <div className="p-3 lg:p-4 text-white sticky top-0 z-10" style={{ backgroundColor: 'rgb(var(--primary))' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedListing(null)} 
                      className="lg:hidden p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg lg:text-xl font-bold">Ride Details</h2>
                  </div>
                  <button 
                    onClick={() => setSelectedListing(null)} 
                    className="hidden lg:block p-1.5 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Compact Content */}
              <div className="p-4 space-y-4">
                {/* Compact Route */}
                <div 
                  className="space-y-3 cursor-pointer hover:bg-primary/5 dark:hover:bg-primary/10 rounded-lg p-2 -m-2 transition-all duration-200 group/route-detail"
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
                    <h3 className="text-base font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center">
                      <Navigation className="w-4 h-4 mr-2 text-primary" />
                      Route Details
                    </h3>
                    <div className="text-xs text-primary opacity-0 group-hover/route-detail:opacity-100 transition-opacity bg-primary/10 px-2 py-1 rounded-full">
                      View on Map
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">From</p>
                      <p className="text-sm font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-primary transition-colors">
                        {selectedListing.startLocationText}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-error/10 p-2 rounded-full mr-3">
                      <MapPin className="w-4 h-4 text-error" />
                    </div>
                    <div>
                      <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">To</p>
                      <p className="text-sm font-semibold text-light-on-surface dark:text-dark-on-surface group-hover/route-detail:text-primary transition-colors">
                        {selectedListing.endLocationText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compact Trip Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-1">
                      <Calendar className="w-4 h-4 mr-1.5" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-xs" style={{ color: 'rgba(var(--text), 0.7)' }}>Date</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {formatDate(selectedListing.departureTime)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-1">
                      <Clock className="w-4 h-4 mr-1.5" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-xs" style={{ color: 'rgba(var(--text), 0.7)' }}>Time</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text))' }}>
                      {formatTime(selectedListing.departureTime)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-1">
                      <Banknote className="w-4 h-4 mr-1.5" style={{ color: 'rgb(var(--primary))' }} />
                      <p className="text-xs" style={{ color: 'rgba(var(--text), 0.7)' }}>Price</p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'rgb(var(--primary))' }}>
                      {getPriceDisplay(selectedListing.pricePerSeat)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(var(--surface), 0.8)' }}>
                    <div className="flex items-center mb-1">
                      <Users className="w-4 h-4 text-primary mr-1.5" />
                      <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">Seats</p>
                    </div>
                    <p className="text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                      {selectedListing.seatsAvailable}
                    </p>
                  </div>
                </div>

                {/* Compact Driver Section */}
                <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-light-on-surface dark:text-dark-on-surface mb-3 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Driver Information
                  </h3>
                  
                  <div className="flex items-center mb-3">
                    <OtherAvatarPic 
                      otherUserId={selectedListing.provider?.user?.id} 
                      imageUrl={selectedListing.provider?.user?.mediaUrls[0] || undefined} 
                      userName={selectedListing.provider?.user?.username || "Driver"}
                      className="w-10 h-10"
                    />
                    <div className="ml-3">
                      <p className="text-base font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {selectedListing.provider?.user?.username || "Driver"}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Car size={14} className="text-primary" />
                        <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant capitalize">
                          {selectedListing.provider?.vehicleType || "Vehicle"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Compact Driver Reviews */}
                  <DriverReviewsCompactOptimized 
                    driverId={selectedListing.provider?.user?.id}
                    driverName={selectedListing.provider?.user?.name || "Driver"}
                    showStats={true}
                    maxReviews={2}
                  />
                </div>

                {/* Compact Action Buttons */}
                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={openBookingModal}
                    disabled={myRides.some(ride => ride.id === selectedListing.id)}
                  >
                    {myRides.some(ride => ride.id === selectedListing.id) ? (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Request Sent
                      </>
                    ) : (
                      <>
                        <Car className="w-4 h-4 mr-2" />
                        Book This Ride
                      </>
                    )}
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-outlined flex items-center justify-center space-x-1.5 py-2.5 rounded-lg transition-all duration-200 text-sm"
                      onClick={() => handleMessageDriver(selectedListing.provider?.user?.id)}
                    >
                      <MessageCircle size={16} />
                      <span>Message</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-outlined flex items-center justify-center space-x-1.5 py-2.5 rounded-lg transition-all duration-200 text-sm"
                      style={{
                        borderColor: 'rgb(var(--success))',
                        color: 'rgb(var(--success))'
                      }}
                    >
                      <Phone size={16} />
                      <span>Call</span>
                    </motion.button>
                  </div>
                  
                  {/* Compact Report Button */}
                  <div className="flex justify-center">
                    <ReportListingButton
                      listingId={selectedListing.id.toString()}
                      listingTitle={`ride from ${selectedListing.startLocationText} to ${selectedListing.endLocationText}`}
                      currentUserId={userId}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingModal && selectedListing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-light-on-surface dark:text-dark-on-surface">
                  Book Your Ride
                </h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Trip Summary */}
              <div className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{selectedListing.startLocationText}</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{selectedListing.endLocationText}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{formatDate(selectedListing.departureTime)} at {formatTime(selectedListing.departureTime)}</span>
                  <span className="font-bold text-primary">{getPriceDisplay(selectedListing.pricePerSeat)} per seat</span>
                </div>
              </div>

              {/* Seat Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-light-on-surface dark:text-dark-on-surface mb-2">
                  Number of Seats
                </label>
                <select
                  value={selectedSeats}
                  onChange={(e) => setSelectedSeats(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-light-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {Array.from({ length: Math.min(selectedListing.seatsAvailable, 4) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>
                      {num} seat{num > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedListing.seatsAvailable} seats available
                </p>
              </div>

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-light-on-surface dark:text-dark-on-surface mb-2">
                  Message to Driver (Optional)
                </label>
                <textarea
                  value={bookingMessage}
                  onChange={(e) => setBookingMessage(e.target.value)}
                  placeholder="Hi! I'd like to book this ride. Looking forward to traveling with you!"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-light-on-surface dark:text-dark-on-surface focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bookingMessage.length}/200 characters
                </p>
              </div>

              {/* Total Cost */}
              <div className="bg-primary/10 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Cost:</span>
                  <span className="text-xl font-bold text-primary">
                    {getPriceDisplay((parseFloat(selectedListing.pricePerSeat.replace(/[^0-9.]/g, '')) * selectedSeats).toString())}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {selectedSeats} seat{selectedSeats > 1 ? 's' : ''} × {getPriceDisplay(selectedListing.pricePerSeat)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBookRide(selectedListing)}
                  disabled={isLoading}
                  className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedRideListings;