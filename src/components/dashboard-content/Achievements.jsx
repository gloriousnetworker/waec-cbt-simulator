// components/dashboard-content/Achievements.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const resultsResponse = await fetchWithAuth('/results/all');
        const performanceResponse = await fetchWithAuth('/performance/summary');
        
        let examResults = [];
        let performanceData = {};
        
        if (resultsResponse && resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          examResults = resultsData.results || [];
        }
        
        if (performanceResponse && performanceResponse.ok) {
          const perfData = await performanceResponse.json();
          performanceData = perfData.performance || {};
        }
        
        const totalExams = performanceData.totalExams || 0;
        const avgScore = Math.round(performanceData.averagePercentage || performanceData.averageScore || 0);
        const streak = Math.min(totalExams, 7);
        
        setStats({ totalExams, averageScore: avgScore, streak });
        
        const achievementsList = generateAchievements(examResults, totalExams, avgScore, streak);
        setAchievements(achievementsList);
      } else {
        const cachedAchievements = getOfflineData('achievements');
        if (cachedAchievements) {
          setAchievements(cachedAchievements);
        }
        setStats({ totalExams: 0, averageScore: 0, streak: 0 });
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = (examResults, totalExams, avgScore, streak) => {
    const achievementsList = [
      { 
        id: 1, 
        title: 'First Exam Completed', 
        description: 'Complete your first practice exam', 
        icon: '🎯', 
        achieved: totalExams >= 1, 
        date: totalExams >= 1 ? new Date().toISOString().split('T')[0] : null,
        points: 50 
      },
      { 
        id: 2, 
        title: 'Speed Demon', 
        description: 'Complete an exam in half the allotted time', 
        icon: '⚡', 
        achieved: false, 
        target: 'Complete a timed exam', 
        points: 100 
      },
      { 
        id: 3, 
        title: 'Perfect Score', 
        description: 'Score 100% on any exam', 
        icon: '💯', 
        achieved: examResults.some(r => (r.percentage || r.score) >= 100), 
        date: examResults.some(r => (r.percentage || r.score) >= 100) ? new Date().toISOString().split('T')[0] : null,
        points: 200 
      },
      { 
        id: 4, 
        title: 'Consistent Performer', 
        description: 'Complete 10 exams with 80%+ score', 
        icon: '📈', 
        achieved: totalExams >= 10 && avgScore >= 80, 
        target: `${Math.min(totalExams, 10)}/10 exams`, 
        points: 150 
      },
      { 
        id: 5, 
        title: 'Subject Master', 
        description: 'Achieve 90%+ in all subjects', 
        icon: '👨‍🎓', 
        achieved: false, 
        target: 'Complete all subjects with 90%+', 
        points: 300 
      },
      { 
        id: 6, 
        title: 'Early Bird', 
        description: 'Complete 5 exams before 8 AM', 
        icon: '🌅', 
        achieved: false, 
        target: '0/5 completed', 
        points: 75 
      },
      { 
        id: 7, 
        title: 'Weekend Warrior', 
        description: 'Complete 3 exams in one weekend', 
        icon: '🏋️', 
        achieved: totalExams >= 3, 
        date: totalExams >= 3 ? new Date().toISOString().split('T')[0] : null,
        points: 125 
      },
      { 
        id: 8, 
        title: 'Study Streak', 
        description: 'Practice for 7 consecutive days', 
        icon: '🔥', 
        achieved: streak >= 7, 
        target: `${streak}/7 days`, 
        points: 100 
      },
      { 
        id: 9, 
        title: 'Top 10%', 
        description: 'Rank in top 10% globally', 
        icon: '🏆', 
        achieved: avgScore >= 80, 
        target: avgScore >= 80 ? 'Achieved' : `Current: ${avgScore}%`, 
        points: 250 
      },
      { 
        id: 10, 
        title: 'Quick Learner', 
        description: 'Improve score by 20% in a week', 
        icon: '📚', 
        achieved: false, 
        target: 'Complete more exams', 
        points: 150 
      },
      { 
        id: 11, 
        title: 'Exam Marathon', 
        description: 'Complete 5 exams in one day', 
        icon: '🏃', 
        achieved: false, 
        target: '0/5 completed', 
        points: 200 
      },
      { 
        id: 12, 
        title: 'All Subjects', 
        description: 'Attempt exams in all subjects', 
        icon: '🎓', 
        achieved: false, 
        target: 'Complete all available subjects', 
        points: 175 
      },
    ];

    return achievementsList;
  };

  const totalPoints = achievements.filter(a => a.achieved).reduce((sum, a) => sum + a.points, 0);
  const achievedCount = achievements.filter(a => a.achieved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Achievements</h1>
        <p className="text-[#626060] mt-2 font-playfair">Track your accomplishments and earn rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-[#039994] to-[#028a85] rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{achievedCount}</div>
          <div className="text-teal-100">Achievements Unlocked</div>
          <div className="mt-4 text-sm text-teal-200">Out of {achievements.length} total</div>
        </div>

        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{totalPoints}</div>
          <div className="text-green-100">Total Points</div>
          <div className="mt-4 text-sm text-green-200">Earn more to unlock rewards</div>
        </div>

        <div className="bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">Level {Math.floor(totalPoints / 500) + 1}</div>
          <div className="text-purple-100">Current Level</div>
          <div className="mt-4">
            <div className="h-2 bg-purple-400 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4"></div>
            </div>
            <div className="text-xs text-purple-200 mt-2">{totalPoints % 500}/500 points to next level</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ y: -4 }}
            className={`rounded-xl p-5 ${achievement.achieved ? 'bg-white border border-green-200 shadow-sm' : 'bg-gray-50 border border-gray-200'}`}
          >
            <div className="flex items-start mb-4">
              <div className={`text-3xl p-3 rounded-lg ${achievement.achieved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {achievement.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`font-bold ${achievement.achieved ? 'text-gray-800' : 'text-gray-600'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${achievement.achieved ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {achievement.achieved ? '✓ Achieved' : 'In Progress'}
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{achievement.points} pts</div>
                <div className="text-xs text-gray-500">
                  {achievement.achieved ? (
                    <span>Earned: {achievement.date || new Date().toLocaleDateString()}</span>
                  ) : (
                    <span>{achievement.target}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 font-playfair">🎁 Points Rewards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🏅</div>
            <div className="font-medium text-blue-700">500 pts</div>
            <div className="text-xs text-gray-600">Bronze Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🥈</div>
            <div className="font-medium text-blue-700">1000 pts</div>
            <div className="text-xs text-gray-600">Silver Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-medium text-blue-700">2000 pts</div>
            <div className="text-xs text-gray-600">Gold Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">👑</div>
            <div className="font-medium text-blue-700">5000 pts</div>
            <div className="text-xs text-gray-600">Platinum Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}