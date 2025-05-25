import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { signOut } from "next-auth/react";
import { redirect } from 'next/navigation';
import { container } from '@/app/lib/diContainer';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';
import { SignoutButton } from './components/SignoutButton';

const Profile = async () => {
  const session = await getServerSession(authOptions);

const transportationProvierController =  container.resolve(TransformationProviderController);


  
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
      const transporationProviderData = await transportationProvierController.getTransformationProviderById(session?.user.id);
      console.log(transporationProviderData)

  return (
    <div className="min-h-screen transition-colors duration-300 flex flex-col items-center justify-start pt-12">
      <div className="app-bar w-full fixed top-0 left-0 z-10">
        <h1 className="text-headline-md">My Profile</h1>
      </div>
      
      <div className="max-w-3xl w-full px-6 mt-16">
        <h1 className="mb-6">User Profile</h1>
        
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {session.user?.image ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary">
                <img 
                  src={session.user.image} 
                  alt={`${session.user.name}'s profile picture`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center text-display-md font-bold text-primary">
                {session.user?.name?.charAt(0) || "U"}
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-headline-md mb-4 text-center md:text-left">{session.user.name || "User"}</h2>
              
              <div className="divider my-4"></div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-title-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-body-lg">{session.user.email || "No email provided"}</p>
                </div>
                
                {session.user.id && (
                  <div>
                    <p className="text-title-sm text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="text-body-md font-mono">{session.user.id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        

              <div className="card mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
            
            <div className="flex-1">
              <h2 className="text-headline-md mb-4 text-center md:text-left">Prodiver Details</h2>
              
              <div className="divider my-4"></div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-title-sm text-gray-500 dark:text-gray-400">vehicle Type</p>
                  <p className="text-body-lg">{transporationProviderData.vehicleType || "No vehicle Type provided"}</p>
                </div>

                <div>
                  <p className="text-title-sm text-gray-500 dark:text-gray-400">seats Available</p>
                  <p className="text-body-lg">{transporationProviderData.seatsAvailable || "No vehicle Type provided"}</p>
                </div>

                <div>
                  <p className="text-title-sm text-gray-500 dark:text-gray-400">Created at</p>
                  <p className="text-body-lg">{transporationProviderData.createdAt || "No vehicle Type provided"}</p>
                </div>
                 <div>
                  <p className="text-title-sm text-gray-500 dark:text-gray-400">Account Status</p>
                  <p className="text-body-lg">{transporationProviderData.accountStatus || "No vehicle Type provided"}</p>
                </div>
              
              </div>
            </div>
          </div>
        </div>
        
        <div className="card mb-8">
          <h2 className="mb-4">Account Settings</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="relative inline-block w-11 h-6">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  id="notifications" 
                />
                <label 
                  htmlFor="notifications" 
                  className="switch absolute cursor-pointer"
                ></label>
              </div>
              <label htmlFor="notifications" className="text-body-md">Enable Notifications</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative inline-block w-11 h-6">
                <input 
                  type="checkbox" 
                  className="peer sr-only" 
                  id="darkMode" 
                />
                <label 
                  htmlFor="darkMode" 
                  className="switch absolute cursor-pointer"
                ></label>
              </div>
              <label htmlFor="darkMode" className="text-body-md">Dark Mode</label>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div className="mt-6">
            
              <SignoutButton/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;