'use client';

import { useEffect, useRef, useState } from 'react';

export default function SplashScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const playVideo = async () => {
      try {
        await video.play();
      } catch {}
    };

    const handleEnd = () => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 500);
    };

    video.addEventListener('ended', handleEnd);
    video.addEventListener('canplay', playVideo);

    const fallbackTimeout = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 500);
    }, 6000);

    playVideo();

    return () => {
      clearTimeout(fallbackTimeout);
      video.removeEventListener('ended', handleEnd);
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/splash-animation.mp4"
        muted
        autoPlay
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
