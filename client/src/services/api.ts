import { apiRequest } from "@/lib/queryClient";
import type { User, Claim, InsertClaim } from "@shared/schema";

export interface ClaimResponse {
  claim: Claim;
}

export interface ClaimsResponse {
  claims: Claim[];
}

export interface LeaderboardResponse {
  leaderboard: User[];
}

export interface RankResponse {
  rank: number;
}

export class ApiService {
  // Claim operations
  async saveClaim(claimData: InsertClaim): Promise<ClaimResponse> {
    const response = await apiRequest('POST', '/api/claims', claimData);
    return response.json();
  }

  async getClaims(): Promise<ClaimsResponse> {
    const response = await apiRequest('GET', '/api/claims');
    return response.json();
  }

  async getUserClaims(userId: string): Promise<ClaimsResponse> {
    const response = await apiRequest('GET', `/api/claims/user/${userId}`);
    return response.json();
  }

  // Leaderboard operations
  async getLeaderboard(scope: 'district' | 'city' | 'country', location: string): Promise<LeaderboardResponse> {
    const encodedLocation = encodeURIComponent(location);
    const response = await apiRequest('GET', `/api/leaderboard/${scope}/${encodedLocation}`);
    return response.json();
  }

  async getUserRank(userId: string, scope: 'district' | 'city' | 'country', location: string): Promise<RankResponse> {
    const encodedLocation = encodeURIComponent(location);
    const response = await apiRequest('GET', `/api/leaderboard/${scope}/${encodedLocation}/rank/${userId}`);
    return response.json();
  }

  // User operations
  async getUser(userId: string): Promise<{ user: User }> {
    const response = await apiRequest('GET', `/api/users/${userId}`);
    return response.json();
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<{ user: User }> {
    const response = await apiRequest('PUT', `/api/users/${userId}`, updates);
    return response.json();
  }

  // Authentication
  async login(email: string | undefined, username: string, isAnonymous: boolean): Promise<{ user: User }> {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      username,
      isAnonymous,
    });
    return response.json();
  }
}

export const api = new ApiService();

// Export individual functions for convenience
export const saveClaim = (claimData: InsertClaim) => api.saveClaim(claimData);
export const getClaims = () => api.getClaims();
export const getUserClaims = (userId: string) => api.getUserClaims(userId);
export const getLeaderboard = (scope: 'district' | 'city' | 'country', location: string) => 
  api.getLeaderboard(scope, location);
export const getUserRank = (userId: string, scope: 'district' | 'city' | 'country', location: string) => 
  api.getUserRank(userId, scope, location);

export async function getCompletedCircles() {
  return apiRequest('GET', '/api/completed-circles');
}

export async function getUserPathsByUsername(username: string) {
  return apiRequest('GET', `/api/user-paths/username/${encodeURIComponent(username)}`);
}

export async function getUserPaths(userId: string) {
  return apiRequest('GET', `/api/user-paths/user/${userId}`);
}

export async function getCompletedCirclesByUser(userId: string) {
  return apiRequest('GET', `/api/completed-circles/user/${userId}`);
}

export async function createCompletedCircle(completedCircleData: any) {
  return apiRequest('POST', '/api/completed-circles', completedCircleData);
}
