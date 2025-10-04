import React, { useState, useCallback, useEffect } from 'react';
import { useConverter } from '@/context/ConverterContext.jsx';
import { useTokenSwap } from '../../hooks/UseTokenSwap.jsx';
import { useAuth } from '@/context/AuthContext.jsx'; 

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BellIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 22.0001 12 22C11.6496 22.0001 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SwapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 16V4M7 4L3 8M7 4L11 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 8V20M17 20L21 16M17 20L13 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DropdownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GasIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20.34L12 18.34M12 5.34C12 5.34 14 2.34 17 5.34C20 8.34 18 14.34 12 14.34C6 14.34 4 8.34 7 5.34C10 2.34 12 5.34 12 5.34Z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ContinueArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5L19 12L12 19" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ECH_TOKEN = {
  address: import.meta.env.VITE_EXCHANAGE_ECHO_CONTRACT_ADDRESS,
  decimals: 18
};
const USDC_TOKEN = {
  address: import.meta.env.VITE_EXCHANAGE_USDC_CONTRACT_ADDRESS,
  decimals: 18
};

function ExchangeView() {
  const [fromCurrency, setFromCurrency] = useState('ECH');
  const [toCurrency, setToCurrency] = useState('USDC');
  const [amount, setAmount] = useState('');
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);
  const [error, setError] = useState('');

  const { adminUSDC, adminEcho, userEcho, userUSDC, userScore } = useConverter();
  const { signer } = useAuth();
  const { executeSwap, isSwapping, statusMessage, swapError, swapSuccess } = useTokenSwap(signer);

  const numAdminUsdc = parseFloat(adminUSDC);
  const numAdminEcho = parseFloat(adminEcho);
  const echToUsdcRate = numAdminEcho > 0 ? numAdminUsdc / numAdminEcho : 0;

  // --- Tier Fee Logic ---
  const getFeeTier = () => {
    if (userScore >= 1000) return { tier: 'Diamond', fee: 500, display: '0.05%' };
    if (userScore >= 500) return { tier: 'Gold', fee: 1000, display: '0.1%' };
    if (userScore >= 200) return { tier: 'Silver', fee: 1500, display: '0.15%' };
    if (userScore >= 50) return { tier: 'Bronze', fee: 2500, display: '0.25%' };
    return { tier: 'Standard', fee: 3000, display: '0.3%' };
  };
  const { tier, fee, display } = getFeeTier();

  // Calculate estimated gas cost (example: base $50 gas * fee %)
  const estimatedBaseGasUSD = 50; 
  const estimatedGasCostUSD = ((fee / 10000) * estimatedBaseGasUSD).toFixed(2);

  const getBalanceForCurrency = (currency) => {
    return currency === 'ECH' ? userEcho : userUSDC;
  };

  const fromBalance = getBalanceForCurrency(fromCurrency);
  const toBalance = getBalanceForCurrency(toCurrency);

  let toAmount, fromAmount;
  if (amountInFromCurrency) {
    fromAmount = amount;
    const rate = fromCurrency === 'ECH' ? echToUsdcRate : 1 / echToUsdcRate;
    toAmount = amount && echToUsdcRate > 0 ? (amount * rate).toFixed(4) : '';
  } else {
    toAmount = amount;
    const rate = fromCurrency === 'ECH' ? echToUsdcRate : 1 / echToUsdcRate;
    fromAmount = amount && echToUsdcRate > 0 ? (amount / rate).toFixed(4) : '';
  }

  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > parseFloat(fromBalance)) {
      setError('Insufficient balance');
    } else {
      setError('');
    }
  }, [fromAmount, fromBalance]);

  useEffect(() => {
    if (swapSuccess) {
      setAmount('');
    }
  }, [swapSuccess]);

  const handleFromAmountChange = useCallback((e) => {
    setAmount(e.target.value);
    setAmountInFromCurrency(true);
  }, []);

  const handleToAmountChange = useCallback((e) => {
    setAmount(e.target.value);
    setAmountInFromCurrency(false);
  }, []);

  const handleSetMax = () => {
    setAmount(fromBalance.toString());
    setAmountInFromCurrency(true);
  };

  const handleSetHalf = () => {
    const halfBalance = parseFloat(fromBalance) / 2;
    setAmount(halfBalance.toString());
    setAmountInFromCurrency(true);
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(toAmount);
    setAmountInFromCurrency(true);
  };

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0 || error) return;
    const fromToken = fromCurrency === 'ECH' ? ECH_TOKEN : USDC_TOKEN;
    const toToken = toCurrency === 'USDC' ? USDC_TOKEN : ECH_TOKEN;
    await executeSwap(amount.toString(), 18);
  };

  const getCurrencyLogo = (currency) => null;

  return (
    <div className="w-full max-w-md mx-auto p-0.5 rounded-3xl bg-gradient-to-br from-lime-400 to-purple-500 animate-fade-in-up">
      <div className="bg-black rounded-3xl p-6 font-sans text-white h-full w-full">
        <div className="flex justify-between items-center mb-8 px-2">
          <button className="p-2"><BackIcon /></button>
          <h1 className="text-xl font-bold">Swap currency</h1>
          <button className="p-2"><BellIcon /></button>
        </div>

        <div className="relative">
          <div className="bg-gray-900 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">You pay</span>
              <div className="flex space-x-2">
                <button onClick={handleSetHalf} className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full hover:bg-gray-600">Half</button>
                <button onClick={handleSetMax} className="bg-gray-700 text-white text-xs px-3 py-1 rounded-full hover:bg-gray-600">Max</button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {getCurrencyLogo(fromCurrency)}
                <span className="text-lg font-bold">{fromCurrency}</span>
                <button className="ml-1"><DropdownIcon /></button>
              </div>
              <input
                type="number"
                value={fromAmount}
                onChange={handleFromAmountChange}
                placeholder="0"
                className="bg-transparent text-white text-2xl font-bold text-right w-full outline-none"
              />
            </div>
            <div className="text-left">
              <span className="text-gray-400 text-sm">Balance: {toBalance} {fromCurrency}</span>
            </div>
            {error && <p className="text-red-500 text-xs text-left mt-1">{error}</p>}
          </div>

          <div className="absolute w-full flex justify-center" style={{ top: '50%', transform: 'translateY(-50%)' }}>
            <button onClick={handleSwap} className="z-10 bg-gray-800 border-4 border-black rounded-full p-2 hover:bg-gray-700 transition-all duration-300 transform hover:rotate-180 focus:outline-none">
              <SwapIcon />
            </button>
          </div>

          <div className="bg-[#4a2f62] bg-opacity-40 rounded-2xl p-4 space-y-2 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">You receive</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {getCurrencyLogo(toCurrency)}
                <span className="text-lg font-bold">{toCurrency}</span>
                <button className="ml-1"><DropdownIcon /></button>
              </div>
              <input
                type="number"
                value={toAmount}
                onChange={handleToAmountChange}
                placeholder="0"
                className="bg-transparent text-white text-2xl font-bold text-right w-full outline-none"
              />
            </div>
            <div className="text-left">
              <span className="text-gray-400 text-sm">Balance: {fromBalance} {toCurrency}</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-400 my-2">
          {echToUsdcRate > 0 && (
            <span>
              1 {fromCurrency} ≈ {fromCurrency === 'ECH' ? echToUsdcRate.toFixed(3) : (1 / echToUsdcRate).toFixed(3)} {toCurrency}
            </span>
          )}
        </div>

        {/* Dynamic Gas Fee Section */}
        <div className="flex justify-between items-center bg-gray-800/50 rounded-lg p-3 mt-2">
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <GasIcon />
              <span className="text-gray-400">Your gas fee</span>
            </div>
            <span className="text-xs text-gray-500">Tier: {tier}</span>
          </div>
          <span className="text-white font-medium">{display} (~${estimatedGasCostUSD})</span>
        </div>

        <div className="mt-8">
          <button
            onClick={handleConvert}
            disabled={isSwapping || !amount || parseFloat(amount) <= 0 || !!error}
            className="w-full bg-lime-400 text-gray-800 font-bold py-4 px-6 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSwapping ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{statusMessage || 'Processing...'}</span>
              </>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span>Continue</span>
                <ContinueArrowIcon />
              </div>
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-center h-5">
          {swapError && <p className="text-red-400">{swapError}</p>}
          {swapSuccess && <p className="text-green-400">Swap successful!</p>}
        </div>

      </div>
    </div>
  );
}

export default ExchangeView;
