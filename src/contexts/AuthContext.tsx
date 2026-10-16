import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'customer' | 'customer_kandy' | 'restaurant_owner' | 'rider' | 'admin') => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodora_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('foodora_token');
    if (!storedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('foodora_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    localStorage.setItem('foodora_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: { name: string; email: string; phone: string; password: string }) => {
    const data = await api.auth.register(payload);
    localStorage.setItem('foodora_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    api.auth.logout();
    localStorage.removeItem('foodora_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: 'customer' | 'customer_kandy' | 'restaurant_owner' | 'rider' | 'admin') => {
    setIsLoading(true);
    try {
      const data = await api.auth.demoSwitch(role);
      localStorage.setItem('foodora_token', data.token);
      setToken(data.token);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser();
    }
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoRole,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
