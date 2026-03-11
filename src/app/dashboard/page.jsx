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

const dashboardContainer = "min-h-screen bg-[#F9FAFB]";
const dashboardMain = "flex";
const dashboardContent = "flex-1 min-h-screen overflow-y-auto";
const dashboardInner = "max-w-7xl mx-auto px-4 py-6";
const dashboardLoading = "fixed inset-0 bg-white flex items-center justify-center z-50";
const dashboardLoadingInner = "text-center";
const dashboardLoadingSpinner = "w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4";
const dashboardLoadingText = "text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair";

// Separate component that uses useSearchParams
function DashboardContentWithParams() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const { user, isAuthenticated, authChecked } = useStudentAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle exam results from URL parameters and section navigation
  useEffect(() => {
    if (!searchParams) return;

    // Check for section parameter to navigate to specific section
    const sectionParam = searchParams.get('section');
    if (sectionParam) {
      setActiveSection(sectionParam);
      // Clean up URL parameter without causing a re-render
      const url = new URL(window.location.href);
      url.searchParams.delete('section');
      window.history.replaceState({}, '', url.pathname);
    }

    const hasResult = searchParams.get('examResult');
    const scoreParam = searchParams.get('score');
    const totalParam = searchParams.get('total');
    const percentageParam = searchParams.get('percentage');
    const subjectParam = searchParams.get('subject');
    const reasonParam = searchParams.get('reason');

    if (hasResult === 'true' && scoreParam && totalParam && percentageParam && subjectParam) {
      const score = parseInt(scoreParam);
      const total = parseInt(totalParam);
      const percentage = parseFloat(percentageParam);
      const subject = decodeURIComponent(subjectParam);
      const reason = reasonParam ? decodeURIComponent(reasonParam) : null;

      setExamResult({
        score,
        total,
        percentage,
        subject,
        reason
      });

      setShowResultModal(true);

      // Show appropriate toast message
      if (reason) {
        toast.error(`Exam auto-submitted: ${reason}`, { 
          duration: 5000,
          icon: '⚠️'
        });
      } else {
        toast.success(`${subject} exam completed! Score: ${percentage}%`, { 
          duration: 4000,
          icon: '🎉'
        });
      }

      // Clean up URL parameters without causing a re-render
      const url = new URL(window.location.href);
      url.searchParams.delete('examResult');
      url.searchParams.delete('score');
      url.searchParams.delete('total');
      url.searchParams.delete('percentage');
      url.searchParams.delete('subject');
      url.searchParams.delete('reason');
      window.history.replaceState({}, '', url.pathname);
    }
  }, [searchParams]);

  // Handle authentication and loading
  useEffect(() => {
    if (authChecked && isAuthenticated) {
      if (user?.examMode) {
        router.replace('/dashboard/exam-room');
        return;
      }
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated, user, router]);

  const handleCloseResult = useCallback(() => {
    setShowResultModal(false);
    setExamResult(null);
  }, []);

  const handleNavigation = useCallback((section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'home': 
        return <DashboardHome setActiveSection={handleNavigation} />;
      case 'exams': 
        return <Exams setActiveSection={handleNavigation} />;
      case 'timed-tests': 
        return <TimedTests setActiveSection={handleNavigation} />;
      case 'performance': 
        return <Performance setActiveSection={handleNavigation} />;
      case 'achievements': 
        return <Achievements setActiveSection={handleNavigation} />;
      case 'past-questions': 
        return <PastQuestions setActiveSection={handleNavigation} />;
      case 'settings': 
        return <Settings setActiveSection={handleNavigation} />;
      case 'help': 
        return <Help setActiveSection={handleNavigation} />;
      default: 
        return <DashboardHome setActiveSection={handleNavigation} />;
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 75) return { grade: 'A', color: 'text-[#10B981]', bg: 'bg-[#D1FAE5]' };
    if (percentage >= 60) return { grade: 'B', color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' };
    if (percentage >= 50) return { grade: 'C', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' };
    if (percentage >= 40) return { grade: 'D', color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' };
    return { grade: 'F', color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]' };
  };

  const handleViewPerformance = useCallback(() => {
    handleCloseResult();
    setActiveSection('performance');
  }, [handleCloseResult]);

  if (pageLoading) {
    return (
      <div className={dashboardLoading}>
        <div className={dashboardLoadingInner}>
          <div className={dashboardLoadingSpinner}></div>
          <p className={dashboardLoadingText}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardContainer}>
      <StudentNavbar 
        activeSection={activeSection}
        setActiveSection={handleNavigation}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className={dashboardMain}>
        <StudentSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          setActiveSection={handleNavigation}
        />
        
        <main className={dashboardContent}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className={dashboardInner}
          >
            {renderSection()}
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {showResultModal && examResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleCloseResult}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-md mx-4 text-center"
            >
              <div className="mb-6">
                {examResult.reason ? (
                  <div className="text-5xl mb-4">⚠️</div>
                ) : (
                  <div className="text-5xl mb-4">
                    {examResult.percentage >= 50 ? '🎉' : '📚'}
                  </div>
                )}
                <h3 className="text-[24px] leading-[120%] font-[700] tracking-[-0.03em] text-[#1E1E1E] mb-2 font-playfair">
                  {examResult.reason ? 'Exam Auto-Submitted' : 'Exam Completed!'}
                </h3>
                <p className="text-[14px] leading-[140%] font-[400] text-[#626060] font-playfair">
                  {examResult.subject}
                </p>
                {examResult.reason && (
                  <p className="text-[12px] leading-[140%] font-[500] text-[#DC2626] mt-2 font-playfair">
                    {examResult.reason}
                  </p>
                )}
              </div>

              <div className="mb-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getGrade(examResult.percentage).bg} mb-4`}>
                  <span className={`text-[40px] leading-[100%] font-[700] font-playfair ${getGrade(examResult.percentage).color}`}>
                    {getGrade(examResult.percentage).grade}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#F9FAFB] rounded-lg">
                    <span className="text-[13px] leading-[100%] font-[500] text-[#626060] font-playfair">Score</span>
                    <span className="text-[16px] leading-[100%] font-[700] text-[#1E1E1E] font-playfair">
                      {examResult.score} / {examResult.total}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-[#F9FAFB] rounded-lg">
                    <span className="text-[13px] leading-[100%] font-[500] text-[#626060] font-playfair">Percentage</span>
                    <span className={`text-[16px] leading-[100%] font-[700] font-playfair ${getGrade(examResult.percentage).color}`}>
                      {examResult.percentage}%
                    </span>
                  </div>

                  {examResult.reason && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-[12px] leading-[140%] font-[500] text-[#DC2626] font-playfair">
                        ⚠️ This exam was auto-submitted due to policy violation
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleViewPerformance}
                  className="w-full py-3 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85] transition-colors"
                >
                  View Performance Analytics
                </button>
                <button
                  onClick={handleCloseResult}
                  className="w-full py-3 bg-white text-[#039994] border border-[#039994] rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#F0F9F8] transition-colors"
                >
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

// Main export with Suspense wrapper
export default function DashboardPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className={dashboardLoading}>
          <div className={dashboardLoadingInner}>
            <div className={dashboardLoadingSpinner}></div>
            <p className={dashboardLoadingText}>Loading dashboard...</p>
          </div>
        </div>
      }>
        <DashboardContentWithParams />
      </Suspense>
    </StudentProtectedRoute>
  );
}