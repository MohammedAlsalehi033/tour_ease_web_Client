import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/app/lib/diContainer'; 
import { UserController } from '@/app/(controller)/user/userController';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';
import { User } from '@/app/(model)/user/userModel';
import OtherAvatarPic from '../../components/otherAvatarPic';
import ReportUserButton from '../../components/ReportUserButton';
import ProviderRatingDisplay from '../../components/ProviderRatingDisplay';
import DriverReviewsSection from '../../components/DriverReviewsSection';

// This is the page that displays another user's profile.
const UserProfilePage = async ({ params }: { params: { id: string } }) => {
  // Get current user session
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  // We will need controllers to fetch user and provider data.
  const userController = container.resolve(UserController);
  const transportationProviderController = container.resolve(TransformationProviderController);

  let userData: User | null = null;
  let transportationProviderData: any = null;
  
  try {
    // Fetch the user's data using the ID from the URL params.
    userData = await userController.getUserById(params.id);
    // Fetch the transportation provider data for that same user.
    transportationProviderData = await transportationProviderController.getTransformationProviderById(params.id);
  } catch (error) {
    console.error("Error fetching user or provider data:", error);
    // You might want to return a "User not found" component here.
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-headline-md text-gray-500">User not found.</p>
        </div>
    );
  }

  // If no user data is found, we can't render a profile.
  if (!userData) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-headline-md text-gray-500">Could not load user profile.</p>
        </div>
    );
  }

  return (
    <div className="font-sans text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* User Profile Card */}
        <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <OtherAvatarPic imageUrl={userData.mediaUrls[0]} otherUserId={userData.id}/>
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-display text-headline-lg font-bold mb-2">{userData.name || "User"}</h1>
              
              <div className="space-y-3 mt-4">
                <div>
                  <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-sans text-body-lg">{userData.email || "No email provided"}</p>
                </div>
                
                <div>
                    <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="font-mono text-body-md bg-gray-100 dark:bg-gray-700 p-1 rounded inline-block">{params.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Details Card */}
        {transportationProviderData && (
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
            <h2 className="font-display text-headline-md font-bold mb-4">Provider Details</h2>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                <p className="font-sans text-body-lg">{transportationProviderData.vehicleType || "Not specified"}</p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Seats Available</p>
                <p className="font-sans text-body-lg">{transportationProviderData.seatsAvailable ?? "Not specified"}</p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <p className={`font-sans text-body-lg font-semibold ${transportationProviderData.accountStatus === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {transportationProviderData.accountStatus || "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="font-sans text-body-lg">
                  {transportationProviderData.createdAt 
                    ? new Date(transportationProviderData.createdAt).toLocaleDateString() 
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="font-sans text-body-sm text-gray-500 dark:text-gray-400">Rating</p>
                <ProviderRatingDisplay providerId={params.id} />
              </div>
            </div>
          </div>
        )}

        {/* Driver Reviews Section */}
        {transportationProviderData && (
          <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline">
            <DriverReviewsSection 
              driverId={params.id}
              driverName={userData?.name || "User"}
            />
          </div>
        )}

        {/* Report User Card */}
        <div className="card shadow-lg rounded-lg p-6 mb-8 dark:border-dark-outline border border-light-outline ">
          <h2 className="font-display text-headline-md font-bold mb-4">Actions</h2>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <div className="mt-6 flex justify-start">
            <ReportUserButton 
              userId={params.id} 
              userName={userData?.name || "this user"}
              currentUserId={currentUserId}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserProfilePage;
