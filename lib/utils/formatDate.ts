/**
 * Formats a date into a readable string in 'en-GB' locale.
 * @param date - The date to format.
 * @returns The formatted date string, or 'Invalid Date' if the input is invalid.
 */
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!dateObj || isNaN(dateObj.getTime())) return 'Invalid Date';

    return dateObj.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
};
