"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UseAuthRedirectOptions {
  redirectTo?: string;
  redirectIfAuthenticated?: boolean;
  redirectIfUnauthenticated?: boolean;
}

/**
 * Custom hook to handle authentication redirects
 * @param options Configuration options for redirect behavior
 */
export const useAuthRedirect = (options: UseAuthRedirectOptions = {}) => {
  const {
    redirectTo = '/dashboard',
    redirectIfAuthenticated = false,
    redirectIfUnauthenticated = true,
  } = options;

  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    const isAuthenticated = !!session;

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && redirectIfAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Redirect unauthenticated users to login
    if (!isAuthenticated && redirectIfUnauthenticated) {
      const currentPath = window.location.pathname;
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }
  }, [session, status, router, redirectTo, redirectIfAuthenticated, redirectIfUnauthenticated]);

  return {
    isAuthenticated: !!session,
    isLoading: status === 'loading' || isChecking,
    user: session?.user,
    session,
  };
};

/**
 * Hook specifically for protecting pages that require authentication
 */
export const useRequireAuth = () => {
  return useAuthRedirect({
    redirectIfUnauthenticated: true,
    redirectIfAuthenticated: false,
  });
};

/**
 * Hook specifically for auth pages (login, register) that should redirect if already authenticated
 */
export const useRedirectIfAuthenticated = (redirectTo: string = '/dashboard') => {
  return useAuthRedirect({
    redirectTo,
    redirectIfAuthenticated: true,
    redirectIfUnauthenticated: false,
  });
};