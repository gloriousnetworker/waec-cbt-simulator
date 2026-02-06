'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const RollingBanner = () => {
  const messages = [
    "Welcome to WAEC CBT Simulator!",
    "Practice makes perfect!",
    "Time management is key!",
    "Read questions carefully!",
    "Check your answers before submitting!"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="w-full bg-gradient-to-r from-[#039994] to-[#026d6a] text-white py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center gap-2 mr-4">
          <div className="relative w-6 h-6">
            <Image
              src="/icons/icon-72x72.png"
              alt="WAEC CBT"
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span className="font-playfair font-bold">WAEC CBT</span>
        </div>
        <div className="relative h-6 overflow-hidden flex-1">
          <div
            className="absolute top-0 left-0 w-full transition-transform duration-500"
            style={{ transform: `translateY(-${currentIndex * 100}%)` }}
          >
            {messages.map((message, index) => (
              <div key={index} className="h-6 flex items-center">
                <p className="font-playfair text-sm font-medium">{message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollingBanner;