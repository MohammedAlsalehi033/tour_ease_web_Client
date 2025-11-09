"use client";

import React, { useState } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  reviewableType: 'TRANSPORTATION_LISTING' | 'ACCOMMODATION' | 'ROOM' | 'TRANSPORTATION_BOOKING' | 'ACCOMMODATION_BOOKING';
  reviewableId: number;
  title: string;
}

const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  reviewableType,
  reviewableId,
  title
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const reviewController = container.resolve(ReviewController);
      await reviewController.createReview({
        reviewableType,
        reviewableId,
        rating,
        comment: comment.trim()
      });

      onSubmit();
      onClose();
      // Reset form
      setRating(0);
      setComment('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface">
              Rate Your Experience
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
            </button>
          </div>

          {/* Title */}
          <div className="mb-6">
            <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
              How was your experience with:
            </p>
            <p className="text-body-lg font-medium text-light-on-surface dark:text-dark-on-surface">
              {title}
            </p>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-body-md font-medium text-light-on-surface dark:text-dark-on-surface mb-3">
              Rating *
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-2">
              {rating === 0 && 'Click a star to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-body-md font-medium text-light-on-surface dark:text-dark-on-surface mb-3">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Comment *
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full p-3 border border-light-outline dark:border-dark-outline rounded-lg bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background placeholder-light-on-surface-variant dark:placeholder-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-body-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface rounded-lg hover:bg-light-surface-variant dark:hover:bg-dark-surface-variant transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0 || !comment.trim()}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmissionModal;
