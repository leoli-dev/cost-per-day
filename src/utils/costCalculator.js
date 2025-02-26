/**
 * 计算物品的每日成本
 * @param {number} price - 物品价格
 * @param {string} purchaseDate - 购买日期 (ISO 格式)
 * @returns {number} - 每日成本
 */
export const calculateDailyCost = (price, purchaseDate) => {
  const purchaseTime = new Date(purchaseDate).getTime();
  const currentTime = new Date().getTime();
  const daysDiff = Math.max(1, Math.ceil((currentTime - purchaseTime) / (1000 * 60 * 60 * 24)));
  return price / daysDiff;
};

/**
 * 格式化货币显示（保留两位小数）
 * @param {number} value - 要格式化的数值
 * @returns {string} - 格式化后的字符串
 */
export const formatCurrency = (value) => {
  return Number(value).toFixed(2);
}; 