// components/dashboard-content/Achievements.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { Trophy, Star, Zap, CheckCircle, Circle } from 'lucide-react';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({ totalExams: 0, totalPractice: 0, averageScore: 0, streak: 0, bestScore: 0 });
  const [loading, setLoading] = useState(true);
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  useEffect(() => { fetchAchievements(); }, []);

  const generateAchievements = (examHistory, practiceStats, totalExams, totalPractice, avgScore, streak, bestScore) => {
    const list = [
      { id: 1,  title: 'First Exam Completed',    description: 'Complete your first practice exam',         icon: '🎯', achieved: totalExams >= 1,               progress: Math.min(totalExams, 1),       target: 1,   date: totalExams >= 1 ? new Date().toISOString().split('T')[0] : null, points: 50  },
      { id: 2,  title: 'Speed Demon',              description: 'Complete an exam in half the allotted time', icon: '⚡', achieved: false,                          progress: 0,                             target: 1,   points: 100 },
      { id: 3,  title: 'Perfect Score',            description: 'Score 100% on any exam or practice',        icon: '💯', achieved: bestScore >= 100,               progress: bestScore >= 100 ? 1 : 0,     target: 1,   date: bestScore >= 100 ? new Date().toISOString().split('T')[0] : null, points: 200 },
      { id: 4,  title: 'Consistent Performer',     description: 'Complete 10 exams with 80%+ score',         icon: '📈', achieved: totalExams >= 10 && avgScore >= 80, progress: Math.min(totalExams, 10),  target: 10,  points: 150 },
      { id: 5,  title: 'Practice Master',          description: 'Complete 20 practice sessions',             icon: '📝', achieved: totalPractice >= 20,            progress: Math.min(totalPractice, 20),  target: 20,  points: 150 },
      { id: 6,  title: 'Exam Warrior',             description: 'Complete 25 formal exams',                  icon: '⚔️', achieved: totalExams >= 25,              progress: Math.min(totalExams, 25),     target: 25,  points: 200 },
      { id: 7,  title: 'Weekend Warrior',          description: 'Complete 3 exams in one weekend',           icon: '🏋️', achieved: totalExams >= 3,              progress: Math.min(totalExams, 3),      target: 3,   date: totalExams >= 3 ? new Date().toISOString().split('T')[0] : null, points: 125 },
      { id: 8,  title: 'Study Streak',             description: 'Practice for 7 consecutive days',           icon: '🔥', achieved: streak >= 7,                    progress: Math.min(streak, 7),          target: 7,   points: 100 },
      { id: 9,  title: 'Top 10%',                  description: 'Rank in top 10% globally',                  icon: '🏆', achieved: avgScore >= 80,                 progress: Math.min(avgScore, 80),       target: 80,  points: 250 },
      { id: 10, title: 'Quick Learner',            description: 'Improve score by 20% in a week',            icon: '📚', achieved: false,                          progress: 0,                             target: 20,  points: 150 },
      { id: 11, title: 'Practice Marathon',        description: 'Complete 50 practice sessions',             icon: '🏃', achieved: totalPractice >= 50,            progress: Math.min(totalPractice, 50),  target: 50,  points: 250 },
      { id: 12, title: 'Master of All',            description: 'Attempt exams in all subjects',             icon: '🎓', achieved: false,                          progress: 0,                             target: 5,   points: 300 },
      { id: 13, title: 'Bronze Collector',         description: 'Earn 500 points',                           icon: '🥉', achieved: false,                          progress: 0,                             target: 500, points: 0   },
      { id: 14, title: 'Silver Champion',          description: 'Earn 1000 points',                          icon: '🥈', achieved: false,                          progress: 0,                             target: 1000,points: 0   },
      { id: 15, title: 'Gold Legend',              description: 'Earn 2000 points',                          icon: '🥇', achieved: false,                          progress: 0,                             target: 2000,points: 0   },
    ];
    let totalPts = list.reduce((s, a) => s + (a.achieved ? a.points : 0), 0);
    list[12].achieved = totalPts >= 500;  list[12].progress = Math.min(totalPts, 500);
    list[13].achieved = totalPts >= 1000; list[13].progress = Math.min(totalPts, 1000);
    list[14].achieved = totalPts >= 2000; list[14].progress = Math.min(totalPts, 2000);
    return list;
  };

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const [examHistoryRes, practiceStatsRes, performanceRes] = await Promise.all([
          fetchWithAuth('/history'), fetchWithAuth('/practice/stats'), fetchWithAuth('/performance/summary')
        ]);
        let examHistory = [], practiceStats = {}, performanceData = {};
        if (examHistoryRes?.ok) { const d = await examHistoryRes.json(); examHistory = d.exams || []; }
        if (practiceStatsRes?.ok) { const d = await practiceStatsRes.json(); practiceStats = d.stats || {}; }
        if (performanceRes?.ok) { const d = await performanceRes.json(); performanceData = d.performance || {}; }
        const totalExams = examHistory.length;
        const totalPractice = practiceStats.totalPractices || 0;
        const avgScore = Math.round(performanceData.averagePercentage || performanceData.averageScore || 0);
        const bestScore = practiceStats.bestScore || 0;
        const streak = Math.min(totalExams + totalPractice, 7);
        setStats({ totalExams, totalPractice, averageScore: avgScore, streak, bestScore });
        setAchievements(generateAchievements(examHistory, practiceStats, totalExams, totalPractice, avgScore, streak, bestScore));
      } else {
        const cached = getOfflineData('achievements');
        if (cached) setAchievements(cached);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = achievements.filter(a => a.achieved).reduce((s, a) => s + a.points, 0);
  const achievedCount = achievements.filter(a => a.achieved).length;
  const level = Math.floor(totalPoints / 500) + 1;
  const nextLevelPoints = 500 - (totalPoints % 500);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">Achievements</h1>
        <p className="text-sm text-content-secondary mt-1.5">Track your accomplishments and earn rewards</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <p className="text-sm font-medium opacity-90">Unlocked</p>
          </div>
          <p className="text-4xl font-bold font-playfair">{achievedCount}</p>
          <p className="text-sm opacity-80 mt-1">of {achievements.length} total</p>
        </div>

        <div className="bg-gradient-to-r from-success to-success-dark rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Star size={20} />
            </div>
            <p className="text-sm font-medium opacity-90">Total Points</p>
          </div>
          <p className="text-4xl font-bold font-playfair">{totalPoints}</p>
          <p className="text-sm opacity-80 mt-1">Earn more to unlock rewards</p>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy size={20} />
            </div>
            <p className="text-sm font-medium opacity-90">Current Level</p>
          </div>
          <p className="text-4xl font-bold font-playfair">Level {level}</p>
          <div className="mt-3">
            <div className="h-1.5 bg-purple-400/50 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${(totalPoints % 500) / 5}%` }} />
            </div>
            <p className="text-xs opacity-80 mt-1.5">{nextLevelPoints} pts to next level</p>
          </div>
        </div>
      </div>

      {/* Achievement grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {achievements.map(a => {
          const pct = a.target ? Math.min((a.progress / a.target) * 100, 100) : 0;
          return (
            <motion.div
              key={a.id}
              whileHover={{ y: -3 }}
              className={`rounded-xl p-5 border transition-all ${
                a.achieved
                  ? 'bg-white border-success-light shadow-card'
                  : 'bg-surface-muted border-border'
              }`}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`text-2xl p-2.5 rounded-xl flex-shrink-0 ${a.achieved ? 'bg-success-light' : 'bg-surface-subtle'}`}>
                  {a.icon}
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm font-bold leading-tight ${a.achieved ? 'text-content-primary' : 'text-content-secondary'}`}>
                    {a.title}
                  </h3>
                  <p className="text-xs text-content-muted mt-1">{a.description}</p>
                </div>
              </div>

              {a.target && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-content-muted">Progress</span>
                    <span className="font-semibold text-content-secondary">{Math.min(a.progress, a.target)}/{a.target}</span>
                  </div>
                  <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${a.achieved ? 'bg-success' : 'bg-brand-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  a.achieved ? 'bg-success-light text-success' : 'bg-brand-primary-lt text-brand-primary'
                }`}>
                  {a.achieved ? <><CheckCircle size={10} /> Achieved</> : <><Circle size={10} /> In Progress</>}
                </span>
                <div className="text-right">
                  <p className="text-sm font-bold text-content-primary">{a.points} pts</p>
                  <p className="text-xs text-content-muted">
                    {a.achieved ? `Earned: ${a.date || new Date().toLocaleDateString()}` : 'Next milestone'}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Points Rewards */}
      <div className="bg-brand-primary-lt border border-brand-primary/20 rounded-xl p-5">
        <h3 className="text-base font-bold text-brand-primary-dk mb-4 font-playfair flex items-center gap-2">
          <Zap size={16} /> Points Rewards
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { pts: 500,  label: 'Bronze Badge',   icon: '🏅', unlocked: totalPoints >= 500  },
            { pts: 1000, label: 'Silver Badge',   icon: '🥈', unlocked: totalPoints >= 1000 },
            { pts: 2000, label: 'Gold Badge',     icon: '🥇', unlocked: totalPoints >= 2000 },
            { pts: 5000, label: 'Platinum Rank',  icon: '👑', unlocked: totalPoints >= 5000 },
          ].map(({ pts, label, icon, unlocked }) => (
            <div key={pts} className={`text-center p-4 rounded-xl border transition-all ${unlocked ? 'bg-white border-success-light shadow-card' : 'bg-white/50 border-border opacity-60'}`}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className={`text-sm font-bold ${unlocked ? 'text-brand-primary' : 'text-content-secondary'}`}>{pts} pts</p>
              <p className="text-xs text-content-muted">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
