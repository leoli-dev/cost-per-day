import React, { createContext, useContext, useState } from 'react';

const TotalCostContext = createContext();

export const TotalCostProvider = ({ children }) => {
  const [totalDailyCost, setTotalDailyCost] = useState(0);

  return (
    <TotalCostContext.Provider value={{ totalDailyCost, setTotalDailyCost }}>
      {children}
    </TotalCostContext.Provider>
  );
};

export const useTotalCost = () => useContext(TotalCostContext); 