'use client';

import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardNavbar from '../../components/dashboard-components/Navbar';
import DashboardSidebar from '../../components/dashboard-components/Sidebar';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import DashboardHome from '../../components/dashboard-content/Home';
import Exams from '../../components/dashboard-content/Exams';
import TimedTests from '../../components/dashboard-content/TimedTests';
import Performance from '../../components/dashboard-content/Performance';
import Achievements from '../../components/dashboard-content/Achievements';
import PastQuestions from '../../components/dashboard-content/PastQuestions';
import StudyGroups from '../../components/dashboard-content/StudyGroups';
import Settings from '../../components/dashboard-content/Settings';
import Help from '../../components/dashboard-content/Help';
import {
  dashboardContainer,
  dashboardMain,
  dashboardContent,
  dashboardInner,
  dashboardLoading,
  dashboardLoadingInner,
  dashboardLoadingSpinner,
  dashboardLoadingText
} from '../../styles/styles';

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [examData, setExamData] = useState(null);
  const [showExam, setShowExam] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const { isAuthenticated, authChecked } = useAuth();

  useEffect(() => {
    if (authChecked && isAuthenticated) {
      const timer = setTimeout(() => {
        setPageLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authChecked, isAuthenticated]);

  const handleStartExam = (subject, examType) => {
    setExamData({ subject, examType });
    setShowExam(true);
  };

  const handleExamComplete = (result) => {
    setShowExam(false);
    setResultData(result);
    setShowResult(true);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResultData(null);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };

  const renderSection = () => {
    if (showExam) {
      return <ExamScreen examData={examData} onComplete={handleExamComplete} onCancel={() => setShowExam(false)} />;
    }

    if (showResult) {
      return <ExamResult resultData={resultData} onClose={handleCloseResult} setActiveSection={setActiveSection} />;
    }

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
      {!showExam && !showResult ? (
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
        </div>
      ) : (
        <div className="min-h-screen bg-white">
          {renderSection()}
        </div>
      )}
    </ProtectedRoute>
  );
}