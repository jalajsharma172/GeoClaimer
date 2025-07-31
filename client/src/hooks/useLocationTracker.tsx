import { useState, useEffect, useRef } from "react";

export interface LocationData {
  position: GeolocationPosition | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
}

export function useLocationTracker() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000, // Cache position for 5 seconds
    };

    const handleSuccess = (position: GeolocationPosition) => {
      setPosition(position);
      setAccuracy(position.coords.accuracy);
      setIsTracking(true);
      setError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      setIsTracking(false);
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError("Location access denied. Please enable GPS permissions.");
          break;
        case error.POSITION_UNAVAILABLE:
          setError("Location information unavailable. Please check your GPS.");
          break;
        case error.TIMEOUT:
          setError("Location request timed out. Please try again.");
          break;
        default:
          setError("An unknown error occurred while retrieving location.");
          break;
      }
    };

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      options
    );

    // Cleanup function
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  // Manual refresh function
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPosition(position);
        setAccuracy(position.coords.accuracy);
        setIsTracking(true);
        setError(null);
      },
      (error) => {
        setIsTracking(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("Location access denied. Please enable GPS permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information unavailable. Please check your GPS.");
            break;
          case error.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;
          default:
            setError("An unknown error occurred while retrieving location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // Don't use cached position for manual refresh
      }
    );
  };

  return {
    position,
    accuracy,
    isTracking,
    error,
    refreshLocation,
  };
}
