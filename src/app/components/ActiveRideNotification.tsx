'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  Clock, 
  User, 
  X, 
  ChevronRight,
  Navigation,
  MessageCircle,
  Phone
} from 'lucide-react';
import { ActiveRideDetails } from '@/app/hooks/useActiveRide';
import OtherAvatarPic from '../(view)/components/otherAvatarPic';

interface ActiveRideNotificationProps {
  activeRide: ActiveRideDetails;
  onDismiss?: () => void;
}

const ActiveRideNotification: React.FC<ActiveRideNotificationProps> = ({ 
  activeRide, 
  onDismiss 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const formatTime = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRoleDisplay = (role: string) => {
    return role === 'driver' ? 'Driver' : 'Passenger';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed top-4 right-4 z-50"
      >
        <motion.button
          onClick={() => setIsMinimized(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors relative"
        >
          <Car className="w-6 h-6" />
          <motion.div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(activeRide.status)}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-primary/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-light p-4 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-white/20 p-2 rounded-full"
              >
                <Car className="w-5 h-5" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-sm">Active Ride</h3>
                <p className="text-xs opacity-90">You're the {getRoleDisplay(activeRide.userRole)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
            <motion.div
              className={`h-full ${getStatusColor(activeRide.status)} rounded-r-full`}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Route Information */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {activeRide.startLocationText}
              </span>
            </div>
            <div className="flex items-center space-x-2 ml-1">
              <div className="w-0 h-4 border-l-2 border-dashed border-gray-300"></div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400 truncate">
                {activeRide.endLocationText}
              </span>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {formatDate(activeRide.departureTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-3 h-3 text-gray-500" />
              <span className="text-gray-600 dark:text-gray-400">
                {activeRide.seatsBooked} seats
              </span>
            </div>
          </div>

          {/* Other User Info */}
          {activeRide.otherUserDetails && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <OtherAvatarPic
                  otherUserId={activeRide.otherUserDetails.id}
                  imageUrl={activeRide.otherUserDetails.mediaUrls?.[0]}
                  userName={activeRide.otherUserDetails.username}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activeRide.otherUserDetails.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeRide.userRole === 'driver' ? 'Passenger' : 'Driver'}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Link
                  href={`/chats/${activeRide.otherUserDetails.id}`}
                  className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Link
              href="/rideSharing/activeRide"
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <span>View Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            {activeRide.otherUserDetails && (
              <Link
                href={`/rideSharing/activeRide/map/${activeRide.otherUserDetails.id}`}
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <Navigation className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ActiveRideNotification;