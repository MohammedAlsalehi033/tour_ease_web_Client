"use client";

import React, { useState } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review, ReviewStats } from '@/app/(model)/review/reviewModel';
import RatingDisplay from './RatingDisplay';

interface DriverReviewsCompactProps {
  driverId: string;
  driverName: string;
  className?: string;
  showStats?: boolean;
  maxReviews?: number;
}

const DriverReviewsCompact: React.FC<DriverReviewsCompactProps> = ({ 
  driverId, 
  driverName,
  className = '',
  showStats = true,
  maxReviews = 3
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  React.useEffect(() => {
    fetchDriverReviews();
  }, [driverId]);

  const fetchDriverReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      
      // Fetch reviews for this driver (assuming they're reviews for transportation bookings)
      const reviewsResponse = await reviewController.getReviewsByReviewer(driverId, {
        limit: showAll ? 10 : maxReviews
      });
      
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
      }

      // Fetch stats for this driver
      if (showStats) {
        const statsResponse = await reviewController.getReviewStats('TRANSPORTATION_PROVIDER', parseInt(driverId));
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getReviewableTitle = (review: Review) => {
    if (review.transportationListing) {
      return `${review.transportationListing.startLocationText} → ${review.transportationListing.endLocationText}`;
    }
    if (review.transportationBooking) {
      return `${review.transportationBooking.startLocationText} → ${review.transportationBooking.endLocationText}`;
    }
    return 'Transportation Service';
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || (!stats && reviews.length === 0)) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-2">
          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            No reviews yet
          </p>
        </div>
      </div>
    );
  }

  const displayReviews = expanded ? reviews : reviews.slice(0, maxReviews);
  const hasMoreReviews = reviews.length > maxReviews;

  return (
    <div className={`${className}`}>
      {/* Stats Summary */}
      {showStats && stats && stats.totalReviews > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            <RatingDisplay rating={stats.averageRating} size="sm" showNumber={true} />
            <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              ({stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''})
            </span>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-2">
          {displayReviews.map((review) => (
            <div key={review.id} className="bg-light-surface-variant/30 dark:bg-dark-surface-variant/30 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
                  <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                <span className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {getReviewableTitle(review)}
                </span>
              </div>
              
              <p className="text-body-sm text-light-on-surface dark:text-dark-on-surface line-clamp-2">
                {review.comment}
              </p>
            </div>
          ))}

          {/* Show More/Less Button */}
          {hasMoreReviews && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 py-2 text-body-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {reviews.length - maxReviews} More Review{reviews.length - maxReviews !== 1 ? 's' : ''}
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverReviewsCompact;
