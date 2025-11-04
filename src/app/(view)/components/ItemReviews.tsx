"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review, ReviewStats } from '@/app/(model)/review/reviewModel';
import RatingDisplay from './RatingDisplay';

interface ItemReviewsProps {
  reviewableType: string;
  reviewableId: number;
  className?: string;
}

const ItemReviews: React.FC<ItemReviewsProps> = ({ 
  reviewableType, 
  reviewableId, 
  className = '' 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [reviewableType, reviewableId, page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      const response = await reviewController.getReviewsForItem(reviewableType, reviewableId, {
        page,
        limit: showAll ? limit : 3
      });
      
      if (response.success) {
        setReviews(response.data.reviews);
      } else {
        setError(response.message || 'Failed to fetch reviews');
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
      const response = await reviewController.getReviewStats(reviewableType, reviewableId);
      
      if (response.success) {
        setStats(response.data);
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

  const toggleShowAll = () => {
    setShowAll(!showAll);
    setPage(1);
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="text-center p-4 text-red-600 dark:text-red-400">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center p-6">
          <MessageSquare className="w-12 h-12 text-light-on-surface-variant dark:text-dark-on-surface-variant mx-auto mb-3" />
          <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            No reviews yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Stats Summary */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <RatingDisplay rating={stats.averageRating} size="md" showNumber={true} />
          <span className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
          </span>
        </div>
        
        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating.toString()] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-body-sm text-light-on-surface dark:text-dark-on-surface w-4">
                  {rating}
                </span>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant w-8">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-light-outline dark:border-dark-outline pb-4 last:border-b-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                {review.reviewer?.mediaUrls?.[0] ? (
                  <img
                    src={review.reviewer.mediaUrls[0]}
                    alt={review.reviewer.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <div>
                  <h4 className="text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                    {review.reviewer?.username || 'Anonymous'}
                  </h4>
                  <div className="flex items-center gap-2">
                    <RatingDisplay rating={review.rating} size="sm" showNumber={false} />
                    <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Show More/Less Button */}
      {stats.totalReviews > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={toggleShowAll}
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
                Show All Reviews ({stats.totalReviews})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemReviews;
