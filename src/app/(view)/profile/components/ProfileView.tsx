'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User } from '@/app/(model)/user/userModel';
import AvatarImage from './avatarImage';
import { 
  User as UserIcon, 
  Mail, 
  Hash, 
  Car, 
  Users, 
  Activity, 
  Calendar,
  Edit,
  Settings,
  LogOut
} from 'lucide-react';
import ProviderRatingDisplay from '../../components/ProviderRatingDisplay';
import DriverReviewsSection from '../../components/DriverReviewsSection';
import UpdateProviderForm from './UpdateProviderForm';
import { SignoutButton } from './SignoutButton';

interface ProfileViewProps {
  sessionUser: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
    image?: string | null;
  };
  userData: User | null;
  transportationProviderData: any;
}

const ProfileView: React.FC<ProfileViewProps> = ({ sessionUser, userData, transportationProviderData }) => {
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">My Profile</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and account settings</p>
          </div>
        </motion.div>

        {/* User Profile Card */}
        <motion.div variants={itemVariants} className="card bg-white dark:bg-gray-800 border-none shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative inline-block">
                <AvatarImage media={userData?.mediaUrls || []} userName={sessionUser.name || "User"} size="w-32 h-32" />
                <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 z-10"></div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-display">{sessionUser.name || "User"}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                    {userData?.roles?.map((role, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full font-medium capitalize">
                        {role.replace(/_/g, ' ')}
                      </span>
                    )) || <span className="text-gray-500">User</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                      <Mail size={18} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{sessionUser.email || "No email provided"}</p>
                    </div>
                  </div>

                  {sessionUser.id && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                        <Hash size={18} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">User ID</p>
                        <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{sessionUser.id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Provider Details Card */}
        {transportationProviderData && (
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="card bg-white dark:bg-gray-800 border-none shadow-lg">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                  <Car size={24} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Provider Details</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Car size={16} />
                      <span className="text-sm font-medium">Vehicle Type</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transportationProviderData.vehicleType || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Users size={16} />
                      <span className="text-sm font-medium">Seats Available</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transportationProviderData.seatsAvailable ?? "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Activity size={16} />
                      <span className="text-sm font-medium">Account Status</span>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transportationProviderData.accountStatus === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {transportationProviderData.accountStatus || "Not specified"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar size={16} />
                      <span className="text-sm font-medium">Member Since</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {transportationProviderData.createdAt
                        ? new Date(transportationProviderData.createdAt).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-4">Performance & Settings</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Rating</p>
                      {sessionUser.id && <ProviderRatingDisplay providerId={sessionUser.id} />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Update Vehicle Info</p>
                      {sessionUser.id && (
                        <UpdateProviderForm
                          providerId={sessionUser.id}
                          currentVehicleType={transportationProviderData.vehicleType || ''}
                          currentSeatsAvailable={transportationProviderData.seatsAvailable || 1}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Reviews Section */}
            <div className="card bg-white dark:bg-gray-800 border-none shadow-lg">
              <div className="p-6">
                {sessionUser.id && (
                  <DriverReviewsSection
                    driverId={sessionUser.id}
                    driverName={userData?.username || "You"}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Account Settings Card */}
        <motion.div variants={itemVariants} className="card bg-white dark:bg-gray-800 border-none shadow-lg">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300">
              <Settings size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white font-display">Account Settings</h2>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Sign Out</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account on this device</p>
              </div>
              <SignoutButton />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProfileView;
