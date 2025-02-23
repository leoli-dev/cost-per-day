import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { IoArrowBack, IoTrashOutline } from "react-icons/io5";
import zhCN from 'date-fns/locale/zh-CN';
import { addItem, updateItem, getAllItems, deleteItem } from '../services/db';

function AddItem() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState(-1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
  }, [location, navigate]);

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

  return (
    <div className="container">
      <Link to="/" className="back-button">
        <IoArrowBack />
        返回列表
      </Link>
      
      <h1>{isEditMode ? '编辑物品' : '添加新物品'}</h1>

      {isEditMode && (
        <button 
          type="button"
          className="delete-button"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <IoTrashOutline />
          删除物品
        </button>
      )}

      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label>物品名称:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="请输入物品名称"
          />
        </div>
        
        <div className="form-group">
          <label>购买金额 ($):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            required
            placeholder="请输入大于0的金额"
          />
        </div>

        <div className="form-group">
          <label>购买日期:</label>
          <DatePicker
            selected={purchaseDate}
            onChange={date => setPurchaseDate(date)}
            maxDate={new Date()}
            dateFormat="yyyy/MM/dd"
            required
            className="date-picker"
            locale={zhCN}
            showMonthYearPicker={datePickerOpen === 'month'}
            showYearPicker={datePickerOpen === 'year'}
            onCalendarOpen={() => setDatePickerOpen('date')}
            onCalendarClose={() => setDatePickerOpen(false)}
            calendarClassName="custom-datepicker"
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              decreaseYear,
              increaseYear,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
              changeYear,
              changeMonth,
            }) => (
              <div className="custom-header">
                <button
                  type="button"
                  className="view-switch"
                  onClick={() => {
                    if (!datePickerOpen) setDatePickerOpen('date');
                    else if (datePickerOpen === 'date') setDatePickerOpen('month');
                    else if (datePickerOpen === 'month') setDatePickerOpen('year');
                    else setDatePickerOpen('date');
                  }}
                >
                  {datePickerOpen === 'year' ? date.getFullYear() :
                   datePickerOpen === 'month' ? date.getFullYear() :
                   `${date.getFullYear()}/${date.getMonth() + 1}`}
                </button>
                <div className="navigation-buttons">
                  <button
                    type="button"
                    onClick={datePickerOpen === 'year' ? decreaseYear : decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={datePickerOpen === 'year' ? increaseYear : increaseMonth}
                    disabled={nextMonthButtonDisabled}
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          />
        </div>

        <button 
          type="submit" 
          className="save-button" 
          disabled={!isFormValid}
        >
          保存
        </button>
      </form>

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>确认删除</h2>
            <p>确定要删除这个物品吗？此操作不可撤销。</p>
            <div className="modal-buttons">
              <button 
                className="modal-button cancel"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button 
                className="modal-button confirm"
                onClick={handleDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddItem;