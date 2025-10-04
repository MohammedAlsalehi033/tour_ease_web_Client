'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Session } from 'next-auth';
import { container } from '@/app/lib/diContainer';
import { UserController } from '@/app/(controller)/user/userController';
import { BookingController } from '@/app/(controller)/rideSharing/bookingController';
import { RideListingController } from '@/app/(controller)/rideSharing/rideListingController';
import { User } from '@/app/(model)/user/userModel';
import { Booking } from '@/app/(model)/rideSharing/booking/bookingModel';
import ReviewPastRides from './ReviewPastRides';
import Link from 'next/link';

interface FunctionalDashboardProps {
  session: Session;
}

interface UserStats {
  totalBookings: number;
  completedRides: number;
  totalSpent: number;
  totalEarnings: number;
  ridesOffered: number;
  averageRating: number;
}

const FunctionalDashboard: React.FC<FunctionalDashboardProps> = ({ session }) => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalBookings: 0,
    completedRides: 0,
    totalSpent: 0,
    totalEarnings: 0,
    ridesOffered: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get greeting based on time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userController = container.resolve(UserController);
        const bookingController = container.resolve(BookingController);

        // Fetch user data
        if (session.user?.id) {
          const userData = await userController.getUserById(session.user.id);
          setUser(userData);

          // Check if user is transportation provider
          const isProvider = userData.roles.includes('transportation_provider');

          // Fetch bookings based on user role
          let userBookings: Booking[] = [];
          try {
            if (isProvider) {
              const response = await bookingController.getBookingsForDriver(session.user.id);
              userBookings = response.success ? response.data : [];
            } else {
              const response = await bookingController.getBookingsForTraveler(session.user.id);
              userBookings = response.success ? response.data : [];
            }
          } catch (bookingError) {
            console.error('Error fetching bookings:', bookingError);
            // Continue with empty bookings array
            userBookings = [];
          }
          
          setBookings(userBookings);

          // Calculate stats from actual data
          const completedBookings = userBookings.filter(booking => 
            booking.status === 'accepted'
          );
          
          const totalSpent = isProvider ? 0 : userBookings.reduce((sum, booking) => 
            sum + (parseFloat(booking.totalPrice) || 0), 0
          );
          
          const totalEarnings = isProvider ? userBookings.reduce((sum, booking) => 
            sum + (parseFloat(booking.totalPrice) || 0), 0
          ) : 0;

          setStats({
            totalBookings: userBookings.length,
            completedRides: completedBookings.length,
            totalSpent,
            totalEarnings,
            ridesOffered: isProvider ? userBookings.length : 0,
            averageRating: 4.5 // This would come from a separate rating API
          });
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [session.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `rgb(var(--background))` }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto" style={{ borderColor: `rgb(var(--primary))` }}></div>
          <p style={{ color: `rgb(var(--text))` }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: `rgb(var(--background))` }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isProvider = user?.roles.includes('transportation_provider');
  const isNewUser = stats.totalBookings === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: `rgb(var(--background))` }}>
      <div className=" mx-auto p-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: `rgb(var(--text))` }}>
            {greeting}, {session.user?.name || 'User'}! 
            {isNewUser ? ' 🚀' : isProvider ? ' 🚗' : ' 👋'}
          </h1>
          <p className="opacity-70" style={{ color: `rgb(var(--text))` }}>
            {isNewUser 
              ? "Welcome to TourEase! Let's get you started with your first ride."
              : isProvider
                ? "Manage your rides and track your earnings."
                : "Find rides and manage your bookings."
            }
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isProvider ? (
            <>
              <StatCard
                title="Rides Offered"
                value={stats.ridesOffered}
                icon="🚗"
                color="rgb(var(--primary))"
              />
              <StatCard
                title="Total Earnings"
                value={`$${stats.totalEarnings.toLocaleString()}`}
                icon="💰"
                color="rgb(var(--success))"
              />
              <StatCard
                title="Completed Trips"
                value={stats.completedRides}
                icon="✅"
                color="rgb(var(--info))"
              />
              <StatCard
                title="Driver Rating"
                value={`${stats.averageRating.toFixed(1)}/5`}
                icon="⭐"
                color="rgb(var(--warning))"
              />
            </>
          ) : stats.totalBookings > 0 ? (
            <>
              <StatCard
                title="Total Bookings"
                value={stats.totalBookings}
                icon="🚌"
                color="rgb(var(--primary))"
              />
              <StatCard
                title="Total Spent"
                value={`$${stats.totalSpent.toLocaleString()}`}
                icon="💳"
                color="rgb(var(--error))"
              />
              <StatCard
                title="Completed Trips"
                value={stats.completedRides}
                icon="✅"
                color="rgb(var(--success))"
              />
              <StatCard
                title="Your Rating"
                value={`${stats.averageRating.toFixed(1)}/5`}
                icon="⭐"
                color="rgb(var(--warning))"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Welcome!"
                value="Get Started"
                icon="👋"
                color="rgb(var(--primary))"
              />
              <StatCard
                title="Find Rides"
                value="Explore"
                icon="🔍"
                color="rgb(var(--success))"
              />
              <StatCard
                title="Safety First"
                value="Learn More"
                icon="🛡️"
                color="rgb(var(--info))"
              />
              <StatCard
                title="Need Help?"
                value="Support"
                icon="❓"
                color="rgb(var(--warning))"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <QuickActions isProvider={isProvider} isNewUser={isNewUser} />

        {/* Recent Activity & Upcoming Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentBookings bookings={bookings.slice(0, 5)} isProvider={isProvider} />
          <UpcomingBookings 
            bookings={bookings.filter(b => 
              b.status === 'accepted' || b.status === 'pending'
            ).slice(0, 5)} 
            isProvider={isProvider} 
          />
        </div>

        {/* Review Past Rides - Only for travelers */}
        {!isProvider && (
          <div className="mb-8">
            <ReviewPastRides bookings={bookings} isProvider={!!isProvider} />
          </div>
        )}

        {/* New User Onboarding */}
        {isNewUser && <NewUserBanner isProvider={isProvider} />}
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = 
({ title, value, icon, color }) => (
  <div
    className="rounded-[var(--radius-standard)] p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
    style={{ backgroundColor: `rgb(var(--surface))` }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-2xl">{icon}</div>
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
    <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--text))` }}>
      {title}
    </h3>
  </div>
);

// Quick Actions Component
const QuickActions: React.FC<{ isProvider: boolean; isNewUser: boolean }> = 
({ isProvider, isNewUser }) => {
  const actions = isNewUser ? [
    { title: 'Complete Profile', href: '/profile', icon: '👤', color: 'rgb(var(--primary))' },
    { title: 'Find Rides', href: '/rideSharing/map', icon: '🔍', color: 'rgb(var(--success))' },
    { title: 'Ask Questions', href: '/questions', icon: '🛡️', color: 'rgb(var(--info))' },
    { title: 'Chat Support', href: '/chats', icon: '❓', color: 'rgb(var(--warning))' }
  ] : isProvider ? [
    { title: 'Offer Ride', href: '/rideSharing/listing', icon: '➕', color: 'rgb(var(--primary))' },
    { title: 'Active Rides', href: '/rideSharing/activeRide', icon: '📋', color: 'rgb(var(--success))' },
    { title: 'My Reviews', href: '/my-reviews', icon: '⭐', color: 'rgb(var(--info))' },
    { title: 'Trip Planner', href: '/tripPlanner', icon: '🗺️', color: 'rgb(var(--warning))' }
  ] : [
    { title: 'Find Rides', href: '/rideSharing/maps', icon: '🔍', color: 'rgb(var(--primary))' },
    { title: 'Trip Planner', href: '/tripPlanner', icon: '�️', color: 'rgb(var(--success))' },
    { title: 'My Reviews', href: '/my-reviews', icon: '⭐', color: 'rgb(var(--info))' },
    { title: 'Ask Questions', href: '/questions', icon: '❓', color: 'rgb(var(--warning))' }
  ];

  return (
    <div 
      className="rounded-[var(--radius-standard)] p-6 border border-gray-200 dark:border-gray-700 mb-8"
      style={{ backgroundColor: `rgb(var(--surface))` }}
    >
      <h2 className="text-xl font-semibold mb-4" style={{ color: `rgb(var(--text))` }}>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="p-4 rounded-lg text-white block hover:shadow-lg transition-all duration-200 hover:scale-105"
            style={{ backgroundColor: action.color }}
          >
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-3">{action.icon}</span>
              <h3 className="font-semibold">{action.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Recent Bookings Component
const RecentBookings: React.FC<{ bookings: Booking[]; isProvider: boolean }> = 
({ bookings, isProvider }) => (
  <div 
    className="rounded-[var(--radius-standard)] p-6 border border-gray-200 dark:border-gray-700"
    style={{ backgroundColor: `rgb(var(--surface))` }}
  >
    <h2 className="text-xl font-semibold mb-4" style={{ color: `rgb(var(--text))` }}>
      {isProvider ? 'Recent Driver Bookings' : 'Recent Bookings'}
    </h2>
    {bookings.length === 0 ? (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">📱</div>
        <p className="opacity-70" style={{ color: `rgb(var(--text))` }}>
          No bookings yet
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium" style={{ color: `rgb(var(--text))` }}>
                  {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                </h3>
                <p className="text-sm opacity-70" style={{ color: `rgb(var(--text))` }}>
                  ${parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                </p>
                <p className="text-xs opacity-50 mt-1" style={{ color: `rgb(var(--text))` }}>
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  booking.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Upcoming Bookings Component  
const UpcomingBookings: React.FC<{ bookings: Booking[]; isProvider: boolean }> = 
({ bookings, isProvider }) => (
  <div 
    className="rounded-[var(--radius-standard)] p-6 border border-gray-200 dark:border-gray-700"
    style={{ backgroundColor: `rgb(var(--surface))` }}
  >
    <h2 className="text-xl font-semibold mb-4" style={{ color: `rgb(var(--text))` }}>
      {isProvider ? 'Upcoming Driver Bookings' : 'Upcoming Trips'}
    </h2>
    {bookings.length === 0 ? (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✈️</div>
        <p className="opacity-70" style={{ color: `rgb(var(--text))` }}>
          No upcoming trips
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium" style={{ color: `rgb(var(--text))` }}>
                  {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                </h3>
                <p className="text-sm opacity-70" style={{ color: `rgb(var(--text))` }}>
                  ${parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                </p>
                <p className="text-xs opacity-50 mt-1" style={{ color: `rgb(var(--text))` }}>
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span 
                className={`px-2 py-1 rounded text-xs font-medium ${
                  booking.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  booking.status === 'cancelled' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// New User Banner
const NewUserBanner: React.FC<{ isProvider: boolean }> = ({ isProvider }) => (
  <div className="mt-8 rounded-lg p-6 text-white" 
       style={{ background: 'linear-gradient(135deg, rgb(var(--primary)), rgb(var(--secondary)))' }}>
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-3xl mr-4">🎯</span>
        <div>
          <h3 className="text-xl font-semibold mb-1">
            Complete your TourEase journey!
          </h3>
          <p className="opacity-90">
            {isProvider 
              ? "Start offering rides and earn money today."
              : "Find your first ride and explore the city."
            }
          </p>
        </div>
      </div>
      <div className="flex space-x-3">
        <Link href="/profile" className="bg-white bg-opacity-20 px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors">
          Complete Profile
        </Link>
        <Link href="/rideSharing" className="bg-white bg-opacity-20 px-4 py-2 rounded-lg font-medium hover:bg-opacity-30 transition-colors">
          {isProvider ? 'Offer First Ride' : 'Find First Ride'}
        </Link>
      </div>
    </div>
  </div>
);

export default FunctionalDashboard;