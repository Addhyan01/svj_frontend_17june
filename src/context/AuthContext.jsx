import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // On mount: restore session from stored token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.data);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  /**
   * Login with email + password.
   * Backend: POST /api/v1/auth/login
   * Response: { success, token, user: { id, name, role, status, membershipId } }
   */
  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      const { token, user: userData } = data;

      localStorage.setItem('token', token);
      setUser(userData);

      if (userData.role === 'SUPER_ADMIN' || userData.role === 'ADMIN' || userData.role === 'ASSOCIATE' || userData.role === 'MEMBER' || userData.role === 'DONOR') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }

      return { success: true };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Check your credentials.';
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
