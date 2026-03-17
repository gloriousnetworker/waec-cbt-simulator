// src/app/not-found.jsx
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D1117 0%, #0f1f3d 50%, #0D1117 100%)' }}
    >
      {/* Ghost logo background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <Image
          src="/logo.png"
          alt=""
          width={480}
          height={480}
          className="object-contain"
          style={{ opacity: 0.04 }}
          priority
        />
      </div>

      {/* Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full">
        {/* Logo */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 flex-shrink-0"
          style={{ background: 'rgba(21, 101, 192, 0.15)', border: '1px solid rgba(21, 101, 192, 0.3)' }}
        >
          <Image
            src="/logo.png"
            alt="Einstein's CBT"
            width={52}
            height={52}
            className="object-contain"
            style={{ filter: 'drop-shadow(0 0 12px rgba(21,101,192,0.6))' }}
          />
        </div>

        {/* 404 */}
        <p
          className="font-bold leading-none mb-3 font-playfair"
          style={{ fontSize: '6rem', color: '#1565C0', opacity: 0.9 }}
        >
          404
        </p>

        {/* Heading */}
        <h1 className="text-xl font-bold text-white mb-2 font-playfair">
          Page Not Found
        </h1>

        {/* Sub-text */}
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          This page doesn&apos;t exist or may have been moved. Use the buttons below to find your way back.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => router.back()}
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all min-h-[48px]"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.85)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/login')}
            className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all min-h-[48px] text-white"
            style={{ background: '#1565C0' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1251A3'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1565C0'; }}
          >
            Return to Login
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Einstein&apos;s CBT — Powered by Mega Tech Solutions
      </p>
    </div>
  );
}
