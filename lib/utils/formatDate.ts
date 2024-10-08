/**
 * Formats a date into a readable string in 'en-GB' locale, with optional
 * timezone support.
 *
 * @param date - The date to format.
 * @param timeZone - The timezone to format the date in (defaults to
 *   'Pacific/Auckland' for NZ time).
 * @returns The formatted date string with time, or 'Invalid Date' if the input
 *   is invalid.
 */
export const formatDate = (
  date: Date | string,
  timeZone: string = 'Pacific/Auckland',
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date';

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Use 24-hour format
    timeZone,
  };

  return dateObj.toLocaleString('en-GB', options);
};
