import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserId = localStorage.getItem('userId');
        if (savedUserId) {
          const { data } = await api.get('/users/me');
          setUser(data);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('userId');
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('userId', userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
