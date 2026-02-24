// login/page.jsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStudentAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const loginContainer = "min-h-screen bg-[#F9FAFB] flex items-center justify-center"
const loginContent = "w-full max-w-sm px-4 py-2"

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState('nin')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, authChecked } = useStudentAuth()
  const videoRef = useRef(null)
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && authChecked && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authChecked, router, mounted])

  useEffect(() => {
    if (loading && videoRef.current) {
      videoRef.current.play().catch(() => {})
    }
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) {
      toast.error('Please enter your credentials')
      return
    }
    setLoading(true)
    const loginToast = toast.loading('Logging in...')
    
    try {
      const result = await login(identifier, password, loginType)
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.firstName}!`, { id: loginToast })
        setTimeout(() => {
          router.replace('/dashboard')
        }, 1500)
      } else {
        toast.error(result.message || 'Invalid credentials', { id: loginToast })
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.message || 'Authentication failed. Please try again.', { id: loginToast })
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.error('Please contact your school administrator to reset your password')
  }

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-white"
          >
            <video
              ref={videoRef}
              src="/loader.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={loginContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className={loginContent}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-4"
          >
            <h1 className="text-[40px] leading-[100%] font-[700] tracking-[-0.03em] text-[#039994] text-center mb-1 font-playfair">WAEC</h1>
            <h2 className="text-[20px] leading-[120%] font-[600] tracking-[-0.03em] text-[#1E1E1E] text-center mb-1 font-playfair">CBT Exam Simulator</h2>
            <p className="text-[12px] leading-[140%] font-[400] tracking-[-0.02em] text-[#626060] text-center mb-6 font-playfair">Sign in to start practicing</p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div>
              <label className="block mb-1 text-[12px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair">
                {loginType === 'nin' ? 'NIN (National ID Number)' : 'Login ID'}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border-b-2 border-gray-300 text-[13px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#039994] transition-colors bg-transparent placeholder-[#B0B0B0]"
                placeholder={loginType === 'nin' ? "12345678901" : "john.doe"}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block mb-1 text-[12px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-gray-300 text-[13px] leading-[100%] tracking-[-0.02em] font-[500] text-[#1E1E1E] font-playfair focus:outline-none focus:border-[#039994] transition-colors bg-transparent placeholder-[#B0B0B0]"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#626060] hover:text-[#039994] transition-colors text-[18px]"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={loginType === 'nin'}
                    onChange={() => setLoginType('nin')}
                    className="w-3 h-3 accent-[#039994]"
                  />
                  <span className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">NIN</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    checked={loginType === 'loginId'}
                    onChange={() => setLoginType('loginId')}
                    className="w-3 h-3 accent-[#039994]"
                  />
                  <span className="text-[10px] leading-[100%] font-[400] text-[#626060] font-playfair">Login ID</span>
                </label>
              </div>
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] leading-[100%] font-[500] text-[#039994] hover:underline font-playfair"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[#039994] text-white text-[14px] leading-[100%] font-[600] tracking-[-0.02em] rounded-md hover:bg-[#02857f] focus:outline-none focus:ring-2 focus:ring-[#039994] focus:ring-offset-2 transition-all font-playfair disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <div className="mt-4 px-3 py-2 bg-[#E6FFFA] border-l-4 border-[#039994] rounded-r-md mb-4">
              <p className="text-[10px] leading-[140%] font-[400] text-[#036B67] font-playfair">
                <strong>Demo Accounts:</strong> Use NIN: 12345678941 / Password: 123456 or Login ID: king.doe / Password: 123456
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">📱</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Mobile Friendly</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">⚡</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Instant Results</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">📚</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Past Questions</div>
              </div>
              <div className="text-center py-2">
                <div className="text-[20px] mb-1">🎯</div>
                <div className="text-[10px] leading-[120%] font-[500] text-[#626060] font-playfair">Analytics</div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E8E8] text-center">
              <p className="text-[9px] leading-[140%] font-[400] text-[#626060] font-playfair">
                <span className="font-[600] text-[#1E1E1E]">Mega-Tech</span>
                <span className="mx-1">•</span>
                <span>© {currentYear} All rights reserved</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        input::placeholder {
          color: #B0B0B0 !important;
        }
      `}</style>
    </>
  )
}