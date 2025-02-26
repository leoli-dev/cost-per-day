import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoTrashOutline, IoArrowBack, IoCalendarOutline } from "react-icons/io5";
import { zhCN } from 'date-fns/locale';
import { addItem, updateItem, getAllItems, deleteItem } from '../services/db';
import { formatDate } from '../utils/formatters';

function AddItem() {
  const { t } = useTranslation();
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
    <div className="pb-20 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8 mb-6">
        <div className="flex items-center">
          <button 
            className="text-white p-1 rounded-full hover:bg-white/20 transition-colors"
            onClick={() => navigate('/')}
          >
            <IoArrowBack className="text-2xl" />
          </button>
          <h1 className="text-2xl font-semibold text-white text-center drop-shadow-lg ml-3">
            {isEditMode ? t('editItem') : t('addNewItem')}
          </h1>
        </div>
      </div>

      <div className="px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">物品名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="请输入物品名称"
              className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:border-purple-300 
              focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">购买金额 ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0.01"
              step="0.01"
              required
              placeholder="请输入大于0的金额"
              className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:border-purple-300 
              focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200 font-orbitron"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-600 font-medium">购买日期</label>
            <div className="relative date-picker-container">
              <input
                type="text"
                value={formatDate(purchaseDate)}
                onClick={() => setShowDatePicker(true)}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:border-purple-300 
                focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200 cursor-pointer"
              />
              
              {showDatePicker && (
                <div 
                  className="fixed inset-0 z-50" 
                  style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowDatePicker(false);
                    }
                  }}
                >
                  <div 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
                    bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DayPicker
                      mode="single"
                      selected={purchaseDate}
                      onSelect={(date) => {
                        if (date) {
                          setPurchaseDate(date);
                          setShowDatePicker(false);
                        }
                      }}
                      locale={zhCN}
                      maxDate={new Date()}
                      modifiersClassNames={{
                        selected: 'bg-purple-600 text-white hover:bg-purple-700',
                        today: 'text-purple-600 font-bold',
                      }}
                      className="p-3"
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
          <button 
            className="relative p-4 group"
            onClick={() => handleIconClick('settings')}
          >
            <div className={`absolute inset-0 rounded-full transition-all duration-300 
              ${activeIcon === 'settings' ? 'bg-purple-600 scale-110' : 'bg-transparent scale-0'}`} 
            />
            <IoSettingsOutline className={`text-2xl relative z-10 transition-colors duration-300
              ${activeIcon === 'settings' ? 'text-white' : 'text-purple-600 group-hover:text-purple-800'}`} 
            />
          </button>
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