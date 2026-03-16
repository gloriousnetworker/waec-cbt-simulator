// components/dashboard-content/Exams.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { Timer, BookOpen, Shield, AlertCircle } from 'lucide-react';

const subjectIcons = {
  Mathematics: '🧮', English: '📖', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', Economics: '📈', Geography: '🗺️', Government: '🏛️',
  'Christian Religious Knowledge': '✝️', 'Islamic Religious Knowledge': '☪️',
  'Literature in English': '📚', Commerce: '💼', 'Financial Accounting': '💰',
  'Agricultural Science': '🌾', 'Civic Education': '🏛️', 'Data Processing': '💻',
};

const subjectColors = {
  Mathematics: 'bg-info', English: 'bg-success', Physics: 'bg-purple-500',
  Chemistry: 'bg-danger', Biology: 'bg-success-dark', Economics: 'bg-warning',
  Geography: 'bg-brand-cyan', Government: 'bg-indigo-500',
  'Christian Religious Knowledge': 'bg-purple-400', 'Islamic Religious Knowledge': 'bg-emerald-500',
  'Literature in English': 'bg-pink-500', Commerce: 'bg-orange-500',
  'Financial Accounting': 'bg-success', 'Agricultural Science': 'bg-lime-500',
  'Civic Education': 'bg-sky-500', 'Data Processing': 'bg-indigo-500',
};

const examTypes = [
  { id: 'practice', name: 'Practice Exam',     desc: 'Untimed · Explanations included', icon: BookOpen },
  { id: 'mock',     name: 'Mock Exam',          desc: 'Strict WAEC simulation',           icon: Shield },
];

export default function Exams({ setActiveSection }) {
  const [activeTab, setActiveTab] = useState('practice');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({});
  const [practiceStats, setPracticeStats] = useState({});
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const [subjectsRes, perfRes, statsRes] = await Promise.all([
          fetchWithAuth('/subjects'),
          fetchWithAuth('/performance/summary'),
          fetchWithAuth('/practice/stats'),
        ]);
        if (subjectsRes?.ok) { const d = await subjectsRes.json(); setSubjects(d.subjects || []); }
        if (perfRes?.ok)     { const d = await perfRes.json(); setPerformance(d.performance || {}); }
        if (statsRes?.ok)    { const d = await statsRes.json(); setPracticeStats(d.stats || {}); }
      } else {
        const cs = getOfflineData('studentSubjects');
        if (cs) setSubjects(cs);
      }
    } catch (err) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (subject) => {
    if (activeTab === 'practice') {
      localStorage.setItem('practice_subject', JSON.stringify({ id: subject.id, name: subject.name }));
      router.push('/dashboard/practice-setup');
    } else {
      localStorage.setItem('practice_subject', JSON.stringify({ id: subject.id, name: subject.name, isMockExam: true, duration: 60, questionCount: 30 }));
      localStorage.setItem('mock_exam_active', 'true');
      router.push('/dashboard/exam-mock-instructions');
    }
  };

  const getSubjectStats = (name) => {
    const ep = performance.subjects?.[name];
    const pp = practiceStats.bySubject?.[name];
    return {
      bestScore: Math.max(ep?.bestScore || 0, pp?.bestScore || 0),
      attempts:  (ep?.attempts || 0) + (pp?.attempts || 0),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">
          Practice &amp; Mock Exams
        </h1>
        <p className="text-sm text-content-secondary mt-1.5">Select a subject and exam type to begin</p>
      </div>

      {/* ── Tab + Timed Tests CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2">
          {examTypes.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all min-h-[44px] ${
                activeTab === id
                  ? 'border-brand-primary bg-brand-primary-lt text-brand-primary'
                  : 'border-border bg-white text-content-secondary hover:border-brand-primary'
              }`}
            >
              <Icon size={15} strokeWidth={2} />
              {name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setActiveSection('timed-tests')}
          className="btn-primary text-sm flex-shrink-0"
        >
          <Timer size={15} strokeWidth={2.5} />
          Timed Tests
        </button>
      </div>

      {/* ── Subject Grid ── */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-base font-bold text-content-primary mb-2 font-playfair">No Subjects Available</h3>
          <p className="text-sm text-content-secondary">You haven&apos;t been assigned any subjects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          {subjects.map((subject) => {
            const s = getSubjectStats(subject.name);
            return (
              <motion.div
                key={subject.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl border border-border overflow-hidden shadow-card hover:border-brand-primary hover:shadow-card-md transition-all"
              >
                {/* Color bar */}
                <div className={`h-1.5 ${subjectColors[subject.name] || 'bg-brand-primary'}`} />
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl flex-shrink-0">{subjectIcons[subject.name] || '📘'}</span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-content-primary font-playfair leading-tight">{subject.name}</h3>
                      <p className="text-xs text-content-muted mt-0.5">{subject.questionCount || 50} questions · {subject.class}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {[
                      { label: 'Duration', val: subject.duration ? `${Math.floor(subject.duration / 60)}h ${subject.duration % 60}m` : 'Variable' },
                      { label: 'Best Score', val: `${s.bestScore}%`, colored: true, score: s.bestScore },
                      { label: 'Total Attempts', val: s.attempts },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-content-secondary">{item.label}</span>
                        <span className={`font-semibold ${item.colored ? (item.score >= 70 ? 'text-success' : item.score >= 50 ? 'text-warning' : 'text-danger') : 'text-content-primary'}`}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleStartExam(subject)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px] text-white ${
                      activeTab === 'practice' ? 'bg-brand-primary hover:bg-brand-primary-dk' : 'bg-danger hover:bg-danger-dark'
                    }`}
                  >
                    Start {activeTab === 'practice' ? 'Practice' : 'Mock'} Exam
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Instructions Banner ── */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-5 sm:p-7 text-white">
        <h3 className="text-base font-bold mb-4 font-playfair flex items-center gap-2">
          <AlertCircle size={16} /> Exam Instructions
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {[
            'Practice exams: Untimed with detailed explanations',
            'Mock exams: Strict WAEC simulation with fullscreen mode',
            'You cannot navigate away during mock exams',
            '3 tab switches in mock exam = auto-submit',
            'All questions should be attempted before submission',
            'For timed tests, visit the Timed Tests section',
          ].map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm">
              <span className="opacity-60 mt-0.5">•</span>
              <span className="opacity-90">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
