import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllItems, deleteItem } from '../services/db';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoChevronDown, IoChevronForward, IoCalendar, IoCash, IoTrash } from 'react-icons/io5';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateDailyCost, formatCurrency as calculateCurrency } from '../utils/costCalculator';
import { format, differenceInDays } from 'date-fns';

function ItemList() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeIcon, setActiveIcon] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadItems = async () => {
      try {
        const storedItems = await getAllItems();
        setItems(storedItems);
        
        // Calculate total daily cost
        const total = storedItems.reduce((sum, item) => {
          return sum + Number(calculateDailyCost(item.price, item.purchaseDate));
        }, 0);
        setTotalDailyCost(total);
      } catch (error) {
        console.error('Error loading items:', error);
      }
    };

    loadItems();
  }, []);

  const handleEditItem = (item) => {
    navigate(`/edit?id=${item.id}`);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      setItems(items.filter(i => i.id !== itemToDelete.id));
      // 重新计算总成本
      const newTotal = items
        .filter(i => i.id !== itemToDelete.id)
        .reduce((sum, item) => {
          return sum + Number(calculateDailyCost(item.price, item.purchaseDate));
        }, 0);
      setTotalDailyCost(newTotal);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const toggleItem = (id) => {
    setExpandedItem(expandedItem === id ? null : id);
  };

  const handleIconClick = (iconName) => {
    setActiveIcon(iconName);
    setTimeout(() => {
      setActiveIcon(null);
    }, 1000);
  };

  return (
    <div>
      {/* Header Total - 使用渐变背景 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-8 mb-4">
        <div className="text-center">
          <div className="text-white text-sm mb-2 opacity-90">
            {t('totalDailyCost')}
          </div>
          <div className="font-orbitron text-4xl font-medium text-white drop-shadow-lg">
            ${calculateCurrency(totalDailyCost)}{t('perDay')}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="px-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">{t('noItems')}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      ${calculateCurrency(calculateDailyCost(item.price, item.purchaseDate))}{t('perDay')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <IoChevronDown 
                      className={`text-purple-500 transition-transform ${expandedItem === item.id ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>
                
                {expandedItem === item.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div 
                          className={`p-2 rounded-lg ${activeIcon === 'price' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}
                          onMouseEnter={() => setActiveIcon('price')}
                          onMouseLeave={() => setActiveIcon(null)}
                        >
                          <IoCash className="text-lg" />
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-gray-500">{t('purchaseAmount')}</div>
                          <div className="font-medium">${item.price}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div 
                          className={`p-2 rounded-lg ${activeIcon === 'date' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}
                          onMouseEnter={() => setActiveIcon('date')}
                          onMouseLeave={() => setActiveIcon(null)}
                        >
                          <IoCalendar className="text-lg" />
                        </div>
                        <div className="ml-3">
                          <div className="text-xs text-gray-500">{t('purchaseDate')}</div>
                          <div className="font-medium">
                            {format(new Date(item.purchaseDate), 'yyyy-MM-dd')} 
                            <span className="text-sm text-gray-500 ml-2">
                              ({differenceInDays(new Date(), new Date(item.purchaseDate))} {t('daysAgo')})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        className="w-full mt-3 flex items-center justify-center gap-2 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                        onClick={() => handleEditItem(item)}
                      >
                        {t('edit')} <IoChevronForward />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-4 max-w-xs w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('confirmDelete')}</h3>
            <p className="text-gray-600 mb-4">
              {t('deleteConfirmation')}
            </p>
            <div className="flex gap-2">
              <button 
                className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium"
                onClick={() => setShowDeleteModal(false)}
              >
                {t('cancel')}
              </button>
              <button 
                className="flex-1 py-2 rounded-lg bg-red-500 text-white font-medium"
                onClick={confirmDelete}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

export default ItemList;