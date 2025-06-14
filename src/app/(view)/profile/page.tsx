import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
// Assuming your DI container and controller are set up correctly
import { container } from '@/app/lib/diContainer'; 
import { SignoutButton } from './components/SignoutButton';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';


const Profile = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  let transportationProviderData = null;
  
  try {
    const transportationProviderController = container.resolve(TransformationProviderController);
    
    transportationProviderData = await transportationProviderController.getTransformationProviderById(session.user.id);
    console.log(transportationProviderData);

  } catch (error) {
    console.error("Error fetching transportation provider data:", error);
  }

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
     
      
      <div className="max-w-3xl w-full px-6 mt-20">
        
        {/* User Profile Card */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {session.user?.image ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-500">
                <img  
                  src={session.user.image}  
                  alt={`${session.user.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{session.user.name || "User"}</h2>
              
              <div className="space-y-3 mt-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-lg">{session.user.email || "No email provided"}</p>
                </div>
                
                {session.user.id && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="text-base font-mono bg-gray-100 dark:bg-gray-700 p-1 rounded inline-block">{session.user.id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Provider Details Card */}
        {transportationProviderData && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Provider Details</h2>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Vehicle Type</p>
                <p className="text-lg">{transportationProviderData.vehicleType || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Seats Available</p>
                <p className="text-lg">{transportationProviderData.seatsAvailable ?? "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                <p className={`text-lg font-semibold ${transportationProviderData.accountStatus === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {transportationProviderData.accountStatus || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                <p className="text-lg">
                  {transportationProviderData.createdAt 
                    ? new Date(transportationProviderData.createdAt).toLocaleDateString() 
                    : "Not specified"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings Card */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Account Settings</h2>
          <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
          <div className="mt-6 flex justify-end">

            <SignoutButton/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
