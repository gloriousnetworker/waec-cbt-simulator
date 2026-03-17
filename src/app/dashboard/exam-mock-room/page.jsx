// app/dashboard/exam-mock-room/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { Keyboard, AlertTriangle } from 'lucide-react';

function MockExamRoomContent() {
  const router = useRouter();
  const { user, fetchWithAuth } = useStudentAuth();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState('');
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitCountdown, setAutoSubmitCountdown] = useState(null);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [fullscreenAttempted, setFullscreenAttempted] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);
  const violationTimeoutRef = useRef(null);
  const fullscreenCheckInterval = useRef(null);
  const toastShownRef = useRef(false);
  const autoAdvanceTimer = useRef(null);
  const warningDismissedRef = useRef(false);

  useEffect(() => {
    const storedSession = localStorage.getItem('practice_session');
    const mockActive = localStorage.getItem('mock_exam_active');
    if (storedSession && mockActive) {
      try {
        const parsed = JSON.parse(storedSession);
        setSession(parsed);
        setAnswers(parsed.answers || {});
        setCurrentQuestion(parsed.currentQuestion || 0);
        setLoading(false);
      } catch {
        toast.error('Invalid session data');
        router.push('/dashboard');
      }
    } else {
      toast.error('No mock exam session found');
      router.push('/dashboard');
    }
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (violationTimeoutRef.current) clearTimeout(violationTimeoutRef.current);
      if (fullscreenCheckInterval.current) clearInterval(fullscreenCheckInterval.current);
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!session || examSubmitted || !fullscreenAttempted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { handleAutoSubmit('Time expired'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [session, examSubmitted, fullscreenAttempted]);

  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => setFullscreenAttempted(true)).catch(() => setFullscreenAttempted(true));
    } else {
      setFullscreenAttempted(true);
    }
  }, []);

  // Show fullscreen prompt when session loads — browser requires user gesture to enter fullscreen
  useEffect(() => {
    if (session && !fullscreenAttempted) {
      if (document.fullscreenElement) {
        // Already in fullscreen (carried over from instructions page)
        setFullscreenAttempted(true);
      } else {
        setShowFullscreenPrompt(true);
      }
    }
  }, [session, fullscreenAttempted]);

  const savePracticeToServer = async (resultData) => {
    try {
      const response = await fetchWithAuth('/practice/save', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: session.subjectId,
          subjectName: session.subjectName,
          totalQuestions: resultData.totalQuestions,
          correct: resultData.correct,
          wrong: resultData.wrong,
          unanswered: resultData.unanswered,
          percentage: resultData.percentage,
          duration: Math.floor((3600 - timeLeft) / 60),
          difficulty: 'all',
          isTimedTest: true,
        }),
      });
      if (response?.ok) console.log('Mock exam saved');
    } catch (err) { console.error('Error saving mock exam:', err); }
  };

  const handleViolation = useCallback((type) => {
    if (examSubmitted || !session) return;
    if (violationTimeoutRef.current) clearTimeout(violationTimeoutRef.current);
    setWarningCount(prev => {
      const n = prev + 1;
      setLastViolationType(type);
      setShowWarning(true);
      warningDismissedRef.current = false;
      if (n === 2) {
        setAutoSubmitCountdown(5);
        const cd = setInterval(() => {
          setAutoSubmitCountdown(p => { if (p <= 1) { clearInterval(cd); return 0; } return p - 1; });
        }, 1000);
      }
      if (n >= 3) {
        violationTimeoutRef.current = setTimeout(() => handleAutoSubmit(`Malpractice: ${type}`), 500);
      }
      return n;
    });
  }, [examSubmitted, session]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !examSubmitted && session && !warningDismissedRef.current) handleViolation('Tab switched');
  }, [examSubmitted, session, handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !examSubmitted && session && fullscreenAttempted) {
      handleViolation('Exited fullscreen mode');
      setShowFullscreenPrompt(true);
    }
  }, [examSubmitted, session, fullscreenAttempted, handleViolation]);

  const handleContextMenu = useCallback((e) => e.preventDefault(), []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault();
      if (!examSubmitted && session && !warningDismissedRef.current) handleViolation('Forbidden key combination');
    }
    if (!examSubmitted && session?.questions?.length > 0) {
      const key = e.key.toUpperCase();
      if (['A','B','C','D'].includes(key)) {
        e.preventDefault();
        const idx = key.charCodeAt(0) - 65;
        if (idx < (session.questions[currentQuestion]?.options.length || 0)) handleAnswerSelect(session.questions[currentQuestion].id, idx);
      }
      if ((e.key === 'Enter' || e.key === ' ') && !e.shiftKey) {
        e.preventDefault();
        if (currentQuestion < session.questions.length - 1) handleNext();
      }
    }
  }, [examSubmitted, session, currentQuestion, handleViolation]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleVisibilityChange, handleFullscreenChange, handleContextMenu, handleKeyDown]);

  const handleAutoSubmit = async (reason) => { if (examSubmitted || !session) return; await submitExam(true, reason); };

  const submitExam = async (isAuto = false, reason = '') => {
    if (examSubmitted || !session) return;
    setExamSubmitted(true);
    setSubmitting(true);
    let correct = 0, wrong = 0, unanswered = 0;
    session.questions.forEach(q => {
      const a = answers[q.id];
      if (!a) unanswered++;
      else if (a.isCorrect) correct++;
      else wrong++;
    });
    const percentage = Math.round((correct / session.questions.length) * 100);
    const resultData = { totalQuestions: session.questions.length, correct, wrong, unanswered, percentage, subjectName: session.subjectName, subjectId: session.subjectId, date: new Date().toISOString(), isMockExam: true, isAuto, reason };
    await savePracticeToServer(resultData);
    const history = JSON.parse(localStorage.getItem('practice_history') || '[]');
    history.unshift({ id: session.id, date: new Date().toISOString(), subject: session.subjectName, subjectId: session.subjectId, ...resultData, timedOut: isAuto });
    localStorage.setItem('practice_history', JSON.stringify(history.slice(0, 50)));
    localStorage.removeItem('practice_session');
    localStorage.removeItem('mock_exam_active');
    setSubmitting(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setTimeout(() => {
      router.push(`/dashboard?examResult=true&score=${correct}&total=${session.questions.length}&percentage=${percentage}&subject=${encodeURIComponent(session.subjectName)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`);
    }, 1000);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (!session || examSubmitted) return;
    const question = session.questions.find(q => q.id === questionId);
    const optionText = question.options[optionIndex];
    const isCorrect = optionText === question.correctAnswer;
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: { selected: optionText, selectedIndex: optionIndex, isCorrect, correctAnswer: question.correctAnswer } };
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = setTimeout(() => {
        if (currentQuestion < session.questions.length - 1 && !examSubmitted) setCurrentQuestion(p => p + 1);
        autoAdvanceTimer.current = null;
      }, 500);
      return newAnswers;
    });
  };

  const clearAutoAdvance = () => { if (autoAdvanceTimer.current) { clearTimeout(autoAdvanceTimer.current); autoAdvanceTimer.current = null; } };
  const handleNext     = () => { if (!session || examSubmitted) return; clearAutoAdvance(); if (currentQuestion < session.questions.length - 1) setCurrentQuestion(p => p + 1); };
  const handlePrevious = () => { if (!session || examSubmitted) return; clearAutoAdvance(); if (currentQuestion > 0) setCurrentQuestion(p => p - 1); };
  const handleQuestionJump = (idx) => { if (!session || examSubmitted) return; clearAutoAdvance(); setCurrentQuestion(idx); };
  const handleSubmit = () => { if (!session || examSubmitted) return; clearAutoAdvance(); setShowSubmitModal(true); };

  const handleDismissWarning = () => { setShowWarning(false); warningDismissedRef.current = true; setAutoSubmitCountdown(null); };

  const formatTime = (s) => {
    if (isNaN(s) || s < 0) return '00:00:00';
    return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':');
  };

  const getTimerColor = () => { if (timeLeft > 1800) return 'text-brand-primary'; if (timeLeft > 600) return 'text-warning'; return 'text-danger animate-pulse'; };

  const getWarningStyle = () => {
    if (warningCount === 1) return { bg: 'bg-warning-light border-warning', text: 'text-warning-dark', icon: '⚠️' };
    if (warningCount === 2) return { bg: 'bg-orange-100 border-orange-400', text: 'text-orange-700', icon: '🚨' };
    return { bg: 'bg-danger-light border-danger', text: 'text-danger', icon: '🛑' };
  };

  if (loading || !session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-base font-medium text-content-secondary">Loading mock exam...</p>
        </div>
      </div>
    );
  }

  // Guard: session exists but has no questions
  if (!session.questions || session.questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-muted p-4">
        <div className="bg-white rounded-2xl shadow-card-md p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} className="text-warning-dark" />
          </div>
          <h2 className="text-xl font-bold text-content-primary font-playfair mb-2">No Questions Available</h2>
          <p className="text-sm text-content-secondary mb-6">
            There are no mock exam questions available for{' '}
            <span className="font-semibold text-content-primary">{session.subjectName}</span> at this time.
            Please try a different subject.
          </p>
          <button
            onClick={() => { localStorage.removeItem('practice_session'); localStorage.removeItem('mock_exam_active'); router.push('/dashboard'); }}
            className="w-full py-3 bg-brand-primary text-white rounded-xl font-semibold text-sm hover:bg-brand-primary-dk transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Fullscreen prompt — must click to enter (browser requires user gesture)
  if (showFullscreenPrompt) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
        style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[480px] h-[480px] opacity-[0.04]">
            <img src="/logo.png" alt="" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-playfair mb-1">{session.subjectName}</h1>
          <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.75)' }}>Mock Exam — Strict Mode</p>
          <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
            This exam must run in <span className="font-semibold text-white">fullscreen mode.</span>
          </p>
          <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Exiting fullscreen counts as a violation. 3 violations = auto-submit.
          </p>
          <button
            onClick={() => {
              enterFullscreen();
              setShowFullscreenPrompt(false);
            }}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg mb-3"
            style={{ background: '#FFFFFF', color: '#1F2A49' }}
          >
            Enter Fullscreen &amp; Begin Mock Exam
          </button>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {user?.firstName} {user?.lastName} · {session.questions.length} Questions · 60 min
          </p>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / session.questions.length) * 100;
  const warningStyle = getWarningStyle();

  return (
    <div className="min-h-screen bg-surface-muted">

      {/* ── STRICT MODE BANNER — z-20 so it's above header (z-10) ── */}
      <div className="bg-gradient-to-r from-danger to-danger-dark text-white sticky top-0 z-20 py-2.5">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm font-bold tracking-wide flex items-center justify-center gap-2">
          <AlertTriangle size={15} strokeWidth={2.5} />
          MOCK EXAM — STRICT MODE ENABLED
          <AlertTriangle size={15} strokeWidth={2.5} />
        </div>
      </div>

      {/* ── Exam Header — z-10, appears below banner ── */}
      <div className="bg-white border-b border-border sticky top-9 z-10 shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-content-primary font-playfair">
              {session.subjectName} — Mock Exam
            </h1>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-content-secondary">
              <span><span className="font-semibold">Student:</span> {user?.firstName} {user?.lastName}</span>
              <span><span className="font-semibold">ID:</span> {user?.loginId}</span>
              <span><span className="font-semibold">Class:</span> {user?.class}</span>
            </div>
            <p className="text-xs text-danger font-medium mt-1">
              Strict Mode · {warningCount}/3 warnings
              {autoSubmitCountdown > 0 && (
                <span className="ml-2 font-bold animate-pulse"> · Auto-submit in {autoSubmitCountdown}s</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-content-muted mb-0.5">Time Left</p>
              <span className={`font-mono text-2xl md:text-3xl font-bold ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={() => setShowShortcutGuide(!showShortcutGuide)}
              className="btn-secondary text-xs px-3 py-2 min-h-[36px]"
              aria-label="Toggle keyboard shortcuts"
            >
              <Keyboard size={14} /> Shortcuts
            </button>
          </div>
        </div>

        {/* Shortcut guide (collapsible) */}
        <AnimatePresence>
          {showShortcutGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-brand-primary-lt border-t border-border overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                {[
                  { key: 'A B C D', desc: 'Select option', color: 'text-brand-primary' },
                  { key: 'Enter / Space', desc: 'Next question', color: 'text-warning-dark' },
                  { key: '← →', desc: 'Navigate', color: 'text-warning-dark' },
                  { key: 'F12 / Ctrl', desc: 'Forbidden', color: 'text-danger' },
                ].map(s => (
                  <div key={s.key} className="p-3 bg-white rounded-xl shadow-card">
                    <span className={`text-sm font-bold block mb-0.5 font-mono ${s.color}`}>{s.key}</span>
                    <span className="text-xs text-content-secondary">{s.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main exam layout ── */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Question area */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl p-5 sm:p-7 border border-border shadow-card-md">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-bold text-brand-primary">
                Question {currentQuestion + 1} / {session.questions.length}
              </span>
              <span className="text-xs font-medium text-content-secondary badge-brand">
                {currentQ.marks || 1} mark{currentQ.marks !== 1 ? 's' : ''}
              </span>
            </div>

            <p className="text-base sm:text-lg font-medium text-content-primary mb-6 leading-relaxed">
              {currentQ.question}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQ.options.map((option, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = answers[currentQ.id]?.selected === option;
                return (
                  <div
                    key={idx}
                    onClick={() => handleAnswerSelect(currentQ.id, idx)}
                    className={`border-2 rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-all min-h-[56px] ${
                      isSelected ? 'border-brand-primary bg-brand-primary-lt shadow-brand' : 'border-border hover:border-brand-primary hover:bg-brand-primary-lt'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${isSelected ? 'bg-brand-primary text-white' : 'bg-surface-subtle text-content-secondary border-2 border-border'}`}>
                      {letter}
                    </div>
                    <span className="text-sm font-medium text-content-primary flex-1">{option}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3 bg-info-light rounded-xl border border-info/20">
              <p className="text-xs text-info-dark font-medium">
                💡 Press A, B, C, or D to select · Auto-advances after selection
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all min-h-[48px] ${currentQuestion === 0 ? 'bg-surface-subtle text-content-muted cursor-not-allowed' : 'btn-secondary'}`}
            >
              ← Previous
            </button>
            {currentQuestion === session.questions.length - 1 ? (
              <button onClick={handleSubmit} disabled={submitting} className="btn-danger px-6 py-3 rounded-xl text-sm font-semibold min-h-[48px]">
                {submitting ? 'Submitting...' : 'Submit Mock Exam'}
              </button>
            ) : (
              <button onClick={handleNext} className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold min-h-[48px]">
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Progress sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-5 border border-border shadow-card-md sticky top-32">
            <h3 className="text-base font-bold text-content-primary mb-4 font-playfair">Exam Progress</h3>

            <div className="mb-5">
              <div className="flex justify-between text-xs text-content-secondary mb-1.5">
                <span>Answered</span>
                <span className="font-bold">{answeredCount} / {session.questions.length}</span>
              </div>
              <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <h4 className="text-sm font-bold text-content-primary mb-3">Questions</h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-5">
              {session.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionJump(idx)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    idx === currentQuestion ? 'bg-brand-primary text-white shadow-brand scale-110' :
                    answers[q.id] !== undefined ? 'bg-brand-primary-lt border-2 border-brand-primary text-brand-primary' :
                    'bg-surface-subtle text-content-secondary hover:border-2 hover:border-brand-primary'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            <button onClick={handleSubmit} disabled={submitting} className="btn-danger w-full text-sm mb-4">
              {submitting ? 'Submitting...' : 'Submit Mock Exam'}
            </button>

            <div className="p-3 bg-danger-light rounded-xl border border-danger/20">
              <p className="text-xs font-bold text-danger flex items-center gap-1.5">
                <AlertTriangle size={13} /> Warnings: {warningCount}/3
              </p>
              {warningCount === 2 && (
                <p className="text-xs text-danger mt-1">Next violation will auto-submit!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Warning Modal ── */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              className="bg-white rounded-2xl p-7 max-w-md w-full text-center shadow-card-lg"
            >
              <div className="text-6xl mb-4">{warningStyle.icon}</div>
              <h3 className={`text-2xl font-bold mb-2 font-playfair ${warningStyle.text}`}>
                Warning {warningCount} of 3
              </h3>
              <p className="text-sm text-content-secondary mb-5">
                Violation: <strong>{lastViolationType}</strong>
              </p>
              <div className={`p-4 ${warningStyle.bg} border rounded-xl mb-5`}>
                <p className={`text-sm font-bold ${warningStyle.text}`}>
                  {warningCount === 1 && 'First warning! Stay on this page.'}
                  {warningCount === 2 && 'Second warning! One more violation = auto-submit!'}
                  {warningCount >= 3 && 'Third warning! Submitting your exam...'}
                </p>
              </div>
              <button onClick={handleDismissWarning} className="btn-primary w-full text-sm">
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit Confirm Modal ── */}
      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-7 max-w-md w-full shadow-card-lg"
            >
              <h3 className="text-xl font-bold text-content-primary mb-2 font-playfair">Submit Mock Exam?</h3>
              <p className="text-sm text-content-secondary mb-6 leading-relaxed">
                You have answered <strong>{answeredCount}</strong> of <strong>{session.questions.length}</strong> questions.
                {answeredCount < session.questions.length && ` ${session.questions.length - answeredCount} remain unanswered.`}
                <br /><br />
                Once submitted, you cannot change your answers.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => submitExam(false)} disabled={submitting} className="btn-danger flex-1 text-sm">
                  {submitting ? 'Submitting...' : 'Submit Now'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MockExamRoomPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
        </div>
      }>
        <MockExamRoomContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}
