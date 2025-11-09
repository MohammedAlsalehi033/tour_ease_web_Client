'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { ReportController } from '@/app/(controller)/report/reportController';
import { container } from '@/app/lib/diContainer';
import { CreateReportData, ReportableType } from '@/app/(model)/report/reportModel';

interface ReportRequestButtonProps {
  requestId: string;
  requestTitle?: string;
  currentUserId?: string;
  className?: string;
}

const ReportRequestButton: React.FC<ReportRequestButtonProps> = ({ 
  requestId, 
  requestTitle = "this ride request",
  currentUserId,
  className = ""
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reportReason: '',
    description: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const reportController = container.resolve(ReportController);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleCloseModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const reportReasons = [
    'Fake or misleading request',
    'Inappropriate content',
    'Spam or duplicate request',
    'Suspicious pricing or demands',
    'Safety concerns',
    'Violation of terms of service',
    'Inappropriate behavior by traveler',
    'Potential scam',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      if (!currentUserId) {
        setErrors(['You must be logged in to report a ride request']);
        return;
      }

      const reportData: CreateReportData = {
        reporterId: currentUserId,
        reportableType: 'TRANSPORTATION_REQUEST' as ReportableType, // Using TRANSPORTATION_LISTING for now as there's no specific REQUEST type
        reportReason: formData.reportReason,
        description: formData.description,
        transportationRequestId: parseInt(requestId) // Using this field for ride request ID
      };

      // Validate the data
      const validation = reportController.validateReportData(reportData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }

      // Check for duplicate report
      const isDuplicate = await reportController.checkDuplicateReport(
        currentUserId,
        'TRANSPORTATION_REQUEST' as ReportableType,
        parseInt(requestId)
      );

      if (isDuplicate) {
        setErrors(['You have already reported this ride request']);
        return;
      }

      // Create the report
      await reportController.createReport(reportData);
      
      setSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        setFormData({ reportReason: '', description: '' });
      }, 2000);

    } catch (error) {
      console.error('Error creating report:', error);
      setErrors(['Failed to submit report. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ reportReason: '', description: '' });
    setErrors([]);
    setSuccess(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (!currentUserId) {
    return null; // Don't show report button if user is not logged in
  }

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Flag className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Report Ride Request
            </h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Flag className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Report Submitted
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Thank you for helping keep our community safe. We'll review your report shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You're reporting {requestTitle}. Please select a reason and provide details.
                </p>
              </div>

              {/* Report Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for report *
                </label>
                <select
                  name="reportReason"
                  value={formData.reportReason}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a reason...</option>
                  {reportReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional details *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Please provide specific details about the issue..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-400">
                      Please fix the following issues:
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700 dark:text-red-400">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.reportReason || !formData.description}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${className}`}
        title="Report this ride request"
      >
        <Flag className="w-4 h-4" />
        <span>Report</span>
      </button>

      {/* Modal Portal */}
      {isModalOpen && typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </>
  );
};

export default ReportRequestButton;