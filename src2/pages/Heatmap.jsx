import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
function Heatmap() {
  const mapRef = useRef(null);
  const [data, setData] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const searchLatRef = useRef(null);
  const searchLngRef = useRef(null);
  const searchMarkerRef = useRef(null);

  useEffect(() => {
    // Initialize the map directly since Leaflet is now properly imported
    initialize();

    return () => {
      // cleanup leaflet elements if any
      if (mapRef.current && mapRef.current.remove) {
        mapRef.current.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchData() {
    try {
      const res = await fetch('http://82.177.167.151:5001/heatmap/data');
      const json = await res.json();
      setData(json.data || []);
      setSubmittedCount(json.submitted || 0);
      return json.data || [];
    } catch (err) {
      console.error('Failed to fetch heatmap data', err);
      return [];
    }
  }

  async function initialize() {
    const heatmapData = await fetchData();

    // Create map
    mapRef.current = L.map('map').setView([20, 0], 2);

    // Add dark tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19
    }).addTo(mapRef.current);

    // Add markers
    addMarkers(heatmapData);
  }

  function addMarkers(points) {
    if (!mapRef.current) return;

    points.forEach(point => {
      const color = point.value > 100 ? 'red' :
                    point.value > 85 ? 'orange' :
                    point.value > 70 ? 'yellow' :
                    point.value > 50 ? 'green' : 'blue';

      const isSubmitted = point.is_submitted || false;
      // use a light stroke for contrast on dark backgrounds
      const markerOptions = {
        radius: isSubmitted ? 9 : 6,
        fillColor: color,
        color: '#ffffff',
        weight: isSubmitted ? 2.5 : 1.25,
        opacity: 1,
        fillOpacity: isSubmitted ? 0.95 : 0.9
      };

      const marker = L.circleMarker([point.lat, point.lng], markerOptions).addTo(mapRef.current);
      marker.bindPopup(`${point.value.toFixed(1)} dB<br/>Event: ${point.event}<br/>Device: ${point.device_id}<br/>Lat: ${point.lat}<br/>Lng: ${point.lng}<br/>Type: ${isSubmitted ? 'Submitted' : 'Generated'}<br/>Time: ${new Date(point.timestamp).toLocaleString()}`);
    });
  }

  function showError(msg) {
    const el = document.getElementById('searchError');
    if (el) el.textContent = msg;
  }

  function clearError() {
    showError('');
  }

  function searchLocation() {
    clearError();
    const lat = parseFloat(searchLatRef.current.value);
    const lng = parseFloat(searchLngRef.current.value);

    if (isNaN(lat) || isNaN(lng)) {
      showError('Please enter valid latitude and longitude values');
      return;
    }
    if (lat < -90 || lat > 90) { showError('Latitude must be between -90 and 90'); return; }
    if (lng < -180 || lng > 180) { showError('Longitude must be between -180 and 180'); return; }

    mapRef.current.setView([lat, lng], 10);
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    searchMarkerRef.current = L.marker([lat, lng]).addTo(mapRef.current).bindPopup(`<b>Search Location</b><br/>Lat: ${lat}<br/>Lng: ${lng}`).openPopup();
  }

  function findNearestDevice() {
    clearError();
    const lat = parseFloat(searchLatRef.current.value);
    const lng = parseFloat(searchLngRef.current.value);
    if (isNaN(lat) || isNaN(lng)) { showError('Please enter valid coordinates to find nearest device'); return; }

    let nearest = null;
    let minDistance = Infinity;
    data.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.lat - lat, 2) + Math.pow(point.lng - lng, 2));
      if (distance < minDistance) { minDistance = distance; nearest = point; }
    });

    if (nearest) {
      mapRef.current.setView([nearest.lat, nearest.lng], 12);
      L.popup()
        .setLatLng([nearest.lat, nearest.lng])
        .setContent(`<b>Nearest Device</b><br/>Device: ${nearest.device_id}<br/>Noise: ${nearest.value.toFixed(1)} dB<br/>Distance: ${(minDistance * 111).toFixed(2)} km`)
        .openOn(mapRef.current);
    } else {
      showError('No devices found');
    }
  }

  async function refreshData() {
    // remove existing map markers and reload
    if (mapRef.current && mapRef.current.eachLayer) {
      mapRef.current.eachLayer(layer => {
        // keep tile layer but remove markers/circleMarkers
        if (layer && layer._latlng) {
          try { mapRef.current.removeLayer(layer); } catch (e) {}
        }
      });
    }
    const newData = await fetchData();
    addMarkers(newData);
  }

  return (
    <div style={{ 
      padding: 20, 
      backgroundColor: '#0a0a0a', 
      minHeight: '100vh',
      color: '#e6eef8'
    }}>
      <h1 style={{ 
        color: '#fff', 
        marginBottom: 20,
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: '600'
      }}>Device Noise Level Heatmap</h1>

      <div style={{ 
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        border: '1px solid #333',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }} className="search-container">
        <strong style={{ color: '#e6eef8', marginRight: 10 }}>Search Location:</strong>
        <input 
          ref={searchLatRef} 
          type="number" 
          placeholder="Latitude" 
          step="any" 
          min="-90" 
          max="90" 
          style={{ 
            width: 200, 
            padding: 8, 
            margin: '0 5px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: 4,
            color: '#fff',
            fontSize: '14px'
          }} 
        />
        <input 
          ref={searchLngRef} 
          type="number" 
          placeholder="Longitude" 
          step="any" 
          min="-180" 
          max="180" 
          style={{ 
            width: 200, 
            padding: 8, 
            margin: '0 5px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #444',
            borderRadius: 4,
            color: '#fff',
            fontSize: '14px'
          }} 
        />
        <button 
          onClick={searchLocation} 
          style={{ 
            padding: '8px 15px', 
            marginRight: 8,
            backgroundColor: '#4c7ae0',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a8bef'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4c7ae0'}
        >Go to Location</button>
        <button 
          onClick={findNearestDevice} 
          style={{ 
            padding: '8px 15px',
            backgroundColor: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#16a34a'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#22c55e'}
        >Find Nearest Device</button>
        <span id="searchError" style={{ color: '#ef4444', fontSize: 12, marginLeft: 8 }}></span>
      </div>

      <div className="legend" style={{ 
        background: '#1a1a1a', 
        color: '#e6eef8', 
        padding: 15, 
        borderRadius: 8, 
        boxShadow: '0 6px 20px rgba(0,0,0,0.8)', 
        marginBottom: 15,
        border: '1px solid #333',
        lineHeight: 1.6
      }}>
        <div style={{ marginBottom: 10 }}>
          <strong style={{ fontSize: '16px', color: '#fff' }}>Decibel Levels:</strong>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ 
              color: '#7dd3fc', 
              background: 'rgba(125,211,252,0.15)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: '14px'
            }}>30-50 dB (Quiet)</span>
            <span style={{ 
              color: '#34d399', 
              background: 'rgba(52,211,153,0.15)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: '14px'
            }}>50-70 dB (Moderate)</span>
            <span style={{ 
              color: '#fbbf24', 
              background: 'rgba(251,191,36,0.15)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: '14px'
            }}>70-85 dB (Loud)</span>
            <span style={{ 
              color: '#fb923c', 
              background: 'rgba(251,146,60,0.15)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: '14px'
            }}>85-100 dB (Very Loud)</span>
            <span style={{ 
              color: '#f87171', 
              background: 'rgba(248,113,113,0.15)', 
              padding: '4px 8px', 
              borderRadius: 4,
              fontSize: '14px'
            }}>100+ dB (Noise Pollution)</span>
          </div>
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <strong style={{ fontSize: '16px', color: '#fff' }}>Data Sources:</strong>
          <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
            <span style={{ 
              background: 'rgba(125,211,252,0.15)', 
              color: '#7dd3fc',
              padding: '4px 10px', 
              borderRadius: 4,
              fontSize: '14px',
              border: '1px solid rgba(125,211,252,0.3)'
            }}>Generated Data</span>
            <span style={{ 
              background: 'rgba(248,113,113,0.15)', 
              color: '#f87171',
              padding: '4px 10px', 
              borderRadius: 4,
              fontSize: '14px',
              border: '1px solid rgba(248,113,113,0.3)'
            }}>Submitted Data</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <button 
            onClick={refreshData} 
            style={{ 
              padding: '8px 15px', 
              backgroundColor: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
          >🔄 Refresh Data</button>
          <span id="dataCount" style={{ 
            fontSize: '14px',
            color: '#94a3b8',
            background: 'rgba(148,163,184,0.1)',
            padding: '6px 12px',
            borderRadius: 4
          }}>
            Total: {data.length} points ({submittedCount} submitted)
          </span>
        </div>
      </div>

      <div id="map" style={{ 
        height: 600, 
        width: '100%', 
        borderRadius: 8, 
        overflow: 'hidden', 
        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
        border: '1px solid #333'
      }}></div>
      
      {/* Enhanced Dark theme styling for Leaflet and UI elements */}
      <style>{`
        /* Leaflet popup dark theme */
        .leaflet-popup-content-wrapper { 
          background: #1a1a1a; 
          color: #e6eef8; 
          border-radius: 8px; 
          box-shadow: 0 8px 32px rgba(0,0,0,0.8);
          border: 1px solid #333;
        }
        .leaflet-popup-content { 
          margin: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
        }
        .leaflet-popup-tip { 
          background: #1a1a1a;
          border: 1px solid #333;
        }
        .leaflet-popup-close-button {
          color: #94a3b8 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #fff !important;
          background: rgba(255,255,255,0.1) !important;
        }
        
        /* Leaflet control buttons dark theme */
        .leaflet-control-zoom a {
          background-color: #1a1a1a !important;
          color: #e6eef8 !important;
          border: 1px solid #333 !important;
        }
        .leaflet-control-zoom a:hover {
          background-color: #2a2a2a !important;
          color: #fff !important;
        }
        .leaflet-control-attribution {
          background-color: rgba(26,26,26,0.9) !important;
          color: #94a3b8 !important;
          border: 1px solid #333 !important;
        }
        .leaflet-control-attribution a {
          color: #7dd3fc !important;
        }
        
        /* Input focus styles for dark theme */
        input[type="number"]:focus {
          outline: none !important;
          border-color: #4c7ae0 !important;
          box-shadow: 0 0 0 2px rgba(76,122,224,0.2) !important;
        }
        
        /* Button hover effects */
        button {
          transition: all 0.2s ease-in-out !important;
        }
        
        /* Scrollbar styling for dark theme */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
}

export default Heatmap;
