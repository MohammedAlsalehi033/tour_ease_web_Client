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
          colorStyle: { color: `rgb(var(--primary))` }
        },
        {
          title: 'Total Earnings',
          value: `$${(userActivity.totalEarnings || 0).toLocaleString()}`,
          icon: '💰',
          colorStyle: { color: `rgb(var(--success))` }
        },
        {
          title: 'Completed Trips',
          value: userActivity.completedRides || 0,
          icon: '✅',
          colorStyle: { color: `rgb(var(--info))` }
        },
        {
          title: 'Driver Rating',
          value: userActivity.rating ? `${userActivity.rating.toFixed(1)}/5` : 'No ratings yet',
          icon: '⭐',
          colorStyle: { color: `rgb(var(--warning))` }
        }
      ];
    } else if (userActivity.totalTrips && userActivity.totalTrips > 0) {
      // Regular Passenger Stats
      return [
        {
          title: 'Rides Taken',
          value: userActivity.ridesToken || 0,
          icon: '🚌',
          colorStyle: { color: `rgb(var(--primary))` }
        },
        {
          title: 'Total Spent',
          value: `$${(userActivity.totalSpent || 0).toLocaleString()}`,
          icon: '💳',
          colorStyle: { color: `rgb(var(--error))` }
        },
        {
          title: 'Completed Trips',
          value: userActivity.completedRides || 0,
          icon: '✅',
          colorStyle: { color: `rgb(var(--success))` }
        },
        {
          title: 'Passenger Rating',
          value: userActivity.rating ? `${userActivity.rating.toFixed(1)}/5` : 'No ratings yet',
          icon: '⭐',
          colorStyle: { color: `rgb(var(--warning))` }
        }
      ];
    } else {
      // New User Stats - Focus on getting started
      return [
        {
          title: 'Welcome!',
          value: 'Get Started',
          icon: '👋',
          colorStyle: { color: `rgb(var(--primary))` }
        },
        {
          title: 'Find Rides',
          value: 'Explore',
          icon: '🔍',
          colorStyle: { color: `rgb(var(--success))` }
        },
        {
          title: 'Safety First',
          value: 'Learn More',
          icon: '🛡️',
          colorStyle: { color: `rgb(var(--info))` }
        },
        {
          title: 'Need Help?',
          value: 'Support',
          icon: '❓',
          colorStyle: { color: `rgb(var(--warning))` }
        }
      ];
    }
  }, [user, userActivity]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-[var(--radius-standard)] p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          style={{ backgroundColor: `rgb(var(--surface))` }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-2xl font-bold" style={stat.colorStyle}>
              {stat.value}
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: `rgb(var(--text))` }}>
            {stat.title}
          </h3>
          <p className="text-sm opacity-70" style={{ color: `rgb(var(--text))` }}>
            {stat.title === 'Welcome!' && 'Complete your profile to begin'}
            {stat.title === 'Find Rides' && 'Search for available rides'}
            {stat.title === 'Safety First' && 'Review our safety guidelines'}
            {stat.title === 'Need Help?' && 'Get help and support'}
            {stat.title === 'Rides Offered' && 'Total rides you\'ve offered'}
            {stat.title === 'Total Earnings' && 'Your total earnings'}
            {stat.title === 'Completed Trips' && 'Successfully completed trips'}
            {stat.title === 'Driver Rating' && 'Your average rating'}
            {stat.title === 'Rides Taken' && 'Total rides you\'ve taken'}
            {stat.title === 'Total Spent' && 'Total amount spent on rides'}
            {stat.title === 'Passenger Rating' && 'Your passenger rating'}
          </p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;