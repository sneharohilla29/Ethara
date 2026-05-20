import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  const saveToken = useCallback((newToken) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem('taskflow_token', newToken);
    } else {
      localStorage.removeItem('taskflow_token');
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    saveToken(null);
  }, [saveToken]);

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user || res.data);
      } catch {
        saveToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    validateToken();
  }, [token, saveToken]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const data = res.data;
    saveToken(data.token);
    setUser(data.user || data);
    return data;
  };

  const signup = async (name, email, password) => {
    const res = await authAPI.signup(name, email, password);
    const data = res.data;
    saveToken(data.token);
    setUser(data.user || data);
    return data;
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
