"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later");
      } else {
        setError("Failed to send reset email. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-headline-lg font-bold text-primary mb-2">
            Reset Password
          </h1>
          <p className="font-sans text-body-lg" style={{ color: 'rgba(var(--text), 0.7)' }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Reset Form Card */}
        <div className="card">
          {success ? (
            <div className="text-center py-4">
              {/* Success Icon */}
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success bg-opacity-10 flex items-center justify-center">
                <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="font-display text-headline-md font-semibold mb-3">
                Check Your Email
              </h2>
              <p className="font-sans text-body-md mb-6" style={{ color: 'rgba(var(--text), 0.7)' }}>
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              
              <div className="space-y-3">
                <Link 
                  href="/login"
                  className="btn-primary w-full block text-center"
                >
                  Back to Login
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full px-4 py-2.5 text-primary hover:underline font-sans text-body-md font-medium"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-headline-md font-semibold mb-6">
                Forgot Password
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
                    disabled={loading}
                  />
                  <p className="mt-2 text-sm" style={{ color: 'rgba(var(--text), 0.6)' }}>
                    Enter the email address associated with your account
                  </p>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center">
                <Link 
                  href="/login"
                  className="text-primary hover:underline font-sans text-body-md font-semibold inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="font-sans text-body-sm" style={{ color: 'rgba(var(--text), 0.6)' }}>
            Need help?{" "}
            <Link 
              href="/support"
              className="text-primary hover:underline font-medium"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
