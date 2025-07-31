import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, X } from "lucide-react";

interface LeaderboardProps {
  user: User;
  onClose: () => void;
}

export default function Leaderboard({ user, onClose }: LeaderboardProps) {
  const [scope, setScope] = useState<'district' | 'city' | 'country'>('district');
  
  const location = scope === 'district' ? user.district || 'unknown' : 
                  scope === 'city' ? user.city || 'unknown' : 
                  user.country || 'unknown';

  const { data: leaderboardData, isLoading } = useQuery<{ leaderboard: User[] }>({
    queryKey: ['/api/leaderboard', scope, location],
    enabled: !!location,
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-300 text-gray-700 rounded-full flex items-center justify-center text-sm font-medium">
            {rank}
          </div>
        );
    }
  };

  const getRankBg = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) {
      return "bg-blue-600/10 border-2 border-blue-600/20";
    }
    
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 border border-yellow-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-25 border border-amber-200";
      default:
        return "hover:bg-gray-50";
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0 bg-white rounded-2xl">
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Leaderboard
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </Button>
        </DialogHeader>

        <div className="px-6 pt-4">
          <Tabs value={scope} onValueChange={(value) => setScope(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
              <TabsTrigger 
                value="district" 
                className="py-2 px-3 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                District
              </TabsTrigger>
              <TabsTrigger 
                value="city"
                className="py-2 px-3 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                City
              </TabsTrigger>
              <TabsTrigger 
                value="country"
                className="py-2 px-3 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Country
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-6 pt-4 overflow-y-auto custom-scrollbar max-h-96">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : !leaderboardData?.leaderboard?.length ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No players found in this area</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to claim territory!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboardData.leaderboard.map((player: User, index: number) => {
                const rank = index + 1;
                const isCurrentUser = player.id === user.id;
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${getRankBg(rank, isCurrentUser)}`}
                  >
                    <div className="flex-shrink-0">
                      {getRankIcon(rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${isCurrentUser ? 'text-blue-600' : 'text-gray-900'} truncate`}>
                        {player.username}
                        {isCurrentUser && <span className="text-sm ml-1">(You)</span>}
                      </p>
                      <p className={`text-sm ${isCurrentUser ? 'text-blue-500' : 'text-gray-600'}`}>
                        {player.district || player.city || 'Unknown Area'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold ${isCurrentUser ? 'text-blue-600' : rank <= 3 ? 'text-yellow-600' : 'text-gray-700'}`}>
                        {Math.round(player.totalArea || 0).toLocaleString()} m²
                      </p>
                      <p className={`text-xs ${isCurrentUser ? 'text-blue-500' : 'text-gray-500'}`}>
                        {player.totalClaims || 0} claims
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
