"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Star, MessageSquare, ChevronDown, ChevronUp, User, Calendar } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review, ReviewStats } from '@/app/(model)/review/reviewModel';
import RatingDisplay from './RatingDisplay';

interface DriverReviewsCompactOptimizedProps {
  driverId: string | undefined;
  driverName: string;
  className?: string;
  showStats?: boolean;
  maxReviews?: number;
  preloadedStats?: ReviewStats | null; // Accept preloaded stats to avoid duplicate requests
}

// Cache for driver reviews to prevent duplicate requests
const driverReviewsCache = new Map<string, { data: Review[]; stats: ReviewStats | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const DriverReviewsCompactOptimized: React.FC<DriverReviewsCompactOptimizedProps> = ({ 
  driverId, 
  driverName,
  className = '',
  showStats = true,
  maxReviews = 3,
  preloadedStats = null
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(preloadedStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  // Memoize cache key
  const cacheKey = useMemo(() => `driver-${driverId}`, [driverId]);

  const fetchDriverReviews = useCallback(async () => {
    if (!driverId || dataFetched) return;

    // Check cache first
    const cached = driverReviewsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setReviews(cached.data);
      if (!preloadedStats) {
        setStats(cached.stats);
      }
      setDataFetched(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      
      // Fetch reviews for this driver
      const reviewsResponse = await reviewController.getReviewsForItem('TRANSPORTATION_PROVIDER', driverId);
      
      let fetchedReviews: Review[] = [];
      let fetchedStats: ReviewStats | null = null;

      if (reviewsResponse.success) {
        fetchedReviews = reviewsResponse.data?.reviews || [];
        setReviews(fetchedReviews);
      }

      // Only fetch stats if not preloaded and showStats is true
      if (showStats && !preloadedStats) {
        const statsResponse = await reviewController.getReviewStats('TRANSPORTATION_PROVIDER', driverId);
        if (statsResponse.success) {
          fetchedStats = statsResponse.data;
          setStats(fetchedStats);
        }
      }

      // Cache the results
      driverReviewsCache.set(cacheKey, {
        data: fetchedReviews,
        stats: preloadedStats || fetchedStats,
        timestamp: Date.now()
      });

      setDataFetched(true);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  }, [driverId, cacheKey, showStats, preloadedStats, dataFetched]);

  // Only fetch when component becomes visible (intersection observer could be added here)
  React.useEffect(() => {
    if (driverId && !dataFetched) {
      fetchDriverReviews();
    }
  }, [driverId, dataFetched, fetchDriverReviews]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getReviewableTitle = useCallback((review: Review) => {
    if (review.transportationListing) {
      return `${review.transportationListing.startLocationText} → ${review.transportationListing.endLocationText}`;
    }
    if (review.transportationBooking) {
      return `${review.transportationBooking.startLocationText} → ${review.transportationBooking.endLocationText}`;
    }
    return 'Transportation Service';
  }, []);

  // Memoize display reviews
  const displayReviews = useMemo(() => {
    return expanded ? reviews : reviews.slice(0, maxReviews);
  }, [reviews, expanded, maxReviews]);

  const hasMoreReviews = useMemo(() => {
    return reviews.length > maxReviews;
  }, [reviews.length, maxReviews]);

  // Early return conditions
  if (!driverId) {
    return null;
  }

  if (loading && !dataFetched) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || (!stats && reviews.length === 0 && dataFetched)) {
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

export default DriverReviewsCompactOptimized;