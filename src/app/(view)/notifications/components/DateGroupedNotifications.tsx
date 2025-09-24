'use client';

import React from 'react';
import { TransportationOffer } from '@/app/(model)/rideSharing/offer/offerModel';

interface DateGroupedNotificationsProps {
  offers: TransportationOffer[];
  children: (offer: TransportationOffer) => React.ReactNode;
}

const getDateGroup = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    const daysDiff = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      return 'This Week';
    } else if (daysDiff <= 30) {
      return 'This Month';
    } else {
      return 'Older';
    }
  }
};

const groupOffersByDate = (offers: TransportationOffer[]) => {
  const groups: { [key: string]: TransportationOffer[] } = {};
  
  offers.forEach(offer => {
    const dateKey = offer.listing?.departureTime || offer.request?.departureTime || offer.createdAt || '';
    const groupKey = getDateGroup(dateKey);
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(offer);
  });
  
  // Sort groups by priority
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
  const sortedGroups: { [key: string]: TransportationOffer[] } = {};
  
  groupOrder.forEach(groupKey => {
    if (groups[groupKey]) {
      // Sort offers within each group by date (newest first)
      sortedGroups[groupKey] = groups[groupKey].sort((a, b) => {
        const dateA = new Date(a.listing?.departureTime || a.request?.departureTime || a.createdAt || '');
        const dateB = new Date(b.listing?.departureTime || b.request?.departureTime || b.createdAt || '');
        return dateB.getTime() - dateA.getTime();
      });
    }
  });
  
  return sortedGroups;
};

const DateGroupedNotifications: React.FC<DateGroupedNotificationsProps> = ({
  offers,
  children
}) => {
  const groupedOffers = groupOffersByDate(offers);
  
  if (offers.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedOffers).map(([groupKey, groupOffers]) => (
        <div key={groupKey}>
          {/* Date Group Header */}
          <div className="flex items-center mb-4">
            <h3 className="text-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
              {groupKey}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-light-outline to-transparent dark:from-dark-outline ml-4"></div>
            <span className="ml-4 px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {groupOffers.length}
            </span>
          </div>
          
          {/* Notifications in this group */}
          <div className="space-y-4">
            {groupOffers.map(offer => children(offer))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DateGroupedNotifications;