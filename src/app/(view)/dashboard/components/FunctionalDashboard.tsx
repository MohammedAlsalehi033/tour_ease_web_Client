'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Session } from 'next-auth';
import { motion } from 'framer-motion';
import { container } from '@/app/lib/diContainer';
import { UserController } from '@/app/(controller)/user/userController';
import { BookingController } from '@/app/(controller)/rideSharing/bookingController';
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const cardHoverVariants = {
    scale: 1.05,
    y: -2,
    transition: { duration: 0.2 }
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

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
          const isProvider = !!userData.roles?.includes('transportation_provider');

          // Fetch bookings based on user role
          let userBookings: Booking[] = [];
          try {
            if (isProvider) {
              const response = await bookingController.getBookingsForDriver(session.user.id);
              userBookings = response.success ? (response.data as Booking[]) : [];
            } else {
              const response = await bookingController.getBookingsForTraveler(session.user.id);
              userBookings = response.success ? (response.data as Booking[]) : [];
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
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
          <p className="text-body-lg text-light-on-surface dark:text-dark-on-surface">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-background dark:bg-dark-background">
        <div className="text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary py-2 px-6"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isProvider = !!user?.roles?.includes('transportation_provider');
  const isNewUser = stats.totalBookings === 0;

  return (
    <motion.div
      className="min-h-screen bg-light-background dark:bg-dark-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className=" p-6 ">
        {/* Dashboard Header */}
        <motion.div
          className="mb-8"
          variants={itemVariants}
        >
          <h1 className="font-display text-headline-lg font-bold mb-2 text-light-on-surface dark:text-dark-on-surface">
            {greeting}, {session.user?.name || 'User'}!
          </h1>
          <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {isNewUser
              ? "Welcome to TourEase! Let's get you started with your first ride."
              : isProvider
                ? "Manage your rides and track your earnings."
                : "Find rides and manage your bookings."
            }
          </p>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          variants={staggerContainerVariants}
        >
          {isProvider ? (
            <>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Rides Offered"
                  value={stats.ridesOffered}
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Total Earnings"
                  value={`PKR ${stats.totalEarnings.toLocaleString()}`}
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Completed Trips"
                  value={stats.completedRides}
                />
              </motion.div>
            </>
          ) : stats.totalBookings > 0 ? (
            <>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Total Bookings"
                  value={stats.totalBookings}
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Total Spent"
                  value={`PKR ${stats.totalSpent.toLocaleString()}`}
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Completed Trips"
                  value={stats.completedRides}
                />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Get Started"
                  value="0"
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Find Rides"
                  value="Explore"
                />
              </motion.div>
              <motion.div variants={itemVariants} whileHover={cardHoverVariants}>
                <StatCard
                  title="Need Help?"
                  value="Support"
                />
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <QuickActions isProvider={isProvider} isNewUser={isNewUser} />
        </motion.div>

        {/* Recent Activity & Upcoming Trips */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          variants={staggerContainerVariants}
        >
          <motion.div variants={itemVariants}>
            <RecentBookings bookings={bookings.slice(0, 5)} isProvider={isProvider} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <UpcomingBookings
              bookings={bookings.filter(b =>
                b.status === 'accepted' || b.status === 'pending'
              ).slice(0, 5)}
              isProvider={isProvider}
            />
          </motion.div>
        </motion.div>

        {/* Review Past Rides - Only for travelers */}
        {!isProvider && (
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <ReviewPastRides bookings={bookings} isProvider={!!isProvider} />
          </motion.div>
        )}

        {/* New User Onboarding */}
        {isNewUser && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <NewUserBanner isProvider={isProvider} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard: React.FC<{ title: string; value: string | number }> =
  ({ title, value }) => (
    <motion.div
      className="card shadow-lg rounded-lg p-6 border border-light-outline dark:border-dark-outline cursor-pointer"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
        {title}
      </p>
      <motion.p
        className="font-display text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {value}
      </motion.p>
    </motion.div>
  );

// Quick Actions Component
const QuickActions: React.FC<{ isProvider: boolean; isNewUser: boolean }> =
  ({ isProvider, isNewUser }) => {
    const actions = isNewUser ? [
      { title: 'Complete Profile', href: '/profile' },
      { title: 'Find Rides', href: '/rideSharing/maps' },
      { title: 'Ask Questions', href: '/questions' },
      { title: 'Chat Support', href: '/chats' }
    ] : isProvider ? [
      { title: 'Offer Ride', href: '/rideSharing/listing' },
      { title: 'Active Rides', href: '/rideSharing/activeRide' },
      { title: 'My Reviews', href: '/my-reviews' },
      { title: 'Trip Planner', href: '/tripPlanner' }
    ] : [
      { title: 'Find Rides', href: '/rideSharing/maps' },
      { title: 'Trip Planner', href: '/tripPlanner' },
      { title: 'My Reviews', href: '/my-reviews' },
      { title: 'Ask Questions', href: '/questions' }
    ];

    return (
      <div className="card shadow-lg rounded-lg p-6 border border-light-outline dark:border-dark-outline mb-8">
        <h2 className="font-display text-headline-md font-bold mb-4 text-light-on-surface dark:text-dark-on-surface">
          Quick Actions
        </h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
        >
          {actions.map((action, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.8 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.4 }
                }
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={action.href}
                className="btn-primary text-center py-3 px-4 rounded-lg font-medium transition-all block"
              >
                {action.title}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  };

// Recent Bookings Component
const RecentBookings: React.FC<{ bookings: Booking[]; isProvider: boolean }> =
  ({ bookings, isProvider }) => (
    <motion.div
      className="card shadow-lg rounded-lg p-6 border border-light-outline dark:border-dark-outline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <h2 className="font-display text-headline-md font-bold mb-4 text-light-on-surface dark:text-dark-on-surface">
        {isProvider ? 'Recent Driver Bookings' : 'Recent Bookings'}
      </h2>
      {bookings.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
            No bookings yet
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
              }
            }
          }}
        >
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              className="p-4 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.4 }
                }
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-body-lg text-light-on-surface dark:text-dark-on-surface">
                    {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                  </h3>
                  <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    PKR {parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                  </p>
                  <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <motion.span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'accepted' ? 'badge-success' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {booking.status}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

// Upcoming Bookings Component  
const UpcomingBookings: React.FC<{ bookings: Booking[]; isProvider: boolean }> =
  ({ bookings, isProvider }) => (
    <motion.div
      className="card shadow-lg rounded-lg p-6 border border-light-outline dark:border-dark-outline"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
    >
      <h2 className="font-display text-headline-md font-bold mb-4 text-light-on-surface dark:text-dark-on-surface">
        {isProvider ? 'Upcoming Driver Bookings' : 'Upcoming Trips'}
      </h2>
      {bookings.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
            No upcoming trips
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
              }
            }
          }}
        >
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              className="p-4 rounded-lg border border-light-outline dark:border-dark-outline bg-light-surface-variant/30 dark:bg-dark-surface-variant/30"
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 0.4 }
                }
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: "rgba(var(--primary-rgb), 0.05)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-body-lg text-light-on-surface dark:text-dark-on-surface">
                    {booking.bookingSource === 'listing' ? 'Ride Listing' : 'Ride Request'} #{booking.id.toString().slice(-4)}
                  </h3>
                  <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    PKR {parseFloat(booking.totalPrice).toFixed(2)} • {booking.seatsBooked} seat{booking.seatsBooked !== 1 ? 's' : ''}
                  </p>
                  <p className="text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <motion.span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'accepted' ? 'badge-success' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                    booking.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  {booking.status}
                </motion.span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );

// New User Banner
const NewUserBanner: React.FC<{ isProvider: boolean }> = ({ isProvider }) => (
  <motion.div
    className="card shadow-lg rounded-lg p-6 border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10"
    initial={{ opacity: 0, scale: 0.9, y: 30 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      duration: 0.6,
      delay: 0.8,
      type: "spring",
      stiffness: 100
    }}
    whileHover={{
      scale: 1.02,
      boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }}
  >
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <h3 className="font-display text-headline-md font-bold mb-2 text-light-on-surface dark:text-dark-on-surface">
          Complete your TourEase journey!
        </h3>
        <p className="text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
          {isProvider
            ? "Start offering rides and earn money today."
            : "Find your first ride and explore the city."
          }
        </p>
      </motion.div>
      <motion.div
        className="flex gap-3 flex-shrink-0"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/profile" className="btn-secondary py-2 px-4 rounded-lg font-medium whitespace-nowrap">
            Complete Profile
          </Link>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href="/rideSharing" className="btn-primary py-2 px-4 rounded-lg font-medium whitespace-nowrap">
            {isProvider ? 'Offer First Ride' : 'Find First Ride'}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  </motion.div>
);

export default FunctionalDashboard;