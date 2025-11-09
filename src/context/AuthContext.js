"use client";
import "reflect-metadata"
import { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ApiService } from "@/app/services/apiService";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  // Register with Firebase
  const signup = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const apiserver = new ApiService();

      console.log(`User created: ${JSON.stringify(userCredential.user)}`);
      const createdUserinDB = await apiserver.post("/createUser", {
        id: userCredential.user.uid,
        username: name,
        email: userCredential.user.email,
        password: password,
      });
      
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

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const apiserver = new ApiService();

      // Create user in database if they don't exist
      try {
        await apiserver.post("/createUser", {
          id: userCredential.user.uid,
          username: userCredential.user.displayName || "Google User",
          email: userCredential.user.email,
          password: "", // No password for OAuth users
        });
      } catch (dbError) {
        // User might already exist, that's okay
        console.log("User might already exist in database");
      }

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Sign in with NextAuth using the Firebase token
      const result = await signIn("credentials", {
        email: userCredential.user.email,
        firebaseToken: idToken,
        redirect: false,
      });

      return result;
    } catch (error) {
      throw error;
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const apiserver = new ApiService();

      // Create user in database if they don't exist
      try {
        await apiserver.post("/createUser", {
          id: userCredential.user.uid,
          username: userCredential.user.displayName || "Facebook User",
          email: userCredential.user.email,
          password: "", // No password for OAuth users
        });
      } catch (dbError) {
        // User might already exist, that's okay
        console.log("User might already exist in database");
      }

      // Get the Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Sign in with NextAuth using the Firebase token
      const result = await signIn("credentials", {
        email: userCredential.user.email,
        firebaseToken: idToken,
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
      signInWithGoogle,
      signInWithFacebook,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);