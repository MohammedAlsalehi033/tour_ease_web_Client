"use client";

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Calendar, Edit, Trash2, MapPin } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { Review } from '@/app/(model)/review/reviewModel';
import RatingDisplay from '../components/RatingDisplay';

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      const response = await reviewController.getMyReviews({ limit: 50 });
      
      if (response.success) {
        setReviews(response.data);
      } else {
        setError(response.message || 'Failed to fetch your reviews');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const reviewController = container.resolve(ReviewController);
      const response = await reviewController.updateReview(editingReview.id, {
        rating: editRating,
        comment: editComment
      });

      if (response.success) {
        // Update the review in the list
        setReviews(prev => prev.map(review => 
          review.id === editingReview.id ? response.data : review
        ));
        setEditingReview(null);
        setEditRating(0);
        setEditComment('');
      } else {
        setError(response.message || 'Failed to update review');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const reviewController = container.resolve(ReviewController);
      const response = await reviewController.deleteReview(reviewId);

      if (response.success) {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        setError(response.message || 'Failed to delete review');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete review');
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
    return `${review.reviewableType.replace('_', ' ')} #${review.reviewableId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light-background dark:bg-dark-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display-sm font-bold text-light-on-background dark:text-dark-on-background mb-2">
            My Reviews
          </h1>
          <p className="text-body-lg text-light-on-background/70 dark:text-dark-on-background/70">
            Manage your reviews and ratings
          </p>
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
              No reviews yet
            </h3>
            <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              You haven't written any reviews yet. Complete a trip to leave your first review!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="card p-6">
                {editingReview?.id === review.id ? (
                  /* Edit Mode */
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                        {getReviewableTitle(review)}
                      </span>
                    </div>

                    {/* Rating */}
                    <div>
                      <label className="block text-body-md font-medium text-light-on-surface dark:text-dark-on-surface mb-2">
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setEditRating(star)}
                            className="p-1 transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= editRating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-body-md font-medium text-light-on-surface dark:text-dark-on-surface mb-2">
                        Comment
                      </label>
                      <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full p-3 border border-light-outline dark:border-dark-outline rounded-lg bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        rows={4}
                        maxLength={500}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateReview}
                        className="btn-primary px-4 py-2"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingReview(null);
                          setEditRating(0);
                          setEditComment('');
                        }}
                        className="btn-outlined px-4 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-body-md font-medium text-light-on-surface dark:text-dark-on-surface">
                          {getReviewableTitle(review)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReview(review)}
                          className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors"
                        >
                          <Edit className="w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <RatingDisplay rating={review.rating} size="md" showNumber={true} />
                      <span className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <p className="text-body-md text-light-on-surface dark:text-dark-on-surface leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;
