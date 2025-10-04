import { useState, useCallback } from "react";
import { ethers } from "ethers";
import abiJson from "../ABI/RegisterDeviceABI.json";
import EchonetTokenABI from "../ABI/EchonetTokenABI.json";
import { useAuth } from "@/context/AuthContext";
import { Graph, Ipfs, ContentIds } from "@graphprotocol/grc-20";
import axios from "axios";

const MAIN_CONTRACT_ADDRESS = import.meta.env.VITE_MAIN_CONTRACT_ADDRESS;
const TOKEN_CONTRACT_ADDRESS = import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS;
const SPENDER_ADDRESS = import.meta.env.VITE_SPENDER_ADDRESS;

// ✅ Parse FEES safely as BigInt with 18 decimals (adjust decimals if needed)
// const FEES = ethers.parseUnits(import.meta.env.VITE_APPROVAL_FEES || "50", 18);

const MAIN_CONTRACT_ABI = abiJson.output.abi;
const ECHONET_ABI = EchonetTokenABI.output.abi;

export const useRegisterDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const BACKEND_URI = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";
  const API_URL = `${BACKEND_URI}/api/hypergraph`;
  // const API_URL = `http://localhost:3001/api/hypergraph`;

  const { walletAddress } = useAuth();

  const registerDevice = useCallback(
    async ({ latitude,
      longitude,
      macAddress,
      deviceId,
      deviceType,
      deviceLocation,
      locality,
      sectorNo,
      dataType,
      projectName}) => {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      const mappedData = {
        deviceId: deviceId,
        name: macAddress, // or use a separate name field if you have one
        type: deviceType,
        location: deviceLocation,
        locality: locality,
        latitude: latitude,
        longitude: longitude,
        dataType: dataType,
        project: projectName,
        ownerAddress: walletAddress,
        description: `Sensor ${macAddress} at ${deviceLocation}`, // or use a description field from your form
      };

      const tiwariData = {
        mac_address : deviceId,
        area : locality,
        sector_no : sectorNo,
        city : deviceLocation,
        latitude,
        longitude
      }

      console.log("Mapped Data:", mappedData);

      try {
        // 1️⃣ Validate Inputs
        if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Invalid latitude or longitude.");
        }
        if (
          !macAddress ||
          !macAddress.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
        ) {
          throw new Error("Invalid MAC address format.");
        }
        if (!walletAddress) {
          throw new Error("Wallet not connected. Please connect your wallet.");
        }
        if (typeof window.ethereum === "undefined") {
          throw new Error("MetaMask not detected. Please install MetaMask.");
        }

        console.log("Registering device data:", tiwariData);

        // await axios.post("https://fetch-dev.onrender.com/register",tiwariData);

        // 2️⃣ Setup Provider & Signer
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // ✅ Log network for debugging
        const network = await provider.getNetwork();
        console.log("Connected to chainId:", network.chainId);

        // 3️⃣ Approve Tokens First
        const tokenContract = new ethers.Contract(
          TOKEN_CONTRACT_ADDRESS,
          ECHONET_ABI,
          signer
        );

        console.log("Estimating gas for token approval...");
        const gasEstimateApprove = await tokenContract.approve.estimateGas(
          SPENDER_ADDRESS,
          "50000000000000000000" // 50 tokens with 18 decimals
        );

        console.log("Approving tokens...");
        const approveTx = await tokenContract.approve(
          SPENDER_ADDRESS,
          "50000000000000000000",
          { gasLimit: gasEstimateApprove }
        );
        console.log("Approval tx hash:", approveTx.hash);

        await approveTx.wait();
        console.log("Tokens approved successfully ✅");

        // 4️⃣ Now Call registerSensor
        const contract = new ethers.Contract(
          MAIN_CONTRACT_ADDRESS,
          MAIN_CONTRACT_ABI,
          signer
        );

        console.log("Estimating gas for registerSensor...");
        try {
          await contract.registerSensor.estimateGas(macAddress);
        } catch (gasErr) {
          console.error("Gas estimation failed for registerSensor:", gasErr);
          throw new Error(
            "Transaction would fail (reverted). Check contract logic or wallet state."
          );
        }

        console.log("Sending registerSensor transaction...");
        const tx = await contract.registerSensor(macAddress);
        console.log("Transaction hash:", tx.hash);

        const receipt = await tx.wait();
        await axios.post(API_URL, mappedData);
        console.log("Device registered successfully ✅", receipt);

        setIsSuccess(true);

        // --- PUBLISH SENSOR PROFILE TO IPFS (Hypergraph) ---
        try {
          // Example sensor profile data (customize as needed)
          const sensorProfile = {
            id: macAddress,
            name: `Sensor ${macAddress}`,
            location: `${latitude},${longitude}`,
            ownerAddress: walletAddress,
            contractAddress: MAIN_CONTRACT_ADDRESS,
            properties: {
              dataType: "Ambient Sound Level (dB)",
              status: "active",
              polygonContractAddress: MAIN_CONTRACT_ADDRESS,
            },
          };

          // Create custom properties (mimic publishSensor.ts)
          const dataTypeProperty = Graph.createProperty({
            name: "Data Type",
            description: "The type of data collected by the sensor",
            dataType: "STRING",
          });
          const statusProperty = Graph.createProperty({
            name: "Status",
            description: "The operational status of the sensor",
            dataType: "STRING",
          });
          const contractAddressProperty = Graph.createProperty({
            name: "Contract Address",
            description: "The blockchain contract address for the sensor",
            dataType: "STRING",
          });

          // Create entity
          const entityResult = Graph.createEntity({
            name: sensorProfile.name,
            description: `Sensor at ${sensorProfile.location}`,
            values: [
              {
                property: ContentIds.LOCATION_PROPERTY,
                value: sensorProfile.location,
              },
              {
                property: dataTypeProperty.id,
                value: sensorProfile.properties.dataType,
              },
              {
                property: statusProperty.id,
                value: sensorProfile.properties.status,
              },
              {
                property: contractAddressProperty.id,
                value: sensorProfile.properties.polygonContractAddress,
              },
            ],
          });

          // Combine all operations
          const allOps = [
            ...dataTypeProperty.ops,
            ...statusProperty.ops,
            ...contractAddressProperty.ops,
            ...entityResult.ops,
          ];

          // Publish to IPFS/Hypergraph
          const publicationResult = await Ipfs.publishEdit({
            name: `Sensor Profile: ${sensorProfile.name}`,
            ops: allOps,
            author: walletAddress,
            network: "TESTNET",
          });
          console.log("Successfully published to Hypergraph!", publicationResult);
        } catch (publishErr) {
          console.error("Error publishing sensor profile to Hypergraph:", publishErr);
        }

        return { success: true, txHash: tx.hash };
      } catch (err) {
        console.error("Error during device registration:", err);
        setError(err.message || "Transaction reverted or failed.");
        return { success: false };
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress]
  );

  return { registerDevice, isLoading, error, isSuccess };
};
