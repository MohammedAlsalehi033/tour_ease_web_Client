export interface Report {
  id: number;
  reporterId: string;
  reportableType: ReportableType;
  reportReason: string;
  description: string;
  status: ReportStatus;
  reportedUserId?: string;
  transportationListingId?: number;
  accommodationId?: number;
  roomId?: number;
  questionId?: number;
  commentId?: number;
  messageId?: number;
  offerId?: number;
  transportationBookingId?: number;
  accommodationBookingId?: number;
  resolvedBy?: string;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

export type ReportableType = 
  | 'USER'
  | 'TRANSPORTATION_LISTING'
  | 'ACCOMMODATION'
  | 'ROOM'
  | 'QUESTION'
  | 'COMMENT'
  | 'MESSAGE'
  | 'OFFER'
  | 'TRANSPORTATION_BOOKING'
  | 'ACCOMMODATION_BOOKING';

export type ReportStatus = 
  | 'pending'
  | 'investigating'
  | 'resolved'
  | 'dismissed';

export interface CreateReportData {
  reporterId: string;
  reportableType: ReportableType;
  reportReason: string;
  description: string;
  reportedUserId?: string;
  transportationListingId?: number;
  accommodationId?: number;
  roomId?: number;
  questionId?: number;
  commentId?: number;
  messageId?: number;
  offerId?: number;
  transportationBookingId?: number;
  accommodationBookingId?: number;
}

export interface UpdateReportStatusData {
  status: ReportStatus;
  resolvedBy: string;
  resolutionNotes?: string;
}

export interface ReportFilters {
  status?: ReportStatus;
  reportableType?: ReportableType;
  reporterId?: string;
  reportedUserId?: string;
}

export interface ReportStatistics {
  totalReports: number;
  pendingReports: number;
  investigatingReports: number;
  resolvedReports: number;
  dismissedReports: number;
  reportsByType: Record<ReportableType, number>;
  reportsByStatus: Record<ReportStatus, number>;
  recentReports: number; // Reports in last 7 days
}

export interface PaginatedReports {
  reports: Report[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
