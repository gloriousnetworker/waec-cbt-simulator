'use client';

import { useEffect, useState, useRef } from 'react';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    
    if (videoElement) {
      const playPromise = videoElement.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log("Video autoplay prevented:", e);
        });
      }

      const handleVideoEnd = () => {
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      };

      videoElement.addEventListener('ended', handleVideoEnd);

      const maxTimeout = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, 6000);

      return () => {
        clearTimeout(maxTimeout);
        if (videoElement) {
          videoElement.removeEventListener('ended', handleVideoEnd);
        }
      };
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ touchAction: 'none' }}
    >
      <video
        ref={videoRef}
        src="/splash-animation.mp4"
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}