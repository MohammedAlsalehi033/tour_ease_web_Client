import { injectable } from "tsyringe";
import { Report, CreateReportData, UpdateReportStatusData, ReportFilters, ReportStatistics, PaginatedReports } from './reportModel';
import { ApiService } from "@/app/services/apiService";
import { ResponseModel } from "@/Types/types";

@injectable()
export class ReportRepo {
    constructor(private apiService: ApiService) {}

    async createReport(data: CreateReportData): Promise<Report> {
        try {
            const response = await this.apiService.post<ResponseModel<Report>>('/reports', data);
            return response.data;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    }

    async getAllReports(
        page: number = 1,
        limit: number = 10,
        filters?: ReportFilters
    ): Promise<PaginatedReports> {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(filters?.status && { status: filters.status }),
                ...(filters?.reportableType && { reportableType: filters.reportableType }),
                ...(filters?.reporterId && { reporterId: filters.reporterId }),
                ...(filters?.reportedUserId && { reportedUserId: filters.reportedUserId }),
            });

            const response = await this.apiService.get<ResponseModel<PaginatedReports>>(
                `/reports?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    }

    async getReportById(id: number): Promise<Report | null> {
        try {
            const response = await this.apiService.get<ResponseModel<Report>>(`/reports/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching report by ID:', error);
            throw error;
        }
    }

    async updateReportStatus(
        id: number,
        data: UpdateReportStatusData
    ): Promise<Report> {
        try {
            const response = await this.apiService.patch<ResponseModel<Report>>(
                `/reports/${id}/status`,
                data
            );
            return response.data;
        } catch (error) {
            console.error('Error updating report status:', error);
            throw error;
        }
    }

    async deleteReport(id: number): Promise<void> {
        try {
            await this.apiService.delete(`/reports/${id}`);
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    }

    async getReportsByReporter(
        reporterId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedReports> {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await this.apiService.get<ResponseModel<PaginatedReports>>(
                `/reports/my-reports?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching reports by reporter:', error);
            throw error;
        }
    }

    async getReportsByReportedUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedReports> {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            const response = await this.apiService.get<ResponseModel<PaginatedReports>>(
                `/reports/user/${userId}?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching reports by reported user:', error);
            throw error;
        }
    }

    async getReportsByType(
        type: string,
        page: number = 1,
        limit: number = 10,
        status?: string
    ): Promise<PaginatedReports> {
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status }),
            });

            const response = await this.apiService.get<ResponseModel<PaginatedReports>>(
                `/reports/type/${type}?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching reports by type:', error);
            throw error;
        }
    }

    async getReportStatistics(): Promise<ReportStatistics> {
        try {
            const response = await this.apiService.get<ResponseModel<ReportStatistics>>('/reports/statistics');
            return response.data;
        } catch (error) {
            console.error('Error fetching report statistics:', error);
            throw error;
        }
    }

    async checkDuplicateReport(
        reporterId: string,
        reportableType: string,
        reportableId: number
    ): Promise<boolean> {
        try {
            // This would typically be a separate endpoint for checking duplicates
            // For now, we'll implement it by checking existing reports
            const reports = await this.getAllReports(1, 100, {
                reporterId,
                reportableType: reportableType as any
            });
            
            return reports.reports.some(report => {
                switch (reportableType) {
                    case 'USER':
                        return report.reportedUserId === reportableId.toString();
                    case 'TRANSPORTATION_LISTING':
                        return report.transportationListingId === reportableId;
                    case 'ACCOMMODATION':
                        return report.accommodationId === reportableId;
                    case 'ROOM':
                        return report.roomId === reportableId;
                    case 'QUESTION':
                        return report.questionId === reportableId;
                    case 'COMMENT':
                        return report.commentId === reportableId;
                    case 'MESSAGE':
                        return report.messageId === reportableId;
                    case 'OFFER':
                        return report.offerId === reportableId;
                    case 'TRANSPORTATION_BOOKING':
                        return report.transportationBookingId === reportableId;
                    case 'ACCOMMODATION_BOOKING':
                        return report.accommodationBookingId === reportableId;
                    default:
                        return false;
                }
            });
        } catch (error) {
            console.error('Error checking duplicate report:', error);
            return false; // Return false on error to allow creation
        }
    }
}
