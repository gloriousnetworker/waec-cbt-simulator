// components/dashboard-content/Home.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { WifiOff, FileText, Timer, BarChart3, Trophy, ChevronRight, TrendingUp, Star } from 'lucide-react';

const subjectIcons = {
  Mathematics: '🧮', English: '📖', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', Economics: '📈', Geography: '🗺️', Government: '🏛️',
  'Christian Religious Knowledge': '✝️', 'Islamic Religious Knowledge': '☪️',
  'Literature in English': '📚', Commerce: '💼', 'Financial Accounting': '💰',
  'Agricultural Science': '🌾', 'Civic Education': '🏛️', 'Data Processing': '💻',
};

// Stat card config — uses brand blue palette with gold for best score
const statCards = [
  { key: 'completed',         label: 'Formal Exams',      icon: FileText,  goal: 20,  gradientFrom: '#1565C0', gradientTo: '#1976D2' },
  { key: 'totalPractices',    label: 'Practice Sessions', icon: TrendingUp,goal: 50,  gradientFrom: '#10B981', gradientTo: '#059669' },
  { key: 'averagePercentage', label: 'Average Score',     icon: BarChart3, goal: 100, gradientFrom: '#1565C0', gradientTo: '#0D47A1', suffix: '%' },
  { key: 'bestScore',         label: 'Best Score',        icon: Star,      goal: 100, gradientFrom: '#FFB300', gradientTo: '#F57C00', suffix: '%', gold: true },
];

const quickActions = [
  { title: 'Start Practice', icon: FileText,  color: 'border-brand-primary text-brand-primary hover:bg-brand-primary-lt', id: 'exams' },
  { title: 'Timed Test',     icon: Timer,     color: 'border-success text-success-dark hover:bg-success-light',         id: 'timed-tests' },
  { title: 'Performance',    icon: BarChart3, color: 'border-info text-info-dark hover:bg-info-light',                  id: 'performance' },
  { title: 'Achievements',   icon: Trophy,    color: 'border-brand-gold text-yellow-600 hover:bg-brand-gold-lt',        id: 'achievements' },
];

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return 'Long ago';
}

export default function DashboardHome({ setActiveSection }) {
  const { user, fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ completed: 0, averagePercentage: 0, rank: 'Top 100%' });
  const [practiceStats, setPracticeStats] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [weakAreas, setWeakAreas] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const [subjectsRes, historyRes, practiceRes, statsRes] = await Promise.all([
          fetchWithAuth('/subjects'),
          fetchWithAuth('/history'),
          fetchWithAuth('/practice/history?limit=20'),
          fetchWithAuth('/practice/stats'),
        ]);

        let exams = [], practices = [], subjectsList = [];

        if (subjectsRes?.ok) {
          const d = await subjectsRes.json();
          subjectsList = d.subjects || [];
          setSubjects(subjectsList);
        }
        if (historyRes?.ok) {
          const d = await historyRes.json();
          exams = d.exams || [];
          const completed = exams.filter(e => e.status === 'completed');
          const avgPct = completed.length ? Math.round(completed.reduce((s, e) => s + (e.percentage || 0), 0) / completed.length) : 0;
          let rank = 'Top 100%';
          if (avgPct >= 80) rank = 'Top 10%';
          else if (avgPct >= 70) rank = 'Top 20%';
          else if (avgPct >= 60) rank = 'Top 30%';
          else if (avgPct >= 50) rank = 'Top 40%';
          setStats({ completed: completed.length, averagePercentage: avgPct, rank });
          const examActivities = exams.slice(0, 3).map(exam => {
            const ts = exam.date?._seconds ? exam.date._seconds * 1000 : new Date(exam.date || exam.createdAt).getTime();
            const subjectName = exam.subjects?.[0]?.subjectName || 'Unknown';
            return { id: exam.id, type: 'exam', subject: subjectName, score: exam.percentage || 0, time: formatTimeAgo(ts), status: (exam.percentage || 0) >= 50 ? 'passed' : 'failed', icon: subjectIcons[subjectName] || '📘' };
          });
          setRecentActivities(prev => [...prev.filter(a => a.type === 'practice'), ...examActivities].slice(0, 5));
        }
        if (practiceRes?.ok) {
          const d = await practiceRes.json();
          practices = d.practices || [];
          setPracticeHistory(practices);
          const practiceActivities = practices.slice(0, 3).map(p => {
            const ts = p.date?._seconds ? p.date._seconds * 1000 : Date.now();
            return { id: p.id, type: 'practice', subject: p.subjectName, score: p.percentage, time: formatTimeAgo(ts), status: p.percentage >= 50 ? 'passed' : 'failed', icon: subjectIcons[p.subjectName] || '📝' };
          });
          setRecentActivities(prev => [...practiceActivities, ...prev.filter(a => a.type === 'exam')].slice(0, 5));
        }
        if (statsRes?.ok) {
          const d = await statsRes.json();
          setPracticeStats(d.stats);
        }

        // Build recommendations
        if (subjectsList.length > 0) {
          const recs = [];
          subjectsList.forEach(sub => {
            const sp = practices.filter(p => p.subjectId === sub.id);
            const se = exams.filter(e => e.subjects?.[0]?.subjectId === sub.id);
            const last = sp[0]?.percentage ?? se[0]?.percentage ?? 0;
            if (last < 50 && sp.length > 0) recs.push({ id: sub.id, name: sub.name, icon: subjectIcons[sub.name] || '📘', message: `Scored ${last}% last time — let's improve!`, type: 'weak', action: 'Practice Now' });
            else if (!sp.length && !se.length) recs.push({ id: sub.id, name: sub.name, icon: subjectIcons[sub.name] || '📘', message: `You haven't started ${sub.name} yet.`, type: 'new', action: 'Start Practice' });
            else if (last >= 70 && last < 90) recs.push({ id: sub.id, name: sub.name, icon: subjectIcons[sub.name] || '📘', message: `Great job! Can you reach 90%?`, type: 'good', action: 'Try Again' });
            else if (last >= 90) recs.push({ id: sub.id, name: sub.name, icon: subjectIcons[sub.name] || '📘', message: `Excellent! Try a timed test.`, type: 'excellent', action: 'Timed Test' });
          });
          setRecommendations(recs.slice(0, 3));

          const weak = subjectsList.flatMap(sub => {
            const failed = practices.filter(p => p.subjectId === sub.id && p.percentage < 50);
            if (!failed.length) return [];
            return [{ id: sub.id, name: sub.name, icon: subjectIcons[sub.name] || '📘', failedCount: failed.length, lastScore: failed[0]?.percentage || 0 }];
          });
          setWeakAreas(weak.slice(0, 3));
        }
      } else {
        const cs = getOfflineData('studentSubjects');
        if (cs) setSubjects(cs);
        const ca = getOfflineData('recentActivities');
        if (ca) setRecentActivities(ca);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeWeakArea = (id, name) => {
    localStorage.setItem('practice_subject', JSON.stringify({ id, name }));
    router.push('/dashboard/practice-setup');
  };

  const handleRecommendationClick = (rec) => {
    const config = { id: rec.id, name: rec.name };
    if (rec.action === 'Timed Test') { config.duration = 10; config.questionCount = 20; config.isTimedTest = true; }
    localStorage.setItem('practice_subject', JSON.stringify(config));
    router.push('/dashboard/practice-setup');
  };

  const popularSubjects = subjects.slice(0, 6).map(s => ({
    id: s.id, name: s.name, icon: subjectIcons[s.name] || '📘', questionCount: s.questionCount || 50,
  }));

  const getMotivationalMessage = () => {
    const last = recentActivities[0];
    if (!last) return 'Start your first practice session today!';
    if (last.score >= 90) return 'Outstanding performance! Keep up the excellent work!';
    if (last.score >= 70) return "Great job! You're making excellent progress.";
    if (last.score >= 50) return 'Good effort! A little more practice will make perfect.';
    return 'Every master was once a beginner. Keep practicing!';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">
            Welcome back, {user?.firstName || 'Student'}! 👋
          </h1>
          <p className="text-sm text-content-secondary mt-1.5">{getMotivationalMessage()}</p>
        </div>
        <div className="flex-shrink-0 ml-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-gold text-brand-navy rounded-full text-xs font-bold shadow-gold">
            <Trophy size={12} />
            Level {Math.floor((practiceStats?.totalPractices || 0) / 10) + 1}
          </span>
        </div>
      </div>

      {/* Offline banner */}
      {isOffline && (
        <div className="offline-banner mb-5">
          <WifiOff size={16} className="flex-shrink-0" />
          <span>You&apos;re offline — showing cached data.</span>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const rawValue = card.key === 'completed' ? stats.completed
            : card.key === 'averagePercentage' ? stats.averagePercentage
            : card.key === 'totalPractices' ? (practiceStats?.totalPractices || 0)
            : (practiceStats?.bestScore || 0);
          const pct = Math.min((rawValue / card.goal) * 100, 100);

          return (
            <motion.div
              key={card.key}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-xl p-4 sm:p-5 text-white"
              style={{ background: `linear-gradient(135deg, ${card.gradientFrom}, ${card.gradientTo})` }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Icon size={16} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-bold font-playfair">
                  {rawValue}{card.suffix || ''}
                </span>
              </div>
              <p className="text-xs font-medium opacity-90 mb-3">{card.label}</p>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs opacity-75 mt-1.5">
                {card.key === 'bestScore'
                  ? rawValue >= 90 ? 'Excellent!' : 'Keep pushing!'
                  : card.key === 'averagePercentage' ? stats.rank
                  : `Goal: ${card.goal} ${card.key === 'totalPractices' ? 'sessions' : 'exams'}`}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button
              key={a.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveSection(a.id)}
              className={`p-4 rounded-xl border-2 ${a.color} transition-all bg-white text-left min-h-[80px]`}
            >
              <Icon size={22} strokeWidth={2} className="mb-2" />
              <span className="text-sm font-semibold block">{a.title}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-bold text-content-primary mb-3 font-playfair flex items-center gap-2">
            <Star size={16} className="text-brand-gold" />
            Recommended for You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => {
              const bg =
                rec.type === 'excellent' ? 'from-success to-success-dark'
                : rec.type === 'good'    ? 'from-info to-info-dark'
                : rec.type === 'weak'    ? 'from-warning to-warning-dark'
                : 'from-brand-primary to-brand-primary-dk';
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => handleRecommendationClick(rec)}
                  className={`rounded-xl p-4 bg-gradient-to-r ${bg} text-white cursor-pointer hover:shadow-card-md transition-all`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{rec.icon}</span>
                    <div>
                      <p className="font-bold text-sm">{rec.name}</p>
                      <p className="text-xs opacity-90 mt-0.5">{rec.message}</p>
                    </div>
                  </div>
                  <button className="w-full py-1.5 bg-white/20 rounded-lg text-xs font-semibold hover:bg-white/30 transition">
                    {rec.action}
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Weak Areas ── */}
      {weakAreas.length > 0 && (
        <div className="mb-6 p-5 bg-warning-light rounded-xl border border-warning-dark/20">
          <h2 className="text-sm font-bold text-warning-dark mb-3 font-playfair flex items-center gap-2">
            ⚠️ Areas Needing Improvement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {weakAreas.map((area) => (
              <div key={area.id} className="bg-white rounded-lg p-3 flex items-center justify-between shadow-card">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{area.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{area.name}</p>
                    <p className="text-xs text-danger">Failed {area.failedCount}×</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePracticeWeakArea(area.id, area.name)}
                  className="px-3 py-1.5 bg-warning text-white text-xs font-semibold rounded-lg hover:bg-warning-dark transition-colors"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Activity + Quick Practice ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-content-primary font-playfair">Recent Activity</h2>
            <button onClick={() => setActiveSection('performance')} className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-0.5">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {recentActivities.length > 0 ? recentActivities.map((a, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 hover:bg-surface-subtle rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${a.type === 'exam' ? 'bg-brand-primary-lt' : 'bg-success-light'}`}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{a.subject}</p>
                    <p className="text-xs text-content-muted">{a.type === 'exam' ? 'Exam' : 'Practice'} · {a.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-base font-bold ${a.score >= 70 ? 'text-success' : a.score >= 50 ? 'text-warning' : 'text-danger'}`}>
                    {a.score}%
                  </span>
                  <p className="text-xs text-content-muted">{a.status === 'passed' ? '✓ Passed' : '⚠ Review'}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-sm text-content-muted">
                No recent activity. Start a practice exam!
              </div>
            )}
          </div>
        </div>

        {/* Quick Practice */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">Quick Practice</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {popularSubjects.map((sub, idx) => {
              const lastScore = practiceHistory.find(p => p.subjectId === sub.id)?.percentage;
              return (
                <button
                  key={idx}
                  onClick={() => { localStorage.setItem('practice_subject', JSON.stringify(sub)); router.push('/dashboard/practice-setup'); }}
                  className="p-3 border border-border rounded-xl hover:border-brand-primary hover:bg-brand-primary-lt transition-all text-left relative"
                >
                  {lastScore !== undefined && (
                    <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${lastScore >= 70 ? 'bg-success' : lastScore >= 50 ? 'bg-warning' : 'bg-danger'}`} />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{sub.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-content-primary truncate">{sub.name}</p>
                      <p className="text-xs text-content-muted">{lastScore != null ? `Last: ${lastScore}%` : `${sub.questionCount} Qs`}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <button onClick={() => setActiveSection('exams')} className="btn-secondary w-full text-sm">
            View All Subjects
          </button>
        </div>
      </div>

      {/* ── Practice Progress ── */}
      {practiceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-white rounded-xl border border-border p-5 shadow-card">
            <h2 className="text-base font-bold text-content-primary mb-4 font-playfair flex items-center gap-2">
              <BarChart3 size={16} className="text-brand-primary" /> Practice Progress
            </h2>
            <div className="space-y-4">
              {[
                { label: 'Questions Attempted', val: practiceStats.totalQuestions || 0, max: 500, color: 'bg-brand-primary' },
                { label: 'Correct Answers',     val: practiceStats.totalCorrect || 0,   max: practiceStats.totalQuestions || 1, color: 'bg-success' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-content-secondary font-medium">{item.label}</span>
                    <span className="font-bold text-content-primary">{item.val}</span>
                  </div>
                  <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { label: 'Best Score', val: `${practiceStats.bestScore || 0}%` },
                  { label: 'Average',    val: `${practiceStats.averagePercentage || 0}%` },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 bg-brand-primary-lt rounded-xl">
                    <p className="text-xl font-bold text-brand-primary font-playfair">{item.val}</p>
                    <p className="text-xs text-content-secondary mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5 shadow-card">
            <h2 className="text-base font-bold text-content-primary mb-4 font-playfair flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-primary" /> Subject Breakdown
            </h2>
            <div className="space-y-3">
              {practiceStats.bySubject && Object.entries(practiceStats.bySubject).slice(0, 5).map(([sub, d], idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{subjectIcons[sub] || '📘'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-content-primary truncate">{sub}</p>
                    <div className="h-1.5 bg-surface-subtle rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.averagePercentage >= 70 ? 'bg-success' : d.averagePercentage >= 50 ? 'bg-warning' : 'bg-danger'}`}
                        style={{ width: `${d.averagePercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-content-primary w-10 text-right flex-shrink-0">{d.averagePercentage}%</span>
                </div>
              ))}
              {(!practiceStats.bySubject || !Object.keys(practiceStats.bySubject).length) && (
                <p className="text-center text-sm text-content-muted py-6">No practice data yet. Start practicing!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA Banner ── */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-5 sm:p-7 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="text-xl font-bold font-playfair mb-1">Ready to Level Up?</h3>
            <p className="text-sm opacity-90">
              {(practiceStats?.averagePercentage || 0) >= 70
                ? "You're doing great! Try timed tests to challenge yourself."
                : 'Practice makes perfect. Every question gets you closer!'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <button onClick={() => setActiveSection('timed-tests')} className="px-5 py-2.5 bg-white text-brand-primary rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors">
              Try Timed Tests
            </button>
            <button onClick={() => setActiveSection('exams')} className="px-5 py-2.5 border border-white/40 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
              Browse Subjects
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/20">
          {[
            { val: stats.completed,                            label: 'Exams' },
            { val: practiceStats?.totalPractices || 0,        label: 'Practices' },
            { val: practiceStats?.totalQuestions || 0,        label: 'Questions' },
            { val: stats.rank,                                 label: 'Global Rank' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <p className="text-2xl font-bold font-playfair">{item.val}</p>
              <p className="text-xs opacity-80 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
