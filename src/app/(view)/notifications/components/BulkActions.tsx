'use client';

import React from 'react';
import { 
  CheckCircle2, 
  X, 
  Trash2, 
  Archive,
  MoreHorizontal
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onMarkAllRead: () => void;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onMarkAllRead,
  onArchiveSelected,
  onDeleteSelected
}) => {
  const allSelected = selectedCount === totalCount && totalCount > 0;

  if (totalCount === 0) return null;

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 mb-4 shadow-sm border border-light-outline dark:border-dark-outline">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Select All Toggle */}
          <button
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-light-on-surface dark:text-dark-on-surface hover:text-primary dark:hover:text-primary transition-colors"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              allSelected 
                ? 'bg-primary border-primary text-white' 
                : 'border-light-outline dark:border-dark-outline hover:border-primary'
            }`}>
              {allSelected && <CheckCircle2 className="w-3 h-3" />}
            </div>
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          {/* Selection Count */}
          {selectedCount > 0 && (
            <span className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {selectedCount} selected
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark Read
            </button>
            
            <button
              onClick={onArchiveSelected}
              className="px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
            
            <button
              onClick={onDeleteSelected}
              className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions for All Notifications */}
      {selectedCount === 0 && (
        <div className="mt-3 pt-3 border-t border-light-outline dark:border-dark-outline">
          <div className="flex items-center gap-2">
            <span className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Quick actions:
            </span>
            <button
              onClick={onMarkAllRead}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Mark all as read
            </button>
            <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">•</span>
            <button
              onClick={onArchiveSelected}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Archive completed
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;