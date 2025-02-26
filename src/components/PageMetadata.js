import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

// 创建一个组件来动态更新页面标题和描述
function PageMetadata() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // 当语言变化时更新元数据
  useEffect(() => {
    // 更新页面标题
    document.title = t('appTitle');
    
    // 更新页面描述
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('appDescription'));
    } else {
      // 如果 meta description 不存在，创建一个
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = t('appDescription');
      document.head.appendChild(newMetaDescription);
    }
  }, [t, language]); // 依赖于翻译函数和当前语言
  
  // 这个组件不渲染任何内容，只负责更新元数据
  return null;
}

export default PageMetadata; 