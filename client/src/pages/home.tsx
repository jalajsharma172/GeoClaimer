import { useState, useEffect } from "react";
import type { User } from "@shared/schema";
import MapView from "@/components/MapView";
import AreaStats from "@/components/AreaStats";
import Leaderboard from "@/components/Leaderboard";
import { useLocationTracker } from "@/hooks/useLocationTracker";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Users, BarChart3 } from "lucide-react";

interface HomeProps {
  user: User;
  onLogout: () => void;
}

export default function Home({ user, onLogout }: HomeProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { position, accuracy, isTracking, error, locationHistory, isCircleComplete, circleCenter, clearHistory, refreshLocation } = useLocationTracker();
  const { toast } = useToast();

  // Debug location tracking
  useEffect(() => {
    console.log('Location tracking status:', {
      position: position ? {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      } : null,
      isTracking,
      error,
      locationHistoryLength: locationHistory.length
    });
  }, [position, isTracking, error, locationHistory.length]);

  useEffect(() => {
    if (error) {
      toast({
        title: "GPS Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (isCircleComplete && circleCenter) {
      toast({
        title: "Circle Completed! 🎉",
        description: "You've successfully completed a 10m circle! Your achievement has been saved.",
        variant: "default",
      });
    }
  }, [isCircleComplete, circleCenter, toast]);

  const handleClaimArea = async () => {
    if (!position || !isTracking) {
      toast({
        title: "GPS Required",
        description: "Please enable GPS tracking to claim areas",
        variant: "destructive",
      });
      return;
    }

    // This will be handled by the MapView component
    toast({
      title: "Attempting Claim",
      description: "Checking for overlaps...",
    });
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map View */}
      <MapView 
        user={user} 
        position={position} 
        isTracking={isTracking}
        locationHistory={locationHistory}
        isCircleComplete={isCircleComplete}
        circleCenter={circleCenter}
        onClaimSuccess={(area) => {
          toast({
            title: "Area Claimed!",
            description: `+${Math.round(area)} m² added to your territory`,
            variant: "default",
          });
        }}
        onClaimError={(message) => {
          toast({
            title: "Claim Failed",
            description: message,
            variant: "destructive",
          });
        }}
        onCircleComplete={(center) => {
          // This will be handled by the useEffect above
        }}
      />

      {/* Top Stats Panel */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Welcome back</p>
                <p className="text-lg font-bold text-gray-900">{user.username}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Area Claimed</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(user.totalArea || 0).toLocaleString()} m²
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats Card */}
      <div className="absolute top-24 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-white/20 min-w-[200px]">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isTracking ? 'GPS Active' : 'GPS Inactive'}
            </span>
          </div>
          {accuracy && (
            <p className="text-xs text-gray-600">Accuracy: ±{Math.round(accuracy)}m</p>
          )}
          {locationHistory.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-600">Tracked Points: {locationHistory.length}</p>
              {isCircleComplete && (
                <p className="text-xs text-green-600 font-medium">✓ Circle Completed!</p>
              )}
            </div>
          )}
          {locationHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="mt-2 w-full text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Clear History
            </button>
          )}
          <button
            onClick={refreshLocation}
            className="mt-2 w-full text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh GPS
          </button>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowStats(true)}
            className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 hover:bg-white/95 transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">Statistics</span>
            </div>
          </button>
          
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex-1 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-white/20 hover:bg-white/95 transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span className="font-medium text-gray-900">Leaderboard</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showStats && (
        <AreaStats user={user} onClose={() => setShowStats(false)} />
      )}
      
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
