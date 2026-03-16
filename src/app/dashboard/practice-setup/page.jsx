// app/dashboard/practice-setup/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { ChevronLeft, Timer, BookOpen, Sliders } from 'lucide-react';

function PracticeSetupContent() {
  const router = useRouter();
  const { fetchWithAuth } = useStudentAuth();
  const [subject, setSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(0);
  const [enableTimer, setEnableTimer] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isTimedTest, setIsTimedTest] = useState(false);

  useEffect(() => {
    const storedSubject = localStorage.getItem('practice_subject');
    const timedConfig = localStorage.getItem('timed_test_config');
    if (storedSubject) {
      const parsed = JSON.parse(storedSubject);
      setSubject(parsed);
      if (parsed.isTimedTest || timedConfig) {
        setIsTimedTest(true);
        setEnableTimer(true);
        if (parsed.duration) setTimeLimit(parsed.duration);
        if (parsed.questionCount) setQuestionCount(parsed.questionCount);
        if (parsed.difficulty && parsed.difficulty !== 'all') setDifficulty(parsed.difficulty.toLowerCase());
      }
    } else {
      toast.error('No subject selected');
      router.push('/dashboard');
    }
    return () => { localStorage.removeItem('timed_test_config'); };
  }, []);

  const handleStartPractice = async () => {
    if (!subject) return;
    setLoading(true);
    const toastId = toast.loading('Preparing practice session...');
    try {
      let url = `/practice?subjectId=${subject.id}&count=${questionCount}`;
      if (difficulty !== 'all') url += `&difficulty=${difficulty}`;
      const res = await fetchWithAuth(url);
      if (res?.ok) {
        const data = await res.json();
        if (!data.questions || data.questions.length === 0) {
          toast.error(`No questions available for ${subject.name}. Try a different subject or difficulty.`, { id: toastId });
          setLoading(false);
          return;
        }
        localStorage.setItem('practice_session', JSON.stringify({
          id: Date.now().toString(), subjectId: subject.id, subjectName: subject.name,
          questions: data.questions, totalQuestions: data.questions.length,
          currentQuestion: 0, answers: {}, startTime: new Date().toISOString(),
          timeLimit: enableTimer ? timeLimit * 60 : 0, difficulty, status: 'in_progress', isTimedTest
        }));
        toast.success('Practice session ready!', { id: toastId });
        router.push('/dashboard/practice-room');
      } else {
        toast.error('Failed to load practice questions', { id: toastId });
      }
    } catch {
      toast.error('Failed to start practice', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-muted">
        <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted py-8 px-4 pb-safe">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card-md overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-primary to-brand-primary-dk p-6 sm:p-8 text-white">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <h1 className="text-2xl font-bold font-playfair mb-1">
              {isTimedTest ? 'Timed Test Setup' : 'Practice Setup'}
            </h1>
            <p className="text-sm opacity-90">
              {isTimedTest
                ? `Ready for your ${subject.duration}-minute ${subject.name} challenge`
                : `Customize your practice session for ${subject.name}`}
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {!isTimedTest && (
              <>
                {/* Question Count */}
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-2 flex items-center gap-1.5">
                    <BookOpen size={13} className="text-brand-primary" /> Number of Questions
                  </label>
                  <input
                    type="range" min="5" max="50" step="5" value={questionCount}
                    onChange={e => setQuestionCount(parseInt(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-brand-primary"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-content-muted">5 questions</span>
                    <span className="text-sm font-bold text-brand-primary">{questionCount} questions</span>
                    <span className="text-xs text-content-muted">50 questions</span>
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-xs font-semibold text-content-primary mb-2 flex items-center gap-1.5">
                    <Sliders size={13} className="text-brand-primary" /> Difficulty Level
                  </label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 bg-white"
                  >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                {/* Timer Toggle */}
                <div className="flex items-center justify-between p-4 bg-surface-muted rounded-xl border border-border">
                  <div>
                    <p className="text-sm font-semibold text-content-primary">Enable Timer</p>
                    <p className="text-xs text-content-muted">Challenge yourself with time limits</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={enableTimer} onChange={e => setEnableTimer(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-subtle rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
                  </label>
                </div>

                {/* Time limit picker */}
                {enableTimer && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-xs font-semibold text-content-primary mb-2 flex items-center gap-1.5">
                      <Timer size={13} className="text-brand-primary" /> Time Limit
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 30, 45, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => setTimeLimit(mins)}
                          className={`px-3 py-2 rounded-xl text-sm font-semibold transition-all min-h-[40px] ${
                            timeLimit === mins ? 'bg-brand-primary text-white' : 'bg-surface-muted border border-border text-content-secondary hover:border-brand-primary'
                          }`}
                        >
                          {mins}m
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}

            {/* Timed test config display */}
            {isTimedTest && (
              <div className="bg-brand-primary-lt p-5 rounded-xl border border-brand-primary/20">
                <h3 className="text-sm font-bold text-brand-primary mb-3 font-playfair">Test Configuration</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Duration', val: `${subject.duration} minutes` },
                    { label: 'Questions', val: subject.questionCount },
                    { label: 'Difficulty', val: subject.difficulty },
                  ].map(({ label, val }) => (
                    <p key={label} className="text-content-secondary">
                      {label}: <span className="font-bold text-content-primary">{val}</span>
                    </p>
                  ))}
                  <p className="text-content-muted text-xs">Timer starts automatically · Auto-submit when time expires</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-semibold text-content-primary mb-3">Session Summary</h3>
              <div className="bg-surface-muted p-4 rounded-xl space-y-2">
                {[
                  { label: 'Subject',    val: subject.name },
                  { label: 'Questions',  val: questionCount },
                  !isTimedTest && { label: 'Difficulty', val: <span className="capitalize">{difficulty}</span> },
                  enableTimer && { label: 'Time Limit', val: `${timeLimit} minutes` },
                ].filter(Boolean).map(({ label, val }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-content-secondary">{label}</span>
                    <span className="font-semibold text-content-primary">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => router.back()} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleStartPractice} disabled={loading} className="btn-primary flex-1 text-sm">
                {loading ? 'Starting...' : 'Start Practice'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeSetupPage() {
  return (
    <StudentProtectedRoute>
      <PracticeSetupContent />
    </StudentProtectedRoute>
  );
}
