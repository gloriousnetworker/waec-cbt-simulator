// components/RollingBanner.js - Alternative version with continuous scroll
'use client';

import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';

export default function RollingBanner() {
  const [banners, setBanners] = useState([]);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const stagingUrl = 'https://big-relief-backend.vercel.app';

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${stagingUrl}/api/v1/banners/active`);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0 || !containerRef.current || !contentRef.current) return;

    const container = containerRef.current;
    const content = contentRef.current;
    
    // Duplicate content for seamless looping
    content.innerHTML += content.innerHTML;

    const contentWidth = content.scrollWidth / 2;
    const duration = 20; // seconds for one full loop

    // Animation
    const animation = gsap.to(content, {
      x: -contentWidth,
      duration: duration,
      ease: 'none',
      repeat: -1,
    });

    // Pause on hover
    container.addEventListener('mouseenter', () => animation.pause());
    container.addEventListener('mouseleave', () => animation.resume());

    return () => {
      animation.kill();
      container.removeEventListener('mouseenter', () => animation.pause());
      container.removeEventListener('mouseleave', () => animation.resume());
    };
  }, [banners]);

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#039994] text-white py-3 overflow-hidden" ref={containerRef}>
      <div 
        className="flex items-center gap-8 px-4 whitespace-nowrap w-max"
        ref={contentRef}
      >
        {banners.map((banner, index) => (
          <div key={`${banner.id}-${index}`} className="flex items-center gap-4">
            {banner.imageUrl && (
              <img 
                src={banner.imageUrl} 
                alt="Banner" 
                className="h-8 w-8 object-contain rounded-full" 
              />
            )}
            <div>
              <h3 className="font-semibold text-sm sm:text-base">{banner.title}</h3>
              <p className="text-xs sm:text-sm">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}