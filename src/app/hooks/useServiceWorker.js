'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState('loading')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!('serviceWorker' in navigator)) {
      setSwStatus('unsupported')
      return
    }

    const registerSW = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }

        const registration = await navigator.serviceWorker.register('/sw.js')
        setSwStatus('registered')

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })

        if (registration.waiting) {
          setUpdateAvailable(true)
        }
      } catch (error) {
        console.error('SW registration failed:', error)
        setSwStatus('failed')
      }
    }

    if (document.readyState === 'complete') {
      registerSW()
    } else {
      window.addEventListener('load', registerSW)
    }
  }, [])

  const skipWaiting = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          setUpdateAvailable(false)
          window.location.reload()
        }
      })
    }
  }

  return { swStatus, updateAvailable, skipWaiting }
}