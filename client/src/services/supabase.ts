// Note: This file provides the structure for Supabase integration
// but uses the existing Express backend instead of direct Supabase client

import { apiRequest } from "@/lib/queryClient";
import type { User, InsertUser } from "@shared/schema";

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export class SupabaseService {
  async signInWithEmail(email: string, username: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        username,
        isAnonymous: false,
      });
      const data = await response.json();
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  async signInAnonymously(username: string): Promise<AuthResponse> {
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username,
        isAnonymous: true,
      });
      const data = await response.json();
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Anonymous authentication failed' 
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // Check localStorage for current user session
    const savedUser = localStorage.getItem('territoryWalkerUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('territoryWalkerUser');
      }
    }
    return null;
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('territoryWalkerUser');
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('territoryWalkerUser');
  }

  // Helper method to get stored user
  getStoredUser(): User | null {
    const savedUser = localStorage.getItem('territoryWalkerUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('territoryWalkerUser');
      }
    }
    return null;
  }
}

export const supabase = new SupabaseService();


