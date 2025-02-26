import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoHome, IoAddCircleOutline, IoAddCircle, IoSettingsOutline, IoSettings } from 'react-icons/io5';

function Footer() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center z-20">
      <button 
        className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive('/') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => navigate('/')}
      >
        {isActive('/') ? <IoHome className="text-2xl" /> : <IoHomeOutline className="text-2xl" />}
        <span className="text-xs mt-1">
          {t('appName')}
        </span>
      </button>
      
      <button 
        className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive('/add') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => navigate('/add')}
      >
        {isActive('/add') ? <IoAddCircle className="text-2xl" /> : <IoAddCircleOutline className="text-2xl" />}
        <span className="text-xs mt-1">
          {t('addNewItem')}
        </span>
      </button>
      
      <button 
        className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive('/settings') ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
        onClick={() => navigate('/settings')}
      >
        {isActive('/settings') ? <IoSettings className="text-2xl" /> : <IoSettingsOutline className="text-2xl" />}
        <span className="text-xs mt-1">
          {t('settings')}
        </span>
      </button>
    </div>
  );
}

export default Footer; 