"use client";

import React, { useState, useEffect } from 'react';
import { Star, Search, Filter, MessageSquare, User, Calendar } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review, ReviewFilters } from '@/app/(model)/review/reviewModel';
import RatingDisplay from '../components/RatingDisplay';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFilters>({
    page: 1,
    limit: 10,
    sort: 'newest'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      
      let response;
      if (searchQuery.trim()) {
        response = await reviewController.searchReviews(searchQuery.trim(), {
          page: filters.page,
          limit: filters.limit
        });
      } else {
        response = await reviewController.getReviews(filters);
      }
      
      if (response.success) {
        setReviews(response.data);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchReviews();
  };

  const handleFilterChange = (key: keyof ReviewFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
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
    return `${review.reviewableType} #${review.reviewableId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-sm font-bold text-light-on-background dark:text-dark-on-background mb-2">
            Reviews
          </h1>
          <p className="text-body-lg text-light-on-background/70 dark:text-dark-on-background/70">
            Read what our users have to say about their experiences
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-on-surface-variant dark:text-dark-on-surface-variant w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-light-outline dark:border-dark-outline rounded-lg bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Sort Filter */}
            <div className="flex gap-2">
              <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-3 py-2 border border-light-outline dark:border-dark-outline rounded-lg bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_rating">Highest Rating</option>
                <option value="lowest_rating">Lowest Rating</option>
              </select>

              <button
                onClick={handleSearch}
                className="btn-primary px-4 py-2 flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="card p-6 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="card p-12 text-center">
            <MessageSquare className="w-16 h-16 text-light-on-surface-variant dark:text-dark-on-surface-variant mx-auto mb-4" />
            <h3 className="text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
              No reviews found
            </h3>
            <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {searchQuery ? 'Try adjusting your search criteria' : 'Be the first to leave a review!'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {review.reviewer?.mediaUrls?.[0] ? (
                      <img
                        src={review.reviewer.mediaUrls[0]}
                        alt={review.reviewer.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-body-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {review.reviewer?.username || 'Anonymous'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <RatingDisplay rating={review.rating} size="sm" showNumber={true} />
                        <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {review.reviewableType.replace('_', ' ')}
                    </p>
                    <p className="text-body-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                      {getReviewableTitle(review)}
                    </p>
                  </div>
                </div>

                <p className="text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsPage;
