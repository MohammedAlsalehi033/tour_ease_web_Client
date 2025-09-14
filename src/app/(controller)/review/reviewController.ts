import { ReviewRepo } from "@/app/(model)/review/reviewRepo";
import { inject, injectable } from "tsyringe";
import { Review, ReviewStats, CreateReviewData, UpdateReviewData, ReviewFilters } from "@/app/(model)/review/reviewModel";

@injectable()
export class ReviewController {
    constructor(@inject(ReviewRepo) private reviewRepo: ReviewRepo) {}

    async createReview(reviewData: CreateReviewData) {
        try {
            // Validate review data
            if (!reviewData.reviewableType || !reviewData.reviewableId || !reviewData.rating || !reviewData.comment) {
                throw new Error('All review fields are required');
            }

            if (reviewData.rating < 1 || reviewData.rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            if (reviewData.comment.trim().length === 0) {
                throw new Error('Comment cannot be empty');
            }

            const review = await this.reviewRepo.createReview(reviewData);
            return review;
        } catch (error) {
            console.error("Error creating review:", error);
            throw error;
        }
    }

    async getReviews(filters?: ReviewFilters) {
        try {
            const reviews = await this.reviewRepo.getReviews(filters);
            return reviews;
        } catch (error) {
            console.error("Error fetching reviews:", error);
            throw error;
        }
    }

    async getReviewsForItem(reviewableType: string, reviewableId: number, filters?: { page?: number; limit?: number }) {
        try {
            if (!reviewableType || !reviewableId) {
                throw new Error('Reviewable type and ID are required');
            }

            const result = await this.reviewRepo.getReviewsForItem(reviewableType, reviewableId, filters);
            return result;
        } catch (error) {
            console.error("Error fetching reviews for item:", error);
            throw error;
        }
    }

    async getReviewStats(reviewableType: string, reviewableId: number) {
        try {
            if (!reviewableType || !reviewableId) {
                throw new Error('Reviewable type and ID are required');
            }

            const stats = await this.reviewRepo.getReviewStats(reviewableType, reviewableId);
            return stats;
        } catch (error) {
            console.error("Error fetching review stats:", error);
            throw error;
        }
    }

    async getReviewsByReviewer(reviewerId: string, filters?: { page?: number; limit?: number }) {
        try {
            if (!reviewerId) {
                throw new Error('Reviewer ID is required');
            }

            const reviews = await this.reviewRepo.getReviewsByReviewer(reviewerId, filters);
            return reviews;
        } catch (error) {
            console.error("Error fetching reviews by reviewer:", error);
            throw error;
        }
    }

    async getMyReviews(filters?: { page?: number; limit?: number }) {
        try {
            const reviews = await this.reviewRepo.getMyReviews(filters);
            return reviews;
        } catch (error) {
            console.error("Error fetching my reviews:", error);
            throw error;
        }
    }

    async getReviewById(id: number) {
        try {
            if (!id) {
                throw new Error('Review ID is required');
            }

            const review = await this.reviewRepo.getReviewById(id);
            return review;
        } catch (error) {
            console.error("Error fetching review by ID:", error);
            throw error;
        }
    }

    async updateReview(id: number, reviewData: UpdateReviewData) {
        try {
            if (!id) {
                throw new Error('Review ID is required');
            }

            // Validate update data
            if (reviewData.rating !== undefined && (reviewData.rating < 1 || reviewData.rating > 5)) {
                throw new Error('Rating must be between 1 and 5');
            }

            if (reviewData.comment !== undefined && reviewData.comment.trim().length === 0) {
                throw new Error('Comment cannot be empty');
            }

            const review = await this.reviewRepo.updateReview(id, reviewData);
            return review;
        } catch (error) {
            console.error("Error updating review:", error);
            throw error;
        }
    }

    async deleteReview(id: number) {
        try {
            if (!id) {
                throw new Error('Review ID is required');
            }

            const result = await this.reviewRepo.deleteReview(id);
            return result;
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    }

    async searchReviews(query: string, filters?: { page?: number; limit?: number }) {
        try {
            if (!query || query.trim().length === 0) {
                throw new Error('Search query is required');
            }

            const reviews = await this.reviewRepo.searchReviews(query.trim(), filters);
            return reviews;
        } catch (error) {
            console.error("Error searching reviews:", error);
            throw error;
        }
    }
}
