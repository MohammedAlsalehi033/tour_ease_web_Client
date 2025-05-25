"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  // Register with Firebase
  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their name if provided
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Login with NextAuth
  const login = async (email, password) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Logout of both Firebase and NextAuth
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
    }
  }, [status]);

  return (
    <AuthContext.Provider value={{ 
      currentUser: session?.user,  // Changed from user to currentUser
      signup,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);