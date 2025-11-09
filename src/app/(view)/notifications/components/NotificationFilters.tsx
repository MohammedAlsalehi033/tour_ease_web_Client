'use client';

import React from 'react';
import { 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc,
  X
} from 'lucide-react';

interface NotificationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (value: 'asc' | 'desc') => void;
  totalCount: number;
  filteredCount: number;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  totalCount,
  filteredCount
}) => {
  const clearAllFilters = () => {
    onSearchChange('');
    onStatusFilterChange('all');
    onSortByChange('date');
    onSortOrderChange('desc');
  };

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || sortBy !== 'date' || sortOrder !== 'desc';

  return (
    <div className="bg-light-surface dark:bg-dark-surface rounded-lg p-4 mb-6 shadow-sm border border-light-outline dark:border-dark-outline">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-light-on-surface-variant dark:text-dark-on-surface-variant" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface placeholder-light-on-surface-variant dark:placeholder-dark-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-on-surface-variant hover:text-light-on-surface dark:text-dark-on-surface-variant dark:hover:text-dark-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="date">Sort by Date</option>
            <option value="status">Sort by Status</option>
            <option value="type">Sort by Type</option>
            <option value="price">Sort by Price</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 rounded-lg border border-light-outline dark:border-dark-outline bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30 transition-colors flex items-center gap-2"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            <span className="text-sm">{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          {filteredCount === totalCount ? (
            <span>{totalCount} notification{totalCount !== 1 ? 's' : ''}</span>
          ) : (
            <span>{filteredCount} of {totalCount} notification{totalCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationFilters;