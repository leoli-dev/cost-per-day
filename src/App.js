import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider, useCurrency } from './contexts/CurrencyContext';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';
import Settings from './components/Settings';
import Footer from './components/Footer';
import PageMetadata from './components/PageMetadata';
import { useTranslation } from 'react-i18next';
import { TotalCostProvider, useTotalCost } from './contexts/TotalCostContext';
import { formatCurrency } from './utils/formatters';

// Header component that changes title based on route
const Header = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { totalDailyCost } = useTotalCost();
  const { currency } = useCurrency();
  
  const getTitle = () => {
    switch(location.pathname) {
      case '/add':
        return t('addNewItem');
      case '/edit':
        return t('editItem');
      case '/settings':
        return t('settings');
      default:
        return t('totalDailyCost');
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 page-header">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-white">
          {getTitle()}
        </h1>
        {location.pathname === '/' && (
          <p className="text-white text-4xl font-orbitron font-bold tracking-wider mt-2">
            {currency}{formatCurrency(totalDailyCost)}<span className="text-lg">{t('perDay')}</span>
          </p>
        )}
      </div>
    </div>
  );
};

// Main content component
const MainContent = () => {
  return (
    <div className="page-content">
      <Routes>
        <Route path="/" element={<ItemList />} />
        <Route path="/add" element={<AddItem />} />
        <Route path="/edit" element={<AddItem />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

// Main app structure
function AppContent() {
  return (
    <>
      <Header />
      <MainContent />
      <Footer />
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <PageMetadata />
        <TotalCostProvider>
          <Router>
            <div className="mx-auto max-w-[1024px] sm:border-x sm:border-gray-200 h-full bg-gray-50 flex flex-col">
              <AppContent />
            </div>
          </Router>
        </TotalCostProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;
