import { format } from 'date-fns';

/**
 * Safely formats a date string or Date object
 * @param {string|Date} dateValue - The date to format
 * @param {string} formatString - The format string for date-fns
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} Formatted date or fallback text
 */
export const safeFormatDate = (dateValue, formatString = 'MMM dd, yyyy HH:mm', fallback = 'Date not available') => {
  if (!dateValue) return fallback;
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, formatString);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

/**
 * Checks if a date value is valid
 * @param {string|Date} dateValue - The date to validate
 * @returns {boolean} True if date is valid
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  return !isNaN(date.getTime());
};
