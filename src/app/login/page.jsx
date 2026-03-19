// app/login/page.jsx
'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Eye, EyeOff, Smartphone, Zap, BookOpen, BarChart3, ShieldCheck, ArrowRight } from 'lucide-react'
import { useStudentAuth } from '../../context/StudentAuthContext'
import toast from 'react-hot-toast'

export default function StudentLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loginType, setLoginType] = useState('nin')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, authChecked } = useStudentAuth()
  const videoRef = useRef(null)
  const currentYear = new Date().getFullYear()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (mounted && authChecked && isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, authChecked, router, mounted])

  useEffect(() => {
    if (loading && videoRef.current) videoRef.current.play().catch(() => {})
  }, [loading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) { toast.error('Please enter your credentials'); return }
    setLoading(true)
    const loginToast = toast.loading('Signing in...')
    try {
      const result = await login(identifier, password, loginType)
      if (result.success) {
        toast.success(`Welcome back, ${result.user.firstName}!`, { id: loginToast })
        if (result.examMode) router.replace('/exam-instructions')
        else setTimeout(() => router.replace('/dashboard'), 1200)
      } else {
        toast.error(result.message || 'Invalid credentials', { id: loginToast })
        setLoading(false)
      }
    } catch (error) {
      toast.error(error.message || 'Authentication failed. Please try again.', { id: loginToast })
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    toast.error('Please contact your school administrator to reset your password')
  }

  const features = [
    { icon: Smartphone, label: 'Mobile Ready' },
    { icon: Zap,        label: 'Instant Results' },
    { icon: BookOpen,   label: 'Past Questions' },
    { icon: BarChart3,  label: 'Analytics' },
  ]

  return (
    <>
      {/* Full-screen loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
          >
            <video
              ref={videoRef} src="/loader.mp4"
              autoPlay loop muted playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Full-page dark navy background ── */}
      <div
        className="min-h-screen relative flex items-center justify-center px-4 py-10 pt-safe pb-safe overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%)' }}
      >
        {/* Ghost logo — large, low-opacity background decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="relative w-[520px] h-[520px]" style={{ opacity: 0.05 }}>
            <Image src="/logo.png" alt="" fill className="object-contain" priority />
          </div>
        </div>

        {/* Radial glow — soft centre highlight */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(58,79,122,0.30) 0%, transparent 70%)' }}
        />

        {/* Subtle top-right corner accent */}
        <div
          className="absolute -top-32 -right-32 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(58,79,122,0.25) 0%, transparent 70%)' }}
        />

        {/* ── Page content ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Logo + Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
            className="flex flex-col items-center mb-10"
          >
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full blur-2xl scale-[2]" style={{ background: 'rgba(58,79,122,0.35)' }} />
              <Image
                src="/logo.png"
                alt="Einstein's CBT App"
                width={92}
                height={92}
                priority
                className="relative z-10 object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}
              />
            </div>
            <h1 className="text-[26px] font-bold tracking-tight text-white text-center font-playfair leading-tight">
              Einstein&apos;s CBT App
            </h1>
            <p className="text-sm font-medium mt-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
              WAEC Exam Practice Portal
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Powered by Mega Tech Solutions
            </p>
          </motion.div>

          {/* Login Type Toggle */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.14 }}
            className="flex gap-2 p-1 rounded-xl mb-7"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            {[
              { value: 'nin',     label: 'NIN Login' },
              { value: 'loginId', label: 'Login ID' },
            ].map((opt) => (
              <button
                key={opt.value} type="button"
                onClick={() => setLoginType(opt.value)} disabled={loading}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[42px] ${
                  loginType === opt.value
                    ? 'bg-white shadow-md'
                    : 'hover:bg-white/10'
                }`}
                style={{
                  color: loginType === opt.value ? '#1F2A49' : 'rgba(255,255,255,0.60)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>

          {/* ── Form — directly on dark bg, no card wrapper ── */}
          <motion.form
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            {/* Identifier */}
            <div>
              <label className="block mb-2.5 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {loginType === 'nin' ? 'NIN (National ID Number)' : 'Login ID'}
              </label>
              <input
                type="text" value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginType === 'nin' ? 'Enter your NIN' : 'e.g. john.doe'}
                disabled={loading}
                autoComplete="username"
                inputMode={loginType === 'nin' ? 'numeric' : 'text'}
                className="w-full bg-transparent border-b pb-3 text-white text-sm font-medium outline-none transition-all min-h-[44px] placeholder:text-white/25 focus:placeholder:text-white/40"
                style={{ borderBottomColor: 'rgba(255,255,255,0.25)' }}
                onFocus={e => { e.target.style.borderBottomColor = 'rgba(255,255,255,0.8)' }}
                onBlur={e => { e.target.style.borderBottomColor = identifier ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)' }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>
                  Password
                </label>
                <button
                  type="button" onClick={handleForgotPassword} disabled={loading}
                  className="text-xs font-semibold transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="go"
                  className="w-full bg-transparent border-b pb-3 pr-10 text-white text-sm font-medium outline-none transition-all min-h-[44px] placeholder:text-white/25 focus:placeholder:text-white/40"
                  style={{ borderBottomColor: 'rgba(255,255,255,0.25)' }}
                  onFocus={e => { e.target.style.borderBottomColor = 'rgba(255,255,255,0.8)' }}
                  onBlur={e => { e.target.style.borderBottomColor = password ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.25)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-0 top-1/2 -translate-y-3 p-2 transition-colors hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.40)' }}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Submit Button — white bg with navy text (inverted) */}
            <button
              type="submit" disabled={loading}
              className="w-full mt-2 py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2 shadow-lg"
              style={{ background: '#FFFFFF', color: '#1F2A49' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(31,42,73,0.25)', borderTopColor: '#1F2A49' }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.28 }}
            className="mt-7 p-4 rounded-xl border"
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
          >
            <div className="flex items-start gap-2.5">
              <ShieldCheck size={14} className="mt-0.5 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.45)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
                <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.75)' }}>Demo:</span>{' '}
                NIN <code className="font-mono rounded px-1" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.80)' }}>12345678941</code> / pw{' '}
                <code className="font-mono rounded px-1" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.80)' }}>123456</code>
                {' '}or ID{' '}
                <code className="font-mono rounded px-1" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.80)' }}>alice.johnson</code> / pw{' '}
                <code className="font-mono rounded px-1" style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.80)' }}>654321</code>
              </p>
            </div>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.32 }}
            className="mt-5 grid grid-cols-4 gap-2"
          >
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 py-3 rounded-xl border"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <Icon size={16} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.55)' }} />
                <span
                  className="text-[10px] font-medium text-center leading-tight"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.36 }}
            className="text-center text-xs mt-5"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            <span className="font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>Mega Tech Solutions</span>
            {' '}·{' '}
            &copy; {currentYear} All rights reserved
          </motion.p>
        </motion.div>
      </div>
    </>
  )
}
