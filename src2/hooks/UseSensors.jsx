// useSensors.js
import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../ABI/RegisterDeviceABI.json";
import { useAuth } from "@/context/AuthContext";

const contractAddress = import.meta.env.VITE_MAIN_CONTRACT_ADDRESS;
const contractABIData = contractABI.output.abi;

export const useSensors = () => {
  const [deviceData, setDeviceData] = useState(null);

  const sensors = async (walletAddress) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(contractAddress, contractABIData, signer);
      const result = await contract.sensors(walletAddress);

      setDeviceData(result);
      return result;
    } catch (error) {
      console.error("Error calling sensors:", error);
      return null;
    }
  };

  return { sensors, deviceData };
};
