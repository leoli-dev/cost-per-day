import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DayPicker, useNavigation } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoTrashOutline, IoArrowBack, IoCalendarOutline } from "react-icons/io5";
import { zhCN } from 'date-fns/locale/zh-CN';
import { enUS } from 'date-fns/locale/en-US';
import { fr } from 'date-fns/locale/fr';
import { addItem, updateItem, getAllItems, deleteItem } from '../services/db';
import { formatDate } from '../utils/formatters';
import { useLanguage } from '../contexts/LanguageContext';

// 自定义日期选择器标题组件
function CustomCaption({ date, locale, goToMonth, goToYear }) {
  const { t } = useTranslation();
  const [yearInput, setYearInput] = useState(date.getFullYear());
  const [showYearInput, setShowYearInput] = useState(false);
  
  // 生成月份选项
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
  
  // 处理年份变更
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
      {/* 年份显示/输入 */}
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
      
      {/* 月份选择 */}
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
  
  // 设置月份跳转函数
  const [month, setMonth] = useState(purchaseDate);
  
  // 获取与当前语言匹配的日期本地化
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
      
      if (isEdit && editId) {
        try {
          const items = await getAllItems();
          const item = items.find(item => item.id === parseInt(editId));
          if (item) {
            setIsEditMode(true);
            setEditIndex(item.id);
            setName(item.name);
            setPrice(item.price.toString());
            setPurchaseDate(new Date(item.purchaseDate));
          } else {
            navigate('/');
          }
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
    <div className="pb-20 min-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8 mb-6">
        <h1 className="text-2xl font-semibold text-white text-center drop-shadow-lg">
          {isEditMode ? t('editItem') : t('addNewItem')}
        </h1>
      </div>
      
      <div className="px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
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
            
            {/* 移动设备使用原生日期选择器，桌面设备使用自定义日期选择器的组合 */}
            <div className="relative">
              {/* 显示当前选择的日期 - 点击后根据设备类型执行不同操作 */}
              <button 
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-purple-100 
                focus:border-purple-300 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200
                text-left"
                onClick={() => {
                  // 检测是否为移动设备
                  const isMobile = window.innerWidth <= 768;
                  if (isMobile) {
                    // 移动设备上触发原生日期选择器点击
                    document.getElementById('native-date-picker').click();
                  } else {
                    // 桌面设备上显示自定义日期选择器
                    setShowDatePicker(!showDatePicker);
                  }
                }}
              >
                {formatDate(purchaseDate, language)}
                <div className="text-purple-500">
                  <IoCalendarOutline className="text-lg" />
                </div>
              </button>
              
              {/* 隐藏的原生日期选择器 - 移动设备上使用 */}
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
              
              {/* 自定义日期选择器 - 桌面设备上使用 */}
              {showDatePicker && (
                <div className="relative z-30 date-picker-container">
                  <div 
                    className="fixed inset-0 bg-black/20 z-30" 
                    onClick={() => setShowDatePicker(false)}
                  ></div>
                  <div className="absolute z-40 mt-2 bg-white rounded-xl shadow-xl overflow-hidden border border-purple-100 w-full max-w-[320px] left-1/2 -translate-x-1/2">
                    {/* 年份和月份快速选择器 */}
                    <div className="flex justify-between items-center bg-gray-50 p-2 border-b">
                      {/* 年份选择 */}
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
                      
                      {/* 月份选择 */}
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
        </form>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/90 border-t border-purple-100">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-around items-center">
          <Link 
            to="/"
            className="relative p-4 group"
            onClick={() => handleIconClick('home')}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 
              ${activeIcon === 'home' ? 'bg-purple-600 scale-110' : 'bg-transparent scale-0'}`} 
            />
            <IoHomeOutline className={`text-2xl relative z-10 transition-colors duration-300
              ${activeIcon === 'home' ? 'text-white' : 'text-purple-600 group-hover:text-purple-800'}`} 
            />
          </Link>
          <Link 
            to="/add"
            className="relative p-4 group"
            onClick={() => handleIconClick('add')}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 
              ${activeIcon === 'add' ? 'bg-purple-600 scale-110' : 'bg-transparent scale-0'}`} 
            />
            <IoAddOutline className={`text-3xl relative z-10 transition-colors duration-300
              ${activeIcon === 'add' ? 'text-white' : 'text-purple-600 group-hover:text-purple-800'}`} 
            />
          </Link>
          <Link 
            to="/settings"
            className="relative p-4 group"
            onClick={() => handleIconClick('settings')}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 
              ${activeIcon === 'settings' ? 'bg-purple-600 scale-110' : 'bg-transparent scale-0'}`} 
            />
            <IoSettingsOutline className={`text-2xl relative z-10 transition-colors duration-300
              ${activeIcon === 'settings' ? 'text-white' : 'text-purple-600 group-hover:text-purple-800'}`} 
            />
          </Link>
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