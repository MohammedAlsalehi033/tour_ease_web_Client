"use client";

import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number;
  showNumber?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ 
  rating, 
  showNumber = true, 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Create full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={i} 
        className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} 
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={`${sizeClasses[size]} text-gray-300`} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
        </div>
      </div>
    );
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star 
        key={`empty-${i}`} 
        className={`${sizeClasses[size]} text-gray-300`} 
      />
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center">
        {stars}
      </div>
      {showNumber && (
        <span className={`${textSizeClasses[size]} text-light-on-surface-variant dark:text-dark-on-surface-variant ml-1`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
