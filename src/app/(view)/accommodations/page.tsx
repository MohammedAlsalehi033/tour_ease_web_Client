"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Banknote
} from 'lucide-react';

const AccommodationsPage = () => {
  // Dummy data for accommodations
  const dummyAccommodations = [
    {
      id: 1,
      name: "Luxury Beach Resort",
      location: "Karachi, Pakistan",
      price: 15000,
      rating: 4.8,
      reviews: 245,
      amenities: ["wifi", "pool", "restaurant", "parking"],
      type: "Resort",
      description: "Stunning beachfront resort with world-class amenities"
    },
    {
      id: 2,
      name: "Mountain View Hotel",
      location: "Islamabad, Pakistan", 
      price: 8500,
      rating: 4.6,
      reviews: 189,
      amenities: ["wifi", "restaurant", "parking"],
      type: "Hotel",
      description: "Peaceful retreat with breathtaking mountain views"
    },
    {
      id: 3,
      name: "Heritage Palace",
      location: "Lahore, Pakistan",
      price: 12000,
      rating: 4.9,
      reviews: 334,
      amenities: ["wifi", "restaurant", "parking"],
      type: "Palace",
      description: "Historic palace converted into luxury accommodation"
    },
    {
      id: 4,
      name: "Desert Safari Lodge",
      location: "Bahawalpur, Pakistan",
      price: 6500,
      rating: 4.4,
      reviews: 156,
      amenities: ["wifi", "restaurant"],
      type: "Lodge",
      description: "Authentic desert experience with modern comforts"
    },
    {
      id: 5,
      name: "City Center Apartments",
      location: "Faisalabad, Pakistan",
      price: 4500,
      rating: 4.2,
      reviews: 98,
      amenities: ["wifi", "parking"],
      type: "Apartment",
      description: "Modern apartments in the heart of the city"
    },
    {
      id: 6,
      name: "Riverside Resort",
      location: "Skardu, Pakistan",
      price: 9500,
      rating: 4.7,
      reviews: 203,
      amenities: ["wifi", "restaurant", "pool"],
      type: "Resort",
      description: "Serene riverside location with adventure activities"
    }
  ];

  const amenityIcons = {
    wifi: Wifi,
    pool: Waves,
    restaurant: Utensils,
    parking: Car
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background">
      {/* Hero Section */}
      <div className="relative h-48 lg:h-64 bg-gradient-to-r from-primary to-primary-variant">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg opacity-90">
              Discover amazing accommodations across Pakistan
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white dark:bg-dark-surface shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-light-surface dark:bg-dark-surface-variant rounded-lg p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Where to?"
                    className="w-full pl-9 pr-3 py-2 rounded border border-light-outline dark:border-dark-outline bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Check-in
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 rounded border border-light-outline dark:border-dark-outline bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Check-out
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2 rounded border border-light-outline dark:border-dark-outline bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium mb-1 text-light-on-surface dark:text-dark-on-surface">
                  Guests
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                  <select className="w-full pl-9 pr-3 py-2 rounded border border-light-outline dark:border-dark-outline bg-white dark:bg-dark-surface focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none">
                    <option>2 Guests</option>
                    <option>1 Guest</option>
                    <option>3 Guests</option>
                    <option>4+ Guests</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-primary text-white px-6 py-2 rounded font-semibold hover:bg-primary-variant transition-colors duration-200 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-light-on-surface dark:text-dark-on-surface mb-1">
            Featured Accommodations
          </h2>
          <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {dummyAccommodations.length} properties available
          </p>
        </div>

        {/* Accommodations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyAccommodations.map((accommodation, index) => (
            <motion.div
              key={accommodation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white dark:bg-dark-surface rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              <div className="relative h-48">
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary-variant/20 flex items-center justify-center">
                  <div className="text-center text-primary">
                    <Shield className="w-12 h-12 mx-auto mb-2" />
                    <p className="text-sm">Image Placeholder</p>
                  </div>
                </div>
                
                <button className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-dark-surface/80 rounded-full hover:bg-white dark:hover:bg-dark-surface transition-colors">
                  <Heart className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-error" />
                </button>

                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                  {accommodation.type}
                </div>
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface group-hover:text-primary transition-colors">
                    {accommodation.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                      {accommodation.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{accommodation.location}</span>
                </div>

                <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm mb-3">
                  {accommodation.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {accommodation.amenities.map((amenity) => {
                    const IconComponent = amenityIcons[amenity as keyof typeof amenityIcons] || Shield;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center space-x-1 bg-light-surface dark:bg-dark-surface-variant px-2 py-1 rounded text-xs"
                      >
                        <IconComponent className="w-3 h-3 text-primary" />
                        <span className="capitalize text-light-on-surface dark:text-dark-on-surface">
                          {amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <Banknote className="w-4 h-4 mr-1 text-primary" />
                      <span className="text-xl font-bold text-primary">
                        PKR {accommodation.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      per night • {accommodation.reviews} reviews
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-variant transition-colors text-sm"
                  >
                    View
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-r from-primary/10 to-primary-variant/10 rounded-lg p-6"
          >
            <Shield className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="text-xl font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
              Coming Soon
            </h3>
            <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-xl mx-auto">
              Full accommodation booking functionality is under development. Stay tuned for our complete booking system!
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationsPage;
