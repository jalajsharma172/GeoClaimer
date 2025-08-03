import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User, Claim, CompletedCircle, UserPath } from "@shared/schema";
import { checkOverlap, calculateCircleArea } from "@/utils/ClaimManager";
import { apiRequest } from "@/lib/queryClient";
import { getCompletedCircles, createCompletedCircle } from "@/services/api";

// Import Leaflet dynamically to avoid SSR issues
let L: any = null;
let isLeafletLoaded = false;
let leafletPromise: Promise<any> | null = null;

const loadLeaflet = async () => {
  if (typeof window !== 'undefined' && !isLeafletLoaded) {
    if (!leafletPromise) {
      leafletPromise = import('leaflet').then(async (leaflet) => {
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');
        L = leaflet.default;
        isLeafletLoaded = true;
        return L;
      }).catch((error) => {
        console.error('Failed to load Leaflet:', error);
        throw error;
      });
    }
    return leafletPromise;
  }
  return Promise.resolve(L);
};

interface MapViewProps {
  user: User;
  position: GeolocationPosition | null;
  isTracking: boolean;
  locationHistory: Array<{lat: number, lng: number, timestamp: number}>;
  isCircleComplete: boolean;
  circleCenter: {lat: number, lng: number} | null;
  onClaimSuccess: (area: number) => void;
  onClaimError: (message: string) => void;
  onCircleComplete: (center: {lat: number, lng: number}) => void;
}

export default function MapView({ 
  user, 
  position, 
  isTracking, 
  locationHistory,
  isCircleComplete,
  circleCenter,
  onClaimSuccess, 
  onClaimError,
  onCircleComplete
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentCircleRef = useRef<any>(null);
  const currentPositionMarkerRef = useRef<any>(null); // <-- Add this line
  const claimedLayersRef = useRef<any[]>([]);
  const locationPathRef = useRef<any>(null);
  const completedCircleLayersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const queryClient = useQueryClient();

  // Preload Leaflet as soon as component mounts
  useEffect(() => {
    loadLeaflet().catch(console.error);
  }, []);

  // Fetch all claims for visualization
  const { data: claimsData } = useQuery<{ claims: Claim[] }>({
    queryKey: ['/api/claims'],
    enabled: isMapReady,
  });

  // Fetch user's claims
  const { data: userClaimsData } = useQuery<{ claims: Claim[] }>({
    queryKey: ['/api/claims/user', user.id],
    enabled: isMapReady,
  });

  // Fetch completed circles
  const { data: completedCirclesData } = useQuery<{ completedCircles: CompletedCircle[] }>({
    queryKey: ['/api/completed-circles'],
    enabled: isMapReady,
  });

  // Fetch user's all paths (including previous ones)
  const { data: userPathsData } = useQuery<{ userPaths: UserPath[] }>({
    queryKey: ['/api/user-paths/user', user.id],
    enabled: isMapReady,
  });

  // Create claim mutation
  const createClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const response = await apiRequest('POST', '/api/claims', claimData);
      return response.json();
    },
    onSuccess: (data) => {
      onClaimSuccess(data.claim.area);
      queryClient.invalidateQueries({ queryKey: ['/api/claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/claims/user', user.id] });
    },
    onError: (error: any) => {
      onClaimError(error.message || 'Failed to claim area');
    },
  });

  // Create completed circle mutation
  const createCompletedCircleMutation = useMutation({
    mutationFn: async (completedCircleData: any) => {
      const response = await createCompletedCircle(completedCircleData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/completed-circles'] });
    },
    onError: (error: any) => {
      console.error('Failed to save completed circle:', error);
    },
  });

  // Initialize map
  useEffect(() => {
    const initializeMap = async () => {
      try {
        console.log('Starting map initialization...');
        setLoadingProgress(10);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI
        
        setLoadingProgress(30);
        console.log('Loading Leaflet...');
        await loadLeaflet();
        
        setLoadingProgress(60);
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay for UI
        
        if (!mapRef.current || !L || mapInstanceRef.current) {
          console.log('Map ref or Leaflet not ready:', { 
            mapRef: !!mapRef.current, 
            L: !!L, 
            mapInstance: !!mapInstanceRef.current 
          });
          return;
        }

        console.log('Creating map instance...');
        setLoadingProgress(80);
        const map = L.map(mapRef.current, {
          center: [40.7128, -74.0060], // Default to NYC
          zoom: 16,
          zoomControl: true,
          attributionControl: true,
        });

        console.log('Adding tile layer...');
        // Add CartoDB tiles (usually faster than OpenStreetMap)
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '© CartoDB',
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Add fallback tile provider if CartoDB fails
        tileLayer.on('tileerror', () => {
          console.log('CartoDB tiles failed, trying OpenStreetMap...');
          // Try OpenStreetMap as fallback
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map);
        });

        setLoadingProgress(90);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UI
        
        mapInstanceRef.current = map;
        setIsMapReady(true);
        setMapError(null);
        setLoadingProgress(100);
        console.log('Map initialization complete!');
        
        // Let tiles load in background
        setTimeout(() => {
          console.log('Map tiles should be loaded by now');
        }, 2000);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setMapError('Failed to load map. Please check your internet connection and refresh the page.');
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!isMapReady && !mapError) {
        console.log('Map loading timeout reached');
        setMapError('Map is taking too long to load. Please check your internet connection and refresh the page.');
      }
    }, 30000); // 30 second timeout (increased from 10 seconds)

    initializeMap();

    return () => {
      clearTimeout(timeoutId);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user position and current circle
  useEffect(() => {
    console.log('Position update:', { position, isTracking, mapReady: !!mapInstanceRef.current });
    
    if (!mapInstanceRef.current || !L || !position || !isTracking) {
      if (currentCircleRef.current) {
        mapInstanceRef.current.removeLayer(currentCircleRef.current);
        currentCircleRef.current = null;
      }
      if (currentPositionMarkerRef.current) { // <-- Remove marker if exists
        mapInstanceRef.current.removeLayer(currentPositionMarkerRef.current);
        currentPositionMarkerRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    const { latitude, longitude } = position.coords;
    
    console.log('Setting position:', { latitude, longitude });

    // Update map center
    map.setView([latitude, longitude], map.getZoom());

    // Remove previous current circle
    if (currentCircleRef.current) {
      map.removeLayer(currentCircleRef.current);
    }
    // Remove previous marker
    if (currentPositionMarkerRef.current) {
      map.removeLayer(currentPositionMarkerRef.current);
    }

    // Add current position circle (10m radius)
    const currentCircle = L.circle([latitude, longitude], {
      radius: 10,
      color: '#22C55E',
      fillColor: '#22C55E',
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(map);

    // Add a more visible marker for exact position
    const positionMarker = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: #EF4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4); position: relative;">
          <div style="position: absolute; top: -8px; left: -8px; width: 32px; height: 32px; border: 2px solid #EF4444; border-radius: 50%; opacity: 0.3;"></div>
        </div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      }),
      zIndexOffset: 1000 // <-- Make sure marker is on top
    }).addTo(map);

    // Add accuracy circle (if accuracy is available)
    if (position.coords.accuracy) {
      const accuracyCircle = L.circle([latitude, longitude], {
        radius: position.coords.accuracy,
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5'
      }).addTo(map);
    }

    currentCircle.bindPopup(`
      <div>
        <strong>Current Position</strong><br>
        Lat: ${latitude.toFixed(6)}<br>
        Lng: ${longitude.toFixed(6)}<br>
        Radius: 10m<br>
        <button onclick="window.attemptClaim()" style="background: #22C55E; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 8px;">
          Claim This Area
        </button>
      </div>
    `);

    currentCircleRef.current = currentCircle;
    currentPositionMarkerRef.current = positionMarker; // <-- Track marker

    // Expose claim function globally for popup button
    (window as any).attemptClaim = handleClaimAttempt;
  }, [position, isTracking]);

  // Render location history path
  useEffect(() => {
    if (!mapInstanceRef.current || !L || locationHistory.length < 2) {
      if (locationPathRef.current) {
        mapInstanceRef.current.removeLayer(locationPathRef.current);
        locationPathRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;

    // Remove previous path
    if (locationPathRef.current) {
      map.removeLayer(locationPathRef.current);
    }

    // Create path from location history
    const pathCoords = locationHistory.map(point => [point.lat, point.lng]);
    const path = L.polyline(pathCoords, {
      color: '#EF4444',
      weight: 3,
      opacity: 0.8,
    }).addTo(map);

    locationPathRef.current = path;

    // Check for circle completion
    if (isCircleComplete && circleCenter) {
      onCircleComplete(circleCenter);
    }
  }, [locationHistory, isCircleComplete, circleCenter, onCircleComplete]);

  // Render claimed areas
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !claimsData?.claims) return;

    const map = mapInstanceRef.current;

    // Clear previous claimed layers
    claimedLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    claimedLayersRef.current = [];

    // Add claimed circles
    claimsData.claims.forEach((claim: Claim) => {
      const isUserClaim = claim.userId === user.id;
      const circle = L.circle([claim.latitude, claim.longitude], {
        radius: claim.radius,
        color: isUserClaim ? '#3B82F6' : '#94A3B8',
        fillColor: isUserClaim ? '#3B82F6' : '#94A3B8',
        fillOpacity: isUserClaim ? 0.4 : 0.2,
        weight: isUserClaim ? 2 : 1,
      }).addTo(map);

      circle.bindPopup(`
        <div>
          <strong>${isUserClaim ? 'Your Claim' : 'Claimed Area'}</strong><br>
          Area: ${Math.round(claim.area)} m²<br>
          Claimed: ${new Date(claim.createdAt!).toLocaleString()}
          ${claim.district ? `<br>District: ${claim.district}` : ''}
        </div>
      `);

      claimedLayersRef.current.push(circle);
    });
  }, [claimsData, user.id]);

  // Render completed circles
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !completedCirclesData?.completedCircles) return;

    const map = mapInstanceRef.current;

    // Clear previous completed circle layers
    completedCircleLayersRef.current.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    completedCircleLayersRef.current = [];

    // Add completed circles
    completedCirclesData.completedCircles.forEach((circle: CompletedCircle) => {
      const isUserCircle = circle.userId === user.id;
      const circleLayer = L.circle([circle.centerLatitude, circle.centerLongitude], {
        radius: circle.radius,
        color: isUserCircle ? '#10B981' : '#F59E0B',
        fillColor: isUserCircle ? '#10B981' : '#F59E0B',
        fillOpacity: isUserCircle ? 0.5 : 0.3,
        weight: isUserCircle ? 3 : 2,
        className: 'completed-circle-layer',
      }).addTo(map);

      circleLayer.bindPopup(`
        <div>
          <strong>${isUserCircle ? 'Your Completed Circle' : 'Completed Circle'}</strong><br>
          User: ${circle.username}<br>
          Area: ${Math.round(circle.area)} m²<br>
          Completed: ${new Date(circle.createdAt!).toLocaleString()}
          ${circle.completionTime ? `<br>Time: ${Math.round(circle.completionTime)}s` : ''}
          ${circle.district ? `<br>District: ${circle.district}` : ''}
        </div>
      `);
      completedCircleLayersRef.current.push(circleLayer);
    });
  }, [completedCirclesData, user.id]);

  // Render all user paths (including previous ones)
  const allUserPathsRef = useRef<any[]>([]);
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !userPathsData?.userPaths) return;

    const map = mapInstanceRef.current;

    // Clear previous user path layers
    allUserPathsRef.current.forEach(layer => {
      if (map.hasLayer(layer)) {
        map.removeLayer(layer);
      }
    });
    allUserPathsRef.current = [];

    // Render all user paths
    userPathsData.userPaths.forEach((userPath: UserPath) => {
      try {
        const pathPoints = JSON.parse(userPath.pathPoints) as Array<{lat: number, lng: number, timestamp: number}>;
        
        if (pathPoints && pathPoints.length > 1) {
          const latLngs = pathPoints.map(point => [point.lat, point.lng]);
          
          // Different styles for active vs completed paths
          const isActive = userPath.isActive === 1;
          const pathStyle = {
            color: isActive ? '#3B82F6' : '#6B7280', // Blue for active, gray for completed
            weight: isActive ? 4 : 3,
            opacity: isActive ? 0.8 : 0.6,
            className: `user-path-layer ${isActive ? 'active-path' : 'completed-path'}`,
          };

          const polyline = L.polyline(latLngs, pathStyle).addTo(map);

          // Add popup with path information
          const pathLength = userPath.pathLength || 0;
          const pathArea = userPath.area || 0;
          const createdDate = new Date(userPath.createdAt!).toLocaleString();
          
          polyline.bindPopup(`
            <div>
              <strong>${isActive ? 'Active Path' : 'Completed Path'}</strong><br>
              Length: ${Math.round(pathLength)} m<br>
              Area: ${Math.round(pathArea)} m²<br>
              Points: ${pathPoints.length}<br>
              Created: ${createdDate}
              ${userPath.district ? `<br>District: ${userPath.district}` : ''}
            </div>
          `);

          allUserPathsRef.current.push(polyline);
        }
      } catch (error) {
        console.error('Error parsing path points:', error);
      }
    });
  }, [userPathsData, user.id]);

  // Handle circle completion
  useEffect(() => {
    if (isCircleComplete && circleCenter && !createCompletedCircleMutation.isPending) {
      const { latitude, longitude } = position!.coords;
      const radius = 10;
      const area = calculateCircleArea(radius);
      
      // Calculate completion time (time from first to last point)
      const completionTime = locationHistory.length > 1 
        ? (locationHistory[locationHistory.length - 1].timestamp - locationHistory[0].timestamp) / 1000
        : 0;

      // Get location details
      const district = `District_${Math.floor(latitude * 100) % 100}`;
      const city = `City_${Math.floor(longitude * 100) % 100}`;
      const country = 'Unknown';

      createCompletedCircleMutation.mutate({
        userId: user.id,
        username: user.username,
        latitude: circleCenter.lat,
        longitude: circleCenter.lng,
        radius,
        area,
        pathPoints: JSON.stringify(locationHistory),
        completionTime,
        district,
        city,
        country,
      });
    }
  }, [isCircleComplete, circleCenter, locationHistory, user, createCompletedCircleMutation]);

  const handleClaimAttempt = async () => {
    if (!position || !isTracking) {
      onClaimError('GPS tracking required to claim areas');
      return;
    }

    const { latitude, longitude } = position.coords;
    const radius = 10;
    const area = calculateCircleArea(radius);

    // Check for overlaps with existing claims
    if (claimsData?.claims) {
      const hasOverlap = claimsData.claims.some((claim: Claim) => 
        checkOverlap(
          { lat: latitude, lng: longitude, radius },
          { lat: claim.latitude, lng: claim.longitude, radius: claim.radius }
        )
      );

      if (hasOverlap) {
        onClaimError('This area overlaps with an existing claim');
        return;
      }
    }

    // Attempt to get location details (simplified - in a real app you'd use reverse geocoding)
    const district = `District_${Math.floor(latitude * 100) % 100}`;
    const city = `City_${Math.floor(longitude * 100) % 100}`;
    const country = 'Unknown';

    createClaimMutation.mutate({
      userId: user.id,
      latitude,
      longitude,
      radius,
      area,
      district,
      city,
      country,
    });
  };

  if (!L || !isMapReady) {
    return (
      <div className="absolute inset-0">
        {/* Map container - always render this */}
        <div 
          ref={mapRef} 
          className="absolute inset-0 z-0"
          style={{ 
            height: '100vh', 
            width: '100vw',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#f0f0f0' // Light gray background to show the container
          }}
        />
        
        {/* Loading overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 z-10">
          <div className="text-center text-gray-600">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-lg font-medium">Loading Map...</p>
            <p className="text-sm text-gray-500">Initializing Leaflet</p>
            <p className="text-xs text-gray-400 mt-2">Progress: {loadingProgress}%</p>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100">
        <div className="text-center text-gray-600">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg font-medium">Map Error</p>
          <p className="text-sm text-gray-500">{mapError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      {/* Map container - always render this */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 z-0"
        style={{ 
          height: '100vh', 
          width: '100vw',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      />
      
      {/* Loading overlay - only show when loading */}
      {loadingProgress < 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-lg font-medium">Loading Map...</p>
            <p className="text-sm text-gray-500">Initializing Leaflet</p>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
