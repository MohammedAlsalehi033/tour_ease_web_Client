"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await login(email, password);
      
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("Failed to sign in");
    }
  };

return (
  <div className="min-h-screen transition-colors duration-300 flex items-center justify-center bg-light-background dark:bg-dark-background">
    <div className="max-w-md w-full p-6 bg-light-surface dark:bg-dark-surface rounded-lg shadow-md card">
      <h1 className="text-headline-md font-semibold mb-6 text-center">Login</h1>
      
      {error && (
        <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-title-md mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="input w-full"
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-title-md mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="input w-full"
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="btn-primary"
            type="submit"
          >
            Sign In
          </button>
          <Link 
            href="/register"
            className="btn-text"
          >
            Create an account
          </Link>
        </div>
      </form>
    </div>
  </div>
);
}