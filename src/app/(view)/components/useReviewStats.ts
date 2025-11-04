
"use client";
import "reflect-metadata"
import { useState, useEffect } from 'react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { ReviewStats } from '@/app/(model)/review/reviewModel';

export const useReviewStats = (reviewableType: string, reviewableId: number) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!reviewableId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const reviewController = container.resolve(ReviewController);
        const fillter = {
          page: 1,
          limit: 10,
          sort: "newest" as "newest",
          reviewableType: reviewableType,
          minRating: 1,
          maxRating: 5,
        }
        const response2 = await reviewController.getReviewsForItem(reviewableType, reviewableId, fillter);
        
        if (response2.success) {

                    setStats(response2.data.stats);

          setReviews(response2.data);
        } else {
          setError(response2.message || 'Failed to fetch reviews');
        }

      } catch (err: any) {
        setError(err.message || 'Failed to fetch review stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [reviewableType, reviewableId]);

  return { stats, reviews, loading, error };
};
