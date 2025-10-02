import { useState } from "react";
import MapView from "@/components/MapView";
import type { User } from "@shared/schema";
import useLocationTracker from "@/hooks/useLocationTracker";

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const [position, setPosition] = useState({ lat: 0, lon: 0, acc: 0 });

  useLocationTracker((newPosition) => {
    setPosition(newPosition);
    console.log(newPosition.lat, newPosition.lon, newPosition.acc);
  });

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map View */}
      <MapView />
    </div>
  );
}
