"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import EnhancedRideListings from './EnhancedRideListings';
import EnhancedRideRequests from './EnhancedRideRequests';

interface RideOrListingSelectorProps {
  rideListings: RideListing[]; 
  rideRequests?: RideRequest[] | undefined; 
}

const RideOrlistingSelector: React.FC<RideOrListingSelectorProps> = ({
  rideListings, 
  rideRequests = []
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'requests'>('listings');

  const tabs = [
    {
      id: 'listings',
      label: 'Available Rides',
      count: rideListings.length,
      icon: '🚗'
    },
    {
      id: 'requests',
      label: 'Ride Requests', 
      count: rideRequests.length,
      icon: '🙋‍♂️'
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-display-lg text-primary mb-3">
            RideShare Hub
          </h1>
          <p className="text-body-lg" style={{ color: 'rgba(var(--text), 0.7)' }}>
            Connect with fellow travelers and share your journey
          </p>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="card rounded-large p-2 shadow-lg">
            <div className="flex relative">
              {/* Animated Background */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-button shadow-md"
                style={{ backgroundColor: 'rgb(var(--primary))' }}
                initial={false}
                animate={{
                  left: activeTab === 'listings' ? '4px' : '50%',
                  width: activeTab === 'listings' ? 'calc(50% - 4px)' : 'calc(50% - 8px)',
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'listings' | 'requests')}
                  className={`relative flex-1 flex items-center justify-center space-x-3 px-6 py-4 rounded-button font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'text-white z-10'
                      : 'hover:bg-opacity-10'
                  }`}
                  style={activeTab === tab.id ? {} : { 
                    color: 'rgba(var(--text), 0.6)',
                  }}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className={`badge badge-info px-2 py-1 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : ''
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'listings' ? (
              <EnhancedRideListings rideListings={rideListings} />
            ) : (
              <EnhancedRideRequests rideRequests={rideRequests} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RideOrlistingSelector;