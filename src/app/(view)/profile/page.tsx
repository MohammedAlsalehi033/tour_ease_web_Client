import React from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { container } from '@/app/lib/diContainer';
import { TransformationProviderController } from '@/app/(controller)/rideSharing/transportationProviderContrroller';
import { UserController } from '@/app/(controller)/user/userController';
import { User } from '@/app/(model)/user/userModel';
import ProfileView from './components/ProfileView';

const Profile = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }
  
  let transportationProviderData: any = null;
  let userData: User | null = null;
  
  try {
    const transportationProviderController = container.resolve(TransformationProviderController);
    const userController = container.resolve(UserController);
    userData = await userController.getUserById(session.user.id);
    console.log("userData", userData);
    
    transportationProviderData = await transportationProviderController.getTransformationProviderById(session.user.id);

  } catch (error) {
    console.error("Error fetching transportation provider data:", error);
  }

  return (
    <ProfileView 
      sessionUser={session.user}
      userData={userData}
      transportationProviderData={transportationProviderData}
    />
  );
};

export default Profile;
