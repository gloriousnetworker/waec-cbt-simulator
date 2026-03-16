// components/dashboard-content/TimedTests.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { Timer, Trophy, BarChart3, Zap } from 'lucide-react';

const subjectIcons = {
  Mathematics: '🧮', English: '📖', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', Economics: '📈', Geography: '🗺️', Government: '🏛️',
  'Christian Religious Knowledge': '✝️', 'Islamic Religious Knowledge': '☪️',
  'Literature in English': '📚', Commerce: '💼', 'Financial Accounting': '💰',
  'Agricultural Science': '🌾', 'Civic Education': '🏛️', 'Data Processing': '💻'
};

const subjectColors = {
  Mathematics: 'bg-info', English: 'bg-success', Physics: 'bg-purple-500',
  Chemistry: 'bg-danger', Biology: 'bg-success-dark', Economics: 'bg-warning',
  Geography: 'bg-brand-cyan', Government: 'bg-indigo-500',
  'Christian Religious Knowledge': 'bg-purple-400', 'Islamic Religious Knowledge': 'bg-emerald-500',
  'Literature in English': 'bg-pink-500', Commerce: 'bg-orange-500',
  'Financial Accounting': 'bg-success', 'Agricultural Science': 'bg-lime-500',
  'Civic Education': 'bg-sky-500', 'Data Processing': 'bg-indigo-500'
};

const difficultyConfig = {
  Easy:   { badge: 'bg-success-light text-success',      bar: 'bg-success' },
  Medium: { badge: 'bg-warning-light text-warning-dark', bar: 'bg-warning' },
  Hard:   { badge: 'bg-danger-light text-danger',        bar: 'bg-danger' },
};

export default function TimedTests() {
  const [subjects, setSubjects] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  const getTimedTestsForSubject = (subject) => [
    {
      id: `${subject.id}-quick`, name: `Quick ${subject.name} Challenge`, subjectId: subject.id,
      subjectName: subject.name, icon: subjectIcons[subject.name] || '📘',
      color: subjectColors[subject.name] || 'bg-brand-primary',
      duration: 5, questionCount: 10, difficulty: 'Easy',
      description: `Test your basic ${subject.name} skills`
    },
    {
      id: `${subject.id}-medium`, name: `${subject.name} Sprint`, subjectId: subject.id,
      subjectName: subject.name, icon: subjectIcons[subject.name] || '📘',
      color: subjectColors[subject.name] || 'bg-brand-primary',
      duration: 10, questionCount: 20, difficulty: 'Medium',
      description: `Intermediate ${subject.name} problems`
    },
    {
      id: `${subject.id}-hard`, name: `${subject.name} Marathon`, subjectId: subject.id,
      subjectName: subject.name, icon: subjectIcons[subject.name] || '📘',
      color: subjectColors[subject.name] || 'bg-brand-primary',
      duration: 15, questionCount: 30, difficulty: 'Hard',
      description: `Advanced ${subject.name} challenge`
    },
  ];

  useEffect(() => {
    fetchSubjects();
    const history = JSON.parse(localStorage.getItem('practice_history') || '[]');
    setPracticeHistory(history);
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const res = await fetchWithAuth('/subjects');
        if (res?.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
        }
      } else {
        const cached = getOfflineData('studentSubjects');
        if (cached) setSubjects(cached);
      }
    } catch {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimedTest = (test) => {
    localStorage.setItem('practice_subject', JSON.stringify({
      id: test.subjectId, name: test.subjectName, duration: test.duration,
      questionCount: test.questionCount, isTimedTest: true, testName: test.name,
      difficulty: test.difficulty.toLowerCase()
    }));
    localStorage.setItem('timed_test_config', JSON.stringify({
      duration: test.duration, questionCount: test.questionCount, difficulty: test.difficulty.toLowerCase()
    }));
    router.push('/dashboard/practice-setup');
  };

  const getBestScore = (subjectId) => {
    const matches = practiceHistory.filter(p => p.subjectId === subjectId);
    return matches.length === 0 ? null : Math.max(...matches.map(p => p.percentage));
  };
  const getAttempts = (subjectId) => practiceHistory.filter(p => p.subjectId === subjectId).length;

  const totalSessions = practiceHistory.length;
  const avgScore = totalSessions > 0 ? Math.round(practiceHistory.reduce((s, p) => s + p.percentage, 0) / totalSessions) : 0;
  const bestScore = totalSessions > 0 ? Math.max(...practiceHistory.map(p => p.percentage)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading timed tests...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">Timed Tests</h1>
          <p className="text-sm text-content-secondary mt-1.5">Test your speed and accuracy under pressure</p>
        </div>
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Timer size={48} className="text-content-muted mx-auto mb-4" />
          <h3 className="text-base font-bold text-content-primary mb-2 font-playfair">No Subjects Available</h3>
          <p className="text-sm text-content-secondary">You haven&apos;t been assigned any subjects yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">Timed Tests</h1>
        <p className="text-sm text-content-secondary mt-1.5">Test your speed and accuracy under pressure</p>
      </div>

      {/* Subject test cards */}
      {subjects.map(subject => {
        const tests = getTimedTestsForSubject(subject);
        const best = getBestScore(subject.id);
        const attempts = getAttempts(subject.id);
        return (
          <div key={subject.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{subjectIcons[subject.name] || '📘'}</span>
              <h2 className="text-lg font-bold text-content-primary font-playfair">{subject.name}</h2>
              {attempts > 0 && (
                <span className="text-xs bg-brand-primary-lt text-brand-primary px-2.5 py-1 rounded-full font-medium">
                  {attempts} attempt{attempts !== 1 ? 's' : ''}
                </span>
              )}
              {best !== null && (
                <span className="text-xs bg-success-light text-success px-2.5 py-1 rounded-full font-medium">
                  Best: {best}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tests.map(test => {
                const dc = difficultyConfig[test.difficulty];
                return (
                  <motion.div
                    key={test.id}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-xl border border-border overflow-hidden shadow-card hover:border-brand-primary hover:shadow-card-md transition-all"
                  >
                    <div className={`h-1.5 ${test.color}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1 pr-2">
                          <h3 className="text-sm font-bold text-content-primary font-playfair leading-tight">{test.name}</h3>
                          <p className="text-xs text-content-muted mt-1">{test.description}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${dc.badge}`}>
                          {test.difficulty}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="bg-surface-muted p-3 rounded-xl text-center">
                          <p className="text-lg font-bold font-mono text-brand-primary">{test.duration}<span className="text-xs font-sans">min</span></p>
                          <p className="text-xs text-content-muted">Duration</p>
                        </div>
                        <div className="bg-surface-muted p-3 rounded-xl text-center">
                          <p className="text-lg font-bold font-mono text-brand-primary">{test.questionCount}</p>
                          <p className="text-xs text-content-muted">Questions</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartTimedTest(test)}
                        className="btn-primary w-full text-sm"
                      >
                        <Zap size={14} />
                        Start Test
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Progress Banner */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-6 sm:p-8 text-white mt-4">
        <h3 className="text-base font-bold mb-5 font-playfair flex items-center gap-2">
          <Timer size={18} /> Your Practice Progress
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { val: totalSessions, label: 'Total Sessions', icon: BarChart3 },
            { val: `${avgScore}%`, label: 'Average Score', icon: BarChart3 },
            { val: `${bestScore}%`, label: 'Best Score', icon: Trophy },
          ].map(({ val, label, icon: Icon }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
              <Icon size={28} className="opacity-80 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold font-playfair">{val}</p>
                <p className="text-sm opacity-90">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
