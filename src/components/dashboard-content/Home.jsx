'use client';

import { useStudentAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardHome({ setActiveSection, onStartExam }) {
  const { user, fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalExams: 0,
    completed: 0,
    averageScore: 0,
    averagePercentage: 0,
    timeSpent: '0h 0m',
    streak: 0,
    rank: 'Top 100%'
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const subjectIcons = {
    Mathematics: '🧮',
    English: '📖',
    Physics: '⚛️',
    Chemistry: '🧪',
    Biology: '🧬',
    Economics: '📈',
    Geography: '🗺️',
    Government: '🏛️',
    'Christian Religious Knowledge': '✝️',
    'Islamic Religious Knowledge': '☪️',
    'Literature in English': '📚',
    Commerce: '💼',
    'Financial Accounting': '💰',
    'Agricultural Science': '🌾',
    'Civic Education': '🏛️',
    'Data Processing': '💻'
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        // Remove the extra /api/student prefix - subjects is already the full endpoint
        const subjectsResponse = await fetchWithAuth('/subjects');
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData.subjects || []);

        const performanceResponse = await fetchWithAuth('/exam/performance/summary');
        const performanceData = await performanceResponse.json();

        const resultsResponse = await fetchWithAuth('/exam/results/all');
        const resultsData = await resultsResponse.json();

        if (performanceData.performance) {
          const perf = performanceData.performance;
          const avgPercentage = perf.averagePercentage || perf.averageScore || 0;
          
          let rank = 'Top 100%';
          if (avgPercentage >= 80) rank = 'Top 10%';
          else if (avgPercentage >= 70) rank = 'Top 20%';
          else if (avgPercentage >= 60) rank = 'Top 30%';
          else if (avgPercentage >= 50) rank = 'Top 40%';

          setStats({
            totalExams: perf.totalExams || 0,
            completed: perf.totalExams || 0,
            averageScore: Math.round(perf.averageScore || 0),
            averagePercentage: Math.round(avgPercentage),
            timeSpent: `${Math.floor((perf.totalExams * 2) / 60)}h ${(perf.totalExams * 2) % 60}m`,
            streak: Math.min(perf.totalExams, 7),
            rank: rank
          });
        }

        if (resultsData.results) {
          const activities = resultsData.results.slice(0, 4).map(result => ({
            id: result.id,
            subject: result.subject,
            subjectId: result.subjectId,
            score: result.percentage || result.score,
            time: formatTimeAgo(result.date._seconds),
            status: 'completed',
            examType: result.examType
          }));
          setRecentActivities(activities);
        }
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) {
          setSubjects(cachedSubjects);
        }
        
        const cachedResults = getOfflineData('recentActivities');
        if (cachedResults) {
          setRecentActivities(cachedResults);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return 'Long ago';
  };

  const quickActions = [
    { 
      title: 'Start New Examination', 
      icon: '📝', 
      color: 'border-[#039994] text-[#039994] hover:bg-[#E8F8F6]', 
      action: () => setActiveSection('exams') 
    },
    { 
      title: 'Timed Practice', 
      icon: '⏱️', 
      color: 'border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]', 
      action: () => {
        setActiveSection('exams');
        setTimeout(() => {
          const timedTab = document.querySelector('[data-tab="timed"]');
          if (timedTab) timedTab.click();
        }, 100);
      } 
    },
    { 
      title: 'View Performance', 
      icon: '📊', 
      color: 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]', 
      action: () => setActiveSection('performance') 
    },
    { 
      title: 'Mock Exam', 
      icon: '🎯', 
      color: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]', 
      action: () => {
        setActiveSection('exams');
        setTimeout(() => {
          const mockTab = document.querySelector('[data-tab="mock"]');
          if (mockTab) mockTab.click();
        }, 100);
      } 
    },
  ];

  const popularSubjects = subjects.slice(0, 6).map(subject => ({
    id: subject.id,
    name: subject.name,
    icon: subjectIcons[subject.name] || '📘',
    questionCount: subject.questionCount || 50
  }));

  const handleQuickStart = (subject) => {
    const duration = subject.examType === 'WAEC' ? 120 : 60;
    router.push(`/dashboard/exam-room?subjectId=${subject.id}&subject=${encodeURIComponent(subject.name)}&type=practice&duration=${duration}&questionCount=${subject.questionCount || 50}`);
  };

  const handleContinueActivity = (activity) => {
    const subject = subjects.find(s => s.id === activity.subjectId);
    if (subject) {
      const duration = subject.examType === 'WAEC' ? 120 : 60;
      router.push(`/dashboard/exam-room?subjectId=${subject.id}&subject=${encodeURIComponent(subject.name)}&type=practice&duration=${duration}&questionCount=${subject.questionCount || 50}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">
          Welcome back, {user?.firstName || 'Student'}! 👋
        </h1>
        <p className="text-[#626060] mt-2 font-playfair">
          Continue your journey to excellence. {stats.completed} exams completed.
        </p>
        {isOffline && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span>📴</span>
            <span className="text-sm font-playfair">You're offline. Some features may be limited.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total Exams', value: stats.totalExams, icon: '📚' },
          { label: 'Completed', value: stats.completed, icon: '📈' },
          { label: 'Avg Score', value: `${stats.averagePercentage}%`, icon: '🎯' },
          { label: 'Time Spent', value: stats.timeSpent, icon: '⏱️' },
          { label: 'Day Streak', value: stats.streak, icon: '🔥' },
          { label: 'Global Rank', value: stats.rank, icon: '🏆' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xl font-bold text-[#1E1E1E] font-playfair">{stat.value}</span>
            </div>
            <p className="text-xs text-[#626060] font-playfair">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, index) => (
          <motion.button
            key={action.title}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={action.action}
            className={`p-4 rounded-xl border-2 ${action.color} transition-all bg-white`}
          >
            <div className="text-3xl mb-2">{action.icon}</div>
            <h3 className="text-sm font-[600] font-playfair">{action.title}</h3>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'completed' ? '✓' : '▶️'}
                    </div>
                    <div>
                      <p className="font-medium text-[#1E1E1E] font-playfair">{activity.subject}</p>
                      <p className="text-xs text-[#626060] font-playfair">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.score > 0 ? (
                      <span className={`font-bold font-playfair ${
                        activity.score >= 70 ? 'text-green-600' : 
                        activity.score >= 50 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {activity.score}%
                      </span>
                    ) : (
                      <button
                        onClick={() => handleContinueActivity(activity)}
                        className="text-[#039994] hover:text-[#028a85] text-sm font-playfair"
                      >
                        Continue →
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No recent activity. Start an exam to see your progress.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Quick Start Subjects</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {popularSubjects.map((subject, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(subject)}
                className="p-3 border border-gray-200 rounded-lg hover:border-[#039994] hover:bg-[#E6FFFA] transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{subject.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-[#1E1E1E] font-playfair">{subject.name}</div>
                    <div className="text-xs text-[#626060] font-playfair">{subject.questionCount} Qs</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setActiveSection('exams')}
            className="w-full py-2 text-[#039994] border border-[#039994] rounded-lg hover:bg-[#E6FFFA] transition-colors text-sm font-playfair"
          >
            View All Subjects
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#039994] to-[#028a85] rounded-xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 font-playfair">Ready to Ace Your Exams?</h3>
            <p className="text-sm opacity-90 font-playfair">
              Practice makes perfect. Start with a subject you want to improve.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {subjects.slice(0, 2).map((subject, index) => (
              <button
                key={index}
                onClick={() => handleQuickStart(subject)}
                className={`px-6 py-3 rounded-lg font-playfair text-sm font-[600] transition-all ${
                  index === 0 
                    ? 'bg-white text-[#039994] hover:bg-gray-100' 
                    : 'border border-white text-white hover:bg-white/10'
                }`}
              >
                Start {subject.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <div className="text-2xl font-bold font-playfair">{stats.completed}</div>
            <div className="text-xs opacity-90 font-playfair">Exams Taken</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">{stats.averagePercentage}%</div>
            <div className="text-xs opacity-90 font-playfair">Average Score</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">{stats.streak} days</div>
            <div className="text-xs opacity-90 font-playfair">Study Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">{stats.rank}</div>
            <div className="text-xs opacity-90 font-playfair">Global Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}