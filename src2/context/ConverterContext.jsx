import React, { useState, useContext, createContext, useEffect } from "react";
import { ethers } from "ethers";
import ExchangeABI from "../ABI/ExchangeABI.json";
import ScoreABI from "../ABI/ScoreABI.json";
import { useAuth } from "./AuthContext";

const EXCHANAGE_USDC_CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANAGE_USDC_CONTRACT_ADDRESS;
const EXCHANAGE_ECHO_CONTRACT_ADDRESS = import.meta.env.VITE_EXCHANAGE_ECHO_CONTRACT_ADDRESS;
const SCORE_CONTRACT_ADDRESS = import.meta.env.VITE_SCORE_ADDRESS;
const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS;
const RPC_URL = import.meta.env.VITE_RPC_URL;

const ConverterContext = createContext();

export const ConverterProvider = ({ children }) => {
    const [adminUSDC, setAdminUSDC] = useState("0.000");
    const [adminEcho, setAdminEcho] = useState("0.000");
    const [userUSDC, setUserUSDC] = useState("0.000");
    const [userEcho, setUserEcho] = useState("0.000");
    const [USDC_Contract, setUSDC_Contract] = useState(null);
    const [Echo_Contract, setEcho_Contract] = useState(null);
    const [userScore,setUserScore] = useState();
    const [scoreContract,setScoreContract] = useState(null);

    const { walletAddress: USER_ADDRESS } = useAuth();

    const fetchUSDCBalances = async () => {
        if (USDC_Contract && ADMIN_ADDRESS && USER_ADDRESS) {
            try {
                const adminUsdcBalance = await USDC_Contract.balanceOf(ADMIN_ADDRESS);
                const userUsdcBalance = await USDC_Contract.balanceOf(USER_ADDRESS);
                
                const formattedAdminUSDC = ethers.formatUnits(adminUsdcBalance, 18);
                const formattedUserUSDC = ethers.formatUnits(userUsdcBalance, 18);

                setAdminUSDC(parseFloat(formattedAdminUSDC).toFixed(3));
                setUserUSDC(parseFloat(formattedUserUSDC).toFixed(3));
            } catch (error) {
                console.error("Error fetching USDC balances:", error);
                setAdminUSDC("0.000");
                setUserUSDC("0.000");
            }
        }
    };

    const fetchEchoBalances = async () => {
        if (Echo_Contract && ADMIN_ADDRESS && USER_ADDRESS) {
            try {
                const adminEchoBalance = await Echo_Contract.balanceOf(ADMIN_ADDRESS);
                const userEchoBalance = await Echo_Contract.balanceOf(USER_ADDRESS);
                
                const formattedAdminEcho = ethers.formatUnits(adminEchoBalance, 18);
                const formattedUserEcho = ethers.formatUnits(userEchoBalance, 18);

                setAdminEcho(parseFloat(formattedAdminEcho).toFixed(3));
                setUserEcho(parseFloat(formattedUserEcho).toFixed(3));
            } catch (error) {
                console.error("Error fetching Echo balances:", error);
                setAdminEcho("0.000");
                setUserEcho("0.000");
            }
        }
    };

    const fetchUserScore = async () => {
        if(scoreContract && USER_ADDRESS){
            try{
                const score = await scoreContract.getContributionScore(USER_ADDRESS);
                setUserScore(ethers.formatUnits(score,0));
                console.log("User score fetched:", ethers.formatUnits(score,0));
                
            }catch(error){
                console.error("Error fetching user score:", error);
                setUserScore("0");
            }
        }
    };

    useEffect(() => {
        const setupContracts = () => {
            try {
                const provider = new ethers.JsonRpcProvider(RPC_URL);

                console.log("exchange usdc address:", EXCHANAGE_USDC_CONTRACT_ADDRESS);
                console.log("exchange echo address:", EXCHANAGE_ECHO_CONTRACT_ADDRESS);
                console.log("exchange score address:", SCORE_CONTRACT_ADDRESS);
                
                const usdcContractInstance = new ethers.Contract(EXCHANAGE_USDC_CONTRACT_ADDRESS, ExchangeABI.abi, provider);
                setUSDC_Contract(usdcContractInstance);

                const echoContractInstance = new ethers.Contract(EXCHANAGE_ECHO_CONTRACT_ADDRESS, ExchangeABI.abi, provider);
                setEcho_Contract(echoContractInstance);

                const scoreContractInstance = new ethers.Contract(SCORE_CONTRACT_ADDRESS, ScoreABI.abi, provider);
                setScoreContract(scoreContractInstance);
            } catch (error) {
                console.error("Failed to set up contracts:", error);
            }
        };

        if (RPC_URL && EXCHANAGE_USDC_CONTRACT_ADDRESS && EXCHANAGE_ECHO_CONTRACT_ADDRESS) {
            setupContracts();
        }
    }, []);

    useEffect(() => {
        if (USDC_Contract && Echo_Contract) {
            fetchUSDCBalances();
            fetchEchoBalances();
            fetchUserScore();
        }
    }, [USDC_Contract, Echo_Contract]);

    const value = {
        adminUSDC,
        adminEcho,
        userEcho,
        userUSDC,
        userScore,
        fetchUSDCBalances,
        fetchEchoBalances,
    };

    return (
        <ConverterContext.Provider value={value}>
            {children}
        </ConverterContext.Provider>
    );
};

export const useConverter = () => {
    return useContext(ConverterContext);
};