import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoHomeOutline, IoAddOutline, IoSettingsOutline } from "react-icons/io5";

function Footer() {
  const [activeIcon, setActiveIcon] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const handleIconClick = (iconName, path) => {
    setActiveIcon(iconName);
    setTimeout(() => {
      setActiveIcon(null);
    }, 1000);
    if (path) {
      setTimeout(() => {
        navigate(path);
      }, 150);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-white/90 border-t border-purple-100">
      <div className="max-w-lg mx-auto px-4 py-3 flex justify-around items-center">
        <button 
          className="relative p-5 group"
          onClick={() => handleIconClick('home', '/')}
        >
          <div className={`absolute inset-[8px] rounded-full transition-all duration-300 
            ${activeIcon === 'home' ? 'bg-purple-600 scale-100' : 'bg-transparent scale-50 opacity-0'}`} 
          />
          <IoHomeOutline className={`text-3xl relative z-10 transition-colors duration-300
            ${activeIcon === 'home' ? 'text-white' : location.pathname === '/' ? 'text-purple-800' : 'text-purple-600 group-hover:text-purple-800'}`} 
          />
        </button>
        <button 
          className="relative p-5 group"
          onClick={() => handleIconClick('add', '/add')}
        >
          <div className={`absolute inset-[8px] rounded-full transition-all duration-300 
            ${activeIcon === 'add' ? 'bg-purple-600 scale-100' : 'bg-transparent scale-50 opacity-0'}`} 
          />
          <IoAddOutline className={`text-4xl relative z-10 transition-colors duration-300
            ${activeIcon === 'add' ? 'text-white' : location.pathname === '/add' ? 'text-purple-800' : 'text-purple-600 group-hover:text-purple-800'}`} 
          />
        </button>
        <button 
          className="relative p-5 group"
          onClick={() => handleIconClick('settings')}
        >
          <div className={`absolute inset-[8px] rounded-full transition-all duration-300 
            ${activeIcon === 'settings' ? 'bg-purple-600 scale-100' : 'bg-transparent scale-50 opacity-0'}`} 
          />
          <IoSettingsOutline className={`text-3xl relative z-10 transition-colors duration-300
            ${activeIcon === 'settings' ? 'text-white' : 'text-purple-600 group-hover:text-purple-800'}`} 
          />
        </button>
      </div>
    </div>
  );
}

export default Footer; 