import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllItems } from '../services/db';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoChevronDown } from 'react-icons/io5';

function ItemList() {
  const [items, setItems] = useState([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);

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

  return (
    <div className="pb-20"> {/* Add padding bottom for footer */}
      {/* Header Total */}
      <div className="bg-white border-b border-gray-200 px-4 py-6 mb-4">
        <div className="text-center">
          <div className="text-gray-600 text-sm font-medium mb-2">
            日均总花费
          </div>
          <div className="font-mono text-4xl font-medium text-danger-600">
            ${totalDailyCost.toFixed(2)}/天
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
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-danger-600">
                      ${calculateDailyCost(item.price, item.purchaseDate)}/天
                    </span>
                    <IoChevronDown 
                      className={`transition-transform ${
                        expandedItem === item.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {expandedItem === item.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="pt-4 space-y-2 text-sm text-gray-600">
                      <div>购买金额: ${item.price}</div>
                      <div className="flex items-center gap-1">
                        购买日期: {new Date(item.purchaseDate).toLocaleDateString()}
                        <span className="text-gray-500">
                          ({calculateDaysSince(item.purchaseDate)}天)
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/edit?id=${item.id}`}
                      className="mt-4 block w-full text-center py-2 bg-blue-500 text-white rounded-md
                      hover:bg-blue-600 transition-colors duration-200"
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-lg mx-auto px-4 py-2 flex justify-around items-center">
          <button className="p-4 text-gray-600 hover:text-gray-900">
            <IoHomeOutline className="text-2xl" />
          </button>
          <Link 
            to="/add"
            className="p-4 text-primary-600 hover:text-primary-700"
          >
            <IoAddOutline className="text-3xl" />
          </Link>
          <button className="p-4 text-gray-600 hover:text-gray-900">
            <IoSettingsOutline className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemList;