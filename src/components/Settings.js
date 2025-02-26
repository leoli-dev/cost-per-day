import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoChevronDown, IoCloudDownloadOutline, IoCloudUploadOutline, IoWarningOutline } from 'react-icons/io5';
import { getAllSettings, updateSetting } from '../services/db';
import { getAllItems, deleteAllItems, addItem } from '../services/db';
import { useLanguage } from '../contexts/LanguageContext';

function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  
  const [currency, setCurrency] = useState('$');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData, setImportData] = useState(null);
  
  const languageRef = useRef(null);
  const currencyRef = useRef(null);
  const fileInputRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' }
  ];

  const currencies = [
    { symbol: '$', name: t('usd') },
    { symbol: '€', name: t('eur') },
    { symbol: '¥', name: t('cny') }
  ];

  // 根据语言代码获取语言名称
  const getLanguageName = (code) => {
    const lang = languages.find(lang => lang.code === code);
    return lang ? lang.name : 'English';
  };

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getAllSettings();
        setCurrency(settings.currency || '$');
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event) {
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(event.target)) {
        setShowCurrencyDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 更新语言设置
  const handleLanguageChange = async (code) => {
    await changeLanguage(code);
    setShowLanguageDropdown(false);
  };

  // 更新货币设置
  const handleCurrencyChange = async (curr) => {
    try {
      setCurrency(curr);
      await updateSetting('currency', curr);
    } catch (error) {
      console.error('Error updating currency:', error);
    }
    setShowCurrencyDropdown(false);
  };

  // Export data function
  const handleExportData = async () => {
    try {
      // Get all items from database
      const items = await getAllItems();
      
      // Check if there's any data to export
      if (!items || items.length === 0) {
        setNotification({
          message: t('noDataForExport'),
          type: 'warning'
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
        return;
      }
      
      // Create a data URL for the JSON file
      const dataStr = JSON.stringify(items, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // Create download link and trigger click
      const exportFileDefaultName = `cost-per-day-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      // Show success notification
      setNotification({
        message: t('exportSuccess'),
        type: 'success'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      
      // Show error notification
      setNotification({
        message: t('exportError'),
        type: 'error'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  // Import data function
  const handleImportData = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.name.endsWith('.json')) {
      setNotification({
        message: t('invalidFileFormat'),
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      event.target.value = ''; // Reset file input
      return;
    }
    
    try {
      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          validateAndProcessImport(content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          setNotification({
            message: t('invalidJsonFormat'),
            type: 'error'
          });
          setTimeout(() => setNotification(null), 3000);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error reading file:', error);
      setNotification({
        message: t('errorReadingFile'),
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  // Validate import data
  const validateAndProcessImport = (data) => {
    // Check if data is an array
    if (!Array.isArray(data)) {
      setNotification({
        message: t('invalidDataFormat'),
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Check if each item has required fields
    for (const item of data) {
      if (!item.id || !item.name || !item.price || !item.purchaseDate) {
        setNotification({
          message: t('invalidDataFormat'),
          type: 'error'
        });
        setTimeout(() => setNotification(null), 3000);
        return;
      }
    }
    
    // Check for duplicate IDs
    const ids = data.map(item => item.id);
    if (new Set(ids).size !== ids.length) {
      setNotification({
        message: t('duplicateIds'),
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Data is valid, store it and show confirmation dialog
    setImportData(data);
    setShowImportConfirm(true);
  };
  
  // Perform the actual import
  const confirmImport = async () => {
    try {
      // Clear existing data
      await deleteAllItems();
      
      // Import new data
      for (const item of importData) {
        await addItem(item);
      }
      
      // Show success notification
      setNotification({
        message: t('importSuccess'),
        type: 'success'
      });
      setTimeout(() => setNotification(null), 3000);
      
      // Close confirmation dialog
      setShowImportConfirm(false);
    } catch (error) {
      console.error('Error importing data:', error);
      setNotification({
        message: t('importError'),
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-600">{t('loading')}</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-white">
            {t('settings')}
          </h1>
        </div>
      </div>
      
      <div className="px-4 space-y-6 page-content settings-page-content mt-4">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg
            ${notification.type === 'success' ? 'bg-green-500' : 
              notification.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'} 
            text-white font-medium`}
          >
            {notification.message}
          </div>
        )}

        {/* Language Selector */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">{t('language')}</h2>
          </div>
          <div className="p-4" ref={languageRef}>
            <button
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <span>{getLanguageName(language)}</span>
              <IoChevronDown className={`transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showLanguageDropdown && (
              <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowLanguageDropdown(false)}>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-gray-100 bg-purple-50">
                    <h3 className="text-center font-medium text-purple-800">{t('selectLanguage')}</h3>
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Currency Selector */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">{t('currency')}</h2>
          </div>
          <div className="p-4" ref={currencyRef}>
            <button
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none"
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            >
              <span>{currency} {currencies.find(c => c.symbol === currency)?.name}</span>
              <IoChevronDown className={`transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCurrencyDropdown && (
              <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowCurrencyDropdown(false)}>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-gray-100 bg-purple-50">
                    <h3 className="text-center font-medium text-purple-800">{t('selectCurrency')}</h3>
                  </div>
                  {currencies.map((curr) => (
                    <button
                      key={curr.symbol}
                      className="w-full text-left p-4 hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-0"
                      onClick={() => handleCurrencyChange(curr.symbol)}
                    >
                      {curr.symbol} {curr.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">{t('dataManagement')}</h2>
          </div>
          <div className="p-4 space-y-3">
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 
              text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 
              transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleExportData}
            >
              <IoCloudDownloadOutline className="text-xl" />
              {t('exportData')}
            </button>
            
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-purple-200
              text-purple-600 rounded-lg font-medium hover:bg-purple-50
              transition-all duration-200 shadow-sm hover:shadow"
              onClick={handleImportData}
            >
              <IoCloudUploadOutline className="text-xl" />
              {t('importData')}
            </button>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>{t('version')} 0.1.0</p>
        </div>
      </div>
      
      {/* Import Confirmation Dialog */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-amber-500">
              <IoWarningOutline className="text-2xl" />
              <h2 className="text-xl font-semibold text-gray-800">{t('importWarning')}</h2>
            </div>
            <p className="text-gray-600">{t('importConfirmation')}</p>
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium
                hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowImportConfirm(false)}
              >
                {t('cancel')}
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 
                text-white font-medium hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
                onClick={confirmImport}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Settings; 