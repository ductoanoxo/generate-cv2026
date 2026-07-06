import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User, mockUsers } from '../mock/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string) => Promise<boolean>;
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
    const storedUser = localStorage.getItem('taydo_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username: string): Promise<boolean> => {
    // In our mock frontend, we just search for the username in mockUsers
    const foundUser = mockUsers.find(u => u.username === username.trim().toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('taydo_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('taydo_user');
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
