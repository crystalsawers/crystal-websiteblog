/**
 * Formats a date into a readable string in 'en-GB' locale.
 *
 * NZ timezone is used by default, with the timezone rendered explicitly
 * as NZST or NZDT according to New Zealand daylight-saving rules.
 *
 * @param date - The date to format.
 * @param timeZone - The timezone to format the date in (defaults to
 *   'Pacific/Auckland' for NZ time).
 * @returns The formatted date string with time and timezone, or 'Invalid Date'
 *   if the input is invalid.
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
    hour12: false,
    timeZone,
  };

  const formattedDate = dateObj.toLocaleString('en-GB', options);

  if (timeZone !== 'Pacific/Auckland') {
    return formattedDate;
  }

  // Get the actual Auckland UTC offset for this exact date.
  const offsetString = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    timeZoneName: 'longOffset',
  })
    .formatToParts(dateObj)
    .find((part) => part.type === 'timeZoneName')?.value;

  const nzTimezone = offsetString === 'GMT+13:00' ? 'NZDT' : 'NZST';

  return `${formattedDate} ${nzTimezone}`;
};
