import { injectable, inject } from 'tsyringe';
import { ReportRepo } from '@/app/(model)/report/reportRepo';
import { 
    Report, 
    CreateReportData, 
    UpdateReportStatusData, 
    ReportFilters, 
    ReportStatistics, 
    PaginatedReports,
    ReportableType,
    ReportStatus
} from '@/app/(model)/report/reportModel';

@injectable()
export class ReportController {
    constructor(
        @inject(ReportRepo) private reportRepo: ReportRepo
    ) {
        // Bind 'this' for all methods that access instance properties/methods
        this.createReport = this.createReport.bind(this);
        this.getAllReports = this.getAllReports.bind(this);
        this.getReportById = this.getReportById.bind(this);
        this.updateReportStatus = this.updateReportStatus.bind(this);
        this.deleteReport = this.deleteReport.bind(this);
        this.getReportsByReporter = this.getReportsByReporter.bind(this);
        this.getReportsByReportedUser = this.getReportsByReportedUser.bind(this);
        this.getReportsByType = this.getReportsByType.bind(this);
        this.getReportStatistics = this.getReportStatistics.bind(this);
        this.checkDuplicateReport = this.checkDuplicateReport.bind(this);
    }

    async createReport(data: CreateReportData): Promise<Report> {
        return this.reportRepo.createReport(data);
    }

    async getAllReports(
        page: number = 1,
        limit: number = 10,
        filters?: ReportFilters
    ): Promise<PaginatedReports> {
        return this.reportRepo.getAllReports(page, limit, filters);
    }

    async getReportById(id: number): Promise<Report | null> {
        return this.reportRepo.getReportById(id);
    }

    async updateReportStatus(
        id: number,
        data: UpdateReportStatusData
    ): Promise<Report> {
        return this.reportRepo.updateReportStatus(id, data);
    }

    async deleteReport(id: number): Promise<void> {
        return this.reportRepo.deleteReport(id);
    }

    async getReportsByReporter(
        reporterId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedReports> {
        return this.reportRepo.getReportsByReporter(reporterId, page, limit);
    }

    async getReportsByReportedUser(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<PaginatedReports> {
        return this.reportRepo.getReportsByReportedUser(userId, page, limit);
    }

    async getReportsByType(
        type: ReportableType,
        page: number = 1,
        limit: number = 10,
        status?: ReportStatus
    ): Promise<PaginatedReports> {
        return this.reportRepo.getReportsByType(type, page, limit, status);
    }

    async getReportStatistics(): Promise<ReportStatistics> {
        return this.reportRepo.getReportStatistics();
    }

    async checkDuplicateReport(
        reporterId: string,
        reportableType: ReportableType,
        reportableId: number
    ): Promise<boolean> {
        return this.reportRepo.checkDuplicateReport(reporterId, reportableType, reportableId);
    }

    // Helper method to validate report data before creation
    validateReportData(data: CreateReportData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.reporterId) {
            errors.push('Reporter ID is required');
        }

        if (!data.reportableType) {
            errors.push('Reportable type is required');
        }

        if (!data.reportReason || data.reportReason.trim().length === 0) {
            errors.push('Report reason is required');
        } else if (data.reportReason.length > 100) {
            errors.push('Report reason must be 100 characters or less');
        }

        if (!data.description || data.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters');
        } else if (data.description.length > 1000) {
            errors.push('Description must be 1000 characters or less');
        }

        // Validate that at least one reportable ID is provided
        const reportableIds = [
            data.reportedUserId,
            data.transportationListingId,
            data.accommodationId,
            data.roomId,
            data.questionId,
            data.commentId,
            data.messageId,
            data.offerId,
            data.transportationBookingId,
            data.transportationRequestId,
            data.accommodationBookingId,
        ];

        if (!reportableIds.some(id => id !== undefined)) {
            errors.push('At least one reportable ID must be provided');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Helper method to get reportable type display name
    getReportableTypeDisplayName(type: ReportableType): string {
        const displayNames: Record<ReportableType, string> = {
            'TRANSPORTATION_REQUEST': 'Transportation Request',
            'USER': 'User',
            'TRANSPORTATION_LISTING': 'Transportation Listing',
            'ACCOMMODATION': 'Accommodation',
            'ROOM': 'Room',
            'QUESTION': 'Question',
            'COMMENT': 'Comment',
            'MESSAGE': 'Message',
            'OFFER': 'Offer',
            'TRANSPORTATION_BOOKING': 'Transportation Booking',
            'ACCOMMODATION_BOOKING': 'Accommodation Booking',
        };

        return displayNames[type] || type;
    }

    // Helper method to get status display name
    getStatusDisplayName(status: ReportStatus): string {
        const displayNames: Record<ReportStatus, string> = {
            'pending': 'Pending',
            'investigating': 'Investigating',
            'resolved': 'Resolved',
            'dismissed': 'Dismissed',
        };

        return displayNames[status] || status;
    }
}
