'use client';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

function ExamRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = searchParams.get('examId');
  const examSetupId = searchParams.get('examSetupId');
  const { user, fetchWithAuth } = useStudentAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState('');
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [timerReady, setTimerReady] = useState(false);
  const [showFullscreenPrompt, setShowFullscreenPrompt] = useState(false);

  const endTimeMsRef = useRef(0);
  const violationTimeoutRef = useRef(null);
  const autoSaveIntervalRef = useRef(null);
  const toastShownRef = useRef(false);
  const submitAttemptedRef = useRef(false);
  const answerJustSelectedRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  const answersRef = useRef({});

  // ─────────────────────────────────────────────────────────────────────────
  // THE TIMER — starts only when timerReady becomes true
  // Uses real clock diff each tick — never drifts, survives re-renders
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerReady || examSubmitted || questions.length === 0) return;

    const calcRemaining = () =>
      Math.max(0, Math.floor((endTimeMsRef.current - Date.now()) / 1000));

    setTimeLeft(calcRemaining());

    const interval = setInterval(() => {
      const rem = calcRemaining();
      setTimeLeft(rem);
      if (rem <= 0) {
        clearInterval(interval);
        handleAutoSubmit('Time expired');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerReady, examSubmitted, questions.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // MOUNT
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!examId || !examSetupId) {
      toast.error('Invalid exam session');
      router.push('/exam-instructions');
      return;
    }
    loadExamFromStorage();
    fetchExamFromServer();
    // Fullscreen requires a user gesture — show prompt instead of calling directly on mount

    const t = setTimeout(() => setShowShortcuts(false), 10000);
    return () => {
      document.fullscreenElement && document.exitFullscreen().catch(() => {});
      clearTimeout(violationTimeoutRef.current);
      clearInterval(autoSaveIntervalRef.current);
      clearTimeout(t);
      clearTimeout(navigationTimeoutRef.current);
    };
  }, [examId, examSetupId]);

  // Show fullscreen prompt once the exam finishes loading (needs user gesture to enter fullscreen)
  useEffect(() => {
    if (!loading && questions.length > 0 && !document.fullscreenElement) {
      setShowFullscreenPrompt(true);
    }
  }, [loading, questions.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // AUTO-SAVE every 30 s
  // Keep answersRef current so the stable interval always reads latest answers
  // without resetting the 30 s clock on every selection
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => { answersRef.current = answers; }, [answers]);

  useEffect(() => {
    if (!examId || examSubmitted || questions.length === 0) return;
    autoSaveIntervalRef.current = setInterval(() => {
      const snap = answersRef.current;
      if (!Object.keys(snap).length) return;
      localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(snap));
      for (const [questionId, index] of Object.entries(snap)) {
        const question = questions.find(q => q.id === questionId);
        const optionText = question?.options?.[index];
        if (optionText) {
          fetchWithAuth(`/exams/${examId}/save-answer`, {
            method: 'POST',
            body: JSON.stringify({ questionId, answer: optionText }),
          }).catch(() => {});
        }
      }
    }, 30000);
    return () => clearInterval(autoSaveIntervalRef.current);
  }, [examId, examSubmitted, questions.length]);

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER: activate timer from a known endTime ms value
  // Only call this when endMs is a valid finite number
  // ─────────────────────────────────────────────────────────────────────────
  const activateTimer = (endMs) => {
    if (!isFinite(endMs) || endMs <= 0) return;
    endTimeMsRef.current = endMs;
    setTimerReady(true);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER: compute endMs from duration (minutes), always valid
  // ─────────────────────────────────────────────────────────────────────────
  const endMsFromDuration = (durationMinutes) => {
    const mins = Number(durationMinutes);
    if (!isFinite(mins) || mins <= 0) return null;
    return Date.now() + mins * 60 * 1000;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // LOAD FROM LOCALSTORAGE (fast, immediate)
  // exam-instructions stores: { ..., duration, startTime, endTime, questions }
  // ─────────────────────────────────────────────────────────────────────────
  const loadExamFromStorage = () => {
    try {
      const raw = localStorage.getItem(`active_exam_${examId}`);
      if (!raw) return;
      const exam = JSON.parse(raw);

      if (exam.questions?.length) setQuestions(exam.questions);
      if (exam.title) setExamTitle(exam.title);

      const sa = localStorage.getItem(`exam_answers_${examId}`);
      if (sa) setAnswers(JSON.parse(sa));

      const total = (exam.questions || []).reduce((s, q) => s + (q.marks || 1), 0);
      setTotalMarks(total);

      if (exam.endTime) {
        const endMs = new Date(exam.endTime).getTime();
        if (isFinite(endMs) && endMs > Date.now()) {
          activateTimer(endMs);
          return;
        }
      }
      if (exam.startTime && exam.duration) {
        const startMs = new Date(exam.startTime).getTime();
        if (isFinite(startMs)) {
          const endMs = startMs + Number(exam.duration) * 60 * 1000;
          if (isFinite(endMs) && endMs > Date.now()) {
            activateTimer(endMs);
            return;
          }
        }
      }
      if (exam.duration) {
        const endMs = endMsFromDuration(exam.duration);
        if (endMs) activateTimer(endMs);
      }
    } catch (e) {
      console.error('loadExamFromStorage', e);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FETCH FROM SERVER (authoritative — called after storage load)
  // The server response (from your JSON sample) contains:
  //   exam.duration (minutes), exam.startTime, exam.endTime (may be absent)
  // ─────────────────────────────────────────────────────────────────────────
  const fetchExamFromServer = async () => {
    try {
      const res = await fetchWithAuth(`/exams/${examId}`);
      if (!res?.ok) return;
      const data = await res.json();
      const exam = data.exam;
      if (!exam) return;

      setQuestions(exam.questions || []);
      if (exam.answers) setAnswers(exam.answers);
      setExamTitle(exam.title || '');

      const total = (exam.questions || []).reduce((s, q) => s + (q.marks || 1), 0);
      setTotalMarks(total);

      let endMs = null;

      if (exam.endTime) {
        const ms = new Date(exam.endTime).getTime();
        if (isFinite(ms) && ms > Date.now()) endMs = ms;
      }

      if (!endMs && exam.startTime && exam.duration) {
        const startMs = new Date(exam.startTime).getTime();
        if (isFinite(startMs)) {
          const ms = startMs + Number(exam.duration) * 60 * 1000;
          if (isFinite(ms) && ms > Date.now()) endMs = ms;
        }
      }

      if (!endMs && exam.duration) {
        const ms = endMsFromDuration(exam.duration);
        if (ms) endMs = ms;
      }

      if (!endMs && endTimeMsRef.current > Date.now()) {
        endMs = endTimeMsRef.current;
      }

      if (endMs) {
        activateTimer(endMs);

        const endTimeIso = new Date(endMs).toISOString();
        const stored = localStorage.getItem(`active_exam_${examId}`);
        const existing = stored ? JSON.parse(stored) : {};
        localStorage.setItem(`active_exam_${examId}`, JSON.stringify({
          ...existing,
          questions: exam.questions,
          title: exam.title,
          duration: exam.duration,
          startTime: exam.startTime || new Date().toISOString(),
          endTime: endTimeIso,
          totalMarks: total,
        }));
      }

      if (exam.answers) {
        localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(exam.answers));
      }
    } catch (e) {
      console.error('fetchExamFromServer', e);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SAVE ANSWERS
  // ─────────────────────────────────────────────────────────────────────────
  // awaitAll=true on submit path: all saves must resolve before submit fires
  // awaitAll=false (default): fire-and-forget for manual mid-exam saves
  const saveCurrentAnswers = async (awaitAll = false) => {
    if (!examId || !Object.keys(answers).length || examSubmitted) return;
    localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(answers));
    const saves = [];
    for (const [questionId, index] of Object.entries(answers)) {
      const question = questions.find(q => q.id === questionId);
      const optionText = question?.options?.[index];
      if (optionText) {
        saves.push(
          fetchWithAuth(`/exams/${examId}/save-answer`, {
            method: 'POST',
            body: JSON.stringify({ questionId, answer: optionText }),
          }).catch(() => {})
        );
      }
    }
    if (awaitAll) await Promise.all(saves);
  };

  const enterFullscreen = () => document.documentElement.requestFullscreen?.().catch(() => {});

  // ─────────────────────────────────────────────────────────────────────────
  // ANTI-CHEAT
  // ─────────────────────────────────────────────────────────────────────────
  const recordTabSwitch = async () => {
    if (!examId || examSubmitted) return;
    try {
      const res = await fetchWithAuth(`/exams/${examId}/tab-switch`, { method: 'POST' });
      if (res?.ok) {
        const d = await res.json();
        if (d.autoSubmitted) handleAutoSubmit('Auto-submitted due to multiple tab switches');
      }
    } catch (_) {}
  };

  const handleViolation = useCallback((type) => {
    if (examSubmitted) return;
    clearTimeout(violationTimeoutRef.current);
    setWarningCount(prev => {
      const n = prev + 1;
      setLastViolationType(type);
      setShowWarning(true);
      recordTabSwitch();
      if (n >= 3) {
        violationTimeoutRef.current = setTimeout(() => handleAutoSubmit(`Malpractice: ${type}`), 100);
      }
      return n;
    });
  }, [examSubmitted]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !examSubmitted) handleViolation('Tab switched');
  }, [examSubmitted, handleViolation]);

  const handleBlur = useCallback(() => {
    if (!examSubmitted && !document.hidden) handleViolation('Window lost focus');
  }, [examSubmitted, handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !examSubmitted) {
      handleViolation('Exited fullscreen');
      // Show prompt so user must click to re-enter (direct re-request without gesture still fails)
      setShowFullscreenPrompt(true);
    }
  }, [examSubmitted, handleViolation]);

  // ─────────────────────────────────────────────────────────────────────────
  // KEYBOARD SHORTCUTS
  // Fix: after handleAnswerSelect auto-advances, we set answerJustSelectedRef
  // so that ArrowRight / Next don't also fire in the same keydown cycle
  // ─────────────────────────────────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      return;
    }

    if (!examSubmitted && questions.length > 0) {
      const k = e.key.toUpperCase();

      if (['A', 'B', 'C', 'D'].includes(k)) {
        e.preventDefault();
        const idx = k.charCodeAt(0) - 65;
        const q = questions[currentQuestion];
        if (q && idx < q.options.length) {
          answerJustSelectedRef.current = true;
          setTimeout(() => { answerJustSelectedRef.current = false; }, 500);
          handleAnswerSelect(q.id, idx);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (!answerJustSelectedRef.current) {
          setCurrentQuestion(p => Math.min(p + 1, questions.length - 1));
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentQuestion(p => Math.max(p - 1, 0));
      } else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        setShowSubmitModal(true);
      }
    }
  }, [examSubmitted, questions, currentQuestion]);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', e => e.preventDefault());
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleVisibilityChange, handleBlur, handleFullscreenChange, handleKeyDown]);

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────────────────────────────────
  const handleAutoSubmit = async (reason) => {
    if (examSubmitted || submitAttemptedRef.current) return;
    await submitExam(true, reason);
  };

  const submitExam = async (isAuto = false, reason = '') => {
    if (examSubmitted || submitAttemptedRef.current) return;
    submitAttemptedRef.current = true;
    setExamSubmitted(true);
    try {
      await saveCurrentAnswers(true);
      const res = await fetchWithAuth(`/exams/${examId}/submit`, { method: 'POST' });
      if (res?.ok) {
        const data = await res.json();
        localStorage.removeItem(`active_exam_${examId}`);
        localStorage.removeItem(`exam_answers_${examId}`);
        const prog = JSON.parse(localStorage.getItem('examProgress') || '{}');
        if (prog[examSetupId]) {
          prog[examSetupId] = { ...prog[examSetupId], status: 'completed', score: data.exam?.score, percentage: data.exam?.percentage };
          localStorage.setItem('examProgress', JSON.stringify(prog));
        }
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          isAuto ? toast.error(reason, { duration: 4000 }) : toast.success('Exam submitted successfully!');
        }
        setTimeout(() => router.push('/exam-instructions'), 2000);
      } else {
        const err = await res?.json().catch(() => ({}));
        toast.error(err?.message || 'Failed to submit exam');
        submitAttemptedRef.current = false;
        setExamSubmitted(false);
      }
    } catch (_) {
      toast.error('Failed to submit exam');
      submitAttemptedRef.current = false;
      setExamSubmitted(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FIXED ANSWER SELECT
  // Auto-advance to next question after 320 ms (gives visual feedback time)
  // Now properly increments by 1 instead of skipping questions
  // ─────────────────────────────────────────────────────────────────────────
  const handleAnswerSelect = (questionId, optionIndex) => {
    // Clear any pending navigation timeouts
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }

    setAnswers(prev => {
      const next = { ...prev, [questionId]: optionIndex };
      localStorage.setItem(`exam_answers_${examId}`, JSON.stringify(next));
      const question = questions.find(q => q.id === questionId);
      const optionText = question?.options?.[optionIndex];
      if (optionText) {
        fetchWithAuth(`/exams/${examId}/save-answer`, {
          method: 'POST',
          body: JSON.stringify({ questionId, answer: optionText }),
        }).catch(() => {});
      }
      return next;
    });

    // Auto-advance to the very next question only
    if (currentQuestion < questions.length - 1) {
      navigationTimeoutRef.current = setTimeout(() => {
        setCurrentQuestion(prev => {
          // Ensure we only go to the immediate next question
          const nextQuestion = prev + 1;
          return Math.min(nextQuestion, questions.length - 1);
        });
        navigationTimeoutRef.current = null;
      }, 320);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // FORMAT HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    if (!timerReady || !isFinite(secs) || secs < 0) return '--:--:--';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerUrgency = !timerReady ? 'safe' : timeLeft > 1800 ? 'safe' : timeLeft > 600 ? 'warn' : 'danger';

  const answeredCount = Object.keys(answers).length;
  const unanswered = questions.length - answeredCount;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-brand-primary-lt">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"/>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin"/>
          </div>
          <p className="text-brand-primary font-bold text-xl font-playfair">Loading your exam…</p>
          <p className="text-content-muted text-sm mt-1 font-playfair">Please wait, do not close this tab</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-brand-primary-lt">
        <div className="text-center max-w-sm mx-4">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-content-primary mb-2 font-playfair">No Questions Found</h2>
          <p className="text-content-secondary mb-6 font-playfair">No questions are available for this exam.</p>
          <button onClick={() => router.push('/exam-instructions')}
            className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold font-playfair hover:bg-brand-primary-dk transition-all hover:scale-105">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Fullscreen prompt — must click to enter (browser requires user gesture) ──
  if (showFullscreenPrompt) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none"
        style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}
      >
        {/* Ghost logo */}
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

          <h1 className="text-2xl font-bold text-white font-playfair mb-2">
            {examTitle || 'WAEC Exam'}
          </h1>
          <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
            This exam runs in <span className="font-semibold text-white">fullscreen mode only.</span>
          </p>
          <p className="text-xs mb-8" style={{ color: 'rgba(255,255,255,0.40)' }}>
            Exiting fullscreen during the exam will be recorded as a violation.
          </p>

          <button
            onClick={() => {
              enterFullscreen();
              setShowFullscreenPrompt(false);
            }}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg mb-3"
            style={{ background: '#FFFFFF', color: '#1F2A49' }}
          >
            Enter Fullscreen &amp; Start Exam
          </button>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
            {user?.firstName} {user?.lastName} · {questions.length} Questions
          </p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  const timerBorderClass = timerUrgency === 'safe' ? 'border-brand-primary'   : timerUrgency === 'warn' ? 'border-amber-500'  : 'border-red-500';
  const timerTextClass   = timerUrgency === 'safe' ? 'text-brand-primary'     : timerUrgency === 'warn' ? 'text-amber-600'    : 'text-red-600';
  const timerBgClass     = timerUrgency === 'safe' ? 'bg-brand-primary/5'     : timerUrgency === 'warn' ? 'bg-amber-50'       : 'bg-red-50';

  return (
    <div className="min-h-screen bg-surface-muted select-none">

      <header className="bg-white border-b-2 border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">

            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0 shadow-sm shadow-brand-primary/30">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-content-primary font-playfair text-sm sm:text-base leading-tight truncate">{examTitle}</p>
                <p className="text-content-muted text-xs font-playfair truncate">{user?.firstName} {user?.lastName} · {user?.loginId}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 ${timerBorderClass} ${timerBgClass} shadow-sm flex-shrink-0`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke={timerUrgency === 'safe' ? '#1565C0' : timerUrgency === 'warn' ? '#f59e0b' : '#ef4444'} strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span className={`font-mono font-black text-2xl sm:text-3xl tracking-widest tabular-nums ${timerTextClass}`}>
                {formatTime(timeLeft)}
              </span>
              {timerUrgency === 'danger' && (
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0"/>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {warningCount > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-amber-600 text-xs font-bold font-playfair">⚠️ {warningCount}/3</span>
                </div>
              )}
              <button onClick={() => setShowSubmitModal(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold font-playfair text-sm transition-all hover:scale-105 active:scale-95 shadow-sm shadow-red-200">
                Submit
              </button>
            </div>
          </div>

          <div className="h-1.5 bg-surface-subtle rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dk"
              animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}/>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-brand-primary text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-playfair font-semibold flex items-center gap-3 whitespace-nowrap">
            <span>⌨️ A–D to answer</span>
            <span className="opacity-40">·</span>
            <span>← → to navigate</span>
            <span className="opacity-40">·</span>
            <span>Ctrl+Enter to submit</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_284px] gap-6">

        <div className="space-y-4">

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-sm font-bold font-playfair shadow-sm shadow-brand-primary/25">
                Q{currentQuestion + 1} of {questions.length}
              </span>
              {currentQ.subjectName && (
                <span className="bg-brand-primary-lt text-brand-primary-dk border border-brand-primary/20 px-2.5 py-0.5 rounded-full text-xs font-semibold font-playfair">
                  {currentQ.subjectName}
                </span>
              )}
            </div>
            <span className="bg-white border border-border text-content-secondary px-3 py-1 rounded-full text-xs font-bold font-playfair shadow-sm">
              {currentQ.marks || 1} mark{(currentQ.marks || 1) !== 1 ? 's' : ''}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion}
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">

              <div className="px-6 sm:px-8 py-6 bg-gradient-to-br from-brand-primary-lt to-brand-primary-lt/40 border-b border-border">
                <p className="text-content-primary text-lg sm:text-xl font-playfair font-semibold leading-relaxed">
                  {currentQ.question}
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-3">
                {currentQ.options.map((option, index) => {
                  const letter = LETTERS[index];
                  const isSelected = answers[currentQ.id] === index;
                  return (
                    <motion.button key={index}
                      whileHover={{ scale: 1.007 }} whileTap={{ scale: 0.996 }}
                      onClick={() => handleAnswerSelect(currentQ.id, index)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'border-brand-primary bg-brand-primary/5 shadow-md shadow-brand-primary/10'
                          : 'border-border bg-white hover:border-brand-primary/40 hover:bg-surface-muted'
                      }`}>
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-extrabold font-playfair flex-shrink-0 transition-all duration-150 ${
                        isSelected ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30' : 'bg-surface-subtle text-content-secondary'
                      }`}>
                        {letter}
                      </div>
                      <span className={`flex-1 text-base sm:text-lg font-playfair font-medium leading-snug transition-colors ${
                        isSelected ? 'text-brand-primary-dk font-semibold' : 'text-content-primary'
                      }`}>
                        {option}
                      </span>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                          <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center shadow-sm">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-6 py-3 bg-surface-muted border-t border-border">
                <p className="text-content-muted text-xs font-playfair">
                  Tip: Press{' '}
                  {['A','B','C','D'].map(k => (
                    <kbd key={k} className="mx-0.5 px-1 py-0.5 bg-white border border-border rounded text-content-secondary font-mono text-xs">{k}</kbd>
                  ))}{' '}
                  on your keyboard to quickly select an answer
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between gap-3">
            <button onClick={() => setCurrentQuestion(p => Math.max(p - 1, 0))}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-border text-content-secondary font-bold font-playfair text-sm hover:border-brand-primary hover:text-brand-primary hover:bg-brand-primary/4 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:border-border disabled:hover:text-content-secondary disabled:hover:bg-white shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Previous
            </button>
            <button onClick={() => setCurrentQuestion(p => Math.min(p + 1, questions.length - 1))}
              disabled={currentQuestion === questions.length - 1}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold font-playfair text-sm hover:bg-brand-primary-dk transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-brand-primary shadow-sm shadow-brand-primary/30">
              Next
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-4">

          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-content-primary font-playfair text-sm mb-4 flex items-center gap-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              Your Progress
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'Answered', value: answeredCount, color: '#1565C0', bg: '#E3F2FD' },
                { label: 'Skipped',  value: unanswered,   color: '#f59e0b', bg: '#fffbeb' },
                { label: 'Total',    value: questions.length, color: '#626060', bg: '#F9FAFB' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className="rounded-xl p-2.5 text-center border border-border" style={{ background: bg }}>
                  <div className="text-xl font-extrabold font-playfair" style={{ color }}>{value}</div>
                  <div className="text-xs text-content-muted font-playfair mt-0.5 leading-tight">{label}</div>
                </div>
              ))}
            </div>
            <div className="h-3 bg-surface-subtle rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-primary-dk"
                animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }}/>
            </div>
            <p className="text-center text-brand-primary font-extrabold text-xl font-playfair mt-2">{Math.round(progress)}%</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-content-primary font-playfair text-sm mb-3">Navigate Questions</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, i) => {
                const isCurrent = i === currentQuestion;
                const isDone = answers[q.id] !== undefined;
                return (
                  <button key={q.id} onClick={() => setCurrentQuestion(i)}
                    title={`Question ${i + 1}${isDone ? ' (answered)' : ''}`}
                    className={`aspect-square rounded-lg text-xs font-bold font-playfair transition-all hover:scale-110 active:scale-95 ${
                      isCurrent
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30'
                        : isDone
                        ? 'bg-brand-primary-lt border-2 border-brand-primary text-brand-primary'
                        : 'bg-surface-muted border border-border text-content-secondary hover:border-brand-primary/40 hover:bg-brand-primary-lt'
                    }`}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
              {[
                { cls: 'bg-brand-primary', label: 'Current' },
                { cls: 'bg-brand-primary-lt border-2 border-brand-primary', label: 'Answered' },
                { cls: 'bg-surface-muted border border-border', label: 'Skipped' },
              ].map(({ cls, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className={`w-3.5 h-3.5 rounded-sm ${cls}`}/>
                  <span className="text-content-muted text-xs font-playfair">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-border p-5">
            <h3 className="font-bold text-content-primary font-playfair text-sm mb-3">Exam Info</h3>
            <div className="space-y-2.5">
              {[
                { icon: '🏆', label: 'Total Marks', value: totalMarks },
                { icon: '❓', label: 'Questions',   value: questions.length },
                { icon: '⚠️', label: 'Warnings',    value: `${warningCount} / 3`, warn: warningCount > 0 },
                { icon: '🎓', label: 'Student',      value: user?.class || '' },
              ].map(({ icon, label, value, warn }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-content-secondary text-xs font-playfair">{icon} {label}</span>
                  <span className={`text-xs font-bold font-playfair ${warn ? 'text-amber-500' : 'text-content-primary'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setShowSubmitModal(true)}
            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-extrabold font-playfair text-base shadow-lg shadow-red-200 hover:shadow-red-300 transition-all hover:scale-105 active:scale-95">
            🚀 Submit Exam
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 30 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border-4"
              style={{ borderColor: warningCount >= 3 ? '#ef4444' : warningCount >= 2 ? '#f97316' : '#f59e0b' }}>
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">
                  {warningCount >= 3 ? '🛑' : warningCount >= 2 ? '🚨' : '⚠️'}
                </div>
                <h3 className="text-2xl font-extrabold font-playfair mb-1"
                  style={{ color: warningCount >= 3 ? '#ef4444' : warningCount >= 2 ? '#f97316' : '#f59e0b' }}>
                  Warning {warningCount} of 3
                </h3>
                <p className="text-content-secondary text-sm font-playfair mb-5">
                  <strong className="text-content-primary">Violation detected:</strong> {lastViolationType}
                </p>
                <div className={`p-4 rounded-xl mb-5 text-sm font-semibold font-playfair ${
                  warningCount >= 3 ? 'bg-red-50 text-red-700 border border-red-200'
                  : warningCount >= 2 ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {warningCount === 1 && '⚠️ First warning! Please stay on this exam page and do not switch tabs.'}
                  {warningCount === 2 && '🚨 Second warning! One more violation will automatically submit your exam!'}
                  {warningCount >= 3 && '🛑 Third warning! Your exam is being auto-submitted now.'}
                </div>
                <button onClick={() => setShowWarning(false)}
                  className="w-full py-3.5 rounded-xl font-extrabold font-playfair text-white text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
                  style={{ background: warningCount >= 3 ? '#ef4444' : '#1565C0' }}>
                  I Understand
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-border">
              <div className="p-6 text-center border-b border-border">
                <div className="text-5xl mb-3">📋</div>
                <h3 className="text-xl font-extrabold font-playfair text-content-primary mb-1">Submit Exam?</h3>
                <p className="text-content-secondary text-sm font-playfair">
                  {unanswered === 0
                    ? '✅ You have answered all questions!'
                    : `You still have ${unanswered} unanswered question${unanswered !== 1 ? 's' : ''}. Are you sure?`}
                </p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[
                  { label: 'Answered', val: answeredCount,       color: '#1565C0' },
                  { label: 'Skipped',  val: unanswered,          color: '#f59e0b' },
                  { label: 'Total',    val: questions.length,    color: '#626060' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="py-4 text-center">
                    <div className="text-2xl font-extrabold font-playfair" style={{ color }}>{val}</div>
                    <div className="text-content-muted text-xs font-playfair mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="p-5 flex gap-3">
                <button onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3.5 rounded-xl border-2 border-border text-content-secondary font-bold font-playfair text-sm hover:border-brand-primary hover:text-brand-primary transition-all hover:scale-105 active:scale-95">
                  Keep Going
                </button>
                <button onClick={() => { setShowSubmitModal(false); submitExam(false); }}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold font-playfair text-sm shadow-lg shadow-red-200 transition-all hover:scale-105 active:scale-95">
                  Submit Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExamRoomPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-brand-primary-lt">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20"/>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin"/>
            </div>
            <p className="text-brand-primary font-bold text-xl font-playfair">Loading exam…</p>
          </div>
        </div>
      }>
        <ExamRoomContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}