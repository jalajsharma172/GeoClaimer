import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";
import MapView from "@/components/MapView";
import Leaderboard from "./components/Leaderboard";
import Dashboard from "./components/Dashboard";

// UserNFT interface
interface UserNFTData {
  id: string;
  username: string;
  hashjson: string;
  minted: number; // 0 = false (not minted), 1 = true (minted)
  createdAt: string;
}

// UserNFT API functions
const userNFTAPI = {
  // Get user NFTs by username
  async getUserNFTsByUsername(username: string): Promise<UserNFTData[]> {
    try {
      console.log("Fetching NFT data for username:", username);
      const response = await fetch(`/api/user-nfts/username/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(`Failed to fetch user NFT data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response data:", data);
      return data.userNFTs || [];
    } catch (error) {
      console.error("Error fetching user NFT data:", error);
      throw error;
    }
  },

  // Create new user NFT
  async createUserNFT(username: string, hashjson: string): Promise<UserNFTData> {
    try {
      console.log("Creating NFT data for username:", username, "with hash:", hashjson);
      const response = await fetch('/api/user-nfts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, hashjson })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(`Failed to create user NFT: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Created NFT:", data);
      return data.userNFT;
    } catch (error) {
      console.error("Error creating user NFT:", error);
      throw error;
    }
  },

  // Update NFT minted status
  async updateUserNFTMintedStatus(nftId: string, minted: boolean): Promise<UserNFTData> {
    try {
      console.log("Updating NFT minted status:", nftId, "to:", minted);
      const response = await fetch(`/api/user-nfts/${nftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minted: minted ? 1 : 0 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error response:", errorText);
        throw new Error(`Failed to update NFT minted status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Updated NFT:", data);
      return data.userNFT;
    } catch (error) {
      console.error("Error updating NFT minted status:", error);
      throw error;
    }
  }
};

// Export userNFTAPI for use in components
export { userNFTAPI };

function Router() {
  const [user, setUser] = useState<User | null>(null);// User Name
  const [isLoading, setIsLoading] = useState(true);   // IsLoading Status
// Check for existing user Name 
  useEffect(() => {
    
    const savedUser = localStorage.getItem('territoryWalkerUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('territoryWalkerUser');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('territoryWalkerUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('territoryWalkerUser');
  };

  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading Territory Walker...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/map">
        <MapView />
      </Route>
      <Route path="/leaderboard">
        <Leaderboard />
      </Route>
      <Route path="/dashboard">
        <Dashboard/>
      </Route>
      


      <Route path="/">
        {user ? (
          <Home user={user} onLogout={handleLogout} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster  />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
