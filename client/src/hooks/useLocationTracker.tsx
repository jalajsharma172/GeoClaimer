import React, { useEffect } from 'react';


function useLocationTracker(onPositionUpdate: (position: { lat: number; lon: number; acc: number }) => void) {
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition((position) => {
        if (!position) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const acc = position.coords.accuracy;
        onPositionUpdate({ lat, lon, acc });
      });
    }, 3000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [onPositionUpdate]);
}

export default useLocationTracker;