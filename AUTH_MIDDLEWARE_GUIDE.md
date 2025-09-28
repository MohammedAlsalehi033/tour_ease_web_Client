/**
 * Authentication Middleware Setup Guide
 * 
 * This document explains how to use the centralized authentication middleware
 * that has been implemented in your TourEase Next.js application.
 */

## Overview

The authentication middleware automatically protects your routes and ensures that:
- Unauthenticated users are redirected to the login page
- Authenticated users trying to access login/register are redirected to dashboard
- The original URL is preserved and users are redirected back after login

## Files Added/Modified

### 1. `src/middleware.ts`
- Centralized authentication middleware
- Defines public and protected routes
- Handles automatic redirects
- Preserves callback URLs

### 2. `src/hooks/useAuthRedirect.ts`
- Custom hooks for authentication logic
- `useRequireAuth()` - For protected pages
- `useRedirectIfAuthenticated()` - For auth pages
- Provides loading and authentication states

### 3. `src/components/auth/withAuth.tsx`
- Higher-Order Components (HOCs)
- `withAuth()` - Wraps protected components
- `withPublicRoute()` - Wraps auth pages (login/register)

### 4. Updated `src/app/(view)/login/page.tsx`
- Handles callback URLs properly
- Redirects to original destination after login
- Uses `withPublicRoute` HOC

## Usage Examples

### Protecting a Page Component

```tsx
// For a dashboard or profile page
import { withAuth } from '@/components/auth/withAuth';

function DashboardPage() {
  return <div>Protected Dashboard Content</div>;
}

export default withAuth(DashboardPage);
```

### Auth Pages (Login/Register)

```tsx
// For login or register pages
import { withPublicRoute } from '@/components/auth/withAuth';

function LoginPage() {
  return <div>Login Form</div>;
}

export default withPublicRoute(LoginPage, '/dashboard');
```

### Using Hooks in Components

```tsx
import { useRequireAuth } from '@/hooks/useAuthRedirect';

function MyComponent() {
  const { isAuthenticated, isLoading, user } = useRequireAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome {user?.name}!</div>;
}
```

## Route Configuration

### Public Routes (No Authentication Required)
- `/` - Home page
- `/login` - Login page  
- `/register` - Registration page
- `/api/auth` - Authentication API routes

### Protected Routes (Authentication Required)
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/rideSharing` - Ride sharing features
- `/tripPlanner` - Trip planning
- `/chats` - Chat functionality
- `/notifications` - User notifications
- `/users` - User management
- `/reviews` - Review system
- `/my-reviews` - User's reviews
- `/questions` - Q&A system

## Environment Variables Required

Make sure these are set in your `.env.local`:

```env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
FIREBASE_WEB_API_KEY=your-firebase-api-key
```

## How It Works

1. **Middleware Execution**: Runs on every request matching the config pattern
2. **Route Classification**: Determines if route is public or protected
3. **Authentication Check**: Validates JWT token from NextAuth
4. **Redirect Logic**: 
   - Unauthenticated → Login with callback URL
   - Authenticated on auth pages → Dashboard
   - Authenticated on protected pages → Continue
5. **Callback Handling**: After login, redirects to original destination

## Testing the Implementation

1. Try accessing `/dashboard` without being logged in
2. You should be redirected to `/login?callbackUrl=%2Fdashboard`
3. After successful login, you should be redirected back to `/dashboard`
4. Try accessing `/login` while authenticated - should redirect to `/dashboard`

## Customization

### Adding New Protected Routes
Edit the `protectedRoutes` array in `src/middleware.ts`:

```typescript
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/your-new-route', // Add here
];
```

### Changing Default Redirect
Modify the `redirectTo` parameter in HOCs or hooks:

```typescript
export default withPublicRoute(LoginPage, '/custom-dashboard');
```

### Custom Loading Components
Override the AuthLoading component in `withAuth.tsx`:

```tsx
const CustomLoading = () => (
  <div className="custom-loading">Your Loading UI</div>
);
```