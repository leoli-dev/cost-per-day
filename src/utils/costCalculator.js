/**
 * Calculate the daily cost of an item
 * @param {number} price - Item price
 * @param {string} purchaseDate - Purchase date (ISO format)
 * @returns {number} - Daily cost
 */
export const calculateDailyCost = (price, purchaseDate) => {
  const purchaseTime = new Date(purchaseDate).getTime();
  const currentTime = new Date().getTime();
  const daysDiff = Math.max(1, Math.ceil((currentTime - purchaseTime) / (1000 * 60 * 60 * 24)));
  return price / daysDiff;
};

/**
 * Format currency display (with two decimal places and thousands separator)
 * @param {number} value - Value to format
 * @returns {string} - Formatted string
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}; 