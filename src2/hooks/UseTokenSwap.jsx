import { useState } from 'react';
import { ethers } from 'ethers';

import poolSwapTest from '../ABI/ExchangeABI.json';
import SwapRouter from "../ABI/PoolSwapTest.json";

const SWAP_ROUTER_ADDRESS = "0xB3A1947Fc443814715a94Db4030543A2D27e664C";
const HOOK_ADDRESS = "0x3299D60A4fF3c4A7c554BB929CF59ee9d22b3ffe";

// const tokenA = "0x75F3DD83b1eF86C381F3CA8BBe3515fa68252526" //usdc
// const tokenB = "0x1fF1A03729203435BAE7a5B42583493Ee5b4682d" // echo

const tokenA = "0xc1d7ea2A94A0bdC8594cA2C485aB93e46e2a593e"
const tokenB = "0x1c2e5A8dB0e60eD3747b798e74e8940e4ce4de13" 

// const amountString = "2"

export const useTokenSwap = (signer) => {
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapError, setSwapError] = useState(null);
    const [swapSuccess, setSwapSuccess] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const TokenABI = poolSwapTest.abi;
    const swapRouterABI = SwapRouter.abi;
    const sellTokenA = true; // true if selling tokenA (USDC), false if selling tokenB (ECH)

    const executeSwap = async (amountString,decimals) => {
        if (!signer) {
            setSwapError("Wallet not connected. Please connect your wallet.");
            return
        }
        
        console.log("amountString:", amountString);
        
        console.log("decimals:", decimals);
        

        const sellingTokenAddress = sellTokenA ? tokenA : tokenB;

        setIsSwapping(true);
        setSwapError(null);
        setSwapSuccess(false);

        try {
            setStatusMessage("Requesting approval from user...");

            const tokenToSellContract = new ethers.Contract(sellingTokenAddress, TokenABI, signer);
            const amountToSellRaw = ethers.parseUnits(amountString, decimals);



            const approveTx = await tokenToSellContract.approve(SWAP_ROUTER_ADDRESS, amountToSellRaw);
            await approveTx.wait();

            setStatusMessage("Approval successful! Preparing to swap...");

            const swapRouterContract = new ethers.Contract(SWAP_ROUTER_ADDRESS, swapRouterABI, signer);

            const token0 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenA : tokenB;
            const token1 = tokenA.toLowerCase() < tokenB.toLowerCase() ? tokenB : tokenA;

            console.log("from : ", sellingTokenAddress, " to : ", sellTokenA ? tokenB : tokenA);
            

            const isSellingToken0 = sellingTokenAddress.toLowerCase() === token0.toLowerCase();

            const MIN_SQRT_RATIO_BI = BigInt("4295128739");
            const MAX_SQRT_RATIO_BI = BigInt("1461446703485210103287273052203988822378723970341");

            const key = {
                currency0: token0,
                currency1: token1,
                fee: 3000,
                tickSpacing: 60,
                hooks: HOOK_ADDRESS
            };

            const params = {
                zeroForOne: isSellingToken0,
                amountSpecified: amountToSellRaw,
                // sqrtPriceLimitX96: (isSellingToken0
                //     ? MIN_SQRT_RATIO_BI + BigInt(1)
                //     : MAX_SQRT_RATIO_BI - BigInt(1)
                // ).toString()
                sqrtPriceLimitX96: '0'
            };

            setStatusMessage("Requesting swap signature...");
            const swapTx = await swapRouterContract.swap(
                key,
                params,
                { settleUsingBurn: false, takeClaims: false },
                '0x'
            );
            await swapTx.wait();

            setStatusMessage("Swap successful! 🎉");
            setSwapSuccess(true);

        } catch (error) {
            console.error("Swap failed:", error);
            setSwapError(error.reason || "An error occurred during the swap.");
            setStatusMessage("Transaction failed.");
        } finally {
            setIsSwapping(false);
        }
    };

    return { executeSwap, isSwapping, swapError, swapSuccess, statusMessage };
};