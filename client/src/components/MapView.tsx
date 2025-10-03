import { useToast } from "@/hooks/use-toast"; // Import the useToast hook
import toast from 'react-hot-toast';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useLocationTracker from "@/hooks/useLocationTracker";
import './map.css';
import { uploadJsonToIPFS } from './UploadToIPFS';
import { calculatePolygonArea } from "@shared/utils/geometry";
import { useNavigate } from "react-router-dom"; // Add this import

// Define the type for a path point (lat and lon)
interface PathPoint {
  lat: number;
  lon: number;
}


function MapView() {
  const navigate = useNavigate(); // Add this line
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const [userPath, setUserPath] = useState<PathPoint[]>([]);

  // --- CHANGE #1: Use useState for totalDistance ---
  const [totalDistance, setTotalDistance] = useState(0);

  const [position, setPosition] = useState<{ lat: number; lon: number; acc: number }>({ lat: 0, lon: 0, acc: 0 });
  const [isClosed, setIsClosed] = useState(false);
  const ghostPolyline = useRef<L.Polyline | null>(null);
  const MAX_ACCURACY_THRESHOLD_M = 30;

  // Initialize the toast hook (assuming it's set up correctly)
  // const { toast } = useToast(); 

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
          createUserPathLine();
      }
  }, []);

  function createUserPathLine() {
      if (userPath.length > 0 && mapRef.current) {
          polylineRef.current = L.polyline(userPath.map(p => L.latLng(p.lat, p.lon)), { color: 'blue' }).addTo(mapRef.current);
          polylineRef.current.setStyle({
              color: 'blue',
              weight: 2,
              opacity: 2,
              dashArray: '5, 5',
          });
      }
  }

  function removeUserPathLine() {
      if (polylineRef.current) {
          polylineRef.current.remove();
          polylineRef.current = null;
      }
  }

  // 3. Update position and path using the custom hook
  useLocationTracker((newPosition) => {
      if (newPosition.acc > MAX_ACCURACY_THRESHOLD_M) {
          toast.error(`GPS Accuracy is low (${newPosition.acc.toFixed(1)}m)`);
          return;
      }
      
      // Don't calculate distance for the very first point
      if (position.lat === 0 && position.lon === 0) {
          setPosition(newPosition);
          return;
      }
      
      const latlngA = L.latLng(position.lat, position.lon);
      const latlngB = L.latLng(newPosition.lat, newPosition.lon);
      const temp_distance = latlngA.distanceTo(latlngB);
      
      if (temp_distance > 100) {
          toast.error(`Skipped large movement of ${temp_distance.toFixed(1)}m`);
          // You might want to just update the position without adding to path/distance
          // setPosition(newPosition); 
          return;
      }
      
      if (temp_distance < 5) {
          // It's better not to notify the user every time they stop, it can be annoying.
          // You can add a notification here if you want.
          return;
      }

      // --- CHANGE #2: Update state correctly ---
      setTotalDistance(prevDistance => prevDistance + temp_distance);

      // Update position and path
      setPosition(newPosition);
      setUserPath((prevPath) => [
          ...prevPath,
          { lat: newPosition.lat, lon: newPosition.lon },
      ]);
  });

  // 4. Update the map view, marker, and polyline when position or path changes
  useEffect(() => {
      if (mapRef.current) {
          if (markerRef.current) {
              mapRef.current.removeLayer(markerRef.current);
          }
          markerRef.current = L.marker([position.lat, position.lon]).addTo(mapRef.current!)
              .bindPopup(`Lat: ${position.lat}, Lon: ${position.lon}, Acc: ${position.acc}`)
              .openPopup();
      }
      removeUserPathLine();
      createUserPathLine();
      mapRef.current?.setView([position.lat, position.lon], 18);
  }, [position, userPath]);

  // Function to finalize the polygon
  async function finalizePolygon(): Promise<string | void> {
      if (isClosed || userPath.length < 5) return;
      const finalCoords = [...userPath, userPath[0]];
      const leafletCoords = finalCoords.map((point) => L.latLng(point.lat, point.lon));
      const newPolygon = L.polygon(leafletCoords, {
          color: '#007bff',
          fillColor: '#007bff',
          fillOpacity: 0.2,
      }).addTo(mapRef.current!);
      setUserPath([]);
      setIsClosed(true);
      mapRef.current!.fitBounds(newPolygon.getBounds());

      // Build GeoJSON coordinates [lng, lat]
      const geoJsonCoords = finalCoords.map(p => [p.lon, p.lat]);
      const polygonGeoJSON = {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Polygon" as const,
          coordinates: [geoJsonCoords],
        },
      };

      // Calculate area in m^2 using shared geometry util
      const areaMeters = calculatePolygonArea(
        finalCoords.map(p => ({ lat: p.lat, lng: p.lon }))
      );

      // Resolve username from localStorage if present
      let userName = "Anonymous";
      try {
        const savedUser = localStorage.getItem('territoryWalkerUser');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed?.username) userName = parsed.username;
        }
      } catch {}

      const metadata = {
        UserName: userName,
        PolygonCoordinates: finalCoords,
        Area: areaMeters,
        GeoJSON: polygonGeoJSON,
      };

      try {
        const hashcode = await uploadJsonToIPFS(metadata);
        const url =`https://gateway.pinata.cloud/ipfs/${hashcode}`
        console.log('Metadata pinned at:', url);
        window.alert(url);
        return url;
      } catch (e) {
        console.error('Failed to upload metadata to IPFS', e);
      }
  }

  // --- CHANGE #3: Create a formatted distance string for display ---
  const formatDistance = (meters: number) => {
      if (meters < 1000) {
          return `${meters.toFixed(1)} m`;
      } else {
          return `${(meters / 1000).toFixed(2)} km`;
      }
  };
  
  return (
      <div id="map" style={{ position: 'relative', height: '100vh', width: '100%' }}>
          {/* Back to Home Button */}
          <div style={{
              position: 'absolute',
              top: '100px',
              left: '10px',
              zIndex: 1000,
              borderRadius: '100px'
          }}>
              <button
                  onClick={() => navigate("/")}
                  style={{
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '100%',
                      padding: '20px 20px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      fontWeight: 'bold'
                  }}
              >
                  ←
              </button>
          </div>
          {/* Finalize Polygon Button */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
              <button
                  onClick={finalizePolygon}
                  style={{
                      backgroundColor: isClosed || userPath.length >= 5 ? 'green' : 'grey',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '10px 20px',
                      cursor: isClosed || userPath.length >= 5 ? 'pointer' : 'not-allowed',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                  }}
                  disabled={isClosed || userPath.length < 5}
              >
                  Finalize Polygon
              </button>
          </div>
          {/* --- CHANGE #4: The new and improved distance display --- */}
          <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '8px 15px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              fontSize: '18px',
              fontWeight: '600',
              color: '#333'
          }}>
              <span>Distance: {formatDistance(totalDistance)}</span>
          </div>
      </div>
  );
}

export default MapView;

// import { useToast } from "@/hooks/use-toast"; // Import the useToast hook
// import toast from 'react-hot-toast';
// import React, { useEffect, useRef, useState } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import useLocationTracker from "@/hooks/useLocationTracker";
// import './map.css';

// // Define the type for a path point (lat and lon)
// interface PathPoint {
//   lat: number;
//   lon: number;
// }

// function MapView() {
//   const mapRef = useRef<L.Map | null>(null);
//   const markerRef = useRef<L.Marker | null>(null); // Reference to the current marker
//   const polylineRef = useRef<L.Polyline | null>(null);
//   const [userPath, setUserPath] = useState<PathPoint[]>([]); // State to store the path array
//   var distance=0;
  
//   const [position, setPosition] = useState<{ lat: number; lon: number; acc: number }>({ lat: 0, lon: 0, acc: 0 });
//   const [isClosed, setIsClosed] = useState(false); // State to track if the polygon is closed
//   const ghostPolyline = useRef<L.Polyline | null>(null); // Reference to the ghost polyline
//    const MAX_ACCURACY_THRESHOLD_M = 30; // Maximum acceptable accuracy in meters

//    const { toast } = useToast(); // Initialize the toast hook

   
//   // 1. Get LIVE LOCATION
//   useLocationTracker((newPosition) => {
//     setPosition(newPosition);
//   });

//   // 2. Initialize the map
//   useEffect(() => {
//     if (!mapRef.current) {
//       mapRef.current = L.map('map').setView([position.lat, position.lon], 18);

//       const googleMap = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
//         maxZoom: 20,
//         subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
//       });

//       googleMap.addTo(mapRef.current);


//     // User Path LINE
//     createUserPathLine();
      
//     }
//   }, []);



//   function createUserPathLine() {
//     if (userPath.length > 0 && mapRef.current) {
//       polylineRef.current = L.polyline(userPath.map(p => L.latLng(p.lat, p.lon)), { color: 'blue' }).addTo(mapRef.current);        
//       polylineRef.current.setStyle({
//         color: 'blue',
//         weight: 2,
//         opacity: 2,
//         dashArray: '5, 5',
//       });
//     }
//   }

//   function removeUserPathLine() {
//     if (polylineRef.current) {
//       polylineRef.current.remove();
//       polylineRef.current = null;
//     }
//   }


//   // Watch user position
 
//     // navigator.geolocation.watchPosition(
//     //   function (position) {
//     //     var lat = position.coords.latitude;
//     //     var lng = position.coords.longitude;

//     //     // Push new coordinate as PathPoint and update state
//     //     const newPoint: PathPoint = { lat:lat, lon: lng };
//     //     setUserPath((prev) => {
//     //       const next = [...prev, newPoint];
//     //       // Update polyline with latest points
//     //       polylineRef.current?.setLatLngs(next.map(p => L.latLng(p.lat, p.lon)));
//     //       return next;
//     //     });
        

//     //     // Move map center to latest point
//     //     mapRef.current?.setView([lat, lng], 16);
        
//     //   },
//     //   function (error) {
//     //     console.error("Error getting location:", error);
//     //   },
//     //   {
//     //     enableHighAccuracy: true,
//     //     maximumAge: 0,
//     //     timeout: 5000
//     //   }
//     // );












//   // 3. Update position and path using the custom hook
//   useLocationTracker((newPosition) => {
//     if (newPosition.acc > MAX_ACCURACY_THRESHOLD_M) {
//       // Show a toast notification for low accuracy
//       toast({
//         title: "Low GPS Accuracy",
//         description: `Accuracy too low (${newPosition.acc.toFixed(1)}m). Move to an open area!`,
//         variant: "destructive", // Use a "destructive" variant for error messages
//       });
//       return;
//     }
    
//     const latlngA = L.latLng(position.lat, position.lon);
//     const latlngB = L.latLng(newPosition.lat, newPosition.lon);
//     const temp_distance = latlngA.distanceTo(latlngB);
    
//      if (temp_distance > 100) {
//       // Show a toast notification for large movement
//       toast({
//         title: "Large Movement",
//         description: `Skipped large movement (${temp_distance.toFixed(1)}m).`,
      
//       });
//       // return;
//     }

//     distance+=temp_distance;

//     if (temp_distance < 5) {
//       // Show a toast notification for small movement
//       toast({
//         title: "No Movement",
//         description: "Moved less than 5 meters.",
//       });
//       return;
//     }



//     // Update position and path
//     setPosition(newPosition);
//     setUserPath((prevPath) => [
//       ...prevPath,
//       { lat: newPosition.lat, lon: newPosition.lon },
//     ]);
 

//   });


// // 4. Update the map view, marker, and polyline when position or path changes
//   useEffect(() => {
//     if (mapRef.current) {     
      
//       // Remove the previous marker if it exists
//       if (markerRef.current) {
//         mapRef.current.removeLayer(markerRef.current);
//       }
//       // Add a new marker
//       markerRef.current = L.marker([position.lat, position.lon]).addTo(mapRef.current!)
//         .bindPopup(`Lat: ${position.lat}, Lon: ${position.lon}, Acc: ${position.acc}`)
//         .openPopup();
//     }
//          // Update User Path Line
//     removeUserPathLine();
//     createUserPathLine();

//       // Update the map view
//       mapRef.current?.setView([position.lat, position.lon], 18);
    
 

//   }, [position, userPath]);





//   // Function to finalize the polygon
//   function finalizePolygon() {
//     if (isClosed || userPath.length < 5) return;

//     const finalCoords = [...userPath, userPath[0]]; // Close the polygon by adding the first point at the end
//     const leafletCoords = finalCoords.map((point) => L.latLng(point.lat, point.lon));

//     const newPolygon = L.polygon(leafletCoords, {
//       color: '#007bff',
//       fillColor: '#007bff',
//       fillOpacity: 0.2,
//     }).addTo(mapRef.current!);

//     setUserPath([]); // Clear the path
//     setIsClosed(true); // Mark the polygon as closed
//     mapRef.current!.fitBounds(newPolygon.getBounds()); // Fit the map to the polygon
//     console.log("POLYGON FINALIZED!");
//   }

//   // Function to remove the ghost line
//   function removeGhostLine() {
//     if (ghostPolyline.current) {
//       ghostPolyline.current.remove();
//       ghostPolyline.current = null;
//     }
//   }

//   return (
//     <div id="map" style={{ position: 'relative', height: '100vh', width: '100%' }}>
//       {/* The map will be rendered into this div */}
//       <div
//         style={{
//           position: 'absolute',
//           top: '20px',
//           right: '20px',
//           zIndex: 1000,
//         }}
//       >
//         <button
//           onClick={finalizePolygon}
//           style={{
//             backgroundColor: isClosed || userPath.length >= 5 ? 'green' : 'red',
//             color: 'white',
//             border: 'none',
//             borderRadius: '5px',
//             padding: '10px 20px',
//             cursor: isClosed || userPath.length >= 5 ? 'pointer' : 'not-allowed',
//           }}
//           disabled={!isClosed && userPath.length < 5}
//         >
//           Finalize Polygon
//         </button>
//       </div>
//       <div style={{
//         position:'absolute',
//         top:'30px',
//         right:'20px',
//         color:'red'
//       }} >
//         <h1 style={{
          
//         }}>Distance {distance}</h1>
//       </div>
//     </div>
//   );
// }

// export default MapView;