import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  hasRecovered: boolean;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasOffline: false,
    hasRecovered: false,
  });

  const handleOnline = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: true,
      isOffline: false,
      hasRecovered: prev.wasOffline, // Only set recovered if we were previously offline
      wasOffline: prev.wasOffline, // Keep the offline history
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      isOnline: false,
      isOffline: true,
      wasOffline: true,
      hasRecovered: false,
    }));
  }, []);

  const resetRecoveryFlag = useCallback(() => {
    setNetworkStatus(prev => ({
      ...prev,
      hasRecovered: false,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    ...networkStatus,
    resetRecoveryFlag,
  };
}

export default useNetworkStatus;