'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/app/(model)/rideSharing/booking/bookingModel';
import { container } from '@/app/lib/diContainer';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { CreateReviewData, Review } from '@/app/(model)/review/reviewModel';

interface ReviewPastRidesProps {
  bookings: Booking[];
  isProvider: boolean;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

const ReviewPastRides: React.FC<ReviewPastRidesProps> = ({ bookings, isProvider }) => {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [reviewData, setReviewData] = useState<ReviewFormData>({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Fetch existing reviews on component mount
  useEffect(() => {
    const fetchExistingReviews = async () => {
      try {
        setLoadingReviews(true);
        const reviewController = container.resolve(ReviewController);
        const response = await reviewController.getMyReviews();
        
        if (response.success) {
          // Handle the ResponseModel data structure properly
          const reviews = Array.isArray(response.data) ? response.data : [];
          setExistingReviews(reviews.flat()); // Flatten in case it's nested arrays
          console.log('Fetched existing reviews:', reviews);
        }
      } catch (error) {
        console.error('Error fetching existing reviews:', error);
        setExistingReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (!isProvider) {
      fetchExistingReviews();
    } else {
      setLoadingReviews(false);
    }
  }, [isProvider]);


  // Get existing review IDs for transportation bookings
  const idsFilteredExistingReviews = existingReviews
    .filter(review => review.reviewableType === 'TRANSPORTATION_BOOKING')
    .map(review => review.transportationBooking?.id)
    .filter(id => id !== undefined);
  
  console.log("ReviewPastRides - Filtered existing review IDs:", idsFilteredExistingReviews);

  // Filter unreviewed bookings that are complete and for travelers
  const unreviewedBookings = bookings.filter(booking => 
    !isProvider && 
    booking.status === 'complete' && 
    !idsFilteredExistingReviews.includes(booking.id)
  );

  // Filter reviewed bookings to show in history section
  const reviewedCompletedBookings = bookings.filter(booking => 
    !isProvider && 
    booking.status === 'complete' && 
    idsFilteredExistingReviews.includes(booking.id)
  );

  console.log('ReviewPastRides - Unreviewed bookings:', unreviewedBookings);
  console.log('ReviewPastRides - Reviewed bookings:', reviewedCompletedBookings);

  const handleSubmitReview = async (bookingId: number) => {
    if (!reviewData.rating || !reviewData.comment.trim()) {
      alert('Please provide both a rating and comment');
      return;
    }

    setSubmittingReview(true);

    try {
      const reviewController = container.resolve(ReviewController);
      
      const createReviewData: CreateReviewData = {
        reviewableType: 'TRANSPORTATION_BOOKING',
        reviewableId: bookingId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      };

      const response = await reviewController.createReview(createReviewData);
      
      if (response.success) {
        // Refresh the reviews list to get the latest data
        const reviewController = container.resolve(ReviewController);
        const updatedResponse = await reviewController.getMyReviews();
        if (updatedResponse.success) {
          const reviews = Array.isArray(updatedResponse.data) ? updatedResponse.data : [];
          setExistingReviews(reviews.flat());
        }
        
        setSelectedBooking(null);
        setReviewData({ rating: 5, comment: '' });
        alert('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`Failed to submit review: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={interactive ? () => onRate?.(star) : undefined}
            className={`text-2xl ${interactive ? 'hover:scale-110 transition-transform cursor-pointer' : ''}`}
            disabled={!interactive}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  // Don't show for providers
  if (isProvider) {
    return null;
  }

  // Show loading state while fetching reviews
  if (loadingReviews) {
    return (
      <div className="bg-surface border border-border rounded-[var(--radius-standard)] p-6">
        <h2 className="text-xl font-semibold mb-4 text-text">
          Review Past Rides
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text opacity-70">Loading your review history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-[var(--radius-standard)] p-6">
      <h2 className="text-xl font-semibold mb-4 text-text">
        Review Past Rides
      </h2>
      
      {unreviewedBookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📝</div>
          <p className="opacity-70 text-text">
            No completed rides to review
          </p>
          <p className="text-sm opacity-50 mt-2 text-text">
            Complete a ride to leave a review
          </p>
          {/* Debug info when no bookings are shown */}
          {bookings.length > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-left">
              <p className="text-sm font-medium mb-2 text-text">Debug Info:</p>
              <p className="text-xs text-text">Total bookings: {bookings.length}</p>
              <p className="text-xs text-text">Is Provider: {isProvider ? 'Yes' : 'No'}</p>
              <div className="text-xs mt-2 text-text">
                <p className="font-medium">Booking details:</p>
                {bookings.map(b => (
                  <div key={b.id} className="ml-2 mt-1">
                    ID: {b.id}, Status: {b.status}, Source: {b.bookingSource}
                    {b.listing && <span>, Listing Status: {b.listing.status}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {unreviewedBookings.map((booking) => (
            <div key={booking.id} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-text">
                    {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                  </h3>
                  <p className="text-sm opacity-70 text-text">
                    ${parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs opacity-50 mt-1 text-text">
                    Completed: {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-success/10 text-success border border-success/20">
                  {booking.status}
                </span>
              </div>

              {selectedBooking === booking.id ? (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-3 text-text">
                    Rate your ride experience
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-text">
                      Rating
                    </label>
                    {renderStars(reviewData.rating, true, (rating) => 
                      setReviewData(prev => ({ ...prev, rating }))
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-text">
                      Comment
                    </label>
                    <textarea
                      value={reviewData.comment}
                      onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience with this ride..."
                      className="w-full p-3 border border-input rounded-lg resize-none bg-background text-text placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleSubmitReview(booking.id)}
                      disabled={submittingReview || !reviewData.comment.trim()}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBooking(null);
                        setReviewData({ rating: 5, comment: '' });
                      }}
                      className="btn-outlined"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedBooking(booking.id)}
                  className="btn-outlined w-full mt-3"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">⭐</span>
                    Rate this ride
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Already Reviewed Bookings */}
      {reviewedCompletedBookings.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <h3 className="text-lg font-medium mb-4 text-text">Previously Reviewed</h3>
          <div className="space-y-3">
            {reviewedCompletedBookings.map((booking) => (
              <div key={booking.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-text text-sm">
                      {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                    </h4>
                    <p className="text-xs opacity-70 text-text">
                      ${parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-success/10 text-success border border-success/20 flex items-center">
                    <span className="mr-1">✓</span>
                    Reviewed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPastRides;