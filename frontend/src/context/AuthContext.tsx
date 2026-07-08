import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User } from '../mock/mockData';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  isDean: boolean;
  isDeptHead: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('taydo_token');
    const storedUser = localStorage.getItem('taydo_user');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password = ''): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: username.trim(),
        password: password
      });

      const { token } = response.data;
      if (!token) {
        return false;
      }

      localStorage.setItem('taydo_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const meResponse = await axios.get(`${API_BASE_URL}/api/auth/me`);
      const backendUser = meResponse.data;

      const loggedUser: User = {
        id: backendUser.userId,
        username: backendUser.username,
        fullName: backendUser.fullName,
        email: `${backendUser.username}@taydo.edu.vn`,
        role: backendUser.role,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${backendUser.username}`
      };

      setUser(loggedUser);
      localStorage.setItem('taydo_user', JSON.stringify(loggedUser));
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taydo_user');
    localStorage.removeItem('taydo_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const role = user?.role ?? 0;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin: role === 99,
        isDean: role === 50,
        isDeptHead: role === 20,
        isTeacher: role === 10 || role === 2,
        isStudent: role === 1,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
