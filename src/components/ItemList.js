import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllItems } from '../services/db';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoChevronDown } from 'react-icons/io5';
import { formatCurrency, formatDate } from '../utils/formatters';

function ItemList() {
  const [items, setItems] = useState([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);
  const [activeIcon, setActiveIcon] = useState(null);

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

  const calculateDailyCost = (price, purchaseDate) => {
    const purchaseTime = new Date(purchaseDate).getTime();
    const currentTime = new Date().getTime();
    const daysDiff = Math.ceil((currentTime - purchaseTime) / (1000 * 60 * 60 * 24));
    return (price / daysDiff).toFixed(2);
  };

  const calculateDaysSince = (purchaseDate) => {
    const purchaseTime = new Date(purchaseDate).getTime();
    const currentTime = new Date().getTime();
    return Math.ceil((currentTime - purchaseTime) / (1000 * 60 * 60 * 24));
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
          <div className="text-white/90 text-sm font-medium mb-2">
            日均总花费
          </div>
          <div className="font-orbitron text-4xl font-medium text-white drop-shadow-lg">
            ${formatCurrency(totalDailyCost)}/天
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="px-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">暂无项目</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-purple-100"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-50 transition-colors"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="font-medium text-gray-800 text-2xl">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-orbitron text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      ${formatCurrency(calculateDailyCost(item.price, item.purchaseDate))}
                    </span>
                    <IoChevronDown 
                      className={`transition-transform text-purple-500 ${
                        expandedItem === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {expandedItem === item.id && (
                  <div className="px-4 pb-4 border-t border-purple-100 bg-purple-50/50">
                    <div className="pt-4 space-y-2 text-sm text-gray-600">
                      <div>购买金额: <span className="font-orbitron text-purple-600">${formatCurrency(item.price)}</span></div>
                      <div className="flex items-center gap-1">
                        购买日期: {formatDate(item.purchaseDate)}
                        <span className="text-purple-500 font-medium">
                          ({calculateDaysSince(item.purchaseDate)}天)
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/edit?id=${item.id}`}
                      className="mt-4 block w-full text-center py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 
                      text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 
                      transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      修改
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
    </div>
  );
}

export default ItemList;