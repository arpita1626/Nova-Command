import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, DEMO_USERS } from '../types/auth';
import { getGlobalStoreState, switchGlobalUser } from './manufacturingStore';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AppUser | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'nova_command_auth_session';
const AUTH_USER_STORAGE_KEY = 'nova_command_auth_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      return stored === 'true';
    }
    return false;
  });

  const [user, setUser] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
      if (storedUserId) {
        const found = DEMO_USERS.find((u) => u.id === storedUserId || u.email.toLowerCase() === storedUserId.toLowerCase());
        return found || DEMO_USERS[0];
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Simulate brief secure authentication handshake
    await new Promise((resolve) => setTimeout(resolve, 350));

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // 1. Validation: Identifier is required
    if (!cleanId) {
      setIsLoading(false);
      return { success: false, error: 'User ID or Email is required.' };
    }

    // 2. Validation: Password is required
    if (!cleanPass) {
      setIsLoading(false);
      return { success: false, error: 'Password is required to access the operations command center.' };
    }

    // 3. Password minimum security check
    if (cleanPass.length < 3) {
      setIsLoading(false);
      return { success: false, error: 'Invalid password. Password must be at least 3 characters.' };
    }

    // 4. Look up user by email, id, or role shorthand
    const lowerId = cleanId.toLowerCase();
    let matchedUser = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === lowerId ||
        u.id.toLowerCase() === lowerId ||
        (lowerId === 'admin' && u.role === 'ADMIN') ||
        (lowerId === 'manager' && u.role === 'MANAGER') ||
        (lowerId === 'planner' && u.role === 'PRODUCTION_PLANNER') ||
        (lowerId === 'inspector' && u.role === 'QUALITY_INSPECTOR') ||
        (lowerId === 'quality' && u.role === 'QUALITY_INSPECTOR') ||
        (lowerId === 'hr' && u.role === 'HR')
    );

    // Also check current store users in case user was added by admin
    if (!matchedUser) {
      const storeState = getGlobalStoreState();
      matchedUser = storeState.users.find(
        (u: AppUser) =>
          u.email.toLowerCase() === lowerId ||
          u.id.toLowerCase() === lowerId ||
          (lowerId === 'planner' && u.role === 'PRODUCTION_PLANNER') ||
          (lowerId === 'inspector' && u.role === 'QUALITY_INSPECTOR')
      );
    }

    // If identifier doesn't match an email or recognized user pattern
    if (!matchedUser) {
      // If it looks like an email or alphanumeric ID, allow enterprise login or reject
      const isEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
      const isUserIdFormat = /^[a-zA-Z0-9_-]{3,}$/.test(cleanId);

      if (!isEmailFormat && !isUserIdFormat) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Invalid credentials. User ID or corporate email not recognized.',
        };
      }

      // Check if password matches demo criteria or length
      if (cleanPass.length < 4) {
        setIsLoading(false);
        return {
          success: false,
          error: 'Invalid password. Please check your credentials and try again.',
        };
      }

      // Default fallback user for valid custom login
      matchedUser = {
        id: `user-${cleanId.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@novacommand.io`,
        role: 'MANAGER',
        title: 'Operations Supervisor',
        initials: (cleanId.substring(0, 2)).toUpperCase(),
        department: 'Plant Operations',
        avatarBg: 'bg-blue-600 text-white',
        description: 'Operational control across production lines and telemetry.',
      };
    }

    // Successful authentication
    setIsAuthenticated(true);
    setUser(matchedUser);

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, matchedUser.id);
    }

    // Sync active user in manufacturing store
    switchGlobalUser(matchedUser.id);

    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
