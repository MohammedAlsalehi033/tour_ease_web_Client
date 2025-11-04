import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";
import { injectable } from "tsyringe";
import { Review, ReviewStats, CreateReviewData, UpdateReviewData, ReviewFilters } from './reviewModel';

@injectable()
export class ReviewRepo {
    constructor(private apiService: ApiService) {}

    async createReview(reviewData: CreateReviewData): Promise<ResponseModel<Review>> {
        try {
            const response = await this.apiService.post<ResponseModel<Review>>('/reviews', reviewData);
            return response;
        } catch (error) {
            console.error('Error creating review:', error);
            throw new Error('Failed to create review.');
        }
    }

    async getReviews(filters?: ReviewFilters): Promise<ResponseModel<Review[]>> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        params.append(key, value.toString());
                    }
                });
            }
            const url = params.toString() ? `/reviews?${params}` : '/reviews';
            const response = await this.apiService.get<ResponseModel<Review[]>>(url);
            return response;
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw new Error('Failed to retrieve reviews.');
        }
    }

    async getReviewsForItem(reviewableType: string, reviewableId: number, filters?: { page?: number; limit?: number }): Promise<ResponseModel<{ reviews: Review[]; stats: ReviewStats }>> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        params.append(key, value.toString());
                    }
                });
            }
            const url = params.toString() 
                ? `/reviews/item/${reviewableType}/${reviewableId}?${params}` 
                : `/reviews/item/${reviewableType}/${reviewableId}`;
            const response = await this.apiService.get<ResponseModel<{ reviews: Review[]; stats: ReviewStats }>>(url);
            return response;
        } catch (error) {
            console.error(`Error fetching reviews for ${reviewableType} ${reviewableId}:`, error);
            throw new Error('Failed to retrieve item reviews.');
        }
    }

    async getReviewStats(reviewableType: string, reviewableId: number): Promise<ResponseModel<ReviewStats>> {
        try {
            const response = await this.apiService.get<ResponseModel<ReviewStats>>(`/reviews/stats/${reviewableType}/${reviewableId}`);
            return response;
        } catch (error) {
            console.error(`Error fetching review stats for ${reviewableType} ${reviewableId}:`, error);
            throw new Error('Failed to retrieve review statistics.');
        }
    }

    async getReviewsByReviewer(reviewerId: string, filters?: { page?: number; limit?: number }): Promise<ResponseModel<Review[]>> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        params.append(key, value.toString());
                    }
                });
            }
            const url = params.toString() 
                ? `/reviews/reviewer/${reviewerId}?${params}` 
                : `/reviews/reviewer/${reviewerId}`;
            const response = await this.apiService.get<ResponseModel<Review[]>>(url);
            return response;
        } catch (error) {
            console.error(`Error fetching reviews by reviewer ${reviewerId}:`, error);
            throw new Error('Failed to retrieve reviewer reviews.');
        }
    }

    async getMyReviews(filters?: { page?: number; limit?: number }): Promise<ResponseModel<Review[]>> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        params.append(key, value.toString());
                    }
                });
            }
            const url = params.toString() ? `/reviews/my-reviews?${params}` : '/reviews/my-reviews';
            const response = await this.apiService.get<ResponseModel<Review[]>>(url);
            return response;
        } catch (error) {
            console.error('Error fetching my reviews:', error);
            throw new Error('Failed to retrieve your reviews.');
        }
    }

    async getReviewById(id: number): Promise<ResponseModel<Review>> {
        try {
            const response = await this.apiService.get<ResponseModel<Review>>(`/reviews/${id}`);
            return response;
        } catch (error) {
            console.error(`Error fetching review ${id}:`, error);
            throw new Error('Failed to retrieve review.');
        }
    }

    async updateReview(id: number, reviewData: UpdateReviewData): Promise<ResponseModel<Review>> {
        try {
            const response = await this.apiService.put<ResponseModel<Review>>(`/reviews/${id}`, reviewData);
            return response;
        } catch (error) {
            console.error(`Error updating review ${id}:`, error);
            throw new Error('Failed to update review.');
        }
    }

    async deleteReview(id: number): Promise<ResponseModel<void>> {
        try {
            const response = await this.apiService.delete<ResponseModel<void>>(`/reviews/${id}`);
            return response;
        } catch (error) {
            console.error(`Error deleting review ${id}:`, error);
            throw new Error('Failed to delete review.');
        }
    }

    async searchReviews(query: string, filters?: { page?: number; limit?: number }): Promise<ResponseModel<Review[]>> {
        try {
            const params = new URLSearchParams({ query });
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        params.append(key, value.toString());
                    }
                });
            }
            const response = await this.apiService.get<ResponseModel<Review[]>>(`/reviews/search?${params}`);
            return response;
        } catch (error) {
            console.error(`Error searching reviews with query "${query}":`, error);
            throw new Error('Failed to search reviews.');
        }
    }
}
