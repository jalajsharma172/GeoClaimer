import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [stakeData, setStakeData] = useState(null);
  const { walletAddress } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchStakeData = async () => {
    try {
      // Send walletAddress in POST body for security and backend compatibility
      // console.log("Fetching stake data for wallet address:", walletAddress);
      const res = await axios.post(`${backendUrl}/api/stake-data`, { walletAddress });
      const data = res.data;
      if (data.success) setStakeData(data.data);
      else console.log('Error in fetching the stake data : ', data.message);
    } catch (err) {
      console.log('Error in fetching the stake data : ', err.message);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchStakeData();
    } else {
      setStakeData(null);
    }
  }, [walletAddress]);

  const value = {
    stakeData,
    fetchStakeData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};