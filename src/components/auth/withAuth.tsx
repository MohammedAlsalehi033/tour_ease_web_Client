"use client";

import React from 'react';
import { useRequireAuth, useRedirectIfAuthenticated } from '@/hooks/useAuthRedirect';

// Loading component
const AuthLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

/**
 * Higher-Order Component to protect pages that require authentication
 */
export function withAuth<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>
) {
  const AuthenticatedComponent = (props: P) => {
    const { isLoading, isAuthenticated } = useRequireAuth();

    if (isLoading) {
      return <AuthLoading />;
    }

    if (!isAuthenticated) {
      // The useRequireAuth hook handles the redirect
      return <AuthLoading />;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
}

/**
 * Higher-Order Component for auth pages (login, register) that should redirect if authenticated
 */
export function withPublicRoute<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo: string = '/dashboard'
) {
  const PublicComponent = (props: P) => {
    const { isLoading, isAuthenticated } = useRedirectIfAuthenticated(redirectTo);

    if (isLoading) {
      return <AuthLoading />;
    }

    if (isAuthenticated) {
      // The useRedirectIfAuthenticated hook handles the redirect
      return <AuthLoading />;
    }

    return <WrappedComponent {...props} />;
  };

  PublicComponent.displayName = `withPublicRoute(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return PublicComponent;
}