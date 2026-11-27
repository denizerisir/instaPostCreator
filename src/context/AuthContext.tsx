import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage, apiRequest } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  isLoading: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = (token: string, user: string) => {
    storage.setToken(token);
    storage.setUser(user);
    setIsAuthenticated(true);
    setUsername(user);
  };

  const logout = () => {
    storage.removeToken();
    storage.removeUser();
    setIsAuthenticated(false);
    setUsername(null);
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = storage.getToken();
    const storedUser = storage.getUser();
    if (!token) {
      setIsAuthenticated(false);
      setUsername(null);
      setIsLoading(false);
      return false;
    }

    try {
      const res = await apiRequest('/auth?action=verify');
      if (res.authenticated) {
        setIsAuthenticated(true);
        setUsername(res.user?.username || storedUser || 'Sanatçı');
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      // If server is temporarily unreachable or local offline mode
      if (token && storedUser) {
        setIsAuthenticated(true);
        setUsername(storedUser);
        return true;
      }
      logout();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, isLoading, login, logout, checkAuth }}>
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
