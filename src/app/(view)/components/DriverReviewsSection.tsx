"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, MapPin, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review, ReviewStats } from '@/app/(model)/review/reviewModel';
import RatingDisplay from './RatingDisplay';

interface DriverReviewsSectionProps {
  driverId: string;
  driverName: string;
  className?: string;
}

const DriverReviewsSection: React.FC<DriverReviewsSectionProps> = ({ 
  driverId, 
  driverName,
  className = ''
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest_rating' | 'lowest_rating'>('newest');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchDriverReviews();
    fetchStats();
  }, [driverId, sortBy, page]);

  const fetchDriverReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      
      // Get reviews where this driver is the reviewer (reviews they wrote)
      const reviewsResponse = await reviewController.getReviewsByReviewer(driverId, {
        page,
        limit: showAll ? 20 : limit
      });
      
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data);
      } else {
        setError(reviewsResponse.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const reviewController = container.resolve(ReviewController);
      const statsResponse = await reviewController.getReviewStats('TRANSPORTATION_PROVIDER', parseInt(driverId));
      
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch review stats:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
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

  const sortReviews = (reviews: Review[]) => {
    return [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest_rating':
          return b.rating - a.rating;
        case 'lowest_rating':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedReviews = sortReviews(reviews);
  const displayReviews = showAll ? sortedReviews : sortedReviews.slice(0, limit);

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
          Reviews by {driverName}
        </h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-body-sm border border-light-outline dark:border-dark-outline rounded px-2 py-1 bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest_rating">Highest Rating</option>
              <option value="lowest_rating">Lowest Rating</option>
            </select>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="card p-4 mb-6 bg-light-surface-variant/30 dark:bg-dark-surface-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <RatingDisplay rating={stats.averageRating} size="lg" showNumber={true} />
              <div>
                <p className="text-body-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                  {stats.averageRating.toFixed(1)} out of 5
                </p>
                <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="hidden md:block space-y-1">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating.toString()] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 w-32">
                    <span className="text-body-sm text-light-on-surface dark:text-dark-on-surface w-3">
                      {rating}
                    </span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant w-4">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-700 dark:text-red-300 text-body-sm">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare className="w-12 h-12 text-light-on-surface-variant dark:text-dark-on-surface-variant mx-auto mb-3" />
          <h4 className="text-body-lg font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
            No reviews yet
          </h4>
          <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {driverName} hasn't written any reviews yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayReviews.map((review) => (
            <div key={review.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                      {getReviewableTitle(review)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
                  <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              
              <p className="text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}

          {/* Show More/Less Button */}
          {reviews.length > limit && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="btn-outlined flex items-center gap-2 mx-auto"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All Reviews ({reviews.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverReviewsSection;
