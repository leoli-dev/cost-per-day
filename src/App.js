import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import ItemList from './components/ItemList';
import AddItem from './components/AddItem';
import Settings from './components/Settings';
import Footer from './components/Footer';
import PageMetadata from './components/PageMetadata';

function App() {
  return (
    <LanguageProvider>
      <PageMetadata />
      <Router>
        <div className="mx-auto max-w-[1024px] sm:border-x sm:border-gray-200 h-full bg-gray-50 flex flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<ItemList />} />
              <Route path="/add" element={<AddItem />} />
              <Route path="/edit" element={<AddItem />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
