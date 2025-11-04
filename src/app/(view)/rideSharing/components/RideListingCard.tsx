"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  Star,
  Shield,
  CheckCircle,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { formatExactTime, formatLocalDate } from '@/app/lib/timeUtils';

interface RideListingCardProps {
  listing: RideListing;
  onClick: () => void;
  isBooked?: boolean;
}

const RideListingCard: React.FC<RideListingCardProps> = ({ 
  listing, 
  onClick, 
  isBooked = false 
}) => {
  const formatDateRelative = (isoString: string) => {
    if (!isoString) return "TBD";
    const date = new Date(isoString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Past";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 7) return `${diffDays} days`;
    
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    return formatExactTime(isoString); // Use exact time without timezone conversion
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "TBD";
    return formatLocalDate(isoString);
  };

  const formatPrice = (price: string) => {
    return price.replace(/[^0-9.]/g, '') ? `PKR ${price.replace(/[^0-9.]/g, '')}` : 'Free';
  };

  const getStatusBadge = () => {
    if (isBooked) {
      return {
        text: 'BOOKED',
        className: 'bg-success/20 text-success border border-success/30',
        icon: CheckCircle
      };
    }
    
    switch (listing.status) {
      case 'active':
        return {
          text: 'AVAILABLE',
          className: 'bg-primary/20 text-primary border border-primary/30',
          icon: Shield
        };
      case 'pending':
        return {
          text: 'PENDING',
          className: 'bg-warning/20 text-warning border border-warning/30',
          icon: AlertCircle
        };
      case 'complete':
        return {
          text: 'COMPLETED',
          className: 'bg-success/20 text-success border border-success/30',
          icon: CheckCircle
        };
      default:
        return {
          text: 'INACTIVE',
          className: 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant border border-light-outline dark:border-dark-outline',
          icon: AlertCircle
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // Enhanced user data extraction
  const driverData = {
    name: listing.provider?.user?.name || 'Anonymous Driver',
    email: listing.provider?.user?.email || '',
    profileImage: listing.provider?.user?.profileImage || null,
    rating: listing.provider?.rating || 4.5,
    reviewCount: listing.provider?.reviewCount || 0,
    joinDate: listing.provider?.user?.createdAt || null,
    verificationStatus: listing.provider?.verificationStatus || 'pending'
  };

  const driverInitial = driverData.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const formattedRating = driverData.rating.toFixed(1);
  const isVerified = driverData.verificationStatus === 'verified';

  // Handle specific click actions
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleLocationClick = (e: React.MouseEvent, location: string) => {
    e.stopPropagation();
    // Could open map or location details
    console.log(`Clicked location: ${location}`);
  };

  const handleDriverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Could open driver profile
    console.log(`Clicked driver: ${driverData.name}`);
  };

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group"
    >
      <div className="bg-light-surface dark:bg-dark-surface rounded-xl sm:rounded-2xl border border-light-outline dark:border-dark-outline shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Header with status */}
        <div className="p-3 sm:p-4 pb-0">
          <div className="flex justify-between items-start mb-3">
            <div className={`flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
              <StatusIcon size={12} />
              <span className="hidden xs:inline">{statusBadge.text}</span>
            </div>
            <div className="text-right">
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {formatPrice(listing.pricePerSeat)}
              </div>
              <div className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                per seat
              </div>
            </div>
          </div>
        </div>

        {/* Route - Improved click areas */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="space-y-2">
            <button
              onClick={(e) => handleLocationClick(e, listing.startLocationText)}
              className="w-full flex items-start space-x-3 p-2 rounded-lg hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors duration-200"
            >
              <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {listing.startLocationText}
                </p>
                <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Pickup location
                </p>
              </div>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-px h-4 bg-light-outline dark:bg-dark-outline ml-1.5"></div>
            </div>
            <button
              onClick={(e) => handleLocationClick(e, listing.endLocationText)}
              className="w-full flex items-start space-x-3 p-2 rounded-lg hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors duration-200"
            >
              <div className="w-3 h-3 bg-error rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {listing.endLocationText}
                </p>
                <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Destination
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-light-outline dark:border-dark-outline"></div>

        {/* Details */}
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Enhanced Driver info */}
            <button
              onClick={handleDriverClick}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors duration-200"
            >
              <div className="relative">
                {driverData.profileImage ? (
                  <img
                    src={driverData.profileImage}
                    alt={driverData.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{driverInitial}</span>
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm text-light-on-surface dark:text-dark-on-surface">
                  {driverData.name}
                </p>
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {formattedRating} ({driverData.reviewCount})
                  </span>
                  {isVerified && (
                    <span className="text-xs text-success">• Verified</span>
                  )}
                </div>
              </div>
            </button>

            {/* Available seats */}
            <div className="flex items-center space-x-2 bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg px-3 py-2">
              <Users size={14} className="text-light-on-surface-variant dark:text-dark-on-surface-variant" />
              <span className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                {listing.seatsAvailable}
              </span>
            </div>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Calendar size={12} />
              <span>{formatDateRelative(listing.departureTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Clock size={12} />
              <span>{formatTime(listing.departureTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <MapPin size={12} />
              <span>{listing.distance_km} km</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Briefcase size={12} />
              <span>{listing.luggage || 0} bags</span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={handleDetailsClick}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-lg font-medium text-sm transition-colors duration-200"
          >
            View Details & Book
          </button>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default RideListingCard;