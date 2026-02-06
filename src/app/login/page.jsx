'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  loginContainer,
  loginContent,
  loginLogo,
  loginTitle,
  loginSubtitle,
  loginForm,
  loginLabel,
  loginInput,
  loginPasswordWrapper,
  loginPasswordToggle,
  loginRememberRow,
  loginCheckboxLabel,
  loginCheckbox,
  loginCheckboxText,
  loginForgotPassword,
  loginButton,
  loginDivider,
  loginDividerLine,
  loginDividerText,
  loginDemoSection,
  loginDemoTitle,
  loginDemoButton,
  loginDemoEmail,
  loginDemoPassword,
  loginDemoArrow,
  loginNote,
  loginNoteText,
  loginFeatures,
  loginFeatureItem,
  loginFeatureIcon,
  loginFeatureText,
  loadingSpinner,
  loadingSpinnerSvg,
  loadingText
} from '../../styles/styles';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const demoCredentials = [
    { email: 'student001@megatechsolutions.org', password: '123456' },
    { email: 'student001@yourschool.org', password: '123456' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleDemoLogin = (email, password) => {
    setIdentifier(email);
    setPassword(password);
    handleLogin(email, password);
  };

  const handleLogin = async (email, pass) => {
    setLoading(true);
    const loginToast = toast.loading('Logging in...');

    try {
      const result = await login(email || identifier, pass || password);
      
      if (result.success) {
        toast.success('Login successful! Redirecting...', { id: loginToast });
        router.push('/dashboard');
      } else {
        toast.error(result.message || 'Login failed', { id: loginToast });
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.', { id: loginToast });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) {
      toast.error('Please enter credentials or use demo accounts');
      return;
    }
    handleLogin(identifier, password);
  };

  return (
    <div className={loginContainer}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={loginContent}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className={loginLogo}>WAEC</h1>
          <h2 className={loginTitle}>CBT Exam Simulator</h2>
          <p className={loginSubtitle}>Sign in to start practicing</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className={loginForm}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div>
            <label className={loginLabel}>Email Address</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={loginInput}
              placeholder="student@example.org"
            />
          </div>

          <div>
            <label className={loginLabel}>Password</label>
            <div className={loginPasswordWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={loginInput}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={loginPasswordToggle}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <div className={loginRememberRow}>
            <label className={loginCheckboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={loginCheckbox}
              />
              <span className={loginCheckboxText}>Remember me</span>
            </label>
            <button type="button" className={loginForgotPassword}>
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={loginButton}
          >
            {loading ? (
              <span className={loadingSpinner}>
                <svg className={loadingSpinnerSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className={loadingText}>Signing in...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className={loginDivider}>
            <div className={loginDividerLine}></div>
            <span className={loginDividerText}>OR</span>
            <div className={loginDividerLine}></div>
          </div>

          <div className={loginDemoSection}>
            <h3 className={loginDemoTitle}>Quick Access - Demo Accounts</h3>
            
            {demoCredentials.map((cred, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleDemoLogin(cred.email, cred.password)}
                disabled={loading}
                className={loginDemoButton}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={loginDemoEmail}>{cred.email}</div>
                    <div className={loginDemoPassword}>Password: {cred.password}</div>
                  </div>
                  <div className={loginDemoArrow}>→</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className={loginNote}>
            <p className={loginNoteText}>
              <strong>Note:</strong> These are demo accounts. For full access, please contact your school administrator.
            </p>
          </div>

          <div className={loginFeatures}>
            <div className={loginFeatureItem}>
              <div className={loginFeatureIcon}>📱</div>
              <div className={loginFeatureText}>Mobile Friendly</div>
            </div>
            <div className={loginFeatureItem}>
              <div className={loginFeatureIcon}>⚡</div>
              <div className={loginFeatureText}>Instant Results</div>
            </div>
            <div className={loginFeatureItem}>
              <div className={loginFeatureIcon}>📚</div>
              <div className={loginFeatureText}>Past Questions</div>
            </div>
            <div className={loginFeatureItem}>
              <div className={loginFeatureIcon}>🎯</div>
              <div className={loginFeatureText}>Analytics</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}