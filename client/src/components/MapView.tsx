import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet'; // Use 'L' as a common alias for Leaflet
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
  const polylineRef = useRef<L.Polyline | null>(null); // Reference to the path line

  
  const [position, setPosition] = useState<{ lat: number; lon: number; acc: number }>(() => {
    // Try to get initial position from useLocationTracker synchronously if possible
    // Otherwise, fallback to default values
    return { lat: 0, lon: 0, acc: 0 };
  });
  // 1. Get LIVE LOCATION
  useLocationTracker((newPosition) => {
    setPosition(newPosition);
  });

    //2. Initialize the map
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


// State to store the path array
  const [userPath, setUserPath] = useState<PathPoint[]>([]);

  // Update position and path using the custom hook
  useLocationTracker((newPosition) => {
    const latlngA = L.latLng(position.lat, position.lon);
    const latlngB = L.latLng(newPosition.lat, newPosition.lon);
    const distance = latlngA.distanceTo(latlngB);

    // if (distance < 5) {
    //   console.log("<<<<<<<<<<<<<<< Distance less than 5m, not logging");
    //   return;
    // }
    // if (distance > 150) {
    //   console.log(">>>>>>>>>>>>>> Distance greater than 150m, not logging");
    //   return;
    // }
 
    console.log(userPath.length+" Distance: ", distance);

    // Update position
    setPosition(newPosition);

    // Update path
    setUserPath((prevPath) => [
      ...prevPath,
      { lat: newPosition.lat, lon: newPosition.lon },
    ]);
 
  });



  // Update the map view, marker, and polyline when position or path changes
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

      // Draw the path on the map
      if (polylineRef.current) {
        mapRef.current.removeLayer(polylineRef.current);
      }
      if (userPath.length > 1) {
        const latlngs = userPath.map((point) => [point.lat, point.lon] as L.LatLngTuple);
        polylineRef.current = L.polyline(latlngs, {
          color: 'red',
          weight: 5,
          opacity: 0.7,
        }).addTo(mapRef.current!);
      }
    }
  }, [position, userPath]);

  return (
    <div id="map">
      {/* The map will be rendered into this div */}
    </div>
  );
}

export default MapView;










