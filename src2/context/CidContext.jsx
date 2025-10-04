import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const CidContext = createContext();

export const CidProvider = ({ children }) => {
  const [cidData, setCidData] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { walletAddress } = useAuth();
  // Prefer Vite env var VITE_BACKEND_URL, fall back to local mapped port 3001
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

  const fetchCidData = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${backendUrl}/api/cid`, { walletAddress });
      const result = res.data;
    //   console.log("Fetched CID data:", result);
      if (result.success) {
        setCidData(result.data);
        // Try to fetch sensor data if ipfsCID is present
        const reading = result.data?.readingSubmitteds?.[0];
        const ipfsCID = reading?.ipfsCID;
        if (ipfsCID) {
          try {
            // Call the backend's new API for sensor data
            console.log('Fetching sensor data for CID:', ipfsCID);
            
            const sensorRes = await axios.get(`${backendUrl}/api/sensor/${ipfsCID}`);
            setSensorData(sensorRes.data);
            console.log('Sensor API data:', sensorRes.data);
          } catch (sensorErr) {
            setSensorData(null);
            console.error('Error fetching sensor data:', sensorErr);
          }
        } else {
          setSensorData(null);
        }
      } else {
        setError(result.message || 'Failed to fetch CID data');
        setSensorData(null);
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
      setSensorData(null);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;
    fetchCidData();
    const interval = setInterval(fetchCidData, 1 * 60 * 1000); // every 5 minutes
    return () => clearInterval(interval);
  }, [walletAddress, fetchCidData]);

  return (
    <CidContext.Provider value={{ cidData, sensorData, loading, error, fetchCidData }}>
      {children}
    </CidContext.Provider>
  );
};

export const useCid = () => useContext(CidContext);
