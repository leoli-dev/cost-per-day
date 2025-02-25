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
    <div className="max-w-lg mx-auto px-4 py-4 min-h-screen">
      <Link to="/" className="inline-flex items-center text-gray-600 mb-6 hover:text-gray-800">
        <IoArrowBack className="mr-2" />
        返回列表
      </Link>
      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? '编辑物品' : '添加新物品'}
      </h1>

      {isEditMode && (
        <button 
          type="button"
          className="btn-danger w-full mb-6 py-3 flex items-center justify-center gap-2"
          onClick={() => setShowDeleteConfirm(true)}
        >
          <IoTrashOutline className="text-xl" />
          删除物品
        </button>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="form-label block">物品名称:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="请输入物品名称"
            className="input-field py-3"
          />
        </div>
        
        <div className="space-y-2">
          <label className="form-label block">购买金额 ($):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            required
            placeholder="请输入大于0的金额"
            className="input-field py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="form-label block">购买日期:</label>
          <DatePicker
            selected={purchaseDate}
            onChange={date => setPurchaseDate(date)}
            maxDate={new Date()}
            dateFormat="yyyy/MM/dd"
            required
            className="input-field py-3"
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
          className="btn-primary w-full py-3 text-lg mt-8" 
          disabled={!isFormValid}
        >
          保存
        </button>
      </form>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center sm:items-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">确认删除</h2>
            <p className="text-gray-600">确定要删除这个物品吗？此操作不可撤销。</p>
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-700 font-medium"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-lg bg-danger-600 text-white font-medium"
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