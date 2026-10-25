/**
 * Form and input validation helper functions.
 */

export const isRequired = (val) => {
  if (val === null || val === undefined) return false;
  if (typeof val === 'string') return val.trim().length > 0;
  return true;
};

export const isValidEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(String(email).trim().toLowerCase());
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Allows common international formats, min 9 digits
  const cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
  return cleaned.length >= 9 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
};

export const isPositiveNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num > 0;
};

export const isNonNegativeNumber = (val) => {
  const num = Number(val);
  return !isNaN(num) && num >= 0;
};

export const isValidDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end;
};

export default {
  isRequired,
  isValidEmail,
  isValidPhone,
  isPositiveNumber,
  isNonNegativeNumber,
  isValidDateRange,
};
