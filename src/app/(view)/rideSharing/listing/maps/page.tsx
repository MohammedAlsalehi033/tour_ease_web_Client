import React from 'react'
import CreateRideListingWizard from '../../components/CreateRideListingWizard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import TransportationProviderForm from '../../components/newProviderForm';
import { container } from 'tsyringe';
import { UserController } from '@/app/(controller)/user/userController';

const page = async () => {
   const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        redirect("/api/auth/signin");
      }
    const userController = container.resolve(UserController);

          const userData = await userController.getUserById(session.user.id);
    
    if (!userData) {
      redirect("/api/auth/signin");
    }
    if (!userData.roles.some(role => role === "transportationProvider")) {
      return <TransportationProviderForm />;
    }

  return (
    <div>
      <CreateRideListingWizard />
    </div>
  )
}

export default page
