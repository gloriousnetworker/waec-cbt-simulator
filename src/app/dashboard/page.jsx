'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNavbar from '../../components/dashboard-components/Navbar';
import DashboardSidebar from '../../components/dashboard-components/Sidebar';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'next/navigation';
import DashboardHome from '../../components/dashboard-content/Home';
import Exams from '../../components/dashboard-content/Exams';
import TimedTests from '../../components/dashboard-content/TimedTests';
import Performance from '../../components/dashboard-content/Performance';
import Achievements from '../../components/dashboard-content/Achievements';
import PastQuestions from '../../components/dashboard-content/PastQuestions';
import StudyGroups from '../../components/dashboard-content/StudyGroups';
import Settings from '../../components/dashboard-content/Settings';
import Help from '../../components/dashboard-content/Help';
import toast from 'react-hot-toast';
import {
  dashboardContainer,
  dashboardMain,
  dashboardContent,
  dashboardInner,
  dashboardLoading,
  dashboardLoadingInner,
  dashboardLoadingSpinner,
  dashboardLoadingText,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../../styles/styles';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [examData, setExamData] = useState(null);
  const [showExam, setShowExam] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [examResult, setExamResult] = useState(null);
  const { isAuthenticated, authChecked } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated]);

  useEffect(() => {
    const hasResult = searchParams.get('examResult');
    if (hasResult === 'true') {
      const score = parseInt(searchParams.get('score') || '0');
      const total = parseInt(searchParams.get('total') || '0');
      const percentage = parseFloat(searchParams.get('percentage') || '0');
      const subject = searchParams.get('subject') || 'Subject';
      const reason = searchParams.get('reason');

      setExamResult({
        score,
        total,
        percentage,
        subject,
        reason
      });

      setShowResultModal(true);

      if (reason) {
        toast.error(`Exam auto-submitted: ${reason}`, { duration: 5000 });
      } else {
        toast.success('Exam completed successfully!', { duration: 3000 });
      }

      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const handleStartExam = (subject, examType) => {
    setExamData({ subject, examType });
    setShowExam(true);
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    setExamResult(null);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <DashboardHome setActiveSection={handleNavigation} onStartExam={handleStartExam} />;
      case 'exams': return <Exams setActiveSection={handleNavigation} onStartExam={handleStartExam} />;
      case 'timed-tests': return <TimedTests setActiveSection={handleNavigation} onStartExam={handleStartExam} />;
      case 'performance': return <Performance setActiveSection={handleNavigation} />;
      case 'achievements': return <Achievements setActiveSection={handleNavigation} />;
      case 'past-questions': return <PastQuestions setActiveSection={handleNavigation} onStartExam={handleStartExam} />;
      case 'study-groups': return <StudyGroups setActiveSection={handleNavigation} />;
      case 'settings': return <Settings setActiveSection={handleNavigation} />;
      case 'help': return <Help setActiveSection={handleNavigation} />;
      default: return <DashboardHome setActiveSection={handleNavigation} onStartExam={handleStartExam} />;
    }
  };

  const getGrade = (percentage) => {
    if (percentage >= 75) return { grade: 'A', color: 'text-[#10B981]', bg: 'bg-[#D1FAE5]' };
    if (percentage >= 60) return { grade: 'B', color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' };
    if (percentage >= 50) return { grade: 'C', color: 'text-[#F59E0B]', bg: 'bg-[#FEF3C7]' };
    if (percentage >= 40) return { grade: 'D', color: 'text-[#EF4444]', bg: 'bg-[#FEE2E2]' };
    return { grade: 'F', color: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]' };
  };

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
    <ProtectedRoute>
      <div className={dashboardContainer}>
        <DashboardNavbar 
          activeSection={activeSection}
          setActiveSection={handleNavigation}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className={dashboardMain}>
          <DashboardSidebar 
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
              className={modalOverlay}
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
                </div>

                {examResult.reason && (
                  <div className="mb-6 p-4 bg-[#FEF2F2] border border-[#DC2626] rounded-lg">
                    <p className="text-[12px] leading-[140%] font-[500] text-[#DC2626] font-playfair">
                      Reason: {examResult.reason}
                    </p>
                  </div>
                )}

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
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      handleCloseResult();
                      setActiveSection('performance');
                    }}
                    className="w-full py-3 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85] transition-colors"
                  >
                    View Performance
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
    </ProtectedRoute>
  );
}