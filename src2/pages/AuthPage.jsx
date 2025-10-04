import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { CheckCircle, ArrowRight, Wallet, Shield } from 'lucide-react';

// import Scanner from "../components/wordCoin/Scanner.jsx"; 

// --- Helper Components for UI ---
const MetaMaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path fill="currentColor" d="M20.5 3.5L13.5 8.5L15 5L20.5 3.5Z"/>
    <path fill="currentColor" d="M3.5 3.5L10.4 8.6L9 5L3.5 3.5Z"/>
    <path fill="currentColor" d="M17.5 16L15.5 19.5L20 20.5L21 16.2L17.5 16Z"/>
    <path fill="currentColor" d="M3 16.2L4 20.5L8.5 19.5L6.5 16L3 16.2Z"/>
    <path fill="currentColor" d="M8.2 10.5L7 12.5L11.4 12.7L11.3 7.8L8.2 10.5Z"/>
    <path fill="currentColor" d="M15.8 10.5L12.7 7.7L12.6 12.7L17 12.5L15.8 10.5Z"/>
    <path fill="currentColor" d="M8.5 19.5L11.3 18.2L8.8 16.3L8.5 19.5Z"/>
    <path fill="currentColor" d="M12.7 18.2L15.5 19.5L15.2 16.3L12.7 18.2Z"/>
  </svg>
);

const AnimatedGrid = () => (
  <div className="absolute inset-0 h-full w-full bg-black bg-grid-white/[0.05] -z-10" />
);

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-white/10 rounded-full h-1.5 mb-8">
    <div 
      className="bg-white h-1.5 rounded-full transition-all duration-700 ease-out"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// --- Main AuthPage Component ---
function AuthPage() {
  const { googleUser, walletAddress, isAuthenticated, setGoogleUser, connectMetaMask } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [progress, setProgress] = useState(0);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      setProgress(100);
      setRedirecting(true);
      setTimeout(() => navigate(from, { replace: true }), 2000);
    } else if (googleUser) {
      setProgress(50);
    } else {
      setProgress(0);
    }
  }, [isAuthenticated, googleUser, navigate, from]);

  const handleMetaMaskConnect = async () => {
    setIsLoading(true);
    await connectMetaMask();
    setIsLoading(false);
  };

  // Replace Google login step with Scanner step
  const isScannerStep = !googleUser;
  const isMetaMaskStep = googleUser && !walletAddress;

  return (
    <div className="w-screen h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedGrid />

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8 relative z-10">
        
        {redirecting ? (
          <div className="text-center transition-opacity duration-500">
            <CheckCircle size={64} className="text-white mx-auto mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-400 mb-4">Authentication complete.</p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="transition-opacity duration-500">
            <div className="text-center mb-8">
              <Shield size={32} className="mx-auto mb-3 text-white" />
              <h1 className="text-2xl font-bold mb-2">Secure Access</h1>
              <p className="text-gray-400 text-sm">Two-step verification required</p>
            </div>

            <ProgressBar progress={progress} />

            {isScannerStep && (
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">Scan to Authenticate</h2>
                <Scanner 
                  onSuccess={(scannedData) => {
                    console.log("✅ Scanner Success:", scannedData);
                    // You can set googleUser manually here to trigger next step
                    setGoogleUser({ name: scannedData.userName || "Scanned User" });
                  }}
                />
              </div>
            )}

            {isMetaMaskStep && (
              <div className="text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Connect Wallet</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Welcome, <span className="text-white font-medium">{googleUser?.name}</span>. Link your wallet to finish.
                </p>
                <button
                  onClick={handleMetaMaskConnect}
                  disabled={isLoading}
                  className="w-full bg-white text-black font-medium py-3 px-6 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" /> : <MetaMaskIcon />}
                  <span>{isLoading ? 'Waiting for connection...' : 'Connect MetaMask'}</span>
                   {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 mt-8 text-xs text-gray-500">
              <div className={`flex items-center gap-1.5 transition-colors ${googleUser ? 'text-gray-300' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${googleUser ? 'bg-white' : 'bg-gray-600'}`} />
                <span>Scan</span>
              </div>
              <div className="w-px h-3 bg-gray-700" />
              <div className={`flex items-center gap-1.5 transition-colors ${walletAddress ? 'text-gray-300' : ''}`}>
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${walletAddress ? 'bg-white' : 'bg-gray-600'}`} />
                <span>Wallet</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
