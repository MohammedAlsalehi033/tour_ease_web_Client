"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Users, Plus, Search } from 'lucide-react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import CreateRideListingWizard from './CreateRideListingWizard';
import CreateRideRequestWizard from './CreateRideRequestWizard';
import EnhancedRideListings from './EnhancedRideListings';
import EnhancedRideRequests from './EnhancedRideRequests';
import TransportationProviderForm from './newProviderForm';

interface SimplifiedRideHubProps {
  rideListings: RideListing[];
  rideRequests?: RideRequest[];
  initialMode?: UserMode;
  isTransportationProvider: boolean;
}

type UserMode = 'driver' | 'traveler';
type DriverView = 'browse-requests' | 'create-listing';
type TravelerView = 'browse-listings' | 'create-request';

const SimplifiedRideHub: React.FC<SimplifiedRideHubProps> = ({
  rideListings,
  rideRequests = [],
  initialMode = 'traveler',
  isTransportationProvider
}) => {
  const [userMode, setUserMode] = useState<UserMode>(initialMode);
  const [driverView, setDriverView] = useState<DriverView>('browse-requests');
  const [travelerView, setTravelerView] = useState<TravelerView>('browse-listings');

  // Memoize counts to prevent unnecessary recalculations
  const counts = useMemo(() => ({
    listings: rideListings.length,
    requests: rideRequests.length
  }), [rideListings.length, rideRequests.length]);

  // Use useCallback to prevent unnecessary re-renders
  const handleModeChange = useCallback((mode: UserMode) => {
    setUserMode(mode);
  }, []);

  const handleDriverViewChange = useCallback((view: DriverView) => {
    setDriverView(view);
  }, []);

  const handleTravelerViewChange = useCallback((view: TravelerView) => {
    setTravelerView(view);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header - Responsive text sizes */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3">
            RideShare Hub
          </h1>
          <p className="text-sm sm:text-base lg:text-lg" style={{ color: 'rgba(var(--text), 0.7)' }}>
            Connect with fellow travelers and share your journey
          </p>
        </motion.div>

        {/* Mode Toggle (Driver/Traveler) - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="card rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-lg max-w-xs sm:max-w-md mx-auto">
            <div className="flex relative">
              {/* Animated Background */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg sm:rounded-xl shadow-md"
                style={{ backgroundColor: 'rgb(var(--primary))' }}
                initial={false}
                animate={{
                  left: userMode === 'driver' ? '6px' : '50%',
                  width: userMode === 'driver' ? 'calc(50% - 6px)' : 'calc(50% - 6px)',
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              {/* Driver Button */}
              <button
                onClick={() => handleModeChange('driver')}
                className={`relative flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  userMode === 'driver'
                    ? 'text-white z-10'
                    : 'hover:bg-opacity-10'
                }`}
                style={userMode === 'driver' ? {} : { 
                  color: 'rgba(var(--text), 0.6)',
                }}
              >
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">I'm a Driver</span>
                <span className="xs:hidden">Driver</span>
              </button>

              {/* Traveler Button */}
              <button
                onClick={() => handleModeChange('traveler')}
                className={`relative flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium sm:font-semibold text-xs sm:text-sm transition-all duration-300 ${
                  userMode === 'traveler'
                    ? 'text-white z-10'
                    : 'hover:bg-opacity-10'
                }`}
                style={userMode === 'traveler' ? {} : { 
                  color: 'rgba(var(--text), 0.6)',
                }}
              >
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">I'm a Traveler</span>
                <span className="xs:hidden">Traveler</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {userMode === 'driver' ? (
            <motion.div
              key="driver"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {!isTransportationProvider ? (
                <TransportationProviderForm />
              ) : (
                <>
                  {/* Driver Sub-Navigation - Responsive */}
                  <div className="mb-4 sm:mb-6">
                    <div className="card rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-md">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleDriverViewChange('browse-requests')}
                          className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                            driverView === 'browse-requests'
                              ? 'text-white shadow-md'
                              : ''
                          }`}
                          style={driverView === 'browse-requests' ? {
                            backgroundColor: 'rgb(var(--primary))'
                          } : {
                            color: 'rgba(var(--text), 0.6)'
                          }}
                        >
                          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Browse Requests</span>
                          <span className="xs:hidden">Requests</span>
                          <span className="badge badge-info px-1.5 py-0.5 text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                            {counts.requests}
                          </span>
                        </button>
                        <button
                          onClick={() => handleDriverViewChange('create-listing')}
                          className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                            driverView === 'create-listing'
                              ? 'text-white shadow-md'
                              : ''
                          }`}
                          style={driverView === 'create-listing' ? {
                            backgroundColor: 'rgb(var(--primary))'
                          } : {
                            color: 'rgba(var(--text), 0.6)'
                          }}
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span className="hidden xs:inline">Create Listing</span>
                          <span className="xs:hidden">Create</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Driver Content */}
                  <AnimatePresence mode="wait">
                    {driverView === 'browse-requests' ? (
                      <motion.div
                        key="browse-requests"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EnhancedRideRequests rideRequests={rideRequests} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="create-listing"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CreateRideListingWizard />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="traveler"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Traveler Sub-Navigation - Responsive */}
              <div className="mb-4 sm:mb-6">
                <div className="card rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-md">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleTravelerViewChange('browse-listings')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                        travelerView === 'browse-listings'
                          ? 'text-white shadow-md'
                          : ''
                      }`}
                      style={travelerView === 'browse-listings' ? {
                        backgroundColor: 'rgb(var(--primary))'
                      } : {
                        color: 'rgba(var(--text), 0.6)'
                      }}
                    >
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Browse Listings</span>
                      <span className="xs:hidden">Listings</span>
                      <span className="badge badge-info px-1.5 py-0.5 text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center">
                        {counts.listings}
                      </span>
                    </button>
                    <button
                      onClick={() => handleTravelerViewChange('create-request')}
                      className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                        travelerView === 'create-request'
                          ? 'text-white shadow-md'
                          : ''
                      }`}
                      style={travelerView === 'create-request' ? {
                        backgroundColor: 'rgb(var(--primary))'
                      } : {
                        color: 'rgba(var(--text), 0.6)'
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Create Request</span>
                      <span className="xs:hidden">Create</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Traveler Content */}
              <AnimatePresence mode="wait">
                {travelerView === 'browse-listings' ? (
                  <motion.div
                    key="browse-listings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EnhancedRideListings rideListings={rideListings} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="create-request"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CreateRideRequestWizard />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SimplifiedRideHub;
