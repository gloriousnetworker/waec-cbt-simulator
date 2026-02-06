'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  splashContainer,
  splashContent,
  splashLogo,
  splashTitle,
  splashSubtitle,
  splashProgressBar,
  splashProgressFill,
  splashProgressText,
  splashDots,
  splashDot
} from '../styles/styles';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={splashContainer}>
      <div className={splashContent}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={splashLogo}>WAEC</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className={splashTitle}>CBT Exam Simulator</h2>
          <p className={splashSubtitle}>Loading your exam environment</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className={splashProgressBar}>
            <div 
              className={splashProgressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className={splashProgressText}>{progress}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className={splashDots}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className={splashDot}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}