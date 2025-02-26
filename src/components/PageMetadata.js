import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

// Component to dynamically update page title and description
function PageMetadata() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  // Update metadata when language changes
  useEffect(() => {
    // Update page title
    document.title = t('appTitle');
    
    // Update page description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('appDescription'));
    } else {
      // If meta description doesn't exist, create one
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = t('appDescription');
      document.head.appendChild(newMetaDescription);
    }
  }, [t, language]); // Depends on translation function and current language
  
  // This component doesn't render any content, only updates metadata
  return null;
}

export default PageMetadata; 