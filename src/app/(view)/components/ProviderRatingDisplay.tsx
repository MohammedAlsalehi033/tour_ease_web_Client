"use client";

import React from 'react';
import { useReviewStats } from './useReviewStats';
import RatingDisplay from './RatingDisplay';

interface ProviderRatingDisplayProps {
  providerId: string;
  className?: string;
}

const ProviderRatingDisplay: React.FC<ProviderRatingDisplayProps> = ({ 
  providerId, 
  className = '' 
}) => {
  const { stats, loading, error } = useReviewStats('TRANSPORTATION_PROVIDER', providerId);
    console.log(stats, loading, error);
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="animate-pulse flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
        </div>
        <div className="w-8 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error || !stats || stats.totalReviews === 0) {
    return (
      <div className={`text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant ${className}`}>
        No reviews yet
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <RatingDisplay 
        rating={stats.averageRating} 
        size="sm" 
        showNumber={true}
      />
      <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
        ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
      </span>
    </div>
  );
};

export default ProviderRatingDisplay;
