import React, { useMemo } from 'react';
import { User } from '@/app/(model)/user/userModel';

interface Activity {
  id: string;
  type: 'ride_offered' | 'ride_booked' | 'ride_completed' | 'payment_received' | 'review_received' | 'profile_updated' | 'welcome' | 'tip';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  color: string;
  metadata?: any;
}

interface RecentActivityProps {
  user: User;
  userActivity: {
    isTransportationProvider?: boolean;
    totalTrips?: number;
    recentActivities?: Activity[];
  };
}

const RecentActivity: React.FC<RecentActivityProps> = ({ user, userActivity }) => {
  const activities = useMemo(() => {
    const isProvider = userActivity.isTransportationProvider || user.roles.includes('transportation_provider');
    const isNewUser = !userActivity.totalTrips || userActivity.totalTrips === 0;
    
    // Use actual activities if available, otherwise generate sample activities based on user type
    if (userActivity.recentActivities && userActivity.recentActivities.length > 0) {
      return userActivity.recentActivities;
    }
    
    if (isNewUser) {
      // New User - Welcome messages and tips
      return [
        {
          id: '1',
          type: 'welcome' as const,
          title: 'Welcome to TourEase! 🎉',
          description: 'Thanks for joining our ride-sharing community. Complete your profile to get started.',
          timestamp: new Date().toISOString(),
          icon: '👋',
          color: 'text-blue-600'
        },
        {
          id: '2',
          type: 'tip' as const,
          title: 'Safety Tip',
          description: 'Always verify the driver\'s identity and vehicle details before getting in.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          icon: '🛡️',
          color: 'text-green-600'
        },
        {
          id: '3',
          type: 'tip' as const,
          title: 'Getting Started',
          description: 'Use the search feature to find rides that match your route and schedule.',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          icon: '💡',
          color: 'text-yellow-600'
        }
      ];
    } else if (isProvider) {
      // Sample activities for transportation providers
      return [
        {
          id: '1',
          type: 'ride_offered' as const,
          title: 'New ride offer published',
          description: 'Your ride from Downtown to Airport is now available for booking.',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          icon: '🚗',
          color: 'text-blue-600'
        },
        {
          id: '2',
          type: 'ride_booked' as const,
          title: 'Ride booked!',
          description: 'Sarah M. has booked your ride for tomorrow at 9:00 AM.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          icon: '📅',
          color: 'text-green-600'
        },
        {
          id: '3',
          type: 'payment_received' as const,
          title: 'Payment received',
          description: 'You received $25.00 for your completed ride to the mall.',
          timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          icon: '💰',
          color: 'text-green-600'
        },
        {
          id: '4',
          type: 'review_received' as const,
          title: 'New 5-star review',
          description: 'John D. left you a great review: "Excellent driver, very punctual!"',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          icon: '⭐',
          color: 'text-yellow-600'
        }
      ];
    } else {
      // Sample activities for passengers
      return [
        {
          id: '1',
          type: 'ride_booked' as const,
          title: 'Ride confirmed',
          description: 'Your ride with Mike T. is confirmed for tomorrow at 8:30 AM.',
          timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
          icon: '✅',
          color: 'text-green-600'
        },
        {
          id: '2',
          type: 'ride_completed' as const,
          title: 'Ride completed',
          description: 'Thanks for riding with Lisa K.! Don\'t forget to leave a review.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          icon: '🏁',
          color: 'text-blue-600'
        },
        {
          id: '3',
          type: 'profile_updated' as const,
          title: 'Profile updated',
          description: 'Your profile photo has been successfully updated.',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          icon: '👤',
          color: 'text-purple-600'
        }
      ];
    }
  }, [user, userActivity]);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const isNewUser = !userActivity.totalTrips || userActivity.totalTrips === 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {isNewUser ? 'Getting Started' : 'Recent Activity'}
        </h2>
        {!isNewUser && activities.length > 0 && (
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No recent activity</h3>
          <p className="text-gray-600">
            {userActivity.isTransportationProvider 
              ? 'Start by offering your first ride!'
              : 'Book your first ride to see activity here.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-medium ${activity.color}`}>
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {getTimeAgo(activity.timestamp)}
                </p>
              </div>
              
              {/* Add action button for certain activity types */}
              {(activity.type === 'ride_booked' || activity.type === 'ride_completed') && (
                <div className="flex-shrink-0">
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New user call-to-action */}
      {isNewUser && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🚀</span>
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Ready to get started?</h3>
              <p className="text-sm text-blue-600 mt-1">
                Complete your profile and find your first ride!
              </p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;