import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DayPicker, useNavigation } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { IoTrashOutline, IoArrowBack, IoCalendarOutline } from "react-icons/io5";
import { zhCN } from 'date-fns/locale/zh-CN';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';
import { addItem, updateItem, getAllItems, deleteItem } from '../services/db';
import { formatDate } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';

// Custom date picker caption component
function CustomCaption({ date, locale, goToMonth, goToYear }) {
  const { t } = useTranslation();
  const [yearInput, setYearInput] = useState(date.getFullYear());
  const [showYearInput, setShowYearInput] = useState(false);
  
  // Generate month options
  const getMonthOptions = () => {
    const options = [];
    const formatter = new Intl.DateTimeFormat(locale.code, { month: 'long' });
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(date.getFullYear(), i, 1);
      options.push(
        <option key={i} value={i}>
          {formatter.format(monthDate)}
        </option>
      );
    }
    
    return options;
  };
  
  // Handle year change
  const handleYearSubmit = (e) => {
    e.preventDefault();
    const year = parseInt(yearInput);
    if (!isNaN(year) && year >= 1900 && year <= 2100) {
      goToYear(year);
      setShowYearInput(false);
    }
  };
  
  return (
    <div className="flex justify-between items-center p-1">
      {/* Year display/input */}
      {showYearInput ? (
        <form onSubmit={handleYearSubmit} className="flex">
          <input
            type="number"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
            className="w-20 px-2 py-1 border border-gray-300 rounded-md"
            min="1900"
            max="2100"
          />
          <button 
            type="submit" 
            className="ml-1 bg-purple-600 text-white px-2 rounded-md"
          >
            OK
          </button>
        </form>
      ) : (
        <button 
          onClick={() => setShowYearInput(true)}
          className="text-lg font-semibold hover:bg-gray-100 px-2 py-1 rounded-md"
        >
          {date.getFullYear()}
        </button>
      )}
      
      {/* Month selection */}
      <select
        value={date.getMonth()}
        onChange={(e) => goToMonth(new Date(date.getFullYear(), parseInt(e.target.value)))}
        className="text-lg px-2 py-1 border border-gray-300 rounded-md appearance-none"
        style={{ maxWidth: '150px' }}
      >
        {getMonthOptions()}
      </select>
    </div>
  );
}

function AddItem() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIcon, setActiveIcon] = useState(null);
  const [month, setMonth] = useState(purchaseDate);
  
  // Get locale matching the current language
  const getLocale = () => {
    switch (language) {
      case 'zh':
        return zhCN;
      case 'fr':
        return fr;
      case 'en':
      default:
        return enUS;
    }
  };

  // Reset form when pathname changes
  useEffect(() => {
    const resetForm = () => {
      setName('');
      setPrice('');
      setPurchaseDate(new Date());
      setIsEditMode(false);
      setEditIndex(-1);
      setShowDeleteConfirm(false);
    };

    if (location.pathname === '/add') {
      resetForm();
    }
  }, [location.pathname]);

  // Load item data for edit mode
  useEffect(() => {
    const loadItem = async () => {
      const searchParams = new URLSearchParams(location.search);
      const editId = searchParams.get('id');
      
      const isEdit = location.pathname === '/edit';
      
      if (isEdit) {
        if (!editId) {
          console.error('Edit mode requires an ID parameter');
          navigate('/');
          return;
        }
        
        try {
          const items = await getAllItems();
          const item = items.find(item => item.id === parseInt(editId));
          
          if (!item) {
            console.error('Invalid item ID:', editId);
            navigate('/');
            return;
          }
          
          setIsEditMode(true);
          setEditIndex(item.id);
          setName(item.name);
          setPrice(item.price.toString());
          setPurchaseDate(new Date(item.purchaseDate));
        } catch (error) {
          console.error('Error loading item:', error);
          navigate('/');
        }
      }
    };

    loadItem();
  }, [location.pathname, location.search, navigate]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const isFormValid = name.trim() !== '' && 
                     Number(price) > 0 && 
                     purchaseDate instanceof Date;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const itemData = {
      name: name.trim(),
      price: Number(price),
      purchaseDate: purchaseDate.toISOString(),
    };

    try {
      if (isEditMode) {
        await updateItem(editIndex, itemData);
      } else {
        await addItem(itemData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(editIndex);
      navigate('/');
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
    setTimeout(() => {
      setActiveIcon(null);
    }, 1000);
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 page-header">
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-white">
            {isEditMode ? t('editItem') : t('addNewItem')}
          </h1>
        </div>
      </div>

      {/* Form */}
      <div className="px-4 py-6 space-y-6 page-content">
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">{t('itemName')}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder={t('enterItemName')}
            className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:border-purple-300 
            focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">{t('price')}</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</div>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0.01"
              step="0.01"
              placeholder={t('enterPrice')}
              className="w-full px-4 py-3 pl-8 rounded-xl border border-purple-100 focus:border-purple-300 
              focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-600 font-medium">{t('date')}</label>
          
          {/* Combination of native date picker for mobile and custom date picker for desktop */}
          <div className="relative">
            {/* Display current selected date - clicking performs different actions based on device type */}
            <button 
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-purple-100 
              focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200
              text-left"
              onClick={() => {
                // Check if device is mobile
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                  // Trigger native date picker on mobile
                  document.getElementById('native-date-picker').click();
                } else {
                  // Show custom date picker on desktop
                  setShowDatePicker(!showDatePicker);
                }
              }}
            >
              {formatDate(purchaseDate, language)}
              <div className="text-purple-500">
                <IoCalendarOutline className="text-lg" />
              </div>
            </button>
            
            {/* Hidden native date picker - used on mobile */}
            <input
              id="native-date-picker"
              type="date"
              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              value={purchaseDate.toISOString().split('T')[0]}
              onChange={(e) => {
                if (e.target.value) {
                  setPurchaseDate(new Date(e.target.value));
                }
              }}
              max={new Date().toISOString().split('T')[0]}
            />
            
            {/* Custom date picker - used on desktop */}
            {showDatePicker && (
              <div className="relative z-30 date-picker-container">
                <div 
                  className="fixed inset-0 bg-black/20 z-30" 
                  onClick={() => setShowDatePicker(false)}
                ></div>
                <div className="absolute z-40 mt-2 bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100 w-full max-w-[320px] left-1/2 -translate-x-1/2">
                  {/* Year and month quick selectors */}
                  <div className="flex justify-between items-center bg-gray-50 p-2 border-b">
                    {/* Year selection */}
                    <select
                      value={month.getFullYear()}
                      onChange={(e) => {
                        const year = parseInt(e.target.value);
                        const newDate = new Date(month);
                        newDate.setFullYear(year);
                        setMonth(newDate);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded-md"
                    >
                      {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    
                    {/* Month selection */}
                    <select
                      value={month.getMonth()}
                      onChange={(e) => {
                        const monthIndex = parseInt(e.target.value);
                        const newDate = new Date(month);
                        newDate.setMonth(monthIndex);
                        setMonth(newDate);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded-md"
                    >
                      {Array.from({ length: 12 }, (_, i) => i).map(monthIndex => {
                        const monthName = new Intl.DateTimeFormat(getLocale().code, { month: 'long' }).format(new Date(2000, monthIndex));
                        return (
                          <option key={monthIndex} value={monthIndex}>{monthName}</option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <DayPicker
                    mode="single"
                    selected={purchaseDate}
                    onSelect={(date) => {
                      if (date) {
                        setPurchaseDate(date);
                        setShowDatePicker(false);
                      }
                    }}
                    month={month}
                    onMonthChange={setMonth}
                    locale={getLocale()}
                    toDate={new Date()}
                    modifiersClassNames={{
                      selected: 'bg-purple-600 text-white',
                      today: 'text-red-500 font-bold'
                    }}
                    className="p-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4 pt-4">
          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium
            hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg
            disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            {t('save')}
          </button>

          {isEditMode && (
            <button 
              type="button"
              className="w-full py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium
              hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg
              flex items-center justify-center gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <IoTrashOutline className="text-xl" />
              {t('deleteItem')}
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center sm:items-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800">{t('confirmDelete')}</h2>
            <p className="text-gray-600">{t('deleteConfirmation')}</p>
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium
                hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                {t('cancel')}
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 
                text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                onClick={handleDelete}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddItem;