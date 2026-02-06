'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const DEMO_USERS = [
  {
    id: 'student001',
    email: 'student001@megatechsolutions.org',
    name: 'John Doe',
    studentId: 'STU001',
    school: 'MegaTech Solutions Academy',
    avatar: '/images/avatar1.png',
    subjects: ['Mathematics', 'English', 'Physics', 'Chemistry']
  },
  {
    id: 'student002',
    email: 'student001@yourschool.org',
    name: 'Jane Smith',
    studentId: 'STU002',
    school: 'Your School International',
    avatar: '/images/avatar2.png',
    subjects: ['Biology', 'Economics', 'Geography', 'Government']
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('waec_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        localStorage.removeItem('waec_user');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (identifier, password) => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check demo credentials
      const user = DEMO_USERS.find(u => 
        u.email.toLowerCase() === identifier.toLowerCase() && 
        password === '123456'
      );

      if (user) {
        setUser(user);
        localStorage.setItem('waec_user', JSON.stringify(user));
        toast.success(`Welcome back, ${user.name}!`);
        return { success: true, data: user };
      } else {
        toast.error('Invalid credentials. Use demo accounts.');
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('waec_user');
    toast.success('Logged out successfully');
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('waec_user', JSON.stringify(newUser));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      loading,
      authChecked
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};