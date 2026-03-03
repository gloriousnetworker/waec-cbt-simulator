'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SplashScreen from '@/components/SplashScreen'
import { useStudentAuth } from '../context/StudentAuthContext'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, authChecked } = useStudentAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (authChecked) {
        if (isAuthenticated) {
          router.push('/dashboard')
        } else {
          router.push('/login')
        }
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [router, isAuthenticated, authChecked])

  return <SplashScreen />
}