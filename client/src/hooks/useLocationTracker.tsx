import { useState, useEffect, useRef } from "react";
import { findPathIntersections, calculatePathLength, calculatePathArea, type PathPoint } from "@shared/utils/geometry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User, UserPath } from "@shared/schema";

export interface LocationData {
  position: GeolocationPosition | null;
  accuracy: number | null;
  isTracking: boolean;
  error: string | null;
  locationHistory: PathPoint[];
  isCircleComplete: boolean;
  circleCenter: {lat: number, lng: number} | null;
  currentPath: UserPath | null;
  totalPathLength: number;
  currentPathArea: number;
}

interface UseLocationTrackerProps {
  user: User;
}

export function useLocationTracker({ user }: UseLocationTrackerProps) {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationHistory, setLocationHistory] = useState<PathPoint[]>([]);
  const [isCircleComplete, setIsCircleComplete] = useState(false);
  const [circleCenter, setCircleCenter] = useState<{lat: number, lng: number} | null>(null);
  const [currentPath, setCurrentPath] = useState<UserPath | null>(null);
  const [totalPathLength, setTotalPathLength] = useState(0);
  const [currentPathArea, setCurrentPathArea] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // Path tracking parameters
  const CIRCLE_RADIUS = 10; // 10 meters
  const CIRCLE_THRESHOLD = 0.8; // 80% of points should be within circle
  const MIN_POINTS_FOR_CIRCLE = 20; // Minimum points to detect a circle
  const PATH_WIDTH = 10; // Path width in meters
  const MIN_DISTANCE_FOR_NEW_POINT = 2; // Minimum distance between points in meters

  // Get active user path
  const { data: activePathData } = useQuery({
    queryKey: ["/api/user-paths/active", user.id],
    enabled: !!user.id,
  });

  // Create new path mutation
  const createPathMutation = useMutation({
    mutationFn: (pathData: any) => 
      fetch('/api/user-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pathData)
      }).then(res => res.json()),
    onSuccess: (response: any) => {
      setCurrentPath(response.userPath);
      queryClient.invalidateQueries({ queryKey: ["/api/user-paths"] });
    },
  });

  // Update path mutation
  const updatePathMutation = useMutation({
    mutationFn: ({ pathId, updates }: { pathId: string; updates: any }) => 
      fetch(`/api/user-paths/${pathId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      }).then(res => res.json()),
    onSuccess: (response: any) => {
      setCurrentPath(response.userPath);
      queryClient.invalidateQueries({ queryKey: ["/api/user-paths"] });
    },
  });

  // Create completed circle mutation
  const createCircleMutation = useMutation({
    mutationFn: (circleData: any) => 
      fetch('/api/completed-circles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(circleData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/completed-circles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

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

  // Start new path tracking
  const startNewPath = async () => {
    if (!position) return;

    const newPathData = {
      userId: user.id,
      username: user.username,
      pathPoints: JSON.stringify([]),
      pathLength: 0,
      area: 0,
      isActive: 1,
      district: user.district,
      city: user.city,
      country: user.country,
    };

    createPathMutation.mutate(newPathData);
  };

  // Update user's total area for travel distance
  const updateUserTotalAreaForTravel = async (currentArea: number) => {
    if (!currentPath || currentArea <= 0) return;
    
    // Only update if area has increased significantly (avoid frequent small updates)
    const lastSavedArea = currentPath.area || 0;
    const areaDifference = currentArea - lastSavedArea;
    
    if (areaDifference >= 50) { // Update every 50 square meters of new area
      try {
        // Update user statistics via API call
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalArea: (user.totalArea || 0) + areaDifference,
          })
        });
        
        // Update the current path's saved area
        if (currentPath) {
          updatePathMutation.mutate({
            pathId: currentPath.id,
            updates: { area: currentArea }
          });
        }
        
        // Invalidate user queries to refresh the UI
        queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      } catch (error) {
        console.error('Failed to update user total area:', error);
      }
    }
  };

  // Save current path to database
  const saveCurrentPath = async () => {
    if (!currentPath || locationHistory.length === 0) return;

    const pathLength = calculatePathLength(locationHistory);
    const pathArea = calculatePathArea(pathLength, PATH_WIDTH);

    const updates = {
      pathPoints: JSON.stringify(locationHistory),
      pathLength,
      area: pathArea,
      isActive: 1,
    };

    updatePathMutation.mutate({ pathId: currentPath.id, updates });
  };

  // Check for path intersections and create circles
  const checkPathIntersections = async () => {
    if (locationHistory.length < 4) return;

    const intersections = findPathIntersections(locationHistory);
    
    for (const intersection of intersections) {
      // Create completed circle
      const circleData = {
        userId: user.id,
        username: user.username,
        centerLatitude: intersection.intersection.lat,
        centerLongitude: intersection.intersection.lng,
        radius: CIRCLE_RADIUS,
        area: intersection.area,
        pathPoints: JSON.stringify(intersection.circlePoints),
        district: user.district,
        city: user.city,
        country: user.country,
      };

      createCircleMutation.mutate(circleData);
      
      setIsCircleComplete(true);
      setCircleCenter(intersection.intersection);
      
      // Reset the flag after a delay
      setTimeout(() => {
        setIsCircleComplete(false);
        setCircleCenter(null);
      }, 5000);
    }
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

    const handleSuccess = (newPosition: GeolocationPosition) => {
      setPosition(newPosition);
      setAccuracy(newPosition.coords.accuracy);
      setIsTracking(true);

      if (newPosition.coords.accuracy > 20) {
        setError(`GPS accuracy is poor (${Math.round(newPosition.coords.accuracy)} meters). Move to an open area for better accuracy.`);
      } else {
        setError(null);
      }

      const newPoint: PathPoint = {
        lat: newPosition.coords.latitude,
        lng: newPosition.coords.longitude,
        timestamp: Date.now(),
        accuracy: newPosition.coords.accuracy
      };

      // Only add point if it's far enough from the last point
      setLocationHistory(prev => {
        const lastPoint = prev[prev.length - 1];
        if (lastPoint && calculateDistance(lastPoint.lat, lastPoint.lng, newPoint.lat, newPoint.lng) < MIN_DISTANCE_FOR_NEW_POINT) {
          return prev; // Skip this point
        }

        const updated = [...prev, newPoint];
        
        // Update path length and area
        const pathLength = calculatePathLength(updated);
        const pathArea = calculatePathArea(pathLength, PATH_WIDTH);
        setTotalPathLength(pathLength);
        setCurrentPathArea(pathArea);
        
        // Update user's total area in real-time based on travel distance
        if (pathArea > currentPathArea) {
          updateUserTotalAreaForTravel(pathArea);
        }
        
        // Check for path intersections
        checkPathIntersections();
        
        // Save to database periodically
        if (updated.length % 10 === 0 && currentPath) {
          saveCurrentPath();
        }
        
        return updated;
      });
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

  // Initialize path tracking when user starts tracking
  useEffect(() => {
    if (isTracking && !currentPath && position) {
      startNewPath();
    }
  }, [isTracking, currentPath, position]);

  // Load active path on component mount
  useEffect(() => {
    if (activePathData && 'activePath' in activePathData && activePathData.activePath) {
      setCurrentPath(activePathData.activePath);
      if (activePathData.activePath.pathPoints) {
        try {
          const savedPoints = JSON.parse(activePathData.activePath.pathPoints);
          setLocationHistory(savedPoints);
          setTotalPathLength(activePathData.activePath.pathLength || 0);
          setCurrentPathArea(activePathData.activePath.area || 0);
        } catch (error) {
          console.error('Failed to parse saved path points:', error);
        }
      }
    }
  }, [activePathData]);

  return {
    position,
    accuracy,
    isTracking,
    error,
    locationHistory,
    isCircleComplete,
    circleCenter,
    currentPath,
    totalPathLength,
    currentPathArea,
    refreshLocation,
    clearHistory,
    startNewPath,
    saveCurrentPath,
  };
}
