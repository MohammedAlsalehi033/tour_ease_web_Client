import React, { useMemo } from 'react';
import { User } from '@/app/(model)/user/userModel';

interface DashboardStatsProps {
  user: User;
  userActivity: {
    ridesOffered?: number;
    ridesToken?: number;
    totalEarnings?: number;
    totalSpent?: number;
    completedRides?: number;
    rating?: number;
    isTransportationProvider?: boolean;
    totalTrips?: number;
  };
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ user, userActivity }) => {
  const stats = useMemo(() => {
    const isProvider = userActivity.isTransportationProvider || user.roles.includes('transportation_provider');
    
    if (isProvider) {
      // Driver/Provider Stats
      return [
        {
          title: 'Rides Offered',
          value: userActivity.ridesOffered || 0,
          icon: '🚗',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Total rides you\'ve offered'
        },
        {
          title: 'Total Earnings',
          value: `$${(userActivity.totalEarnings || 0).toLocaleString()}`,
          icon: '💰',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Your total earnings'
        },
        {
          title: 'Completed Trips',
          value: userActivity.completedRides || 0,
          icon: '✅',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Successfully completed trips'
        },
        {
          title: 'Driver Rating',
          value: userActivity.rating ? `${userActivity.rating.toFixed(1)}/5` : 'No ratings yet',
          icon: '⭐',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          description: 'Your average rating'
        }
      ];
    } else if (userActivity.totalTrips && userActivity.totalTrips > 0) {
      // Regular Passenger Stats
      return [
        {
          title: 'Rides Taken',
          value: userActivity.ridesToken || 0,
          icon: '🚌',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Total rides you\'ve taken'
        },
        {
          title: 'Total Spent',
          value: `$${(userActivity.totalSpent || 0).toLocaleString()}`,
          icon: '💳',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          description: 'Total amount spent on rides'
        },
        {
          title: 'Completed Trips',
          value: userActivity.completedRides || 0,
          icon: '✅',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Successfully completed trips'
        },
        {
          title: 'Passenger Rating',
          value: userActivity.rating ? `${userActivity.rating.toFixed(1)}/5` : 'No ratings yet',
          icon: '⭐',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          description: 'Your passenger rating'
        }
      ];
    } else {
      // New User Stats - Focus on getting started
      return [
        {
          title: 'Welcome!',
          value: 'Get Started',
          icon: '👋',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          description: 'Complete your profile to begin'
        },
        {
          title: 'Find Rides',
          value: 'Explore',
          icon: '🔍',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          description: 'Search for available rides'
        },
        {
          title: 'Safety First',
          value: 'Learn More',
          icon: '🛡️',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          description: 'Review our safety guidelines'
        },
        {
          title: 'Need Help?',
          value: 'Support',
          icon: '❓',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          description: 'Get help and support'
        }
      ];
    }
  }, [user, userActivity]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {stat.title}
          </h3>
          <p className="text-sm text-gray-600">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;