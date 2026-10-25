/**
 * Formats an ISO date string into readable Date format (e.g. Oct 3, 2026).
 * @param {string|Date} dateValue
 * @returns {string} Formatted date
 */
export const formatDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats an ISO datetime string into readable Date & Time format (e.g. Oct 3, 2026, 02:30 PM).
 * @param {string|Date} dateTimeValue
 * @returns {string} Formatted datetime
 */
export const formatDateTime = (dateTimeValue) => {
  if (!dateTimeValue) return '—';
  const date = new Date(dateTimeValue);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a duration with its unit.
 * @param {number|string} duration
 * @param {string} rentalType HOURLY, DAILY, MONTHLY
 * @returns {string}
 */
export const formatDuration = (duration, rentalType) => {
  if (!duration) return '—';
  const type = (rentalType || '').toUpperCase();
  const unit = type === 'HOURLY' ? 'Hour(s)' : type === 'MONTHLY' ? 'Month(s)' : 'Day(s)';
  return `${duration} ${unit}`;
};

export default { formatDate, formatDateTime, formatDuration };
