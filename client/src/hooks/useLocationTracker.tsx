import { useState, useEffect, useRef } from "react";

export interface LocationData {
  position: GeolocationPosition | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
  locationHistory: Array<{lat: number, lng: number, timestamp: number}>;
  isCircleComplete: boolean;
  circleCenter: {lat: number, lng: number} | null;
}

export function useLocationTracker() {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationHistory, setLocationHistory] = useState<Array<{lat: number, lng: number, timestamp: number}>>([]);
  const [isCircleComplete, setIsCircleComplete] = useState(false);
  const [circleCenter, setCircleCenter] = useState<{lat: number, lng: number} | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Circle detection parameters
  const CIRCLE_RADIUS = 10; // 10 meters
  const CIRCLE_THRESHOLD = 0.8; // 80% of points should be within circle
  const MIN_POINTS_FOR_CIRCLE = 20; // Minimum points to detect a circle

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  // Detect if the path forms a circle
  const detectCircle = (history: Array<{lat: number, lng: number, timestamp: number}>) => {
    if (history.length < MIN_POINTS_FOR_CIRCLE) return null;

    // Find the center point (average of all points)
    const centerLat = history.reduce((sum, point) => sum + point.lat, 0) / history.length;
    const centerLng = history.reduce((sum, point) => sum + point.lng, 0) / history.length;

    // Count points within the circle radius
    const pointsInCircle = history.filter(point => 
      calculateDistance(point.lat, point.lng, centerLat, centerLng) <= CIRCLE_RADIUS
    ).length;

    const circleRatio = pointsInCircle / history.length;

    if (circleRatio >= CIRCLE_THRESHOLD) {
      return { lat: centerLat, lng: centerLng };
    }

    return null;
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout for better accuracy
      maximumAge: 0, // Don't use cached position - always get fresh GPS
    };

    const handleSuccess = (position: GeolocationPosition) => {
      setPosition(position);
      setAccuracy(position.coords.accuracy);
      setIsTracking(true);

      if (position.coords.accuracy > 20) {
        setError(`GPS accuracy is poor (${Math.round(position.coords.accuracy)} meters). Move to an open area for better accuracy.`);
      } else {
        setError(null);
      }
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

  // Manual refresh function with high accuracy
  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }

    setError(null);
    console.log('Manually refreshing GPS location...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Only accept positions with good accuracy (less than 20 meters)
        if (position.coords.accuracy > 20) {
          console.log('Manual refresh - GPS accuracy too poor:', position.coords.accuracy, 'meters');
          setError("GPS accuracy is too poor. Please move to an open area or wait for better signal.");
          return;
        }

        console.log('Manual GPS refresh successful:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });

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
        timeout: 20000, // Longer timeout for manual refresh
        maximumAge: 0, // Don't use cached position for manual refresh
      }
    );
  };

  // Clear location history
  const clearHistory = () => {
    setLocationHistory([]);
    setIsCircleComplete(false);
    setCircleCenter(null);
  };

  return {
    position,
    accuracy,
    isTracking,
    error,
    locationHistory,
    isCircleComplete,
    circleCenter,
    refreshLocation,
    clearHistory,
  };
}
