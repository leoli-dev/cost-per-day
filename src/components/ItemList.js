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

  return (
    <div className="container">
      <div className="calculator-display">
        <div className="total-label">日均总花费</div>
        <div className="total-amount">${totalDailyCost.toFixed(2)}/天</div>
      </div>
      
      <Link to="/add" className="add-button-new">添加新物品</Link>
      
      {items.length === 0 ? (
        <p className="no-items">暂无项目</p>
      ) : (
        <div className="items-list">
          {items.map((item, index) => (
            <div key={index} className="item-card">
              <div className="item-name">{item.name}</div>
              <div className="daily-cost">
                ${calculateDailyCost(item.price, item.purchaseDate)}/天
              </div>
              <div className="item-details">
                <div>购买金额: ${item.price}</div>
                <div>购买日期: {new Date(item.purchaseDate).toLocaleDateString()}</div>
              </div>
              <Link 
                to={`/add?edit=${index}`} 
                className="edit-button"
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