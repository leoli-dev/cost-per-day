import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_SETTINGS } from '../services/db';

// 导入翻译文件
import translationEN from './locales/en';
import translationFR from './locales/fr';
import translationZH from './locales/zh';

const resources = {
  en: {
    translation: translationEN
  },
  fr: {
    translation: translationFR
  },
  zh: {
    translation: translationZH
  }
};

// 同步初始化 i18n
i18n
  .use(LanguageDetector) // 检测用户浏览器语言
  .use(initReactI18next) // 将i18n实例传递给react-i18next
  .init({
    resources,
    lng: 'en', // 默认语言
    fallbackLng: 'en', // 如果检测到的语言不可用，则使用英语
    interpolation: {
      escapeValue: false // 不转义HTML内容
    }
  });

export default i18n; 