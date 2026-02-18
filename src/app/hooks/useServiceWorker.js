'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState('loading')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      setSwStatus('unsupported')
      return
    }

    if (process.env.NODE_ENV === 'production') {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          setSwStatus('registered')

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              setSwStatus('updating')
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true)
                  setSwStatus('updated')
                }
              })
            }
          })

          if (registration.waiting) {
            setUpdateAvailable(true)
          }

          setInterval(() => {
            registration.update()
          }, 60 * 60 * 1000)

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

      return () => {
        window.removeEventListener('load', registerSW)
      }
    } else {
      setSwStatus('disabled')
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