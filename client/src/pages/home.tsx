import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import MapView from "@/components/MapView";
import type { User } from "@shared/schema";
import useLocationTracker from "@/hooks/useLocationTracker";

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate(); // Add this line

  // Example wallet connect handler
  const handleWalletConnect = () => {
    alert("Wallet connect coming soon!");
  };

  // Example leaderboard navigation
  const handleLeaderboard = () => {
    window.location.href = "/leaderboard";
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-blue-100 to-green-100 overflow-auto">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
        <div className="text-2xl font-bold text-blue-700">Territory Walker</div>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => navigate("/map")}  
          >
            Open Map
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            onClick={handleLeaderboard}
          >
            See Leaderboard
          </button>
          <button
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            onClick={handleWalletConnect}
          >
            Connect Wallet
          </button>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Info Section */}
      <section className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          Welcome to Territory Walker!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Territory Walker is a geospatial tracking app where you can log your
          walks, claim areas, and compete for achievements. Track your paths,
          visualize your territory, and see how you rank on the leaderboard!
        </p>
        <ul className="list-disc ml-6 text-gray-600 mb-4">
          <li>Real-time GPS tracking and path recording</li>
          <li>Claim 10-meter radius areas as you walk</li>
          <li>Visualize your travel history and achievements</li>
          <li>Compete with others on the leaderboard</li>
          <li>Connect your wallet for future rewards</li>
        </ul>
        <div className="mt-6 text-gray-500 text-sm">
          <strong>Tip:</strong> Click "Open Map" to start tracking your territory!
        </div>
      </section>

      {/* MapView Section */}
      {showMap && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="relative w-[90vw] h-[80vh] bg-white rounded-lg shadow-2xl overflow-hidden">
            <button
              className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => setShowMap(false)}
            >
              Close Map
            </button>
            <MapView />
          </div>
        </div>
      )}
    </div>
  );
}
