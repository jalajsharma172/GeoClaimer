// src/hooks/useUnregisterDevice.js
import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useAuth } from "../context/AuthContext.jsx";
import mainContractABI from "../ABI/RegisterDeviceABI.json"; // <-- import full JSON

const MAIN_CONTRACT_ADDRESS = import.meta.env.VITE_MAIN_CONTRACT_ADDRESS;
const MAIN_CONTRACT_ABI = mainContractABI.output.abi;

export const useUnregisterDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { walletAddress, setIsRegistered } = useAuth();

  const unregisterDevice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      if (!walletAddress) throw new Error("Wallet not connected.");
      if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask not detected. Please install MetaMask.");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        MAIN_CONTRACT_ADDRESS,
        MAIN_CONTRACT_ABI,
        signer
      );

      console.log("Calling unregisterSensor...");
      const tx = await contract.unstakeAndDeregister(); // <-- your contract function name
      console.log("Transaction sent:", tx.hash);

      const receipt = await tx.wait();
      console.log("Unregister success ✅", receipt);

      setIsRegistered(false); // update context
      setIsSuccess(true);
    } catch (err) {
      console.error("Unregister error:", err);
      setError(err.message || "Failed to unregister device.");
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, setIsRegistered]);

  return { unregisterDevice, isLoading, error, isSuccess };
};
