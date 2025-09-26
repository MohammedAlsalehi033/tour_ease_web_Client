"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';

interface RideRequestCardProps {
  request: RideRequest;
  onClick: () => void;
  isAccepted?: boolean;
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({ 
  request, 
  onClick, 
  isAccepted = false 
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

  const formatBudget = (budget: string) => {
    return budget.replace(/[^0-9.]/g, '') ? `$${budget.replace(/[^0-9.]/g, '')}` : 'Free';
  };

  const getStatusBadge = () => {
    if (isAccepted) {
      return {
        text: 'ACCEPTED',
        className: 'bg-success/20 text-success border border-success/30',
        icon: CheckCircle
      };
    }
    
    // You can add more status logic here if RideRequest has a status field
    return {
      text: 'OPEN',
      className: 'bg-primary/20 text-primary border border-primary/30',
      icon: Zap
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  // For now, using placeholder data since RideRequest doesn't have traveler info in the model
  const travelerName = 'Traveler'; // request.traveler?.user?.name || 'Traveler';
  const travelerInitial = travelerName.charAt(0).toUpperCase();

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
                {formatBudget(request.budget)}
              </div>
              <div className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                budget
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
                  {request.startLocationText}
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
                  {request.endLocationText}
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
            {/* Traveler info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <span className="text-secondary font-semibold text-sm">{travelerInitial}</span>
              </div>
              <div>
                <p className="font-medium text-sm text-light-on-surface dark:text-dark-on-surface">
                  {travelerName}
                </p>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Verified traveler
                  </span>
                </div>
              </div>
            </div>

            {/* Seats needed */}
            <div className="flex items-center space-x-2 bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg px-3 py-2">
              <Users size={14} className="text-light-on-surface-variant dark:text-dark-on-surface-variant" />
              <span className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                {request.seatsNeeded}
              </span>
            </div>
          </div>

          {/* Trip details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Calendar size={12} />
              <span>{formatDate(request.departureTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <Clock size={12} />
              <span>{formatTime(request.departureTime)}</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <MapPin size={12} />
              <span>{request.distance_km} km</span>
            </div>
            <div className="flex items-center space-x-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <DollarSign size={12} />
              <span>Flexible</span>
            </div>
          </div>
        </div>

        {/* Call to action hint */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-4 py-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {isAccepted ? 'Offer accepted!' : 'Click to help this traveler'}
            </span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
      </div>
    </motion.div>
  );
};

export default RideRequestCard;