// context/StudentAuthContext.jsx
'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const StudentAuthContext = createContext();
const BASE_URL = 'https://cbt-simulator-backend.vercel.app';

export function StudentAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/student/me`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    
    initAuth();
  }, [checkAuth]);

  const login = useCallback(async (identifier, password, loginType = 'nin') => {
    setLoading(true);
    try {
      const body = loginType === 'nin' 
        ? { nin: identifier, password }
        : { loginId: identifier, password };

      const response = await fetch(`${BASE_URL}/api/student/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        return { 
          success: true, 
          user: data.user
        };
      }
      
      return { 
        success: false, 
        message: data.message || 'Invalid credentials' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Network error. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${BASE_URL}/api/student/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    }
  }, [router]);

  const fetchWithAuth = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${BASE_URL}/api/student${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const maxRetries = 1;
    let retryCount = 0;

    const executeFetch = async () => {
      try {
        const response = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });

        if (response.status === 401 && retryCount < maxRetries) {
          retryCount++;
          
          const refreshResponse = await fetch(`${BASE_URL}/api/student/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (refreshResponse.ok) {
            const refreshed = await checkAuth();
            if (refreshed) {
              return executeFetch();
            }
          }
          
          setUser(null);
          router.push('/login');
          toast.error('Session expired. Please login again.');
          return null;
        }

        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    return executeFetch();
  }, [router, checkAuth]);

  const refreshUser = useCallback(async () => {
    return checkAuth();
  }, [checkAuth]);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  const saveOfflineData = useCallback((key, data) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  }, []);

  const getOfflineData = useCallback((key) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const { data } = JSON.parse(stored);
        return data;
      }
    } catch (error) {
      console.error('Error getting offline data:', error);
    }
    return null;
  }, []);

  return (
    <StudentAuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      refreshUser,
      fetchWithAuth,
      isAuthenticated: !!user,
      loading,
      authChecked,
      isOffline,
      saveOfflineData,
      getOfflineData
    }}>
      {children}
    </StudentAuthContext.Provider>
  );
}

export const useStudentAuth = () => {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}