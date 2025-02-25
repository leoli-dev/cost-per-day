import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { IoHomeOutline, IoAddOutline, IoSettingsOutline, IoTrashOutline } from "react-icons/io5";
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
  const [activeIcon, setActiveIcon] = useState(null);

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
        <h1 className="text-2xl font-semibold text-white text-center drop-shadow-lg">
          {isEditMode ? '编辑物品' : '添加新物品'}
        </h1>
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
            <DatePicker
              selected={purchaseDate}
              onChange={date => setPurchaseDate(date)}
              maxDate={new Date()}
              dateFormat="yyyy/MM/dd"
              required
              className="w-full px-4 py-3 rounded-xl border border-purple-100 focus:border-purple-300 
              focus:ring-2 focus:ring-purple-500/20 outline-none transition-all duration-200"
              locale={zhCN}
              showMonthYearPicker={datePickerOpen === 'month'}
              showYearPicker={datePickerOpen === 'year'}
              onCalendarOpen={() => setDatePickerOpen('date')}
              onCalendarClose={() => setDatePickerOpen(false)}
              calendarClassName="bg-white rounded-xl shadow-lg border border-purple-100 overflow-hidden"
            />
          </div>

          <div className="space-y-4 pt-4">
            <button 
              type="submit" 
              className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium
              hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg
              disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
              disabled={!isFormValid}
            >
              保存
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
                删除物品
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
            <h2 className="text-xl font-semibold text-gray-800">确认删除</h2>
            <p className="text-gray-600">确定要删除这个物品吗？此操作不可撤销。</p>
            <div className="flex gap-3 pt-2">
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium
                hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 
                text-white font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
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