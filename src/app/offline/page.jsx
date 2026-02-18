'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 max-w-md w-full text-center border border-[#E8E8E8]"
      >
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-[24px] leading-[120%] font-[700] tracking-[-0.03em] text-[#1E1E1E] mb-2 font-playfair">
          You're Offline
        </h1>
        <p className="text-[14px] leading-[150%] font-[400] text-[#626060] mb-6 font-playfair">
          Don't worry! You can still practice with downloaded exams. Your progress will sync when you're back online.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85] transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-white text-[#039994] border border-[#039994] rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#F0F9F8] transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
          <p className="text-[12px] leading-[140%] font-[400] text-[#9CA3AF] font-playfair">
            Available offline: Mathematics, English, Physics, and more
          </p>
        </div>
      </motion.div>
    </div>
  )
}