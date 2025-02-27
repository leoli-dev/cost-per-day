import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSetting, updateSetting } from '../services/db';

// Create context
const CurrencyContext = createContext();

// Create provider component
export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('$');
  const [isLoading, setIsLoading] = useState(true);

  // Load currency setting from database
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await getSetting('currency');
        if (savedCurrency) {
          setCurrency(savedCurrency);
        }
      } catch (error) {
        console.error('Error loading currency setting:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCurrency();
  }, []);

  // Function to change currency
  const changeCurrency = async (newCurrency) => {
    try {
      setCurrency(newCurrency);
      await updateSetting('currency', newCurrency);
    } catch (error) {
      console.error('Error updating currency:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Custom hook
export const useCurrency = () => useContext(CurrencyContext); 