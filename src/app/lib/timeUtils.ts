/**
 * Time utility functions for proper timezone handling in ride sharing app
 * 
 * APPROACH: Store all times as UTC, display in user's local timezone
 * This ensures consistency across different timezones and server locations
 */

/**
 * Creates a UTC datetime from local date and time inputs
 * When user selects "9:00 AM" they mean 9:00 AM in their local timezone
 * This converts it to UTC for storage
 */
export const createLocalDateTime = (date: string, time: string): string => {
  // Create date in user's local timezone, then convert to UTC
  return new Date(`${date}T${time}`).toISOString();
};

/**
 * Formats a UTC datetime to local time string for display
 * When showing "9:00 AM UTC" to a user in Pakistan, show "2:00 PM"
 */
export const formatLocalTime = (isoString: string): string => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Formats a UTC datetime to local date string for display
 */
export const formatLocalDate = (isoString: string): string => {
  if (!isoString) return "TBD";
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Creates search time filters for database queries
 * When user searches for rides between 9:00-17:00 local time,
 * convert to UTC for database comparison
 */
export const createSearchTimeFilter = (date: string, timeStart: string, timeEnd: string) => {
  const departureAfter = new Date(`${date}T${timeStart}`).toISOString();
  const departureBefore = new Date(`${date}T${timeEnd}`).toISOString();
  
  return { departureAfter, departureBefore };
};

/**
 * Extracts local time from UTC datetime for form editing
 * When editing a ride scheduled for "9:00 AM UTC", show user their local equivalent
 */
export const extractLocalTime = (isoString: string): string => {
  if (!isoString) return "09:00";
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

/**
 * Extracts local date from UTC datetime for form editing  
 */
export const extractLocalDate = (isoString: string): string => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
};

/**
 * Alternative: Store times exactly as user enters them (no timezone conversion)
 * Use this if you want to store "9:00 AM" as "9:00 AM" regardless of timezone
 */
export const createExactDateTime = (date: string, time: string): string => {
  // This forces the time to be stored exactly as entered
  return new Date(`${date}T${time}:00.000Z`).toISOString();
};

/**
 * Display exact time without timezone conversion
 * Use with createExactDateTime to show times exactly as stored
 */
export const formatExactTime = (isoString: string): string => {
  if (!isoString) return "";
  // Extract time part without timezone conversion
  return isoString.substring(11, 16); // Gets "HH:MM" from "YYYY-MM-DDTHH:MM:SS.sssZ"
};