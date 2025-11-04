import React from 'react'
import CreateRideRequestWizard from '../../components/CreateRideRequestWizard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const page = async () => {
   const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        redirect("/api/auth/signin");
      }

  return (
    <div>
      <CreateRideRequestWizard />
    </div>
  )
}

export default page