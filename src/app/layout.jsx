// src/app/layout.jsx
'use client'

import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { StudentAuthProvider } from '../context/StudentAuthContext'
import { useEffect } from 'react'
import PWAInstallBanner from '../components/PWAInstallBanner'

const toastOptions = {
  style: {
    background: '#FFFFFF',
    color: '#0D1117',
    fontSize: '14px',
    padding: '14px 18px',
    borderRadius: '10px',
    fontWeight: '500',
    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    border: '1px solid #E8ECEF',
    maxWidth: '380px',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  success: {
    style: {
      background: '#F0FDF4',
      color: '#166534',
      borderLeft: '4px solid #10B981',
      border: '1px solid #BBF7D0',
    },
    iconTheme: {
      primary: '#10B981',
      secondary: '#F0FDF4',
    },
  },
  error: {
    style: {
      background: '#FEF2F2',
      color: '#991B1B',
      borderLeft: '4px solid #EF4444',
      border: '1px solid #FECACA',
    },
    iconTheme: {
      primary: '#EF4444',
      secondary: '#FEF2F2',
    },
  },
  loading: {
    style: {
      background: '#EFF6FF',
      color: '#1E40AF',
      borderLeft: '4px solid #1565C0',
      border: '1px solid #BFDBFE',
    },
    iconTheme: {
      primary: '#1565C0',
      secondary: '#EFF6FF',
    },
  },
  duration: 3500,
}

export default function RootLayout({ children }) {
  useEffect(() => {
    // Store the deferred prompt on window so PWAInstallBanner can pick it up
    // even if the event fires before the component mounts
    const handleInstallPrompt = (e) => {
      e.preventDefault()
      window._deferredPWAPrompt = e
    }
    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />

        {/* Viewport — viewport-fit=cover critical for iOS notch support */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* === PWA Core === */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1565C0" />
        <meta name="application-name" content="Einstein's CBT App" />
        <meta
          name="description"
          content="Einstein's CBT App — WAEC Exam Practice powered by Mega Tech Solutions. Practice past questions offline on any device."
        />

        {/* === iOS PWA (Safari Home Screen) === */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Einstein CBT" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />

        {/* iOS Splash Screens (portrait) */}
        <link
          rel="apple-touch-startup-image"
          media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
          href="/icons/icon-512x512.png"
        />

        {/* === Android / Chrome === */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1565C0" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* === Favicon === */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />

        {/* === Misc === */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="color-scheme" content="light" />

        {/* === Open Graph (for sharing) === */}
        <meta property="og:title" content="Einstein's CBT App" />
        <meta property="og:description" content="WAEC Exam Practice — Powered by Mega Tech Solutions" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/icons/icon-512x512.png" />

        <title>Einstein&apos;s CBT App — Powered by Mega Tech Solutions</title>

        {/* Service Worker Registration */}
        <script src="/sw-register.js" defer />
      </head>

      <body className="bg-surface-muted min-h-screen font-inter antialiased">
        {/* Global logo watermark — floats over all pages & components */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundImage: "url('/logo.png')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: '45vmin',
            backgroundPosition: 'center',
            opacity: 0.04,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
        <StudentAuthProvider>
          <Toaster
            position="top-center"
            toastOptions={toastOptions}
            containerStyle={{ top: 20 }}
          />
          {children}
          <PWAInstallBanner />
        </StudentAuthProvider>
      </body>
    </html>
  )
}
