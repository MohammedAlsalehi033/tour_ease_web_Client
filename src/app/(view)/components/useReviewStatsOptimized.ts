"use client";
import "reflect-metadata";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ReviewController } from '@/app/(controller)/review/reviewController';
import { container } from '@/app/lib/diContainer';
import { ReviewStats } from '@/app/(model)/review/reviewModel';

// Cache for review stats to prevent duplicate requests
const reviewStatsCache = new Map<string, { data: ReviewStats | null; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useReviewStatsOptimized = (reviewableType: string, reviewableId: number | string) => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create cache key
  const cacheKey = useMemo(() => `${reviewableType}-${reviewableId}`, [reviewableType, reviewableId]);

  const fetchStats = useCallback(async () => {
    if (!reviewableId) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cached = reviewStatsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      setStats(cached.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const reviewController = container.resolve(ReviewController);
      const filter = {
        page: 1,
        limit: 5, // Reduced from 10 to minimize data transfer
        sort: "newest" as "newest",
        reviewableType: reviewableType,
        minRating: 1,
        maxRating: 5,
      };
      
      const response = await reviewController.getReviewsForItem(reviewableType, Number(reviewableId), filter);
      
      if (response.success) {
        const statsData = response.data.stats;
        setStats(statsData);
        
        // Cache the result
        reviewStatsCache.set(cacheKey, {
          data: statsData,
          timestamp: Date.now()
        });
      } else {
        setError(response.message || 'Failed to fetch reviews');
        // Cache null result to prevent repeated failed requests
        reviewStatsCache.set(cacheKey, {
          data: null,
          timestamp: Date.now()
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch review stats');
      // Cache null result to prevent repeated failed requests
      reviewStatsCache.set(cacheKey, {
        data: null,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, [reviewableType, reviewableId, cacheKey]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error };
};

// Utility function to clear cache when needed
export const clearReviewStatsCache = () => {
  reviewStatsCache.clear();
};

// Utility function to preload stats for multiple items
export const preloadReviewStats = async (items: Array<{ type: string; id: number }>) => {
  const reviewController = container.resolve(ReviewController);
  const promises = items.map(async (item) => {
    const cacheKey = `${item.type}-${item.id}`;
    
    // Skip if already cached and fresh
    const cached = reviewStatsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return;
    }

    try {
      const filter = {
        page: 1,
        limit: 5,
        sort: "newest" as "newest",
        reviewableType: item.type,
        minRating: 1,
        maxRating: 5,
      };
      
      const response = await reviewController.getReviewsForItem(item.type, item.id, filter);
      
      if (response.success) {
        reviewStatsCache.set(cacheKey, {
          data: response.data.stats,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      // Silently fail for preloading
      console.warn(`Failed to preload stats for ${item.type}-${item.id}:`, error);
    }
  });

  // Execute with controlled concurrency to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < promises.length; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    await Promise.allSettled(batch);
    
    // Small delay between batches to be server-friendly
    if (i + batchSize < promises.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
};