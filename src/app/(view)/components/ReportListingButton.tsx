'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag, AlertTriangle, X } from 'lucide-react';
import { ReportController } from '@/app/(controller)/report/reportController';
import { container } from '@/app/lib/diContainer';
import { CreateReportData, ReportableType } from '@/app/(model)/report/reportModel';

interface ReportListingButtonProps {
  listingId: string;
  listingTitle?: string;
  currentUserId?: string;
  className?: string;
}

const ReportListingButton: React.FC<ReportListingButtonProps> = ({ 
  listingId, 
  listingTitle = "this listing",
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
    'Fake or misleading listing',
    'Inappropriate content',
    'Spam or duplicate listing',
    'Suspicious pricing',
    'Safety concerns',
    'Violation of terms of service',
    'Inappropriate behavior by provider',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    try {
      if (!currentUserId) {
        setErrors(['You must be logged in to report a listing']);
        return;
      }

      const reportData: CreateReportData = {
        reporterId: currentUserId,
        reportableType: 'TRANSPORTATION_LISTING' as ReportableType,
        reportReason: formData.reportReason,
        description: formData.description,
        transportationListingId: parseInt(listingId)
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
        'TRANSPORTATION_LISTING' as ReportableType,
        parseInt(listingId)
      );

      if (isDuplicate) {
        setErrors(['You have already reported this listing']);
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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`btn-outlined flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm ${className}`}
      >
        <Flag className="w-4 h-4" />
        Report Listing
      </button>

      {/* Report Modal */}
      {isModalOpen && createPortal(
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[99999] backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={handleBackdropClick}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 transform transition-all duration-200 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-display text-title-lg font-semibold text-gray-900 dark:text-white">
                      Report Listing
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Report {listingTitle} for inappropriate content
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-display text-title-md font-semibold text-gray-900 dark:text-white mb-2">
                    Report Submitted
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Thank you for your report. We'll review it and take appropriate action.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Report Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for reporting
                    </label>
                    <select
                      name="reportReason"
                      value={formData.reportReason}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="">Select a reason</option>
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
                      Additional details
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Please provide specific details about the issue..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"
                      rows={4}
                      minLength={10}
                      maxLength={1000}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.description.length}/1000 characters
                    </p>
                  </div>

                  {/* Error Messages */}
                  {errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ReportListingButton;
