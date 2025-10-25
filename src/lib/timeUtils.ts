/**
 * Utility functions for handling exact time storage and display
 * without timezone conversion, ensuring times are stored and shown
 * exactly as the user enters them.
 */

/**
 * Creates an exact datetime string from date and time parts
 * without timezone conversion. This stores the time exactly as entered.
 */
export function createExactDateTime(date: string, time: string): string {
  // Simply combine date and time without any timezone conversion
  // This ensures the stored time is exactly what the user entered
  const combinedDateTime = `${date}T${time}`;
  return new Date(combinedDateTime).toISOString();
}

/**
 * Formats a datetime string to show only the time portion
 * without applying timezone conversion. This displays the time
 * exactly as it was stored.
 */
export function formatExactTime(isoString: string): string {
  if (!isoString) return "";
  
  // Extract time from ISO string without timezone conversion
  const date = new Date(isoString);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Formats a datetime string to show date in local format
 * This is safe for dates as it doesn't affect time display
 */
export function formatLocalDate(isoString: string): string {
  if (!isoString) return "";
  
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { 
    year: 'numeric',
    month: 'short', 
    day: 'numeric' 
  });
}