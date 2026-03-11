// components/dashboard-content/Home.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardHome({ setActiveSection }) {
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
  const [weakAreas, setWeakAreas] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
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
        const [subjectsRes, historyRes, practiceStatsRes, performanceRes] = await Promise.all([
          fetchWithAuth('/subjects'),
          fetchWithAuth('/history'),
          fetchWithAuth('/practice/stats'),
          fetchWithAuth('/performance/summary')
        ]);

        if (subjectsRes?.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData.subjects || []);
        }

        if (historyRes?.ok) {
          const historyData = await historyRes.json();
          const exams = historyData.exams || [];
          
          const completedExams = exams.filter(e => e.status === 'completed');
          const totalScore = completedExams.reduce((sum, e) => sum + (e.percentage || 0), 0);
          const avgPercentage = completedExams.length > 0 ? Math.round(totalScore / completedExams.length) : 0;
          
          let rank = 'Top 100%';
          if (avgPercentage >= 80) rank = 'Top 10%';
          else if (avgPercentage >= 70) rank = 'Top 20%';
          else if (avgPercentage >= 60) rank = 'Top 30%';
          else if (avgPercentage >= 50) rank = 'Top 40%';

          setStats(prev => ({
            ...prev,
            totalExams: exams.length,
            completed: completedExams.length,
            averageScore: avgPercentage,
            averagePercentage: avgPercentage,
            timeSpent: `${Math.floor((completedExams.length * 2) / 60)}h ${(completedExams.length * 2) % 60}m`,
            streak: Math.min(completedExams.length, 7),
            rank: rank
          }));

          const activities = exams.slice(0, 5).map(exam => {
            const date = exam.endTime || exam.createdAt;
            const timestamp = date._seconds ? date._seconds * 1000 : new Date(date).getTime();
            const percentage = exam.percentage || 0;
            const isPassed = percentage >= 50;
            
            return {
              id: exam.id,
              title: exam.title,
              subject: exam.subjects?.[0]?.subjectName || 'Unknown',
              subjectId: exam.subjects?.[0]?.subjectId,
              score: percentage,
              time: formatTimeAgo(timestamp),
              status: isPassed ? 'passed' : 'failed',
              examType: 'Exam'
            };
          });
          setRecentActivities(activities);

          if (subjectsData?.subjects) {
            const weak = [];
            subjectsData.subjects.forEach(subject => {
              const subjectExams = exams.filter(e => 
                e.subjects?.some(s => s.subjectId === subject.id) && e.percentage < 50
              );
              if (subjectExams.length > 0) {
                weak.push({
                  id: subject.id,
                  name: subject.name,
                  icon: subjectIcons[subject.name] || '📘',
                  failedCount: subjectExams.length,
                  lastScore: subjectExams[0]?.percentage || 0
                });
              }
            });
            setWeakAreas(weak.slice(0, 3));
          }
        }

        if (practiceStatsRes?.ok) {
          const statsData = await practiceStatsRes.json();
          setPracticeStats(statsData.stats);
        }

        if (performanceRes?.ok) {
          const performanceData = await performanceRes.json();
          if (performanceData.performance) {
            const perf = performanceData.performance;
            setStats(prev => ({
              ...prev,
              averagePercentage: Math.round(perf.averagePercentage || perf.averageScore || 0)
            }));
          }
        }
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) setSubjects(cachedSubjects);
        
        const cachedActivities = getOfflineData('recentActivities');
        if (cachedActivities) setRecentActivities(cachedActivities);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return 'Long ago';
  };

  const handlePracticeWeakArea = (subjectId, subjectName) => {
    localStorage.setItem('practice_subject', JSON.stringify({ id: subjectId, name: subjectName }));
    router.push('/dashboard/practice-setup');
  };

  const handleContinueExam = (examId) => {
    router.push(`/dashboard/exam-room?examId=${examId}`);
  };

  const quickActions = [
    { title: 'Start Practice', icon: '📝', color: 'border-[#039994] text-[#039994] hover:bg-[#E8F8F6]', action: () => setActiveSection('exams') },
    { title: 'Timed Test', icon: '⏱️', color: 'border-[#10B981] text-[#10B981] hover:bg-[#D1FAE5]', action: () => setActiveSection('timed-tests') },
    { title: 'View Performance', icon: '📊', color: 'border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#EDE9FE]', action: () => setActiveSection('performance') },
    { title: 'Achievements', icon: '🏆', color: 'border-[#F59E0B] text-[#F59E0B] hover:bg-[#FEF3C7]', action: () => setActiveSection('achievements') },
  ];

  const popularSubjects = subjects.slice(0, 6).map(subject => ({
    id: subject.id,
    name: subject.name,
    icon: subjectIcons[subject.name] || '📘',
    questionCount: subject.questionCount || 50
  }));

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
          You've completed {stats.completed} exams and {practiceStats?.totalPractices || 0} practice sessions. Keep up the great work!
        </p>
        {isOffline && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span>📴</span>
            <span className="text-sm font-playfair">You're offline. Using cached data.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Formal Exams', value: stats.completed, icon: '📚' },
          { label: 'Practice Sessions', value: practiceStats?.totalPractices || 0, icon: '📝' },
          { label: 'Avg Score', value: `${stats.averagePercentage}%`, icon: '🎯' },
          { label: 'Best Score', value: practiceStats?.bestScore ? `${practiceStats.bestScore}%` : '0%', icon: '🏆' },
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

      {weakAreas.length > 0 && (
        <div className="mb-8 p-6 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-xl border border-yellow-300">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 font-playfair flex items-center gap-2">
            <span>⚠️</span> Areas That Need Improvement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakAreas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{area.icon}</span>
                  <div>
                    <p className="font-medium text-[#1E1E1E] font-playfair">{area.name}</p>
                    <p className="text-xs text-red-600 font-playfair">Failed {area.failedCount} time(s)</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePracticeWeakArea(area.id, area.name)}
                  className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Recent Exam Activity</h2>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'passed' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.status === 'passed' ? '✓' : '⚠️'}
                    </div>
                    <div>
                      <p className="font-medium text-[#1E1E1E] font-playfair">{activity.subject}</p>
                      <p className="text-xs text-[#626060] font-playfair">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold font-playfair ${
                      activity.score >= 70 ? 'text-green-600' : 
                      activity.score >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {activity.score}%
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No recent exam activity. Start an exam to see your progress.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Quick Practice</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {popularSubjects.map((subject, index) => (
              <button
                key={index}
                onClick={() => {
                  localStorage.setItem('practice_subject', JSON.stringify(subject));
                  router.push('/dashboard/practice-setup');
                }}
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
                onClick={() => {
                  localStorage.setItem('practice_subject', JSON.stringify({ id: subject.id, name: subject.name }));
                  router.push('/dashboard/practice-setup');
                }}
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
            <div className="text-2xl font-bold font-playfair">{practiceStats?.totalPractices || 0}</div>
            <div className="text-xs opacity-90 font-playfair">Practice Sessions</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">{practiceStats?.averagePercentage || 0}%</div>
            <div className="text-xs opacity-90 font-playfair">Practice Avg</div>
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