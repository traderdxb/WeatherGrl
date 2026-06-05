/**
 * Formats a date or string to HH:mm:ss
 */
export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-GB', { hour12: false });
};

/**
 * Gets current UTC time formatted
 */
export const getUtcTime = (): string => {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false });
};

/**
 * Gets local time for a city based on its GMT offset (simplified for mock)
 */
export const getLocalTime = (timeZone?: string): string => {
  return new Date().toLocaleTimeString('en-GB', { timeZone, hour12: false });
};
