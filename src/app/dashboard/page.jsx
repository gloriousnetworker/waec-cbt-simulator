// app/dashboard/page.jsx
'use client';

import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import StudentNavbar from '../../components/dashboard-components/Navbar';
import StudentSidebar from '../../components/dashboard-components/Sidebar';
import { useState, useEffect, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardHome from '../../components/dashboard-content/Home';
import Exams from '../../components/dashboard-content/Exams';
import TimedTests from '../../components/dashboard-content/TimedTests';
import Performance from '../../components/dashboard-content/Performance';
import Achievements from '../../components/dashboard-content/Achievements';
import PastQuestions from '../../components/dashboard-content/PastQuestions';
import Settings from '../../components/dashboard-content/Settings';
import Help from '../../components/dashboard-content/Help';
import toast from 'react-hot-toast';
import { Trophy, BarChart3 } from 'lucide-react';

// Loading fallback shared
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-content-secondary">Loading dashboard...</p>
      </div>
    </div>
  );
}

function DashboardContentWithParams() {
  // Default open on desktop (≥1024px), closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(window.innerWidth >= 1024);
    const onResize = () => setSidebarOpen(prev => {
      // Only auto-open on resize to desktop; never auto-close (respect user preference)
      if (window.innerWidth >= 1024 && !prev) return true;
      return prev;
    });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const { user, isAuthenticated, authChecked } = useStudentAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;

    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url.pathname);
    }

    const hasResult    = searchParams.get('examResult');
    const scoreParam   = searchParams.get('score');
    const totalParam   = searchParams.get('total');
    const pctParam     = searchParams.get('percentage');
    const subjectParam = searchParams.get('subject');
    const reasonParam  = searchParams.get('reason');

    if (hasResult === 'true' && scoreParam && totalParam && pctParam && subjectParam) {
      const percentage = parseFloat(pctParam);
      const subject    = decodeURIComponent(subjectParam);
      const reason     = reasonParam ? decodeURIComponent(reasonParam) : null;

      setExamResult({ score: parseInt(scoreParam), total: parseInt(totalParam), percentage, subject, reason });
      setShowResultModal(true);

      if (reason) {
        toast.error(`Exam auto-submitted: ${reason}`, { duration: 5000, icon: '⚠️' });
      } else {
        toast.success(`${subject} completed! Score: ${percentage}%`, { duration: 4000, icon: '🎉' });
      }

      const url = new URL(window.location.href);
      ['examResult', 'score', 'total', 'percentage', 'subject', 'reason'].forEach(k => url.searchParams.delete(k));
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      if (user?.examMode) { router.replace('/dashboard/exam-room'); return; }
      const t = setTimeout(() => setPageLoading(false), 100);
      return () => clearTimeout(t);
    }
  }, [authChecked, isAuthenticated, user, router]);

  const handleCloseResult   = useCallback(() => { setShowResultModal(false); setExamResult(null); }, []);
  const handleViewPerf      = useCallback(() => { handleCloseResult(); setActiveSection('performance'); }, [handleCloseResult]);
  const handleNavigation    = useCallback((section) => {
    setActiveSection(section);
    // Only close sidebar automatically on mobile
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, []);

  const getGrade = (pct) => {
    if (pct >= 75) return { grade: 'A', color: 'text-success',       bg: 'bg-success-light' };
    if (pct >= 60) return { grade: 'B', color: 'text-info',          bg: 'bg-info-light' };
    if (pct >= 50) return { grade: 'C', color: 'text-warning-dark',  bg: 'bg-warning-light' };
    if (pct >= 40) return { grade: 'D', color: 'text-danger',        bg: 'bg-danger-light' };
    return              { grade: 'F', color: 'text-danger-dark',    bg: 'bg-danger-light' };
  };

  const renderSection = () => {
    const props = { setActiveSection: handleNavigation };
    switch (activeSection) {
      case 'home':           return <DashboardHome    {...props} />;
      case 'exams':          return <Exams            {...props} />;
      case 'timed-tests':    return <TimedTests       {...props} />;
      case 'performance':    return <Performance      {...props} />;
      case 'achievements':   return <Achievements     {...props} />;
      case 'past-questions': return <PastQuestions    {...props} />;
      case 'settings':       return <Settings         {...props} />;
      case 'help':           return <Help             {...props} />;
      default:               return <DashboardHome    {...props} />;
    }
  };

  if (pageLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Navbar */}
      <StudentNavbar
        activeSection={activeSection}
        setActiveSection={handleNavigation}
        onMenuClick={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex">
        {/* Sidebar */}
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          setActiveSection={handleNavigation}
        />

        {/* Main content — shifts right on desktop when sidebar is open */}
        <main className={`flex-1 min-h-screen overflow-y-auto transition-[margin-left] duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-safe"
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>

      {/* ── Exam Result Modal ── */}
      <AnimatePresence>
        {showResultModal && examResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleCloseResult}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-card-lg"
            >
              {/* Icon */}
              <div className="text-5xl mb-4">
                {examResult.reason ? '⚠️' : examResult.percentage >= 50 ? '🎉' : '📚'}
              </div>

              <h3 className="text-xl font-bold tracking-tight text-content-primary mb-1 font-playfair">
                {examResult.reason ? 'Exam Auto-Submitted' : 'Exam Completed!'}
              </h3>
              <p className="text-sm text-content-secondary mb-1">{examResult.subject}</p>
              {examResult.reason && (
                <p className="text-xs font-medium text-danger mt-1 mb-2">{examResult.reason}</p>
              )}

              {/* Grade circle */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getGrade(examResult.percentage).bg} my-5`}>
                <span className={`text-4xl font-bold font-playfair ${getGrade(examResult.percentage).color}`}>
                  {getGrade(examResult.percentage).grade}
                </span>
              </div>

              {/* Score rows */}
              <div className="space-y-2 mb-6 text-left">
                <div className="flex justify-between items-center p-3 bg-surface-muted rounded-xl">
                  <span className="text-sm font-medium text-content-secondary">Score</span>
                  <span className="text-base font-bold text-content-primary">{examResult.score} / {examResult.total}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface-muted rounded-xl">
                  <span className="text-sm font-medium text-content-secondary">Percentage</span>
                  <span className={`text-base font-bold ${getGrade(examResult.percentage).color}`}>{examResult.percentage}%</span>
                </div>
                {examResult.reason && (
                  <div className="p-3 bg-danger-light rounded-xl">
                    <p className="text-xs font-medium text-danger">⚠️ This exam was auto-submitted due to a policy violation.</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button onClick={handleViewPerf} className="btn-primary w-full text-sm">
                  <BarChart3 size={15} /> View Performance Analytics
                </button>
                <button onClick={handleCloseResult} className="btn-secondary w-full text-sm">
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={<LoadingScreen />}>
        <DashboardContentWithParams />
      </Suspense>
    </StudentProtectedRoute>
  );
}
