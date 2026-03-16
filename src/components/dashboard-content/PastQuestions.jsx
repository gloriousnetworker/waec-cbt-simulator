// components/dashboard-content/PastQuestions.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { BookOpen, BarChart3, Calendar, BookMarked } from 'lucide-react';

const subjectIcons = {
  Mathematics: '🧮', English: '📖', Physics: '⚛️', Chemistry: '🧪',
  Biology: '🧬', Economics: '📈', Geography: '🗺️', Government: '🏛️',
  'Christian Religious Knowledge': '✝️', 'Islamic Religious Knowledge': '☪️',
  'Literature in English': '📚', Commerce: '💼', 'Financial Accounting': '💰',
  'Agricultural Science': '🌾', 'Civic Education': '🏛️', 'Data Processing': '💻'
};

export default function PastQuestions() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [pastQuestions, setPastQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const subjectsRes = await fetchWithAuth('/subjects');
        if (subjectsRes?.ok) {
          const data = await subjectsRes.json();
          setSubjects(data.subjects || []);
        }
        const resultsRes = await fetchWithAuth('/results/all');
        if (resultsRes?.ok) {
          const data = await resultsRes.json();
          setPastQuestions((data.results || []).map(r => {
            const date = new Date(r.date._seconds * 1000);
            return {
              id: r.id, year: date.getFullYear().toString(), subject: r.subject,
              subjectId: r.subjectId, paper: 'Past Question',
              type: r.examType === 'practice' ? 'Practice' : 'Exam',
              questions: 50, duration: '2h',
              difficulty: r.percentage >= 70 ? 'Easy' : r.percentage >= 50 ? 'Medium' : 'Hard',
              score: r.percentage || r.score
            };
          }));
        }
      } else {
        const cached = getOfflineData('studentSubjects');
        if (cached) setSubjects(cached);
      }
    } catch {
      toast.error('Failed to load past questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeNow = (subject) => {
    const duration = subject.examType === 'WAEC' ? 120 : 60;
    router.push(`/exam-room?subjectId=${subject.id}&subject=${encodeURIComponent(subject.name)}&type=practice&duration=${duration}&questionCount=${subject.questionCount || 50}`);
  };

  const filteredQuestions = pastQuestions.filter(q =>
    (selectedYear === 'all' || q.year === selectedYear) &&
    (selectedSubject === 'all' || q.subjectId === selectedSubject)
  );

  const subjectOptions = [
    { id: 'all', name: 'All Subjects', icon: '📚', count: filteredQuestions.length },
    ...subjects.map(s => ({ id: s.id, name: s.name, icon: subjectIcons[s.name] || '📘', count: pastQuestions.filter(q => q.subjectId === s.id).length }))
  ];

  const averageScore = pastQuestions.length > 0
    ? Math.round(pastQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / pastQuestions.length) : 0;

  const difficultyBadge = {
    Easy:   'bg-success-light text-success',
    Medium: 'bg-warning-light text-warning-dark',
    Hard:   'bg-danger-light text-danger',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading past questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">Past Questions</h1>
        <p className="text-sm text-content-secondary mt-1.5">Access WAEC past questions from previous years</p>
      </div>

      {/* Year filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['all', ...years].map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
              selectedYear === year
                ? 'bg-brand-primary text-white'
                : 'bg-white border border-border text-content-secondary hover:border-brand-primary'
            }`}
          >
            {year === 'all' ? 'All Years' : year}
          </button>
        ))}
      </div>

      {/* Subject filter */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2 mb-6">
        {subjectOptions.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
              selectedSubject === subject.id
                ? 'bg-brand-primary-lt border-brand-primary'
                : 'bg-white border-border hover:border-brand-primary'
            }`}
          >
            <span className="text-xl mb-1">{subject.icon}</span>
            <span className="text-xs font-medium text-content-secondary text-center truncate w-full">
              {subject.name === 'All Subjects' ? 'All' : subject.name}
            </span>
            <span className="text-xs text-content-muted mt-0.5">{subject.count}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <BookMarked size={48} className="text-content-muted mx-auto mb-4" />
          <h3 className="text-base font-bold text-content-primary mb-2 font-playfair">No Past Questions Found</h3>
          <p className="text-sm text-content-secondary">No past questions match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredQuestions.map(question => {
            const subject = subjects.find(s => s.id === question.subjectId) || { name: question.subject };
            return (
              <motion.div
                key={question.id}
                whileHover={{ y: -3 }}
                className="bg-white rounded-xl border border-border p-5 shadow-card hover:border-brand-primary hover:shadow-card-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${difficultyBadge[question.difficulty] || 'bg-surface-muted text-content-secondary'}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-content-muted">WAEC {question.year}</span>
                    </div>
                    <h3 className="text-base font-bold text-content-primary font-playfair">{question.subject}</h3>
                    <p className="text-xs text-content-secondary">{question.type} Questions</p>
                  </div>
                  <span className="text-3xl flex-shrink-0 ml-3">{subjectIcons[question.subject] || '📘'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { val: question.questions, label: 'Questions' },
                    { val: question.duration,  label: 'Duration' },
                    { val: `${question.score || 0}%`, label: 'Avg. Score' },
                  ].map(({ val, label }) => (
                    <div key={label} className="text-center p-3 bg-surface-muted rounded-xl">
                      <p className="text-base font-bold text-content-primary">{val}</p>
                      <p className="text-xs text-content-muted">{label}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePracticeNow(subject)}
                  className="btn-primary w-full text-sm"
                >
                  <BookOpen size={14} />
                  Practice Now
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats banner */}
      <div className="bg-brand-primary-lt border border-brand-primary/20 rounded-xl p-5">
        <h3 className="text-base font-bold text-brand-primary-dk mb-4 font-playfair flex items-center gap-2">
          <BarChart3 size={16} /> Past Question Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { val: pastQuestions.length, label: 'Total Papers',   icon: BookMarked },
            { val: years.length,         label: 'Years Covered',  icon: Calendar   },
            { val: subjects.length,      label: 'Subjects',       icon: BookOpen   },
            { val: `${averageScore}%`,   label: 'Avg. Score',     icon: BarChart3  },
          ].map(({ val, label, icon: Icon }) => (
            <div key={label} className="text-center p-4 bg-white rounded-xl border border-border">
              <Icon size={20} className="text-brand-primary mx-auto mb-2" />
              <p className="text-xl font-bold text-brand-primary">{val}</p>
              <p className="text-xs text-content-secondary mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
