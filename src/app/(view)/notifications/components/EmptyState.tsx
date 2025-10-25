'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Car, 
  Search, 
  MapPin, 
  PlusCircle,
  MessageSquare
} from 'lucide-react';

interface EmptyStateProps {
  type: 'no-notifications' | 'no-results' | 'no-requests' | 'no-offers' | 'no-pending' | 'no-completed';
  searchTerm?: string;
  onClearFilters?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, searchTerm, onClearFilters }) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-notifications':
        return {
          icon: Bell,
          title: 'No notifications yet',
          description: 'When someone sends you a ride offer or requests to book your ride, you\'ll see it here.',
          actions: [
            { label: 'Browse Rides', href: '/rideSharing/maps', variant: 'primary' },
            { label: 'Create Listing', href: '/rideSharing/listing/maps', variant: 'secondary' }
          ]
        };
      case 'no-results':
        return {
          icon: Search,
          title: `No results for "${searchTerm}"`,
          description: 'Try adjusting your search terms or clearing some filters to see more notifications.',
          actions: [
            { label: 'Clear Filters', onClick: onClearFilters, variant: 'primary' },
            { label: 'View All', onClick: onClearFilters, variant: 'secondary' }
          ]
        };
      case 'no-requests':
        return {
          icon: Car,
          title: 'No ride requests',
          description: 'You haven\'t received any ride booking requests yet. Create a ride listing to start receiving requests!',
          actions: [
            { label: 'Create Ride Listing', href: '/rideSharing/listing/maps', variant: 'primary' },
            { label: 'View My Listings', href: '/rideSharing/my-listings', variant: 'secondary' }
          ]
        };
      case 'no-offers':
        return {
          icon: MapPin,
          title: 'No ride offers',
          description: 'You haven\'t received any ride offers yet. Post a ride request to get offers from drivers!',
          actions: [
            { label: 'Post Ride Request', href: '/rideSharing/request/maps', variant: 'primary' },
            { label: 'Browse Available Rides', href: '/rideSharing/maps', variant: 'secondary' }
          ]
        };
      case 'no-pending':
        return {
          icon: Bell,
          title: 'No pending notifications',
          description: 'All caught up! You don\'t have any notifications waiting for your response.',
          actions: [
            { label: 'Browse Rides', href: '/rideSharing/maps', variant: 'primary' },
            { label: 'View Completed', onClick: () => {/* Switch to completed tab */}, variant: 'secondary' }
          ]
        };
      case 'no-completed':
        return {
          icon: MessageSquare,
          title: 'No completed notifications',
          description: 'You haven\'t responded to any notifications yet. Check your pending notifications!',
          actions: [
            { label: 'View Pending', onClick: () => {/* Switch to pending tab */}, variant: 'primary' },
            { label: 'Browse Rides', href: '/rideSharing/maps', variant: 'secondary' }
          ]
        };
      default:
        return {
          icon: Bell,
          title: 'Nothing here',
          description: 'No notifications to show.',
          actions: []
        };
    }
  };

  const config = getEmptyStateConfig();
  const Icon = config.icon;

  return (
    <div className="card p-12 rounded-lg border border-light-outline dark:border-dark-outline text-center bg-light-surface dark:bg-dark-surface">
      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-title-lg mb-3 text-light-on-surface dark:text-dark-on-surface">
        {config.title}
      </h2>

      {/* Description */}
      <p className="text-body-lg mb-8 text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-md mx-auto">
        {config.description}
      </p>

      {/* Action Buttons */}
      {config.actions.length > 0 && (
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          {config.actions.map((action, index) => {
            const baseClasses = "py-3 px-6 rounded-full font-medium transition-colors";
            const primaryClasses = "bg-primary text-white hover:bg-primary/90";
            const secondaryClasses = "border border-light-outline dark:border-dark-outline text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-variant/30 dark:hover:bg-dark-surface-variant/30";
            
            const className = `${baseClasses} ${action.variant === 'primary' ? primaryClasses : secondaryClasses}`;

            if (action.href) {
              return (
                <Link key={index} href={action.href} className={className}>
                  {action.label}
                </Link>
              );
            }

            return (
              <button key={index} onClick={action.onClick} className={className}>
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Additional Help Text */}
      {(type === 'no-notifications' || type === 'no-results') && (
        <div className="mt-8 pt-8 border-t border-light-outline dark:border-dark-outline">
          <p className="text-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Need help getting started?{' '}
            <Link href="/help" className="text-primary hover:text-primary/80 underline">
              View our guide
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;