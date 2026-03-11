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
    totalPractice: 0,
    averageScore: 0,
    streak: 0,
    bestScore: 0
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
        const [examHistoryRes, practiceStatsRes, performanceRes] = await Promise.all([
          fetchWithAuth('/history'),
          fetchWithAuth('/practice/stats'),
          fetchWithAuth('/performance/summary')
        ]);
        
        let examHistory = [];
        let practiceStats = {};
        let performanceData = {};
        
        if (examHistoryRes?.ok) {
          const data = await examHistoryRes.json();
          examHistory = data.exams || [];
        }
        
        if (practiceStatsRes?.ok) {
          const data = await practiceStatsRes.json();
          practiceStats = data.stats || {};
        }
        
        if (performanceRes?.ok) {
          const data = await performanceRes.json();
          performanceData = data.performance || {};
        }
        
        const totalExams = examHistory.length;
        const totalPractice = practiceStats.totalPractices || 0;
        const avgScore = Math.round(performanceData.averagePercentage || performanceData.averageScore || 0);
        const bestScore = practiceStats.bestScore || 0;
        const streak = Math.min(totalExams + totalPractice, 7);
        
        setStats({
          totalExams,
          totalPractice,
          averageScore: avgScore,
          streak,
          bestScore
        });
        
        const achievementsList = generateAchievements(examHistory, practiceStats, totalExams, totalPractice, avgScore, streak, bestScore);
        setAchievements(achievementsList);
      } else {
        const cachedAchievements = getOfflineData('achievements');
        if (cachedAchievements) {
          setAchievements(cachedAchievements);
        }
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const generateAchievements = (examHistory, practiceStats, totalExams, totalPractice, avgScore, streak, bestScore) => {
    const achievementsList = [
      { 
        id: 1, 
        title: 'First Exam Completed', 
        description: 'Complete your first practice exam', 
        icon: '🎯', 
        achieved: totalExams >= 1, 
        progress: totalExams >= 1 ? 1 : 0,
        target: 1,
        date: totalExams >= 1 ? new Date().toISOString().split('T')[0] : null,
        points: 50 
      },
      { 
        id: 2, 
        title: 'Speed Demon', 
        description: 'Complete an exam in half the allotted time', 
        icon: '⚡', 
        achieved: false, 
        progress: 0,
        target: 1,
        points: 100 
      },
      { 
        id: 3, 
        title: 'Perfect Score', 
        description: 'Score 100% on any exam or practice', 
        icon: '💯', 
        achieved: bestScore >= 100, 
        progress: bestScore >= 100 ? 1 : 0,
        target: 1,
        date: bestScore >= 100 ? new Date().toISOString().split('T')[0] : null,
        points: 200 
      },
      { 
        id: 4, 
        title: 'Consistent Performer', 
        description: 'Complete 10 exams with 80%+ score', 
        icon: '📈', 
        achieved: totalExams >= 10 && avgScore >= 80, 
        progress: totalExams >= 10 ? 10 : totalExams,
        target: 10,
        points: 150 
      },
      { 
        id: 5, 
        title: 'Practice Master', 
        description: 'Complete 20 practice sessions', 
        icon: '📝', 
        achieved: totalPractice >= 20, 
        progress: totalPractice >= 20 ? 20 : totalPractice,
        target: 20,
        points: 150 
      },
      { 
        id: 6, 
        title: 'Exam Warrior', 
        description: 'Complete 25 formal exams', 
        icon: '⚔️', 
        achieved: totalExams >= 25, 
        progress: totalExams >= 25 ? 25 : totalExams,
        target: 25,
        points: 200 
      },
      { 
        id: 7, 
        title: 'Weekend Warrior', 
        description: 'Complete 3 exams in one weekend', 
        icon: '🏋️', 
        achieved: totalExams >= 3, 
        progress: totalExams >= 3 ? 3 : totalExams,
        target: 3,
        date: totalExams >= 3 ? new Date().toISOString().split('T')[0] : null,
        points: 125 
      },
      { 
        id: 8, 
        title: 'Study Streak', 
        description: 'Practice for 7 consecutive days', 
        icon: '🔥', 
        achieved: streak >= 7, 
        progress: streak,
        target: 7,
        points: 100 
      },
      { 
        id: 9, 
        title: 'Top 10%', 
        description: 'Rank in top 10% globally', 
        icon: '🏆', 
        achieved: avgScore >= 80, 
        progress: avgScore >= 80 ? 100 : avgScore,
        target: 80,
        points: 250 
      },
      { 
        id: 10, 
        title: 'Quick Learner', 
        description: 'Improve score by 20% in a week', 
        icon: '📚', 
        achieved: false, 
        progress: 0,
        target: 20,
        points: 150 
      },
      { 
        id: 11, 
        title: 'Practice Marathon', 
        description: 'Complete 50 practice sessions', 
        icon: '🏃', 
        achieved: totalPractice >= 50, 
        progress: totalPractice >= 50 ? 50 : totalPractice,
        target: 50,
        points: 250 
      },
      { 
        id: 12, 
        title: 'Master of All', 
        description: 'Attempt exams in all subjects', 
        icon: '🎓', 
        achieved: false, 
        progress: 0,
        target: 5,
        points: 300 
      },
      { 
        id: 13, 
        title: 'Bronze Collector', 
        description: 'Earn 500 points', 
        icon: '🥉', 
        achieved: false, 
        progress: 0,
        target: 500,
        points: 0 
      },
      { 
        id: 14, 
        title: 'Silver Champion', 
        description: 'Earn 1000 points', 
        icon: '🥈', 
        achieved: false, 
        progress: 0,
        target: 1000,
        points: 0 
      },
      { 
        id: 15, 
        title: 'Gold Legend', 
        description: 'Earn 2000 points', 
        icon: '🥇', 
        achieved: false, 
        progress: 0,
        target: 2000,
        points: 0 
      },
    ];

    // Calculate points based on achievements
    let totalPoints = 0;
    achievementsList.forEach(a => {
      if (a.achieved) totalPoints += a.points;
    });

    // Update rank achievements
    achievementsList[12].achieved = totalPoints >= 500;
    achievementsList[12].progress = Math.min(totalPoints, 500);
    achievementsList[13].achieved = totalPoints >= 1000;
    achievementsList[13].progress = Math.min(totalPoints, 1000);
    achievementsList[14].achieved = totalPoints >= 2000;
    achievementsList[14].progress = Math.min(totalPoints, 2000);

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

  const nextLevelPoints = totalPoints % 500 === 0 ? 500 : 500 - (totalPoints % 500);
  const level = Math.floor(totalPoints / 500) + 1;

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
          <div className="text-4xl font-bold mb-2">Level {level}</div>
          <div className="text-purple-100">Current Level</div>
          <div className="mt-4">
            <div className="h-2 bg-purple-400 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white" 
                style={{ width: `${(totalPoints % 500) / 5}%` }}
              ></div>
            </div>
            <div className="text-xs text-purple-200 mt-2">{nextLevelPoints} points to next level</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => {
          const progressPercentage = achievement.target ? Math.min((achievement.progress / achievement.target) * 100, 100) : 0;
          
          return (
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

              {achievement.target && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{Math.min(achievement.progress, achievement.target)}/{achievement.target}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${achievement.achieved ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

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
                      <span>Next milestone</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 font-playfair">🎁 Points Rewards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`text-center p-4 rounded-lg border ${totalPoints >= 500 ? 'bg-white border-green-200' : 'bg-white border-blue-100 opacity-50'}`}>
            <div className="text-2xl mb-2">🏅</div>
            <div className="font-medium text-blue-700">500 pts</div>
            <div className="text-xs text-gray-600">Bronze Badge</div>
          </div>
          <div className={`text-center p-4 rounded-lg border ${totalPoints >= 1000 ? 'bg-white border-green-200' : 'bg-white border-blue-100 opacity-50'}`}>
            <div className="text-2xl mb-2">🥈</div>
            <div className="font-medium text-blue-700">1000 pts</div>
            <div className="text-xs text-gray-600">Silver Badge</div>
          </div>
          <div className={`text-center p-4 rounded-lg border ${totalPoints >= 2000 ? 'bg-white border-green-200' : 'bg-white border-blue-100 opacity-50'}`}>
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-medium text-blue-700">2000 pts</div>
            <div className="text-xs text-gray-600">Gold Badge</div>
          </div>
          <div className={`text-center p-4 rounded-lg border ${totalPoints >= 5000 ? 'bg-white border-green-200' : 'bg-white border-blue-100 opacity-50'}`}>
            <div className="text-2xl mb-2">👑</div>
            <div className="font-medium text-blue-700">5000 pts</div>
            <div className="text-xs text-gray-600">Platinum Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}