import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { User, Claim } from "@shared/schema";
import { checkOverlap, calculateCircleArea } from "@/utils/ClaimManager";
import { apiRequest } from "@/lib/queryClient";

// Import Leaflet dynamically to avoid SSR issues
let L: any = null;
if (typeof window !== 'undefined') {
  import('leaflet').then((leaflet) => {
    L = leaflet.default;
  });
}

interface MapViewProps {
  user: User;
  position: GeolocationPosition | null;
  isTracking: boolean;
  onClaimSuccess: (area: number) => void;
  onClaimError: (message: string) => void;
}

export default function MapView({ 
  user, 
  position, 
  isTracking, 
  onClaimSuccess, 
  onClaimError 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const currentCircleRef = useRef<any>(null);
  const claimedLayersRef = useRef<any[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const queryClient = useQueryClient();

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

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [40.7128, -74.0060], // Default to NYC
      zoom: 16,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update user position and current circle
  useEffect(() => {
    if (!mapInstanceRef.current || !L || !position || !isTracking) {
      if (currentCircleRef.current) {
        mapInstanceRef.current.removeLayer(currentCircleRef.current);
        currentCircleRef.current = null;
      }
      return;
    }

    const map = mapInstanceRef.current;
    const { latitude, longitude } = position.coords;

    // Update map center
    map.setView([latitude, longitude], map.getZoom());

    // Remove previous current circle
    if (currentCircleRef.current) {
      map.removeLayer(currentCircleRef.current);
    }

    // Add current position circle (100m radius)
    const currentCircle = L.circle([latitude, longitude], {
      radius: 100,
      color: '#22C55E',
      fillColor: '#22C55E',
      fillOpacity: 0.3,
      weight: 2,
    }).addTo(map);

    currentCircle.bindPopup(`
      <div>
        <strong>Current Position</strong><br>
        Radius: 100m<br>
        <button onclick="window.attemptClaim()" style="background: #22C55E; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-top: 8px;">
          Claim This Area
        </button>
      </div>
    `);

    currentCircleRef.current = currentCircle;

    // Expose claim function globally for popup button
    (window as any).attemptClaim = handleClaimAttempt;
  }, [position, isTracking]);

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

  const handleClaimAttempt = async () => {
    if (!position || !isTracking) {
      onClaimError('GPS tracking required to claim areas');
      return;
    }

    const { latitude, longitude } = position.coords;
    const radius = 100;
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

  if (!L) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
        <div className="text-center text-gray-600">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-lg font-medium">Loading Map...</p>
          <p className="text-sm text-gray-500">Initializing Leaflet</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="absolute inset-0 z-0"
      style={{ height: '100vh', width: '100vw' }}
    />
  );
}
