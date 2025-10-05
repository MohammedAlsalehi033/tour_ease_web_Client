"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { withPublicRoute } from "@/components/auth/withAuth";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get the callback URL from query params, default to dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const result = await login(email, password);
      
      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect to the callback URL or dashboard after successful login
        router.push(callbackUrl);
      }
    } catch (err) {
      setError("Failed to sign in");
    }
  };

return (
  <div className="min-h-screen flex items-center justify-center px-4 py-12">
    <div className="max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-headline-lg font-bold text-primary mb-2">
          Welcome Back
        </h1>
        <p className="font-sans text-body-lg" style={{ color: 'rgba(var(--text), 0.7)' }}>
          Sign in to your TourEase account
        </p>
      </div>

      {/* Login Form Card */}
      <div className="card">
        <h2 className="font-display text-headline-md font-semibold mb-6">
          Login
        </h2>
        
        {error && (
          <div className="badge-error px-4 py-3 rounded mb-6 font-sans text-body-md font-medium">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label 
              htmlFor="email" 
              className="font-display text-title-md mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              required
            />
          </div>
          
          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="password" 
                className="font-display text-title-md"
              >
                Password
              </label>
              <Link 
                href="/forgot-password"
                className="text-sm text-primary hover:underline font-medium"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              required
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="checkbox"
            />
            <label htmlFor="remember" className="ml-2 block text-sm">
              Remember me
            </label>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full"
          >
            Sign In
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="font-sans text-body-md" style={{ color: 'rgba(var(--text), 0.7)' }}>
            Don't have an account?{" "}
            <Link 
              href="/register"
              className="text-primary hover:underline font-semibold"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);
}

// Export the component wrapped with the public route HOC
export default withPublicRoute(LoginPage);