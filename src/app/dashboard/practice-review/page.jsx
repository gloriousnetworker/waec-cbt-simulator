// app/dashboard/practice-review/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { CheckCircle, XCircle, Circle, ChevronLeft, BarChart3 } from 'lucide-react';

function PracticeReviewContent() {
  const router = useRouter();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('practice_review');
    if (stored) {
      setResults(JSON.parse(stored));
    } else {
      router.push('/dashboard');
    }
  }, []);

  if (!results) return null;

  const getGrade = (pct) => {
    if (pct >= 75) return { grade: 'A', color: 'text-success',       bg: 'bg-success-light' };
    if (pct >= 60) return { grade: 'B', color: 'text-info',          bg: 'bg-info-light' };
    if (pct >= 50) return { grade: 'C', color: 'text-warning-dark',  bg: 'bg-warning-light' };
    if (pct >= 40) return { grade: 'D', color: 'text-danger',        bg: 'bg-danger-light' };
    return              { grade: 'F', color: 'text-danger-dark',    bg: 'bg-danger-light' };
  };

  const grade = getGrade(results.percentage);

  return (
    <div className="min-h-screen bg-surface-muted py-8 px-4 pb-safe">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card-md overflow-hidden border border-border"
        >
          {/* Header banner */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk p-6 sm:p-8 text-white">
            <button
              onClick={() => router.push('/dashboard?section=performance')}
              className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={16} />
              Back to Performance
            </button>
            <h1 className="text-2xl font-bold font-playfair mb-1">Practice Review</h1>
            <p className="text-sm opacity-90">{results.subjectName}</p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Score summary */}
            <div className="flex items-center justify-between mb-6">
              <div className="grid grid-cols-4 gap-4 flex-1">
                {[
                  { label: 'Total',   val: results.totalQuestions, color: 'text-content-primary' },
                  { label: 'Correct', val: results.correct,         color: 'text-success' },
                  { label: 'Wrong',   val: results.wrong,           color: 'text-danger' },
                  { label: 'Score',   val: `${results.percentage}%`, color: grade.color },
                ].map(item => (
                  <div key={item.label} className="text-center p-3 bg-surface-muted rounded-xl">
                    <p className={`text-2xl font-bold font-playfair ${item.color}`}>{item.val}</p>
                    <p className="text-xs text-content-muted mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className={`ml-4 w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center ${grade.bg}`}>
                <span className={`text-3xl font-bold font-playfair ${grade.color}`}>{grade.grade}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-content-secondary mb-1.5">
                <span>Accuracy</span>
                <span className="font-semibold">{results.percentage}%</span>
              </div>
              <div className="h-2.5 bg-surface-subtle rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${results.percentage >= 70 ? 'bg-success' : results.percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}
                  style={{ width: `${results.percentage}%` }}
                />
              </div>
            </div>

            {/* Question-by-question review */}
            {results.questions && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">
                  Question Review
                </h2>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {results.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        q.status === 'correct'  ? 'border-success-light bg-success-light/50' :
                        q.status === 'wrong'    ? 'border-danger-light bg-danger-light/50' :
                        'border-border bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-bold text-content-secondary mt-0.5 w-5 flex-shrink-0">
                          {idx + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-content-primary mb-2">{q.question}</p>
                          {q.selected && (
                            <p className={`text-xs mb-1 font-medium ${q.status === 'correct' ? 'text-success' : 'text-danger'}`}>
                              Your answer: {q.selected}
                            </p>
                          )}
                          {q.status === 'wrong' && (
                            <p className="text-xs text-success font-medium">
                              Correct answer: {q.correctAnswer}
                            </p>
                          )}
                          {q.explanation && q.explanation !== 'No explanation provided' && (
                            <div className="mt-2.5 p-3 bg-white rounded-lg border border-border">
                              <p className="text-xs text-content-secondary leading-relaxed">
                                <span className="font-semibold text-brand-primary">Explanation: </span>
                                {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 mt-0.5">
                          {q.status === 'correct'  && <CheckCircle size={16} className="text-success" />}
                          {q.status === 'wrong'    && <XCircle     size={16} className="text-danger"  />}
                          {q.status === 'unanswered' && <Circle    size={16} className="text-content-muted" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => router.push('/dashboard?section=performance')}
              className="btn-primary w-full text-sm"
            >
              <BarChart3 size={15} />
              Back to Performance
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeReviewPage() {
  return (
    <StudentProtectedRoute>
      <PracticeReviewContent />
    </StudentProtectedRoute>
  );
}
