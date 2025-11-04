'use client';

import React, { useState, useMemo } from 'react';
import { Bell } from 'lucide-react';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';
import NotificationTabs from './NotificationTabs';
import NotificationFilters from './NotificationFilters';
import BulkActions from './BulkActions';
import DateGroupedNotifications from './DateGroupedNotifications';
import EnhancedNotificationCard from './EnhancedNotificationCard';
import EmptyState from './EmptyState';

interface OrganizedNotificationsProps {
  initialOffers: (TransportationOffer & {
    isOutDated?: boolean;
    sender?: {
      username?: string;
      mediaUrls?: string[];
    };
  })[];
}

const OrganizedNotifications: React.FC<OrganizedNotificationsProps> = ({ initialOffers }) => {
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOffers, setSelectedOffers] = useState<Set<number>>(new Set());

  // Filter and sort offers based on current settings
  const filteredAndSortedOffers = useMemo(() => {
    let filtered = initialOffers;

    // Tab filtering
    switch (activeTab) {
      case 'requests':
        filtered = filtered.filter(offer => offer.transportationListingId !== null);
        break;
      case 'offers':
        filtered = filtered.filter(offer => offer.transportationListingId === null);
        break;
      case 'pending':
        filtered = filtered.filter(offer => offer.status === 'pending');
        break;
      case 'completed':
        filtered = filtered.filter(offer => offer.status !== 'pending');
        break;
    }

    // Status filtering
    if (statusFilter !== 'all') {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    // Search filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.sender?.username?.toLowerCase().includes(term) ||
        offer.message?.toLowerCase().includes(term) ||
        offer.listing?.startLocationText?.toLowerCase().includes(term) ||
        offer.listing?.endLocationText?.toLowerCase().includes(term) ||
        offer.request?.startLocationText?.toLowerCase().includes(term) ||
        offer.request?.endLocationText?.toLowerCase().includes(term)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.listing?.departureTime || a.request?.departureTime || a.createdAt || '');
          bValue = new Date(b.listing?.departureTime || b.request?.departureTime || b.createdAt || '');
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.transportationListingId !== null ? 'request' : 'offer';
          bValue = b.transportationListingId !== null ? 'request' : 'offer';
          break;
        case 'price':
          aValue = parseFloat(a.pricePerSeat?.toString() || '0');
          bValue = parseFloat(b.pricePerSeat?.toString() || '0');
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [initialOffers, activeTab, searchTerm, statusFilter, sortBy, sortOrder]);

  // Calculate counts for tabs
  const counts = useMemo(() => ({
    all: initialOffers.length,
    requests: initialOffers.filter(offer => offer.transportationListingId !== null).length,
    offers: initialOffers.filter(offer => offer.transportationListingId === null).length,
    pending: initialOffers.filter(offer => offer.status === 'pending').length,
    completed: initialOffers.filter(offer => offer.status !== 'pending').length,
  }), [initialOffers]);

  // Selection handlers
  const handleSelectOffer = (offerId: number) => {
    const newSelected = new Set(selectedOffers);
    if (newSelected.has(offerId)) {
      newSelected.delete(offerId);
    } else {
      newSelected.add(offerId);
    }
    setSelectedOffers(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = new Set(filteredAndSortedOffers.map(offer => offer.id));
    setSelectedOffers(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedOffers(new Set());
  };

  // Bulk action handlers (these would connect to your backend)
  const handleMarkAllRead = () => {
    console.log('Mark as read:', Array.from(selectedOffers));
    // Implement mark as read functionality
    setSelectedOffers(new Set());
  };

  const handleArchiveSelected = () => {
    console.log('Archive:', Array.from(selectedOffers));
    // Implement archive functionality
    setSelectedOffers(new Set());
  };

  const handleDeleteSelected = () => {
    console.log('Delete:', Array.from(selectedOffers));
    // Implement delete functionality
    setSelectedOffers(new Set());
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date');
    setSortOrder('desc');
    setActiveTab('all');
  };

  // Get appropriate empty state type
  const getEmptyStateType = () => {
    if (searchTerm || statusFilter !== 'all') return 'no-results';
    switch (activeTab) {
      case 'requests': return 'no-requests';
      case 'offers': return 'no-offers';
      case 'pending': return 'no-pending';
      case 'completed': return 'no-completed';
      default: return 'no-notifications';
    }
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background transition-colors duration-300 py-8">
      <div className="px-4  mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="bg-primary/10 p-3 rounded-full mr-4">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                Notifications
              </h1>
              <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Manage your ride offers and requests
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <NotificationTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />

        {/* Filters */}
        <NotificationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          totalCount={initialOffers.length}
          filteredCount={filteredAndSortedOffers.length}
        />

        {/* Bulk Actions */}
        {filteredAndSortedOffers.length > 0 && (
          <BulkActions
            selectedCount={selectedOffers.size}
            totalCount={filteredAndSortedOffers.length}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onMarkAllRead={handleMarkAllRead}
            onArchiveSelected={handleArchiveSelected}
            onDeleteSelected={handleDeleteSelected}
          />
        )}

        {/* Notifications List */}
        {filteredAndSortedOffers.length > 0 ? (
          <DateGroupedNotifications offers={filteredAndSortedOffers}>
            {(offer) => (
              <EnhancedNotificationCard
                key={offer.id}
                offer={offer}
                isSelected={selectedOffers.has(offer.id)}
                onSelect={handleSelectOffer}
                searchTerm={searchTerm}
              />
            )}
          </DateGroupedNotifications>
        ) : (
          <EmptyState 
            type={getEmptyStateType()}
            searchTerm={searchTerm}
            onClearFilters={clearAllFilters}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizedNotifications;