import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ethers, formatUnits } from 'ethers';
import abiJson from '../ABI/EchonetTokenABI.json';

const YOUR_CONTRACT_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
const YOUR_CONTRACT_ABI = abiJson.output.abi;

const EchoContext = createContext(null);

export const EchoProvider = ({ children }) => {
    const { walletAddress } = useAuth();
    const [echoCoin, setEchoCoin] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEchoNet = useCallback(async () => {
        if (!walletAddress) {
            console.warn("Wallet address not found");
            setEchoCoin(null);
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            setError("MetaMask is not installed. Please install it to use this feature.");
            return;
        }

        setLoading(true);
        setError(null);
        setEchoCoin(null);

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            // console.log("Connected network:", network);

            const contract = new ethers.Contract(YOUR_CONTRACT_ADDRESS, YOUR_CONTRACT_ABI, provider);

            console.log("Fetching balance for address:", walletAddress);
            const balance = await contract.balanceOf(walletAddress);

            console.log("Raw balance:", balance);
            setEchoCoin(formatUnits(balance, 18));
        } catch (err) {
            console.error("Error fetching data from smart contract:", err);
            setError("Failed to fetch data from the smart contract. Check console for details.");
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    useEffect(() => {
        fetchEchoNet();
    }, [fetchEchoNet]);


    const value = {
        echoCoin,
        loading,
        error,
        refetch: fetchEchoNet
    };

    return (
        <EchoContext.Provider value={value}>
            {children}
        </EchoContext.Provider>
    );
};

export const useEcho = () => {
    return useContext(EchoContext);
};