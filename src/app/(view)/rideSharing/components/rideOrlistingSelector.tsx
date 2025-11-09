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
    <div className="h-[calc(100vh-80px)] overflow-hidden" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 h-full flex flex-col">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-1">
            RideShare Hub
          </h1>
          <p className="text-sm lg:text-base" style={{ color: 'rgba(var(--text), 0.7)' }}>
            Connect with fellow travelers
          </p>
        </motion.div>

        {/* Compact Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex-shrink-0"
        >
          <div className="card rounded-xl p-1.5 shadow-md">
            <div className="flex relative">
              {/* Animated Background */}
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg shadow-sm"
                style={{ backgroundColor: 'rgb(var(--primary))' }}
                initial={false}
                animate={{
                  left: activeTab === 'listings' ? '2px' : '50%',
                  width: activeTab === 'listings' ? 'calc(50% - 2px)' : 'calc(50% - 4px)',
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'listings' | 'requests')}
                  className={`relative flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg font-medium transition-all duration-300 text-sm lg:text-base ${
                    activeTab === tab.id
                      ? 'text-white z-10'
                      : 'hover:bg-opacity-10'
                  }`}
                  style={activeTab === tab.id ? {} : { 
                    color: 'rgba(var(--text), 0.6)',
                  }}
                >
                  <span className="text-base lg:text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  <span className={`px-1.5 py-0.5 text-xs rounded-full font-medium ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface dark:text-dark-on-surface'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area - Takes remaining space */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
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
    </div>
  );
};

export default RideOrlistingSelector;