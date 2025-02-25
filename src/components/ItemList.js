import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAllItems } from '../services/db';

function ItemList() {
  const [items, setItems] = useState([]);
  const [totalDailyCost, setTotalDailyCost] = useState(0);

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

  return (
    <div className="max-w-lg mx-auto px-4 py-4 min-h-screen">
      <div className="bg-white rounded-xl p-6 mb-6 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
        <div className="text-gray-600 text-base font-semibold uppercase tracking-wide mb-2">
          日均总花费
        </div>
        <div className="text-4xl font-bold text-danger-600 animate-pulse-subtle">
          ${totalDailyCost.toFixed(2)}/天
        </div>
      </div>
      
      <Link 
        to="/add" 
        className="btn-primary inline-flex items-center mb-6 w-full justify-center text-lg py-3"
      >
        添加新物品
      </Link>
      
      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-8">暂无项目</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-300 
              relative"
            >
              <div className="pr-16"> {/* Add padding-right to prevent text overlap with edit button */}
                <div className="text-xl font-semibold text-gray-800 mb-2 line-clamp-1">
                  {item.name}
                </div>
                <div className="inline-block px-3 py-1.5 bg-danger-50 text-danger-600 rounded-lg text-lg font-medium mb-3">
                  ${calculateDailyCost(item.price, item.purchaseDate)}/天
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
                  <div className="text-gray-600">
                    购买金额: ${item.price}
                  </div>
                  <div className="text-gray-600 flex items-center flex-wrap gap-1">
                    购买日期: {new Date(item.purchaseDate).toLocaleDateString()}
                    <span className="text-gray-500">
                      ({calculateDaysSince(item.purchaseDate)}天)
                    </span>
                  </div>
                </div>
              </div>
              <Link 
                to={`/edit?id=${item.id}`}
                className="absolute top-4 right-4 px-3 py-1.5 bg-blue-500 text-white rounded-md
                hover:bg-blue-600 transition-colors duration-200 text-sm"
              >
                修改
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;