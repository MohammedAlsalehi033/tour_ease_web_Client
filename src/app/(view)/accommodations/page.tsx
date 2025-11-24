"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Wifi,
  Car,
  Utensils,
  Waves,
  Shield,
  Banknote,
  Loader2,
  User
} from 'lucide-react';
import { container } from '@/app/lib/diContainer';
import { AccommodationController } from '@/app/(controller)/accommodation/accommodationController';
import { Accommodation } from '@/app/(model)/accommodation/accommodationModel';
import { normalizeImageUrl, DEFAULT_IMAGE_PLACEHOLDER } from '@/app/lib/mediaUtils';

const SafeAccommodationImage = ({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) => {
  const [currentSrc, setCurrentSrc] = useState(src ?? DEFAULT_IMAGE_PLACEHOLDER);

  useEffect(() => {
    setCurrentSrc(src ?? DEFAULT_IMAGE_PLACEHOLDER);
  }, [src]);

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
      onError={() => {
        if (currentSrc !== DEFAULT_IMAGE_PLACEHOLDER) {
          setCurrentSrc(DEFAULT_IMAGE_PLACEHOLDER);
        }
      }}
    />
  );
};

const AccommodationsPage = () => {
  // State management
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filter states
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [budget, setBudget] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Get controller instance
  const accommodationController = container.resolve(AccommodationController);

  // Fetch accommodations
  const fetchAccommodations = useCallback(async (page = 1, locationFilter = '') => {
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (locationFilter.trim()) {
        result = await accommodationController.searchAccommodationsByLocation(
          locationFilter,
          page,
          6
        );
      } else {
        result = await accommodationController.getAllAccommodations({
          page,
          pageSize: 6
        });
      }

      if (result.success && result.data) {
        // API returns data as array directly, with pagination separate
        setAccommodations(result.data);
        setTotal(result.pagination.total);
        setCurrentPage(result.pagination.page);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (err: any) {
      console.error('Error fetching accommodations:', err);
      setError(err.message || 'Failed to load accommodations');
      setAccommodations([]);
    } finally {
      setLoading(false);
    }
  }, [accommodationController]);

  // Initial load
  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  // Handle search
  const handleSearch = () => {
    setSearchLocation(location);
    setCurrentPage(1);
    fetchAccommodations(1, location);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchAccommodations(page, searchLocation);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get price from rooms
  const getMinPrice = (accommodation: Accommodation): number => {
    if (!accommodation.rooms || accommodation.rooms.length === 0) return 0;
    return Math.min(...accommodation.rooms.map(room => parseFloat(room.pricePerNight.toString())));
  };

  const amenityIcons = {
    wifi: Wifi,
    pool: Waves,
    restaurant: Utensils,
    parking: Car
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Hero Section */}
      <div className="relative h-24 sm:h-32 lg:h-40 bg-light-surface dark:bg-dark-surface border-b border-light-outline dark:border-dark-outline">
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-light-on-surface dark:text-dark-on-surface"
          >
            <h1 className="font-display text-headline-md sm:text-headline-lg lg:text-headline-xl font-bold mb-1 sm:mb-2">
              Find Your Perfect Stay
            </h1>
            <p className="text-body-sm sm:text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Discover amazing accommodations across Pakistan
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-light-surface dark:bg-dark-surface shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              <div className="relative">
                <label className="block font-display text-body-xs sm:text-body-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input w-full pl-8 sm:pl-9 pr-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block font-display text-body-xs sm:text-body-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="date"
                    value={checkIn}
                    min={today}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      // If check-out is before new check-in, clear it
                      if (checkOut && e.target.value > checkOut) {
                        setCheckOut('');
                      }
                    }}
                    className="input w-full pl-8 sm:pl-9 pr-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block font-display text-body-xs sm:text-body-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                  type="date"
                  value={checkOut}
                  min={
                    checkIn
                    ? new Date(Date.parse(checkIn) + 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0]
                    : today
                  }
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="input w-full pl-8 sm:pl-9 pr-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block font-display text-body-xs sm:text-body-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-3 h-3 sm:w-4 sm:h-4" />
                  <select 
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="input w-full pl-8 sm:pl-9 pr-3 py-2 text-sm sm:text-base appearance-none"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label className="block font-display text-body-xs sm:text-body-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Budget (PKR/night)
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-3 h-3 sm:w-4 sm:h-4" />
                  <input
                    type="number"
                    placeholder="Max price"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="input w-full pl-8 sm:pl-9 pr-3 py-2 text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex justify-center sm:justify-start">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary px-4 sm:px-6 py-2 rounded-lg font-medium flex items-center space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="mb-3 sm:mb-4">
          <h2 className="font-display text-headline-md sm:text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface mb-1">
            {searchLocation ? `Accommodations in ${searchLocation}` : 'Featured Accommodations'}
          </h2>
          <p className="text-body-sm sm:text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {loading ? 'Loading...' : `${total} properties available`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card shadow-lg rounded-lg border border-error/20 bg-error/10 p-4 mb-6"
          >
            <div className="text-center">
              <Shield className="w-10 h-10 mx-auto mb-3 text-error" />
              <h3 className="font-display text-headline-sm font-bold text-error mb-2">
                Error Loading Accommodations
              </h3>
              <p className="text-body-sm text-light-on-surface dark:text-dark-on-surface">
                {error}
              </p>
              <button
                onClick={() => fetchAccommodations(currentPage, searchLocation)}
                className="btn-primary mt-4 px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline overflow-hidden animate-pulse">
                <div className="h-32 sm:h-40 bg-light-surface-variant dark:bg-dark-surface-variant" />
                <div className="p-3 sm:p-4 space-y-3">
                  <div className="h-6 bg-light-surface-variant dark:bg-dark-surface-variant rounded" />
                  <div className="h-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded w-3/4" />
                  <div className="h-4 bg-light-surface-variant dark:bg-dark-surface-variant rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accommodations Grid */}
        {!loading && !error && accommodations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {accommodations.map((accommodation, index) => {
              const minPrice = getMinPrice(accommodation);
              const amenities = ['wifi', 'restaurant', 'parking', 'pool']; // Default amenities
              
              // Check if any rooms can accommodate the guests
              const guestCount = parseInt(guests.split(' ')[0]) || 2;
              const maxRoomCapacity = accommodation.rooms && accommodation.rooms.length > 0
                ? Math.max(...accommodation.rooms.map(room => room.capacity))
                : 0;
              const needsMultipleRooms = maxRoomCapacity > 0 && guestCount > maxRoomCapacity;
              
              // Check budget
              const exceedsBudget = budget && minPrice > parseFloat(budget);
              
              return (
                <motion.div
                  key={accommodation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline overflow-hidden group"
                >
                    <div className="relative h-32 sm:h-40">
                    {accommodation.mediaUrls && accommodation.mediaUrls.length > 0 ? (
                      <SafeAccommodationImage
                        src={normalizeImageUrl(accommodation.mediaUrls[0])}
                        alt={accommodation.name}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-variant/20 flex items-center justify-center">
                        <div className="text-center text-primary">
                          <Shield className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1" />
                          <p className="text-xs sm:text-sm">No Image</p>
                        </div>
                      </div>
                    )}

                    <button className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-dark-surface/80 rounded-full hover:bg-white dark:hover:bg-dark-surface transition-colors">
                      <Heart className="w-3 h-3 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-error" />
                    </button>

                    <div className="absolute bottom-2 left-2 flex gap-1 flex-wrap">
                      {accommodation.rooms && accommodation.rooms.length > 0 && (
                        <div className="bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium">
                          {accommodation.rooms.length} Room{accommodation.rooms.length > 1 ? 's' : ''}
                        </div>
                      )}
                      {needsMultipleRooms && (
                        <div className="bg-warning/90 text-black px-2 py-0.5 rounded text-xs font-medium">
                          Multiple rooms needed
                        </div>
                      )}
                      {exceedsBudget && (
                        <div className="bg-error/90 text-white px-2 py-0.5 rounded text-xs font-medium">
                          Over budget
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4">
                    {/* Host Avatar Section */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="relative">
                        {accommodation.provider?.mediaUrls && accommodation.provider.mediaUrls.length > 0 ? (
                          <img
                            src={normalizeImageUrl(accommodation.provider.mediaUrls[0])}
                            alt="Host"
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary/20"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 ${accommodation.provider?.mediaUrls && accommodation.provider.mediaUrls.length > 0 ? 'hidden' : ''}`}>
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                          Hosted by {accommodation.provider?.accommodationName || 'Host'}
                        </p>
                        <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          Property owner
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                      <h3 className="font-display text-headline-sm sm:text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface group-hover:text-primary transition-colors mb-1 sm:mb-0">
                        {accommodation.name}
                      </h3>
                      {accommodation.averageRating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-warning text-warning" />
                          <span className="text-body-xs sm:text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                            {accommodation.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                      <span className="text-body-xs sm:text-body-sm truncate">{accommodation.location}</span>
                    </div>

                    <p className="text-body-xs sm:text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-3 line-clamp-2">
                      {accommodation.description}
                    </p>

                    {/* Amenities Grid */}
                    <div className="grid grid-cols-2 gap-1.5 mb-3">
                      {amenities.slice(0, 4).map((amenity) => {
                        const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Shield;
                        return (
                          <div
                            key={amenity}
                            className="flex items-center space-x-1.5 bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 px-2 py-1.5 rounded-md"
                          >
                            <IconComponent className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-body-xs text-light-on-surface dark:text-dark-on-surface capitalize truncate">
                              {amenity}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                      <div>
                        {minPrice > 0 && (
                          <>
                            <div className="flex items-center mb-0.5">
                              <Banknote className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary flex-shrink-0" />
                              <span className="font-display text-headline-sm font-bold text-primary">
                                PKR {minPrice.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                              per night {accommodation.reviewCount ? `• ${accommodation.reviewCount} reviews` : ''}
                            </p>
                          </>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (searchLocation) params.set('location', searchLocation);
                          if (checkIn) params.set('checkIn', checkIn);
                          if (checkOut) params.set('checkOut', checkOut);
                          if (guests) params.set('guests', guests);
                          if (budget) params.set('budget', budget);
                          window.location.href = `/accommodations/${accommodation.id}?${params.toString()}`;
                        }}
                        className="btn-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-body-xs sm:text-body-sm w-full sm:w-auto"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && accommodations.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card shadow-lg rounded-lg border border-light-outline dark:border-dark-outline p-8 text-center"
          >
            <Shield className="w-16 h-16 mx-auto mb-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            <h3 className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
              No Accommodations Found
            </h3>
            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-4">
              {searchLocation 
                ? `No accommodations found in ${searchLocation}. Try searching for a different location.`
                : 'No accommodations available at the moment.'}
            </p>
            {searchLocation && (
              <button
                onClick={() => {
                  setLocation('');
                  setSearchLocation('');
                  fetchAccommodations(1, '');
                }}
                className="btn-primary px-6 py-2 rounded-lg"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {!loading && !error && accommodations.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      currentPage === pageNum
                        ? 'btn-primary'
                        : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface dark:text-dark-on-surface hover:bg-primary/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="mt-6 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card shadow-lg rounded-lg border border-primary/20 bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 p-3 sm:p-4"
          >
            <div className="text-center">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 text-primary" />
              <h3 className="font-display text-headline-sm sm:text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface mb-1 sm:mb-2">
                Coming Soon
              </h3>
              <p className="text-body-xs sm:text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-xl mx-auto">
                Full accommodation booking functionality is under development. Stay tuned for our complete booking system!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationsPage;
