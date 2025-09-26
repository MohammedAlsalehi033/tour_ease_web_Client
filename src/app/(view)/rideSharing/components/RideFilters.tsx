"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  ArrowUpDown, 
  RotateCcw,
  Clock,
  MapPin
} from 'lucide-react';
import { FilterOptions } from './hooks/useRideData';

interface RideFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions | ((prev: FilterOptions) => FilterOptions)) => void;
  onReset: () => void;
}

const RideFilters: React.FC<RideFiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  onReset 
}) => {
  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    onFiltersChange(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value || null
      }
    }));
  };

  const handleRangeChange = (
    type: 'priceRange' | 'seatsRange', 
    bound: 'min' | 'max', 
    value: number
  ) => {
    onFiltersChange(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [bound]: value
      }
    }));
  };

  const sortOptions = [
    { value: 'date', label: 'Departure Date' },
    { value: 'price', label: 'Price' },
    { value: 'seats', label: 'Available Seats' },
    { value: 'distance', label: 'Distance' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
          Filter & Sort Options
        </h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant rounded-lg hover:bg-error hover:text-white transition-colors duration-200"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Date Range
            </label>
          </div>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Start date"
            />
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="End date"
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Price Range ($)
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.priceRange.min}
                onChange={(e) => handleRangeChange('priceRange', 'min', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Min"
                min="0"
              />
              <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">to</span>
              <input
                type="number"
                value={filters.priceRange.max}
                onChange={(e) => handleRangeChange('priceRange', 'max', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Max"
                min="0"
              />
            </div>
            {/* Price Range Slider */}
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange.max}
                onChange={(e) => handleRangeChange('priceRange', 'max', Number(e.target.value))}
                className="w-full h-2 bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                <span>$0</span>
                <span>$1000+</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seats Range Filter */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Seats Available
            </label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.seatsRange.min}
                onChange={(e) => handleRangeChange('seatsRange', 'min', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Min"
                min="1"
                max="8"
              />
              <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">to</span>
              <input
                type="number"
                value={filters.seatsRange.max}
                onChange={(e) => handleRangeChange('seatsRange', 'max', Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Max"
                min="1"
                max="8"
              />
            </div>
            {/* Seats Quick Select */}
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(seats => (
                <button
                  key={seats}
                  onClick={() => handleRangeChange('seatsRange', 'min', seats)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors duration-200 ${
                    filters.seatsRange.min === seats
                      ? 'bg-primary text-white'
                      : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-primary hover:text-white'
                  }`}
                >
                  {seats}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Sort By
            </label>
          </div>
          <div className="space-y-2">
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('sortOrder', 'asc')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  filters.sortOrder === 'asc'
                    ? 'bg-primary text-white'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-primary hover:text-white'
                }`}
              >
                Low to High
              </button>
              <button
                onClick={() => handleFilterChange('sortOrder', 'desc')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  filters.sortOrder === 'desc'
                    ? 'bg-primary text-white'
                    : 'bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-primary hover:text-white'
                }`}
              >
                High to Low
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Quick Filters
            </label>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => handleDateRangeChange('start', new Date().toISOString().split('T')[0])}
              className="w-full px-3 py-2 text-sm bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Today & Later
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateRangeChange('start', tomorrow.toISOString().split('T')[0]);
              }}
              className="w-full px-3 py-2 text-sm bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Tomorrow & Later
            </button>
            <button
              onClick={() => {
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                handleDateRangeChange('start', new Date().toISOString().split('T')[0]);
                handleDateRangeChange('end', nextWeek.toISOString().split('T')[0]);
              }}
              className="w-full px-3 py-2 text-sm bg-light-surface-variant dark:bg-dark-surface-variant text-light-on-surface-variant dark:text-dark-on-surface-variant rounded-lg hover:bg-primary hover:text-white transition-colors duration-200"
            >
              Next 7 Days
            </button>
          </div>
        </div>

        {/* Distance Filter (Future enhancement) */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface">
              Distance
            </label>
          </div>
          <div className="space-y-2">
            <select
              className="w-full px-3 py-2 bg-light-surface-variant dark:bg-dark-surface-variant border border-light-outline dark:border-dark-outline rounded-lg text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled
            >
              <option>Any distance</option>
              <option>Under 50 km</option>
              <option>50-100 km</option>
              <option>100-200 km</option>
              <option>200+ km</option>
            </select>
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Coming soon - location-based filtering
            </p>
          </div>
        </div>
      </div>

      {/* Filter Summary */}
      <div className="bg-light-surface-variant dark:bg-dark-surface-variant rounded-lg p-4">
        <h4 className="text-sm font-medium text-light-on-surface dark:text-dark-on-surface mb-2">
          Active Filters Summary
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          {filters.searchQuery && (
            <span className="bg-primary text-white px-2 py-1 rounded-full">
              Search: "{filters.searchQuery}"
            </span>
          )}
          {(filters.dateRange.start || filters.dateRange.end) && (
            <span className="bg-primary text-white px-2 py-1 rounded-full">
              Date: {filters.dateRange.start || 'Any'} to {filters.dateRange.end || 'Any'}
            </span>
          )}
          {(filters.priceRange.min > 0 || filters.priceRange.max < 1000) && (
            <span className="bg-primary text-white px-2 py-1 rounded-full">
              Price: ${filters.priceRange.min}-${filters.priceRange.max}
            </span>
          )}
          {(filters.seatsRange.min > 1 || filters.seatsRange.max < 8) && (
            <span className="bg-primary text-white px-2 py-1 rounded-full">
              Seats: {filters.seatsRange.min}-{filters.seatsRange.max}
            </span>
          )}
          <span className="bg-secondary text-white px-2 py-1 rounded-full">
            Sort: {sortOptions.find(o => o.value === filters.sortBy)?.label} ({filters.sortOrder === 'asc' ? '↑' : '↓'})
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RideFilters;