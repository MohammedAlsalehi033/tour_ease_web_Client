
"use client";
import "reflect-metadata"
import { useState, useEffect } from 'react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { ReviewStats } from '@/app/(model)/review/reviewModel';

export const useReviewStats = (reviewableType: string, reviewableId: number) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log(reviewableType, reviewableId);
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
        const response = await reviewController.getReviewStats(reviewableType, reviewableId);
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch review stats');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch review stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [reviewableType, reviewableId]);

  return { stats, loading, error };
};
