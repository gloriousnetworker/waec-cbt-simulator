'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState('loading')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          setSwStatus('registered')

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            setSwStatus('updating')
            
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
                setSwStatus('updated')
              }
            })
          })

          // Periodic update checks
          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000) // Check every hour

        } catch (error) {
          console.error('SW registration failed:', error)
          setSwStatus('failed')
        }
      }

      registerSW()
    } else {
      setSwStatus('unsupported')
    }
  }, [])

  const skipWaiting = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      })
      setUpdateAvailable(false)
    }
  }

  return { swStatus, updateAvailable, skipWaiting }
}