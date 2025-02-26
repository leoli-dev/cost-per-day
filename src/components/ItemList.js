import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllItems, deleteItem } from '../services/db';
import { IoChevronDown, IoChevronForward, IoCalendar, IoCash, IoTrash } from 'react-icons/io5';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateDailyCost, formatCurrency as calculateCurrency } from '../utils/costCalculator';
import { format, differenceInDays } from 'date-fns';
import { useTotalCost } from '../contexts/TotalCostContext';

function ItemList() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeIcon, setActiveIcon] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();
  const { setTotalDailyCost } = useTotalCost();

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
  }, [setTotalDailyCost]);

  const handleEditItem = (item) => {
    navigate(`/edit?id=${item.id}`);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      setItems(items.filter(i => i.id !== itemToDelete.id));
      
      // Recalculate total cost after deletion
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
    <div className="px-4 py-6 space-y-4 home-page-content">
      {items.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>{t('noItems')}</p>
        </div>
      ) : (
        items.map((item) => (
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
                  ${formatCurrency(calculateDailyCost(item.price, item.purchaseDate))}{t('perDay')}
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
                      <div className="font-medium">${formatCurrency(item.price)}</div>
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
        ))
      )}
      
      {/* Delete confirmation modal */}
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
    </div>
  );
}

export default ItemList;