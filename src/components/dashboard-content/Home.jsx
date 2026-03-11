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
  const [examHistory, setExamHistory] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
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
        const [subjectsRes, historyRes, practiceRes, statsRes] = await Promise.all([
          fetchWithAuth('/subjects'),
          fetchWithAuth('/history'),
          fetchWithAuth('/practice/history?limit=20'),
          fetchWithAuth('/practice/stats')
        ]);

        let exams = [];
        let practices = [];
        let subjectsList = [];

        if (subjectsRes?.ok) {
          const subjectsData = await subjectsRes.json();
          subjectsList = subjectsData.subjects || [];
          setSubjects(subjectsList);
        }

        if (historyRes?.ok) {
          const historyData = await historyRes.json();
          exams = historyData.exams || [];
          setExamHistory(exams);
          
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

          const examActivities = exams.slice(0, 3).map(exam => {
            const date = exam.date || exam.createdAt;
            const timestamp = date?._seconds ? date._seconds * 1000 : new Date(date).getTime();
            const percentage = exam.percentage || 0;
            const isPassed = percentage >= 50;
            const subjectName = exam.subjects?.[0]?.subjectName || 'Unknown';
            
            return {
              id: exam.id,
              type: 'exam',
              subject: subjectName,
              subjectId: exam.subjects?.[0]?.subjectId,
              score: percentage,
              time: formatTimeAgo(timestamp),
              status: isPassed ? 'passed' : 'failed',
              icon: subjectIcons[subjectName] || '📘'
            };
          });
          
          setRecentActivities(prev => {
            const combined = [...(prev.filter(a => a.type === 'practice')), ...examActivities];
            return combined.sort((a, b) => {
              const timeA = a.time.includes('Just now') ? Date.now() : 0;
              const timeB = b.time.includes('Just now') ? Date.now() : 0;
              return timeB - timeA;
            }).slice(0, 5);
          });
        }

        if (practiceRes?.ok) {
          const practiceData = await practiceRes.json();
          practices = practiceData.practices || [];
          setPracticeHistory(practices);
          
          const practiceActivities = practices.slice(0, 3).map(practice => {
            const timestamp = practice.date?._seconds ? practice.date._seconds * 1000 : new Date().getTime();
            const isPassed = practice.percentage >= 50;
            
            return {
              id: practice.id,
              type: 'practice',
              subject: practice.subjectName,
              subjectId: practice.subjectId,
              score: practice.percentage,
              time: formatTimeAgo(timestamp),
              status: isPassed ? 'passed' : 'failed',
              icon: subjectIcons[practice.subjectName] || '📝'
            };
          });
          
          setRecentActivities(prev => {
            const combined = [...practiceActivities, ...(prev.filter(a => a.type === 'exam'))];
            return combined.sort((a, b) => {
              const timeA = a.time.includes('Just now') ? Date.now() : 0;
              const timeB = b.time.includes('Just now') ? Date.now() : 0;
              return timeB - timeA;
            }).slice(0, 5);
          });
        }

        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          setPracticeStats(statsData.stats);
        }

        // Generate recommendations using the collected data
        if (exams.length > 0 || practices.length > 0 || subjectsList.length > 0) {
          const recommendationsList = [];
          
          subjectsList.forEach(subject => {
            const subjectPractices = practices.filter(p => p.subjectId === subject.id);
            const subjectExams = exams.filter(e => e.subjects?.[0]?.subjectId === subject.id);
            
            const lastPractice = subjectPractices[0];
            const lastExam = subjectExams[0];
            const lastScore = lastPractice?.percentage || lastExam?.percentage || 0;
            
            if (lastScore < 50 && subjectPractices.length > 0) {
              recommendationsList.push({
                id: subject.id,
                name: subject.name,
                icon: subjectIcons[subject.name] || '📘',
                message: `You scored ${lastScore}% in your last ${subject.name} practice. Let's improve!`,
                type: 'weak',
                action: 'Practice Now'
              });
            } else if (subjectPractices.length === 0 && subjectExams.length === 0) {
              recommendationsList.push({
                id: subject.id,
                name: subject.name,
                icon: subjectIcons[subject.name] || '📘',
                message: `You haven't started ${subject.name} yet. Begin your journey!`,
                type: 'new',
                action: 'Start Practice'
              });
            } else if (lastScore >= 70 && lastScore < 90) {
              recommendationsList.push({
                id: subject.id,
                name: subject.name,
                icon: subjectIcons[subject.name] || '📘',
                message: `Great job in ${subject.name}! Can you reach 90%?`,
                type: 'good',
                action: 'Try Again'
              });
            } else if (lastScore >= 90) {
              recommendationsList.push({
                id: subject.id,
                name: subject.name,
                icon: subjectIcons[subject.name] || '📘',
                message: `Excellent! You're mastering ${subject.name}. Try a timed test!`,
                type: 'excellent',
                action: 'Timed Test'
              });
            }
          });

          setRecommendations(recommendationsList.slice(0, 3));

          const weak = [];
          subjectsList.forEach(subject => {
            const subjectPractices = practices.filter(p => 
              p.subjectId === subject.id && p.percentage < 50
            );
            if (subjectPractices.length > 0) {
              weak.push({
                id: subject.id,
                name: subject.name,
                icon: subjectIcons[subject.name] || '📘',
                failedCount: subjectPractices.length,
                lastScore: subjectPractices[0]?.percentage || 0,
                lastAttempt: subjectPractices[0]?.date
              });
            }
          });
          setWeakAreas(weak.slice(0, 3));
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

  const handleRecommendationClick = (recommendation) => {
    localStorage.setItem('practice_subject', JSON.stringify({ 
      id: recommendation.id, 
      name: recommendation.name 
    }));
    
    if (recommendation.action === 'Timed Test') {
      const practiceSetup = {
        id: recommendation.id,
        name: recommendation.name,
        duration: 10,
        questionCount: 20,
        isTimedTest: true
      };
      localStorage.setItem('practice_subject', JSON.stringify(practiceSetup));
      localStorage.setItem('timed_test_config', JSON.stringify({
        duration: 10,
        questionCount: 20
      }));
    }
    
    router.push('/dashboard/practice-setup');
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

  const getProgressPercentage = () => {
    const total = practiceStats?.totalPractices || 0;
    const target = 50;
    return Math.min(Math.round((total / target) * 100), 100);
  };

  const getMotivationalMessage = () => {
    const lastActivity = recentActivities[0];
    if (!lastActivity) return "Start your first practice session today!";
    
    if (lastActivity.score >= 90) return "Outstanding performance! Keep up the excellent work!";
    if (lastActivity.score >= 70) return "Great job! You're making excellent progress.";
    if (lastActivity.score >= 50) return "Good effort! A little more practice will make perfect.";
    return "Every master was once a beginner. Keep practicing!";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">
              Welcome back, {user?.firstName || 'Student'}! 👋
            </h1>
            <p className="text-[#626060] mt-2 font-playfair">
              {getMotivationalMessage()}
            </p>
          </div>
          <div className="bg-[#039994] text-white px-4 py-2 rounded-full text-sm font-playfair">
            Level {Math.floor((practiceStats?.totalPractices || 0) / 10) + 1}
          </div>
        </div>
        {isOffline && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <span>📴</span>
            <span className="text-sm font-playfair">You're offline. Using cached data.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-[#039994] to-[#028a85] rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📊</span>
            <span className="text-2xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-sm opacity-90">Formal Exams</p>
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${Math.min((stats.completed / 20) * 100, 100)}%` }}></div>
          </div>
          <p className="text-xs mt-2 opacity-75">Goal: 20 exams</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">📝</span>
            <span className="text-2xl font-bold">{practiceStats?.totalPractices || 0}</span>
          </div>
          <p className="text-sm opacity-90">Practice Sessions</p>
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${getProgressPercentage()}%` }}></div>
          </div>
          <p className="text-xs mt-2 opacity-75">Target: 50 sessions</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🎯</span>
            <span className="text-2xl font-bold">{stats.averagePercentage}%</span>
          </div>
          <p className="text-sm opacity-90">Average Score</p>
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${stats.averagePercentage}%` }}></div>
          </div>
          <p className="text-xs mt-2 opacity-75">{stats.rank}</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">🏆</span>
            <span className="text-2xl font-bold">{practiceStats?.bestScore || 0}%</span>
          </div>
          <p className="text-sm opacity-90">Best Score</p>
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white" style={{ width: `${practiceStats?.bestScore || 0}%` }}></div>
          </div>
          <p className="text-xs mt-2 opacity-75">{practiceStats?.bestScore >= 90 ? 'Excellent!' : 'Keep pushing!'}</p>
        </motion.div>
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

      {recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">🎯 Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg ${
                  rec.type === 'excellent' ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white' :
                  rec.type === 'good' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white' :
                  rec.type === 'weak' ? 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white' :
                  'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white'
                }`}
                onClick={() => handleRecommendationClick(rec)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{rec.icon}</span>
                  <div>
                    <h3 className="font-bold">{rec.name}</h3>
                    <p className="text-xs opacity-90 mt-1">{rec.message}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition">
                  {rec.action}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E1E1E] font-playfair">Recent Activity</h2>
            <button 
              onClick={() => setActiveSection('performance')}
              className="text-xs text-[#039994] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                     onClick={() => activity.type === 'practice' ? router.push('/dashboard/performance') : null}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      activity.type === 'exam' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {activity.icon}
                    </div>
                    <div>
                      <p className="font-medium text-[#1E1E1E] font-playfair">{activity.subject}</p>
                      <p className="text-xs text-[#626060] font-playfair">
                        {activity.type === 'exam' ? 'Exam' : 'Practice'} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-lg font-playfair ${
                      activity.score >= 70 ? 'text-green-600' : 
                      activity.score >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {activity.score}%
                    </span>
                    <p className="text-xs text-[#626060]">
                      {activity.status === 'passed' ? '✓ Passed' : '⚠️ Needs work'}
                    </p>
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
          <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Quick Practice</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {popularSubjects.map((subject, index) => {
              const practiceScore = practiceHistory
                .filter(p => p.subjectId === subject.id)
                .sort((a, b) => new Date(b.date._seconds * 1000) - new Date(a.date._seconds * 1000))[0]?.percentage;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    localStorage.setItem('practice_subject', JSON.stringify(subject));
                    router.push('/dashboard/practice-setup');
                  }}
                  className="p-3 border border-gray-200 rounded-lg hover:border-[#039994] hover:bg-[#E6FFFA] transition-all text-left relative"
                >
                  {practiceScore !== undefined && (
                    <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      practiceScore >= 70 ? 'bg-green-500' :
                      practiceScore >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{subject.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-[#1E1E1E] font-playfair">{subject.name}</div>
                      <div className="text-xs text-[#626060] font-playfair">
                        {practiceScore ? `Last: ${practiceScore}%` : `${subject.questionCount} Qs`}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setActiveSection('exams')}
            className="w-full py-2 text-[#039994] border border-[#039994] rounded-lg hover:bg-[#E6FFFA] transition-colors text-sm font-playfair"
          >
            View All Subjects
          </button>
        </div>
      </div>

      {practiceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">📊 Practice Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#626060]">Total Questions Attempted</span>
                  <span className="font-bold">{practiceStats.totalQuestions || 0}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#039994]" style={{ width: `${Math.min((practiceStats.totalQuestions / 500) * 100, 100)}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#626060]">Correct Answers</span>
                  <span className="font-bold text-green-600">{practiceStats.totalCorrect || 0}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${(practiceStats.totalCorrect / (practiceStats.totalQuestions || 1)) * 100}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#039994]">{practiceStats.bestScore}%</div>
                  <div className="text-xs text-[#626060]">Best Score</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-[#039994]">{practiceStats.averagePercentage}%</div>
                  <div className="text-xs text-[#626060]">Average</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">📈 Subject Breakdown</h2>
            <div className="space-y-3">
              {practiceStats.bySubject && Object.entries(practiceStats.bySubject).slice(0, 4).map(([subject, data], idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{subjectIcons[subject] || '📘'}</span>
                    <span className="text-sm font-medium">{subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          data.averagePercentage >= 70 ? 'bg-green-500' :
                          data.averagePercentage >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${data.averagePercentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold w-12 text-right">{data.averagePercentage}%</span>
                  </div>
                </div>
              ))}
              {(!practiceStats.bySubject || Object.keys(practiceStats.bySubject).length === 0) && (
                <p className="text-center text-[#626060] py-4">No practice data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-[#039994] to-[#028a85] rounded-xl p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-2 font-playfair">Ready to Level Up?</h3>
            <p className="text-sm opacity-90 font-playfair">
              {practiceStats?.averagePercentage >= 70 
                ? "You're doing great! Try timed tests to challenge yourself."
                : "Practice makes perfect. Keep going and you'll improve!"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setActiveSection('timed-tests')}
              className="px-6 py-3 bg-white text-[#039994] rounded-lg font-playfair text-sm font-[600] hover:bg-gray-100 transition"
            >
              Try Timed Tests
            </button>
            <button
              onClick={() => setActiveSection('exams')}
              className="px-6 py-3 border border-white text-white rounded-lg font-playfair text-sm font-[600] hover:bg-white/10 transition"
            >
              Browse Subjects
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <div className="text-2xl font-bold font-playfair">{stats.completed}</div>
            <div className="text-xs opacity-90 font-playfair">Exams</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">{practiceStats?.totalPractices || 0}</div>
            <div className="text-xs opacity-90 font-playfair">Practices</div>
          </div>
          <div>
            <div className="text-2xl font-bold font-playfair">
              {practiceStats?.totalQuestions || 0}
            </div>
            <div className="text-xs opacity-90 font-playfair">Questions</div>
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