'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useActiveRide, ActiveRideDetails } from '@/app/hooks/useActiveRide';
import ActiveRideNotification from './ActiveRideNotification';

interface ActiveRideContextType {
  activeRide: ActiveRideDetails | null;
  hasActiveRide: boolean;
  isLoading: boolean;
  error: string | null;
  refreshActiveRide: () => void;
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
}

const ActiveRideContext = createContext<ActiveRideContextType | undefined>(undefined);

export const useActiveRideContext = () => {
  const context = useContext(ActiveRideContext);
  if (context === undefined) {
    throw new Error('useActiveRideContext must be used within an ActiveRideProvider');
  }
  return context;
};

interface ActiveRideProviderProps {
  children: React.ReactNode;
}

export const ActiveRideProvider: React.FC<ActiveRideProviderProps> = ({ children }) => {
  const activeRideHook = useActiveRide();
  const [showNotification, setShowNotification] = useState(false);
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // Show notification when active ride is detected
  useEffect(() => {
    if (activeRideHook.hasActiveRide && !activeRideHook.isLoading) {
      // Show notification if we haven't shown it yet or if it's a new ride
      if (!hasShownNotification || !showNotification) {
        setShowNotification(true);
        setHasShownNotification(true);
      }
    } else {
      // Hide notification when no active ride
      setShowNotification(false);
      setHasShownNotification(false);
    }
  }, [activeRideHook.hasActiveRide, activeRideHook.isLoading, hasShownNotification, showNotification]);

  // Auto-hide notification after 10 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const contextValue: ActiveRideContextType = {
    ...activeRideHook,
    showNotification,
    setShowNotification,
  };

  return (
    <ActiveRideContext.Provider value={contextValue}>
      {children}
      
      {/* Active Ride Notification */}
      <AnimatePresence>
        {showNotification && activeRideHook.activeRide && (
          <ActiveRideNotification
            activeRide={activeRideHook.activeRide}
            onDismiss={() => setShowNotification(false)}
          />
        )}
      </AnimatePresence>
    </ActiveRideContext.Provider>
  );
};