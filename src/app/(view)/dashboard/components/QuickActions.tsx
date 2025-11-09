import React, { useMemo } from 'react';
import Link from 'next/link';
import { User } from '@/app/(model)/user/userModel';

interface QuickActionsProps {
  user: User;
  userActivity: {
    isTransportationProvider?: boolean;
    totalTrips?: number;
    profileComplete?: boolean;
    hasActiveRide?: boolean;
    hasUpcomingBooking?: boolean;
  };
}

const QuickActions: React.FC<QuickActionsProps> = ({ user, userActivity }) => {
  const actions = useMemo(() => {
    const isProvider = userActivity.isTransportationProvider || user.roles.includes('transportation_provider');
    const isNewUser = !userActivity.totalTrips || userActivity.totalTrips === 0;
    
    if (isNewUser) {
      // New User - Focus on onboarding
      return [
        {
          title: 'Complete Profile',
          description: 'Add your details and preferences',
          icon: '👤',
          href: '/profile',
          color: 'bg-blue-500 hover:bg-blue-600',
          priority: 'high'
        },
        {
          title: 'Find Your First Ride',
          description: 'Search for available rides',
          icon: '🔍',
          href: '/rideSharing/find-rides',
          color: 'bg-green-500 hover:bg-green-600',
          priority: 'high'
        },
        {
          title: 'Learn About Safety',
          description: 'Review safety guidelines and tips',
          icon: '🛡️',
          href: '/safety',
          color: 'bg-purple-500 hover:bg-purple-600',
          priority: 'medium'
        },
        {
          title: 'Become a Driver',
          description: 'Start offering rides and earn money',
          icon: '🚗',
          href: '/rideSharing/become-driver',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          priority: 'low'
        }
      ];
    } else if (isProvider) {
      // Transportation Provider Actions
      const providerActions = [
        {
          title: 'Offer a Ride',
          description: 'Create a new ride offer',
          icon: '➕',
          href: '/rideSharing/offer-ride',
          color: 'bg-blue-500 hover:bg-blue-600',
          priority: 'high'
        },
        {
          title: 'Manage Rides',
          description: 'View and manage your offered rides',
          icon: '📋',
          href: '/rideSharing/manage-rides',
          color: 'bg-green-500 hover:bg-green-600',
          priority: 'high'
        },
        {
          title: 'View Earnings',
          description: 'Check your earnings and payouts',
          icon: '💰',
          href: '/earnings',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          priority: 'medium'
        },
        {
          title: 'Driver Reviews',
          description: 'View your reviews and ratings',
          icon: '⭐',
          href: '/reviews',
          color: 'bg-purple-500 hover:bg-purple-600',
          priority: 'medium'
        }
      ];

      // Add conditional actions
      if (userActivity.hasActiveRide) {
        providerActions.unshift({
          title: 'Active Ride',
          description: 'Manage your current active ride',
          icon: '🚗',
          href: '/rideSharing/active-ride',
          color: 'bg-red-500 hover:bg-red-600',
          priority: 'urgent'
        });
      }

      return providerActions;
    } else {
      // Regular Passenger Actions
      const passengerActions = [
        {
          title: 'Find a Ride',
          description: 'Search for available rides',
          icon: '🔍',
          href: '/rideSharing/find-rides',
          color: 'bg-blue-500 hover:bg-blue-600',
          priority: 'high'
        },
        {
          title: 'My Bookings',
          description: 'View your ride bookings',
          icon: '📅',
          href: '/rideSharing/my-bookings',
          color: 'bg-green-500 hover:bg-green-600',
          priority: 'high'
        },
        {
          title: 'Ride History',
          description: 'View your past rides',
          icon: '📋',
          href: '/rideSharing/ride-history',
          color: 'bg-gray-500 hover:bg-gray-600',
          priority: 'medium'
        },
        {
          title: 'Become a Driver',
          description: 'Start offering rides and earn money',
          icon: '🚗',
          href: '/rideSharing/become-driver',
          color: 'bg-yellow-500 hover:bg-yellow-600',
          priority: 'medium'
        }
      ];

      // Add conditional actions
      if (userActivity.hasUpcomingBooking) {
        passengerActions.unshift({
          title: 'Upcoming Ride',
          description: 'View your next scheduled ride',
          icon: '⏰',
          href: '/rideSharing/upcoming-ride',
          color: 'bg-orange-500 hover:bg-orange-600',
          priority: 'urgent'
        });
      }

      return passengerActions;
    }
  }, [user, userActivity]);

  // Sort actions by priority
  const sortedActions = useMemo(() => {
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return [...actions].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [actions]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedActions.slice(0, 4).map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`${action.color} text-white rounded-lg p-4 block hover:shadow-lg transition-all duration-200 transform hover:scale-105`}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{action.icon}</span>
              <h3 className="font-semibold text-lg">{action.title}</h3>
            </div>
            <p className="text-sm opacity-90">{action.description}</p>
          </Link>
        ))}
      </div>
      
      {/* Show additional actions if there are more than 4 */}
      {sortedActions.length > 4 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sortedActions.slice(4).map((action, index) => (
              <Link
                key={index + 4}
                href={action.href}
                className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <span className="text-xl mr-3">{action.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{action.title}</h4>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;