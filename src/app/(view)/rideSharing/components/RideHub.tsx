"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Car, 
  Users, 
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';
import { RideListing } from '@/app/(model)/rideSharing/RideListting/rideListtingModel';
import { RideRequest } from '@/app/(model)/rideSharing/RideRequest/rideRequestModel';
import { useRideData, FilterOptions } from './hooks/useRideData';

// Temporary placeholder components
const RideListingCard = ({ listing, onClick, isBooked }: any) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer" onClick={onClick}>
    <h3 className="font-semibold">{listing.startLocationText} → {listing.endLocationText}</h3>
    <p>${listing.pricePerSeat} per seat</p>
  </div>
);

const RideRequestCard = ({ request, onClick, isAccepted }: any) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer" onClick={onClick}>
    <h3 className="font-semibold">{request.startLocationText} → {request.endLocationText}</h3>
    <p>Budget: ${request.budget}</p>
  </div>
);

const RideFilters = ({ filters, onFiltersChange, onReset }: any) => (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <p>Filters coming soon...</p>
    <button onClick={onReset} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Reset</button>
  </div>
);

const RideDetailModal = ({ item, isOpen, onClose, onBookRide, onAcceptOffer }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Ride Details</h2>
        <button onClick={onClose} className="float-right text-gray-500">×</button>
        <div className="mt-4">
          <button onClick={() => {
            if (onBookRide) onBookRide(item);
            if (onAcceptOffer) onAcceptOffer(item);
          }} className="w-full bg-blue-500 text-white py-2 rounded">
            {onBookRide ? 'Book Ride' : 'Accept Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface RideHubProps {
  rideListings: RideListing[];
  rideRequests?: RideRequest[];
}

type ViewMode = 'listings' | 'requests' | 'my-rides' | 'my-offers';

const RideHub: React.FC<RideHubProps> = ({ rideListings, rideRequests = [] }) => {
  const {
    filteredListings,
    filteredRequests,
    myRides,
    myAcceptedOffers,
    filters,
    setFilters,
    resetFilters,
    isLoading,
    error,
    bookRide,
    acceptOffer,
  } = useRideData(rideListings, rideRequests);

  const [activeView, setActiveView] = useState<ViewMode>('listings');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RideListing | RideRequest | null>(null);

  // View configurations
  const viewConfigs = {
    listings: {
      title: 'Available Rides',
      icon: Car,
      data: filteredListings,
      emptyMessage: 'No ride listings available',
      emptyDescription: 'Check back later or adjust your filters to see more options.',
    },
    requests: {
      title: 'Ride Requests',
      icon: Users,
      data: filteredRequests,
      emptyMessage: 'No ride requests found',
      emptyDescription: 'Be the first to help fellow travelers get to their destination.',
    },
    'my-rides': {
      title: 'My Booked Rides',
      icon: Calendar,
      data: myRides,
      emptyMessage: 'No booked rides',
      emptyDescription: 'Book your first ride to start your journey.',
    },
    'my-offers': {
      title: 'My Accepted Offers',
      icon: MapPin,
      data: myAcceptedOffers,
      emptyMessage: 'No accepted offers',
      emptyDescription: 'Accept ride requests to help others travel.',
    },
  };

  const currentConfig = viewConfigs[activeView];
  const IconComponent = currentConfig.icon;

  // Helper function to check if any filters are active
  const hasActiveFilters = (filters: FilterOptions) => {
    return filters.searchQuery !== '' ||
           filters.dateRange.start !== null ||
           filters.dateRange.end !== null ||
           filters.priceRange.min > 0 ||
           filters.priceRange.max < 1000 ||
           filters.seatsRange.min > 1 ||
           filters.seatsRange.max < 8 ||
           filters.sortBy !== 'date' ||
           filters.sortOrder !== 'asc';
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
    setSelectedItem(null);
  };

  const handleItemSelect = (item: RideListing | RideRequest) => {
    setSelectedItem(item);
  };

  const handleBookRide = async (listing: RideListing) => {
    try {
      await bookRide(listing);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to book ride:', error);
    }
  };

  const handleAcceptOffer = async (request: RideRequest) => {
    try {
      await acceptOffer(request);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to accept offer:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-background via-light-surface to-light-background dark:from-dark-background dark:via-dark-surface dark:to-dark-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
            RideShare Hub
          </h1>
          <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant text-lg">
            Find your perfect ride or help others reach their destination
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-2 shadow-sm border border-light-outline dark:border-dark-outline">
            <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
              {Object.entries(viewConfigs).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleViewChange(key as ViewMode)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                      activeView === key
                        ? 'bg-primary text-white shadow-lg transform scale-105'
                        : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{config.title}</span>
                    {key === 'my-rides' && myRides.length > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                        {myRides.length}
                      </span>
                    )}
                    {key === 'my-offers' && myAcceptedOffers.length > 0 && (
                      <span className="bg-primary text-white text-xs rounded-full px-2 py-1">
                        {myAcceptedOffers.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        {(activeView === 'listings' || activeView === 'requests') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="bg-light-surface dark:bg-dark-surface rounded-2xl p-6 shadow-sm border border-light-outline dark:border-dark-outline">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-on-surface-variant dark:text-dark-on-surface-variant w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by location or driver name..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-xl text-light-on-surface dark:text-dark-on-surface placeholder-light-on-surface-variant dark:placeholder-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  />
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    showFilters || hasActiveFilters(filters)
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-primary hover:text-white'
                  }`}
                >
                  <SlidersHorizontal size={18} />
                  <span>Filters</span>
                  <ChevronDown 
                    className={`transform transition-transform duration-200 ${
                      showFilters ? 'rotate-180' : ''
                    }`}
                    size={16}
                  />
                </button>
              </div>

              {/* Filters Panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 border-t border-light-outline dark:border-dark-outline pt-6"
                  >
                    <RideFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      onReset={resetFilters}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-error/10 border border-error/20 text-error rounded-2xl p-4"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Content Area */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : currentConfig.data.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 rounded-full bg-light-surface-variant dark:bg-dark-surface-variant flex items-center justify-center">
                  <IconComponent className="w-10 h-10 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
                {currentConfig.emptyMessage}
              </h3>
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant text-lg max-w-md mx-auto">
                {currentConfig.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentConfig.data.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {activeView === 'listings' || activeView === 'my-rides' ? (
                    <RideListingCard
                      listing={item as RideListing}
                      onClick={() => handleItemSelect(item)}
                      isBooked={myRides.some(ride => ride.id === item.id)}
                    />
                  ) : (
                    <RideRequestCard
                      request={item as RideRequest}
                      onClick={() => handleItemSelect(item)}
                      isAccepted={myAcceptedOffers.some(offer => offer.id === item.id)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <RideDetailModal
            item={selectedItem}
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            onBookRide={activeView === 'listings' ? handleBookRide : undefined}
            onAcceptOffer={activeView === 'requests' ? handleAcceptOffer : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Default filters for comparison
const defaultFilters: FilterOptions = {
  searchQuery: '',
  dateRange: { start: null, end: null },
  priceRange: { min: 0, max: 1000 },
  seatsRange: { min: 1, max: 8 },
  sortBy: 'date',
  sortOrder: 'asc',
};

export default RideHub;