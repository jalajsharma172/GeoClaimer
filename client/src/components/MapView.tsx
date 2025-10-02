import { useToast } from "@/hooks/use-toast"; // Import the useToast hook
import toast from 'react-hot-toast';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocationTracker from "@/hooks/useLocationTracker";
import './map.css';

// Define the type for a path point (lat and lon)
interface PathPoint {
  lat: number;
  lon: number;
}

function MapView() {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null); // Reference to the current marker
  const [userPath, setUserPath] = useState<PathPoint[]>([]); // State to store the path array
  const [position, setPosition] = useState<{ lat: number; lon: number; acc: number }>({ lat: 0, lon: 0, acc: 0 });
  const [isClosed, setIsClosed] = useState(false); // State to track if the polygon is closed
  const ghostPolyline = useRef<L.Polyline | null>(null); // Reference to the ghost polyline
   const MAX_ACCURACY_THRESHOLD_M = 30; // Maximum acceptable accuracy in meters

   const { toast } = useToast(); // Initialize the toast hook

   
  // 1. Get LIVE LOCATION
  useLocationTracker((newPosition) => {
    setPosition(newPosition);
  });

  // 2. Initialize the map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('map').setView([position.lat, position.lon], 18);

      const googleMap = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      });

      googleMap.addTo(mapRef.current);
    }
  }, []);

  // 3. Update position and path using the custom hook
  useLocationTracker((newPosition) => {
    if (newPosition.acc > MAX_ACCURACY_THRESHOLD_M) {
      // Show a toast notification for low accuracy
      toast({
        title: "Low GPS Accuracy",
        description: `Accuracy too low (${newPosition.acc.toFixed(1)}m). Move to an open area!`,
        variant: "destructive", // Use a "destructive" variant for error messages
      });
      return;
    }

    const latlngA = L.latLng(position.lat, position.lon);
    const latlngB = L.latLng(newPosition.lat, newPosition.lon);
    const distance = latlngA.distanceTo(latlngB);

    if (distance < 5) {
      // Show a toast notification for small movement
      toast({
        title: "Small Movement",
        description: "Moved less than 5 meters.",
      });
      return;
    }

    if (distance > 100) {
      // Show a toast notification for large movement
      toast({
        title: "Large Movement",
        description: `Skipped large movement (${distance.toFixed(1)}m).`,
      
      });
      return;
    }

    // Update position and path
    setPosition(newPosition);
    setUserPath((prevPath) => [
      ...prevPath,
      { lat: newPosition.lat, lon: newPosition.lon },
    ]);

    // Show a success toast notification for position update
    toast({
      title: "Position Updated",
      description: `New position: Lat ${newPosition.lat.toFixed(4)}, Lon ${newPosition.lon.toFixed(4)}`,
    });
  });


// 4. Update the map view, marker, and polyline when position or path changes
  useEffect(() => {
    if (mapRef.current) {
      // Update the map view
      mapRef.current.setView([position.lat, position.lon], 18);

      // Remove the previous marker if it exists
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
      }

      // Add a new marker
      markerRef.current = L.marker([position.lat, position.lon]).addTo(mapRef.current!)
        .bindPopup(`Lat: ${position.lat}, Lon: ${position.lon}, Acc: ${position.acc}`)
        .openPopup();
    }
  }, [position, userPath]);







  // Function to finalize the polygon
  function finalizePolygon() {
    if (isClosed || userPath.length < 5) return;

    const finalCoords = [...userPath, userPath[0]]; // Close the polygon by adding the first point at the end
    const leafletCoords = finalCoords.map((point) => L.latLng(point.lat, point.lon));

    const newPolygon = L.polygon(leafletCoords, {
      color: '#007bff',
      fillColor: '#007bff',
      fillOpacity: 0.2,
    }).addTo(mapRef.current!);

    setUserPath([]); // Clear the path
    setIsClosed(true); // Mark the polygon as closed
    mapRef.current!.fitBounds(newPolygon.getBounds()); // Fit the map to the polygon
    console.log("POLYGON FINALIZED!");
  }

  // Function to remove the ghost line
  function removeGhostLine() {
    if (ghostPolyline.current) {
      ghostPolyline.current.remove();
      ghostPolyline.current = null;
    }
  }

  return (
    <div id="map" style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* The map will be rendered into this div */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={finalizePolygon}
          style={{
            backgroundColor: isClosed || userPath.length >= 5 ? 'green' : 'red',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '10px 20px',
            cursor: isClosed || userPath.length >= 5 ? 'pointer' : 'not-allowed',
          }}
          disabled={!isClosed && userPath.length < 5}
        >
          Finalize Polygon
        </button>
      </div>
    </div>
  );
}

export default MapView;