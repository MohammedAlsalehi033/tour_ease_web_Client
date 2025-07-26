"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      await signup(name, email, password);
      router.push("/login");
    } catch (err) {
      setError(err.message || "Failed to create an account");
    }
  };

return (
  <div>
    <div className="max-w-md w-full p-6 bg-light-surface dark:bg-dark-surface rounded-lg shadow-md card">
      <h1 className="font-display text-headline-md font-semibold mb-6 text-center">Register</h1>
      
      {error && (
        <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded mb-4 font-sans text-body-md font-medium">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="font-display text-title-md mb-2" htmlFor="name">
            Name
          </label>
          <input
            className="input w-full"
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="font-display text-title-md mb-2" htmlFor="email">
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
          <label className="font-display text-title-md mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="input w-full"
            id="password"
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="btn-primary"
            type="submit"
          >
            Register
          </button>
          <Link 
            href="/login"
            className="btn-text"
          >
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  </div>
);
}