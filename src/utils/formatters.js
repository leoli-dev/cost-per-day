import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';

export const formatCurrency = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export const formatDate = (date, language = 'en') => {
  // 根据语言获取适当的locale
  const locale = language === 'zh' ? zhCN : 
                language === 'fr' ? fr : enUS;
  
  return format(new Date(date), 'yyyy-MM-dd', { locale });
}; 