"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Phone, 
  MessageCircle,
  Star,
  Shield,
  Car,
  Route,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import { formatExactTime, formatLocalDate } from '@/app/lib/timeUtils';

interface RideDetailModalProps {
  item: RideListing | RideRequest;
  isOpen: boolean;
  onClose: () => void;
  onBookRide?: (listing: RideListing) => void;
  onAcceptOffer?: (request: RideRequest) => void;
}

const RideDetailModal: React.FC<RideDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onBookRide,
  onAcceptOffer,
}) => {
  if (!isOpen) return null;

  const isListing = 'provider' in item;
  const listing = isListing ? item as RideListing : null;
  const request = !isListing ? item as RideRequest : null;

  const formatDate = (isoString: string) => {
    if (!isoString) return "TBD";
    return formatLocalDate(isoString);
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    return formatExactTime(isoString); // Use exact time without timezone conversion
  };

  const formatPrice = (price: string) => {
    return price.replace(/[^0-9.]/g, '') ? `$${price.replace(/[^0-9.]/g, '')}` : 'Free';
  };

  const handleActionClick = () => {
    if (listing && onBookRide) {
      onBookRide(listing);
    } else if (request && onAcceptOffer) {
      onAcceptOffer(request);
    }
  };

  const personName = listing?.provider?.user?.name || 'Traveler';
  const personInitial = personName.charAt(0).toUpperCase();
  const actionText = listing ? 'Book This Ride' : 'Accept Request';
  const actionIcon = listing ? Car : CheckCircle;
  const ActionIcon = actionIcon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-light-surface dark:bg-dark-surface rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-light-surface dark:bg-dark-surface border-b border-light-outline dark:border-dark-outline p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface">
              {listing ? 'Ride Details' : 'Request Details'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors duration-200"
            >
              <X size={24} className="text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Route Section */}
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4 flex items-center">
              <Route className="w-5 h-5 mr-2" />
              Journey Route
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-4 h-4 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                    From: {item.startLocationText}
                  </p>
                  <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Departure location
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-px h-8 bg-light-outline dark:bg-dark-outline ml-2"></div>
                <div className="flex-1 flex items-center space-x-2 text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  <MapPin size={14} />
                  <span>{item.distance_km} km journey</span>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-4 h-4 bg-error rounded-full mt-1 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                    To: {item.endLocationText}
                  </p>
                  <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Destination
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Trip Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Trip Information
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-light-on-surface dark:text-dark-on-surface">
                        Departure Date
                      </p>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {formatDate(item.departureTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-light-on-surface dark:text-dark-on-surface">
                        Departure Time
                      </p>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {formatTime(item.departureTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-light-on-surface dark:text-dark-on-surface">
                        {listing ? 'Available Seats' : 'Seats Needed'}
                      </p>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {listing ? listing.seatsAvailable : request?.seatsNeeded} seats
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-light-on-surface dark:text-dark-on-surface">
                        {listing ? 'Price per Seat' : 'Budget'}
                      </p>
                      <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {formatPrice(listing ? listing.pricePerSeat : request?.budget || '')}
                      </p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(listing ? listing.pricePerSeat : request?.budget || '')}
                  </div>
                </div>
              </div>
            </div>

            {/* Person Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {listing ? 'Driver Information' : 'Traveler Information'}
              </h3>

              <div className="bg-light-surface-variant dark:bg-dark-surface-variant rounded-2xl p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-xl">{personInitial}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-light-on-surface dark:text-dark-on-surface">
                      {personName}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          4.8 (23 reviews)
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Shield size={16} className="text-success" />
                        <span className="text-sm text-success">Verified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {listing && (
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm text-light-on-surface dark:text-dark-on-surface">
                        {listing.provider?.vehicleType || 'Standard Vehicle'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm text-light-on-surface dark:text-dark-on-surface">
                        Licensed Driver
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm text-light-on-surface dark:text-dark-on-surface">
                        Account Status: {listing.provider?.accountStatus || 'Active'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors duration-200">
                    <MessageCircle size={18} />
                    <span>Message</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-success text-white rounded-xl hover:bg-success/90 transition-colors duration-200">
                    <Phone size={18} />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {listing?.mediaUrls && listing.mediaUrls.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                Vehicle Photos
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.mediaUrls.slice(0, 4).map((url, index) => (
                  <div key={index} className="aspect-square bg-light-surface-variant dark:bg-dark-surface-variant rounded-xl flex items-center justify-center">
                    <Car className="w-8 h-8 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Safety & Policies */}
          <div className="bg-light-surface-variant dark:bg-dark-surface-variant rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Safety & Policies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <div className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>Identity verified</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>Clean driving record</span>
              </div>
              <div className="flex items-start space-x-2">
                <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
                <span>No smoking allowed</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle size={16} className="text-success mt-0.5 flex-shrink-0" />
                <span>Pet-friendly available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="sticky bottom-0 bg-light-surface dark:bg-dark-surface border-t border-light-outline dark:border-dark-outline p-6 rounded-b-3xl">
          <button
            onClick={handleActionClick}
            className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-2xl font-semibold text-lg hover:from-primary-dark hover:to-secondary shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <ActionIcon size={24} />
            <span>{actionText}</span>
          </button>
          <p className="text-center text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-3">
            {listing ? 'Secure payment through the app' : 'Help this traveler reach their destination'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RideDetailModal;