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
  const { position, accuracy, isTracking, error } = useLocationTracker();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "GPS Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

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
            <div className={`w-3 h-3 ${isTracking ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isTracking ? 'animate-pulse' : ''}`}></div>
            <p className="text-sm font-medium text-gray-700">
              {isTracking ? 'Live Tracking' : 'GPS Inactive'}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Radius:</span>
              <span className="font-medium">100m</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GPS Accuracy:</span>
              <span className={`font-medium ${accuracy && accuracy <= 10 ? 'text-green-500' : 'text-yellow-500'}`}>
                {accuracy ? `±${Math.round(accuracy)}m` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Claims:</span>
              <span className="font-medium">{user.totalClaims || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Area Stats Panel */}
      <div className="absolute bottom-20 left-4 right-4 z-20">
        <AreaStats 
          user={user} 
          isExpanded={showStats} 
          onToggle={() => setShowStats(!showStats)} 
        />
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleClaimArea}
              disabled={!isTracking || !position}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Claim Area</span>
              </div>
            </Button>

            <Button
              onClick={() => setShowLeaderboard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200"
            >
              <Users className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100/50">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${isTracking ? 'bg-green-500' : 'bg-red-500'} rounded-full ${isTracking ? 'animate-pulse' : ''}`}></div>
                <span className="text-gray-600">
                  {isTracking ? 'GPS Active' : 'GPS Inactive'}
                </span>
              </div>
              <span className="text-gray-500">
                {position ? 'Live position' : 'Waiting for GPS...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard 
          user={user} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}
    </div>
  );
}
