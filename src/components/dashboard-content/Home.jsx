'use client';

import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  homeContainer,
  homeHeader,
  homeTitle,
  homeSubtitle,
  homeStatsGrid,
  homeStatCard,
  homeStatCardTop,
  homeStatCardIcon,
  homeStatCardValue,
  homeStatCardLabel,
  homeActionsGrid,
  homeActionButton,
  homeActionIcon,
  homeActionTitle,
  homeContentGrid,
  homeCard,
  homeCardTitle,
  homeActivityItem,
  homeActivityLeft,
  homeActivityIcon,
  homeActivitySubject,
  homeActivityTime,
  homeActivityScore,
  homeActivityContinue,
  homeSubjectGrid,
  homeSubjectButton,
  homeSubjectInner,
  homeSubjectIcon,
  homeSubjectName,
  homeSubjectCount,
  homeViewAllButton,
  homeBanner,
  homeBannerContent,
  homeBannerTitle,
  homeBannerText,
  homeBannerActions,
  homeBannerButtonPrimary,
  homeBannerButtonSecondary,
  homeBannerStats,
  homeBannerStatItem,
  homeBannerStatValue,
  homeBannerStatLabel
} from '../styles';

export default function DashboardHome({ setActiveSection, onStartExam }) {
  const { user } = useAuth();
  const [stats] = useState({
    totalExams: 24,
    completed: 18,
    averageScore: 78,
    timeSpent: '45h 30m',
    streak: 7,
    rank: 'Top 15%'
  });

  const recentActivities = [
    { subject: 'Mathematics', score: 85, time: '2 hours ago', status: 'completed', subjectId: 'mathematics' },
    { subject: 'English Language', score: 72, time: 'Yesterday', status: 'completed', subjectId: 'english' },
    { subject: 'Physics', score: 0, time: 'In progress', status: 'active', subjectId: 'physics' },
    { subject: 'Chemistry', score: 90, time: '3 days ago', status: 'completed', subjectId: 'chemistry' },
  ];

  const quickActions = [
    { title: 'Start New Exam', icon: '📝', color: 'border-[#039994] text-[#039994] hover:bg-[#E8F8F6]', action: () => setActiveSection('exams') },
    { title: 'Timed Practice', icon: '⏱️', color: 'border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]', action: () => setActiveSection('timed-tests') },
    { title: 'View Performance', icon: '📊', color: 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]', action: () => setActiveSection('performance') },
    { title: 'Past Questions', icon: '📚', color: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]', action: () => setActiveSection('past-questions') },
  ];

  const popularSubjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '🧮' },
    { id: 'english', name: 'English', icon: '📖' },
    { id: 'physics', name: 'Physics', icon: '⚛️' },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
    { id: 'biology', name: 'Biology', icon: '🧬' },
    { id: 'economics', name: 'Economics', icon: '📈' }
  ];

  const handleQuickStart = (subjectId) => {
    onStartExam({ subject: subjectId, examType: 'practice' });
  };

  const handleContinueActivity = (activity) => {
    if (activity.status === 'active') {
      onStartExam({ subject: activity.subjectId, examType: 'practice' });
    }
  };

  return (
    <div className={homeContainer}>
      <div className={homeHeader}>
        <h1 className={homeTitle}>
          Welcome back, {user?.name || 'Student'}! 👋
        </h1>
        <p className={homeSubtitle}>
          Continue your journey to excellence. {stats.completed} exams completed.
        </p>
      </div>

      <div className={homeStatsGrid}>
        {[
          { label: 'Total Exams', value: stats.totalExams, icon: '📚' },
          { label: 'Completed', value: stats.completed, icon: '📈' },
          { label: 'Avg Score', value: `${stats.averageScore}%`, icon: '🎯' },
          { label: 'Time Spent', value: stats.timeSpent, icon: '⏱️' },
          { label: 'Day Streak', value: stats.streak, icon: '🔥' },
          { label: 'Global Rank', value: stats.rank, icon: '🏆' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={homeStatCard}
          >
            <div className={homeStatCardTop}>
              <span className={homeStatCardIcon}>{stat.icon}</span>
              <span className={homeStatCardValue}>{stat.value}</span>
            </div>
            <p className={homeStatCardLabel}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className={homeActionsGrid}>
        {quickActions.map((action, index) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`${homeActionButton} ${action.color}`}
          >
            <div className={homeActionIcon}>{action.icon}</div>
            <h3 className={homeActionTitle}>{action.title}</h3>
          </motion.button>
        ))}
      </div>

      <div className={homeContentGrid}>
        <div className={homeCard}>
          <h2 className={homeCardTitle}>Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className={homeActivityItem}>
                <div className={homeActivityLeft}>
                  <div className={`${homeActivityIcon} ${activity.status === 'completed' ? 'bg-[#D1FAE5] text-[#10B981]' : 'bg-[#DBEAFE] text-[#3B82F6]'}`}>
                    {activity.status === 'completed' ? '✓' : '▶️'}
                  </div>
                  <div>
                    <p className={homeActivitySubject}>{activity.subject}</p>
                    <p className={homeActivityTime}>{activity.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.score > 0 ? (
                    <span className={homeActivityScore}>{activity.score}%</span>
                  ) : (
                    <button
                      onClick={() => handleContinueActivity(activity)}
                      className={homeActivityContinue}
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={homeCard}>
          <h2 className={homeCardTitle}>Quick Start Subjects</h2>
          <div className={homeSubjectGrid}>
            {popularSubjects.map((subject, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(subject.id)}
                className={homeSubjectButton}
              >
                <div className={homeSubjectInner}>
                  <span className={homeSubjectIcon}>{subject.icon}</span>
                  <div>
                    <div className={homeSubjectName}>{subject.name}</div>
                    <div className={homeSubjectCount}>50 Qs</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveSection('exams')}
            className={homeViewAllButton}
          >
            View All Subjects
          </button>
        </div>
      </div>

      <div className={homeBanner}>
        <div className={homeBannerContent}>
          <div>
            <h3 className={homeBannerTitle}>Ready to Ace Your Exams?</h3>
            <p className={homeBannerText}>
              Practice makes perfect. Start with a subject you want to improve.
            </p>
          </div>
          <div className={homeBannerActions}>
            <button
              onClick={() => handleQuickStart('mathematics')}
              className={homeBannerButtonPrimary}
            >
              Start Mathematics
            </button>
            <button
              onClick={() => handleQuickStart('english')}
              className={homeBannerButtonSecondary}
            >
              Start English
            </button>
          </div>
        </div>
        
        <div className={homeBannerStats}>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>{stats.completed}</div>
            <div className={homeBannerStatLabel}>Exams Taken</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>{stats.averageScore}%</div>
            <div className={homeBannerStatLabel}>Average Score</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>{stats.streak} days</div>
            <div className={homeBannerStatLabel}>Study Streak</div>
          </div>
          <div className={homeBannerStatItem}>
            <div className={homeBannerStatValue}>{stats.rank}</div>
            <div className={homeBannerStatLabel}>Global Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}