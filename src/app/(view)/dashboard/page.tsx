// page.tsx (Server Component) - Functional Dashboard
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import FunctionalDashboard from "./components/FunctionalDashboard";

export default async function Page() {
  // Get the session on the server
  const session = await getServerSession(authOptions);
  
  // Check if user is authenticated
  if (!session || !session.user) {
    // Redirect to sign in if there is no session
    redirect("/api/auth/signin");
  }

  return <FunctionalDashboard session={session} />;
}