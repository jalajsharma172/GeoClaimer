import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronUp, ChevronDown } from "lucide-react";

interface AreaStatsProps {
  user: User;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function AreaStats({ user, isExpanded, onToggle }: AreaStatsProps) {
  // Fetch user's rank in different scopes
  const { data: districtRank } = useQuery<{ rank: number }>({
    queryKey: ['/api/leaderboard/district', user.district || 'unknown', 'rank', user.id],
    enabled: !!user.district,
  });

  const { data: cityRank } = useQuery<{ rank: number }>({
    queryKey: ['/api/leaderboard/city', user.city || 'unknown', 'rank', user.id],
    enabled: !!user.city,
  });

  return (
    <Card className="bg-white/95 backdrop-blur-sm border border-white/20 overflow-hidden">
      <CardContent className="p-0">
        <Button
          onClick={onToggle}
          variant="ghost"
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50/50 rounded-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Area Statistics</p>
              <p className="text-sm text-gray-600">View your progress</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </Button>

        {isExpanded && (
          <div className="border-t border-gray-100/50 p-4 space-y-4">
            {/* Progress Bars */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">District Rank</span>
                  <span className="font-medium text-blue-600">
                    {districtRank && districtRank.rank > 0 ? `#${districtRank.rank}` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: districtRank && districtRank.rank > 0 ? `${Math.max(100 - districtRank.rank * 2, 10)}%` : '10%' 
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">City Rank</span>
                  <span className="font-medium text-green-500">
                    {cityRank && cityRank.rank > 0 ? `#${cityRank.rank}` : 'N/A'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                    style={{ 
                      width: cityRank && cityRank.rank > 0 ? `${Math.max(100 - cityRank.rank * 2, 10)}%` : '10%' 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Achievements</p>
              <div className="flex flex-wrap gap-2">
                {user.totalClaims && user.totalClaims > 0 && (
                  <div className="px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                    <span className="text-xs font-medium text-yellow-600">First Claim!</span>
                  </div>
                )}
                {user.totalArea && user.totalArea > 1000 && (
                  <div className="px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                    <span className="text-xs font-medium text-green-600">Area Explorer</span>
                  </div>
                )}
                {user.totalClaims && user.totalClaims >= 10 && (
                  <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <span className="text-xs font-medium text-blue-600">Territory Master</span>
                  </div>
                )}
                {(!user.totalClaims || user.totalClaims === 0) && (
                  <div className="px-3 py-1 bg-gray-100 rounded-full border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">Start exploring!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(user.totalArea || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Square Meters</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {user.totalClaims || 0}
                </p>
                <p className="text-xs text-gray-500">Areas Claimed</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
