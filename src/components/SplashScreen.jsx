'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setVisible(false), 400);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(progressInterval);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center pt-safe pb-safe"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.08, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 1.4, times: [0, 0.65, 1], ease: 'easeInOut' }}
            className="mb-10"
          >
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              {/* Glow ring behind logo */}
              <div className="absolute inset-0 rounded-full bg-brand-primary/10 blur-2xl scale-125" />
              <Image
                src="/logo.png"
                alt="Einstein's CBT App Logo"
                width={180}
                height={180}
                priority
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain relative z-10"
              />
            </motion.div>
          </motion.div>

          {/* Text + Progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="w-full max-w-xs px-8 text-center"
          >
            {/* App Name */}
            <h1 className="text-2xl font-bold tracking-tight text-brand-primary font-playfair mb-1">
              Einstein&apos;s CBT App
            </h1>

            <p className="text-sm font-medium text-content-secondary mb-6">
              Powered by Mega Tech Solutions
            </p>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden mb-3">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear' }}
                className="h-full bg-gradient-to-r from-brand-primary to-brand-cyan rounded-full"
              />
            </div>

            <p className="text-xs font-medium text-content-muted mb-1">
              {Math.round(progress)}% — Loading resources...
            </p>

            {/* Animated dots */}
            <div className="flex justify-center gap-1.5 mt-5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-brand-primary"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>

            <p className="text-xs text-content-muted mt-6">
              &copy; {new Date().getFullYear()} Mega Tech Solutions. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
