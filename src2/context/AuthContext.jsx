import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";
import contractABI from '../ABI/RegisterDeviceABI.json';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext(null);

const contractAddress = import.meta.env.VITE_MAIN_CONTRACT_ADDRESS;
const contractABIData = contractABI.output.abi;

const checkRegistrationStatus = async (walletAddress) => {
  try {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed.');
    }
    console.log("Checking registration status for wallet:", walletAddress);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABIData, signer);
    const result = await contract.sensors(walletAddress);
    return result && result.isVerified;
  } catch (error) {
    console.error("Error checking registration status:", error.message);
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [googleUser, setGoogleUser] = useState(true);
  const [walletAddress, setWalletAddress] = useState(() => localStorage.getItem('walletAddress') || null);
  const [signer, setSigner] = useState(null);
  const [ensName, setEnsName] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const navigate = useNavigate();

  const initializeWalletData = useCallback(async (address) => {
    try {
      if (typeof window.ethereum === 'undefined') return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await provider.getSigner();
      setSigner(signerInstance);

      const registrationStatus = await checkRegistrationStatus(address);
      setIsRegistered(registrationStatus);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const res = await axios.post(`${backendUrl}/api/ens/reverse`, { address });
      if (res.data.success) {
        setEnsName(res.data.ensName);
      } else {
        setEnsName(null);
      }
    } catch (error) {
      console.error("Error initializing wallet data:", error);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      initializeWalletData(walletAddress);
    }
  }, [walletAddress, initializeWalletData]);

  const loginWithGoogle = async () => {
    setGoogleUser({ name: "John Doe", email: "john.doe@example.com", picture: '' });
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const address = accounts[0];
        const signerInstance = await provider.getSigner();

        localStorage.setItem('walletAddress', address);
        setWalletAddress(address);
        setSigner(signerInstance);

        navigate('/dashboard');
      } catch (error) {
        console.error("User rejected MetaMask connection request", error.message);
      }
    } else {
      alert("MetaMask is not installed. Please install it to continue.");
    }
  };

  const isAuthenticated = !!googleUser && !!walletAddress;

  const value = {
    googleUser,
    walletAddress,
    signer,
    isRegistered,
    setIsRegistered,
    isAuthenticated,
    loginWithGoogle,
    connectMetaMask,
    setGoogleUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};