/**
 * Example of how to update your time display components
 * Use formatExactTime instead of formatTime for consistent display
 */

import { formatExactTime, formatLocalDate } from '@/app/lib/timeUtils';

// Replace your existing formatTime functions with:
export const formatTime = (isoString: string) => {
  return formatExactTime(isoString);
};

export const formatDate = (isoString: string) => {
  return formatLocalDate(isoString);
};

// Example usage in components:
// Instead of: new Date(listing.departureTime).toLocaleTimeString()
// Use: formatTime(listing.departureTime)