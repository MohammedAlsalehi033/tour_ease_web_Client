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
  AlertCircle
} from 'lucide-react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';

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
  const formatDate = (isoString: string) => {
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
    return new Date(isoString).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatPrice = (price: string) => {
    return price.replace(/[^0-9.]/g, '') ? `$${price.replace(/[^0-9.]/g, '')}` : 'Free';
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

  const driverName = listing.provider?.user?.name || 'Driver';
  const driverInitial = driverName.charAt(0).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl border border-light-outline dark:border-dark-outline shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header with status */}
        <div className="p-4 pb-0">
          <div className="flex justify-between items-start mb-3">
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
              <StatusIcon size={12} />
              <span>{statusBadge.text}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(listing.pricePerSeat)}
              </div>
              <div className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                per seat
              </div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="px-4 pb-4">
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {listing.startLocationText}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-px h-4 bg-light-outline dark:bg-dark-outline ml-1.5"></div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-3 h-3 bg-error rounded-full mt-1.5 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                  {listing.endLocationText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-light-outline dark:border-dark-outline"></div>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Driver info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">{driverInitial}</span>
              </div>
              <div>
                <p className="font-medium text-sm text-light-on-surface dark:text-dark-on-surface">
                  {driverName}
                </p>
                <div className="flex items-center space-x-1">
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    4.8 (23)
                  </span>
                </div>
              </div>
            </div>

            {/* Available seats */}
            <div className="flex items-center space-x-2 bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg px-3 py-2">
              <Users size={14} className="text-light-on-surface-variant dark:text-dark-on-surface-variant" />
              <span className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                {listing.seatsAvailable}
              </span>
            </div>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Calendar size={12} />
              <span>{formatDate(listing.departureTime)}</span>
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
              <Shield size={12} />
              <span>Verified</span>
            </div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default RideListingCard;