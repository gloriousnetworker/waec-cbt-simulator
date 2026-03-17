// src/components/PWAInstallBanner.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Download, Share } from 'lucide-react';

const DISMISS_KEY = 'pwa_install_dismissed_until';
const DISMISS_DAYS = 7;

function isRunningAsPWA() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true
  );
}

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isDismissed() {
  if (typeof window === 'undefined') return false;
  const until = localStorage.getItem(DISMISS_KEY);
  if (!until) return false;
  return Date.now() < parseInt(until, 10);
}

function dismiss() {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

export default function PWAInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [ios, setIos] = useState(false);
  const [showIOSSteps, setShowIOSSteps] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Never show if already running as an installed PWA
    if (isRunningAsPWA()) return;
    // Never show if user dismissed recently
    if (isDismissed()) return;

    const onIOS = isIOS();
    setIos(onIOS);

    if (onIOS) {
      // iOS: show after a short delay so it doesn't feel jarring on first load
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Chrome / Edge / desktop: wait for the browser's prompt event
    const handlePrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    // If the event already fired before this component mounted (rare but possible), check
    // window._deferredPWAPrompt which layout.jsx stores for us
    if (window._deferredPWAPrompt) {
      setDeferredPrompt(window._deferredPWAPrompt);
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (ios) {
      setShowIOSSteps(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setVisible(false);
      }
    } catch {
      // prompt may only be called once — silently ignore
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pwa-banner"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="fixed bottom-4 right-4 z-50 w-[308px] bg-white rounded-2xl shadow-card-lg border border-border overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-content-muted hover:bg-surface-muted hover:text-content-primary transition-colors"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>

          <div className="p-4 pr-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary-lt border border-brand-primary/20 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Einstein's CBT"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-content-primary leading-tight">Einstein&apos;s CBT App</p>
                <p className="text-xs text-content-muted">Mega Tech Solutions</p>
              </div>
            </div>

            {/* Body */}
            {!showIOSSteps ? (
              <>
                <p className="text-xs text-content-secondary mb-4 leading-relaxed">
                  Install the app for faster access, offline practice, and a better exam experience.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    disabled={installing}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-semibold hover:bg-brand-primary-dk transition-colors disabled:opacity-60 min-h-[40px]"
                  >
                    {ios ? (
                      <><Share size={13} /> Add to Home Screen</>
                    ) : (
                      <><Download size={13} /> {installing ? 'Installing…' : 'Install App'}</>
                    )}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-2.5 rounded-xl border border-border text-xs font-semibold text-content-secondary hover:border-brand-primary hover:text-content-primary transition-colors min-h-[40px]"
                  >
                    Not now
                  </button>
                </div>
              </>
            ) : (
              /* iOS step-by-step instructions */
              <>
                <p className="text-xs font-semibold text-content-primary mb-2">How to install on iOS:</p>
                <ol className="space-y-2 mb-4">
                  {[
                    { icon: '1', text: <>Tap the <Share size={12} className="inline mx-0.5 text-blue-500" /> <strong>Share</strong> icon in Safari&apos;s toolbar</> },
                    { icon: '2', text: <>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></> },
                    { icon: '3', text: <>Tap <strong>&quot;Add&quot;</strong> in the top-right corner</> },
                  ].map(({ icon, text }) => (
                    <li key={icon} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{icon}</span>
                      <span className="text-xs text-content-secondary leading-relaxed">{text}</span>
                    </li>
                  ))}
                </ol>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 rounded-xl border border-border text-xs font-semibold text-content-secondary hover:border-brand-primary transition-colors min-h-[40px]"
                >
                  Got it, close
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
