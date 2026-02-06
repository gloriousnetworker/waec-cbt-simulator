'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/SplashScreen';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, authChecked } = useAuth();

  useEffect(() => {
    // Check PWA service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          console.log('✅ Service Worker registered:', reg.scope);
        } else {
          console.log('⚠️ Service Worker not registered');
          // Try to register manually if not registered
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('✅ Service Worker registered manually');
            })
            .catch(err => {
              console.log('❌ Service Worker registration failed:', err);
            });
        }
      });
    }

    const timer = setTimeout(() => {
      if (authChecked) {
        if (isAuthenticated) {
          router.push('/dashboard');
        } else {
          router.push('/login');
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, isAuthenticated, authChecked]);

  return <SplashScreen />;
}