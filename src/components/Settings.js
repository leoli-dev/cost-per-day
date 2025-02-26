import React, { useState, useEffect, useRef } from 'react';
import { IoChevronDown, IoCloudDownloadOutline, IoCloudUploadOutline } from 'react-icons/io5';
import { getAllSettings, updateSetting } from '../services/db';

function Settings() {
  const [languageCode, setLanguageCode] = useState('en');
  const [currency, setCurrency] = useState('$');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const languageRef = useRef(null);
  const currencyRef = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' }
  ];

  const currencies = [
    { symbol: '$', name: '美元 (USD)' },
    { symbol: '€', name: '欧元 (EUR)' },
    { symbol: '¥', name: '人民币 (CNY)' }
  ];

  // 根据语言代码获取语言名称
  const getLanguageName = (code) => {
    const language = languages.find(lang => lang.code === code);
    return language ? language.name : 'English';
  };

  // 加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const settings = await getAllSettings();
        setLanguageCode(settings.language || 'en');
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
    try {
      setLanguageCode(code);
      await updateSetting('language', code);
    } catch (error) {
      console.error('Error updating language:', error);
    }
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

  // 导出数据
  const handleExportData = async () => {
    try {
      // 导出功能将在后续实现
      alert('导出功能即将推出');
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  // 导入数据
  const handleImportData = async () => {
    try {
      // 导入功能将在后续实现
      alert('导入功能即将推出');
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8 mb-6">
        <h1 className="text-2xl font-semibold text-white text-center drop-shadow-lg">
          设置
        </h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Language Selector */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-800">语言</h2>
          </div>
          <div className="p-4" ref={languageRef}>
            <button
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 focus:outline-none"
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <span>{getLanguageName(languageCode)}</span>
              <IoChevronDown className={`transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showLanguageDropdown && (
              <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setShowLanguageDropdown(false)}>
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-gray-100 bg-purple-50">
                    <h3 className="text-center font-medium text-purple-800">选择语言</h3>
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
            <h2 className="text-lg font-medium text-gray-800">货币</h2>
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
                    <h3 className="text-center font-medium text-purple-800">选择货币</h3>
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
            <h2 className="text-lg font-medium text-gray-800">数据管理</h2>
          </div>
          <div className="p-4 space-y-3">
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 
              text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 
              transition-all duration-200 shadow-md hover:shadow-lg"
              onClick={handleExportData}
            >
              <IoCloudDownloadOutline className="text-xl" />
              导出数据
            </button>
            
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-purple-200
              text-purple-600 rounded-lg font-medium hover:bg-purple-50
              transition-all duration-200 shadow-sm hover:shadow"
              onClick={handleImportData}
            >
              <IoCloudUploadOutline className="text-xl" />
              导入数据
            </button>
          </div>
        </div>

        {/* Version Info */}
        <div className="text-center text-gray-500 text-sm mt-8">
          <p>版本 0.1.0</p>
        </div>
      </div>
    </div>
  );
}

export default Settings; 