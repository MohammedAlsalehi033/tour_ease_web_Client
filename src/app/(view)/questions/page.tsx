import "reflect-metadata";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { container } from "@/app/lib/diContainer";
import { UserController } from "@/app/(controller)/user/userController";
// import { ContentController } from '../../(controller)/content/contentController';



export default async function Page() {
const contentController : ContentController= container.resolve(ContentController);


  const userController = container.resolve(UserController);
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    // Redirect to sign in if there is no session
    redirect("/api/auth/signin");
  }

const questions = await contentController.getAllQuestions();
  
  const userData = await userController.getUserById(session?.user.id);
  
  // Pass data to the client component
  return (
    <ClientComponent 
      rideRequests={rideRequests} 
      rideListings={rideListings}
      userData={userData}
    />
  );
}