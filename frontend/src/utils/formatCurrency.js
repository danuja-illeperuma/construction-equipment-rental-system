/**
 * Formats a numeric value into standard currency display (LKR).
 * @param {number|string} amount
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'LKR 0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

export default formatCurrency;
