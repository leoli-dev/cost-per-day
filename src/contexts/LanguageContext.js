import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { getSetting, updateSetting } from '../services/db';
import i18n from '../i18n';

// 创建上下文
const LanguageContext = createContext();

// 创建提供者组件
export const LanguageProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const { t } = useTranslation();

  // 从数据库加载语言设置
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        setLoading(true);
        const language = await getSetting('language') || 'en';
        setCurrentLanguage(language);
        await i18n.changeLanguage(language);
      } catch (error) {
        console.error('Error loading language:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLanguage();
  }, []);

  // 切换语言
  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      setCurrentLanguage(languageCode);
      await updateSetting('language', languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-purple-600">加载中...</div>
    </div>;
  }

  return (
    <LanguageContext.Provider value={{ language: currentLanguage, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子
export const useLanguage = () => useContext(LanguageContext); 