'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import toast from 'react-hot-toast';
import { LogOut, Timer, Keyboard, AlertTriangle, Save, FileText, Play, CheckCircle, Clock } from 'lucide-react';

function ExamInstructionsContent() {
  const [availableExams, setAvailableExams] = useState([]);
  const [examProgress, setExamProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(null);
  const router = useRouter();
  const { user, fetchWithAuth, logout } = useStudentAuth();

  useEffect(() => {
    loadExamProgress();
    fetchAvailableExams();
  }, []);

  const loadExamProgress = () => {
    try {
      const saved = localStorage.getItem('examProgress');
      if (saved) setExamProgress(JSON.parse(saved));
    } catch (_) {}
  };

  const fetchAvailableExams = async () => {
    try {
      const res = await fetchWithAuth('/available-exams');
      if (res?.ok) {
        const data = await res.json();
        setAvailableExams(data.exams || []);
      }
    } catch (_) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam) => {
    setStartingExam(exam.id);
    const toastId = toast.loading('Starting exam...');
    try {
      const res = await fetchWithAuth('/exams/start', {
        method: 'POST',
        body: JSON.stringify({ examSetupId: exam.id }),
      });
      if (res?.ok) {
        const data = await res.json();
        const startTime = new Date().toISOString();
        const durationMs = (exam.duration || 120) * 60 * 1000;
        const endTime = new Date(Date.now() + durationMs).toISOString();
        localStorage.setItem(`active_exam_${data.exam.id}`, JSON.stringify({
          id: data.exam.id, examSetupId: exam.id, title: exam.title,
          duration: exam.duration, startTime, endTime,
          questions: data.exam.questions || [],
          totalMarks: exam.subjects?.reduce((s, sub) => s + (sub.totalMarks || 0), 0) || 0,
        }));
        const updatedProgress = {
          ...examProgress,
          [exam.id]: { examId: data.exam.id, title: exam.title, status: 'in_progress', answers: {}, startTime, endTime, duration: exam.duration, examSetupId: exam.id },
        };
        localStorage.setItem('examProgress', JSON.stringify(updatedProgress));
        setExamProgress(updatedProgress);
        toast.success('Exam started! Good luck!', { id: toastId });
        router.push(`/exam-room?examId=${data.exam.id}&examSetupId=${exam.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to start exam', { id: toastId });
      }
    } catch (_) {
      toast.error('Failed to start exam', { id: toastId });
    } finally {
      setStartingExam(null);
    }
  };

  const handleContinueExam = (exam) => {
    const progress = examProgress[exam.id];
    if (progress?.examId) router.push(`/exam-room?examId=${progress.examId}&examSetupId=${exam.id}`);
  };

  const getExamStatus = (examId) => examProgress[examId]?.status || 'not_started';

  const isExamActive = (exam) => {
    const now = new Date();
    const start = exam.startDateTime?._seconds ? new Date(exam.startDateTime._seconds * 1000) : new Date(exam.startDateTime);
    const end = exam.endDateTime?._seconds ? new Date(exam.endDateTime._seconds * 1000) : new Date(exam.endDateTime);
    return now >= start && now <= end;
  };

  const formatDateTime = (ts) => {
    if (!ts) return 'N/A';
    const d = ts._seconds ? new Date(ts._seconds * 1000) : new Date(ts);
    return d.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${m} minutes`;
  };

  const completedCount = availableExams.filter(e => getExamStatus(e.id) === 'completed').length;
  const inProgressCount = availableExams.filter(e => getExamStatus(e.id) === 'in_progress').length;
  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-muted">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-brand-primary font-bold font-playfair">Loading exams...</p>
          <p className="text-content-muted text-sm mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-20 shadow-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary-dk flex items-center justify-center text-white font-bold text-sm shadow-brand">
              {initials || 'ST'}
            </div>
            <div>
              <p className="text-content-primary font-bold text-sm leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-content-muted text-xs">{user?.class} · {user?.loginId}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-content-secondary text-sm font-medium hover:border-danger hover:text-danger hover:bg-danger-light transition-all min-h-[40px]"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-safe">
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand-primary to-brand-primary-dk rounded-2xl p-6 sm:p-8 text-white shadow-card-lg overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-white/70 text-xs font-semibold tracking-widest uppercase mb-1">Student Portal</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-playfair mb-1">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-white/80 text-sm">
                {availableExams.length === 0
                  ? 'No exams are active right now.'
                  : `You have ${availableExams.length} exam${availableExams.length > 1 ? 's' : ''} available.`}
              </p>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Total',  value: availableExams.length },
                { label: 'Done',   value: completedCount },
                { label: 'Active', value: inProgressCount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
                  <p className="text-2xl font-extrabold font-playfair">{value}</p>
                  <p className="text-white/70 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-border shadow-card p-5 sm:p-6"
        >
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair flex items-center gap-2">
            <FileText size={16} className="text-brand-primary" /> Before You Start — Read This
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Timer,         title: 'Timer starts immediately',  desc: 'Once you click Start, the countdown begins. You cannot pause it.',                color: 'bg-brand-primary-lt border-brand-primary/20' },
              { icon: Keyboard,      title: 'Use keyboard shortcuts',    desc: 'Press A, B, C, D to select. Use ← → arrows to navigate between questions.',     color: 'bg-success-light border-success/20' },
              { icon: AlertTriangle, title: 'Do not switch tabs',        desc: 'Switching tabs gives you a warning. 3 warnings will auto-submit your exam.',     color: 'bg-warning-light border-warning/20' },
              { icon: Save,          title: 'Answers are auto-saved',    desc: 'Your answers save automatically every 30 seconds. No need to worry.',            color: 'bg-surface-muted border-border' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className={`flex gap-3 p-4 rounded-xl border ${color}`}>
                <Icon size={18} className="text-brand-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-content-primary text-sm mb-0.5">{title}</p>
                  <p className="text-content-muted text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Exams list */}
        <div>
          <h2 className="text-content-secondary font-bold text-sm mb-3 flex items-center gap-2">
            <FileText size={14} className="text-brand-primary" /> Your Exams
          </h2>

          {availableExams.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-border shadow-card p-12 text-center"
            >
              <div className="w-16 h-16 bg-surface-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-content-muted" />
              </div>
              <h3 className="text-content-primary font-bold font-playfair text-lg mb-1">No Exams Yet</h3>
              <p className="text-content-muted text-sm">No active exams right now. Check back later.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {availableExams.map((exam, i) => {
                const status = getExamStatus(exam.id);
                const active = isExamActive(exam);
                const totalQ = exam.subjects?.reduce((s, sub) => s + (sub.questionCount || 0), 0) || exam.questionCount || 0;
                const totalM = exam.subjects?.reduce((s, sub) => s + (sub.totalMarks || 0), 0) || exam.totalMarks || 0;

                const styles = {
                  completed:   { border: 'border-success-light',  bg: 'bg-success-light/30', badge: 'bg-success-light text-success',        label: 'Completed'  },
                  in_progress: { border: 'border-warning/40',     bg: 'bg-warning-light/30', badge: 'bg-warning-light text-warning-dark',   label: 'In Progress' },
                  not_started: active
                    ? { border: 'border-border',  bg: 'bg-white',            badge: 'bg-brand-primary-lt text-brand-primary', label: 'Available'  }
                    : { border: 'border-danger/20', bg: 'bg-danger-light/20', badge: 'bg-danger-light text-danger',           label: 'Expired'    },
                };
                const s = styles[status] || styles.not_started;

                return (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`${s.bg} border-2 ${s.border} rounded-2xl p-5 shadow-card transition-all`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-content-primary font-bold font-playfair text-base leading-snug">{exam.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${s.badge}`}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-content-secondary mb-3">
                          <span>{exam.class}</span>
                          <span>{totalQ} questions</span>
                          <span>{totalM} marks</span>
                          <span className="font-bold text-brand-primary flex items-center gap-1">
                            <Timer size={11} /> {formatDuration(exam.duration)}
                          </span>
                          <span>Pass: {exam.passMark}%</span>
                        </div>
                        {exam.subjects?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {exam.subjects.map(sub => (
                              <span key={sub.subjectId} className="px-2 py-0.5 bg-white border border-border text-content-secondary rounded-lg text-xs shadow-card">
                                {sub.subjectName}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-4 text-xs text-content-muted">
                          <span>Start: {formatDateTime(exam.startDateTime)}</span>
                          <span>End: {formatDateTime(exam.endDateTime)}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0 sm:self-center">
                        {status === 'completed' ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success-light border border-success/20 text-success text-sm font-bold">
                            <CheckCircle size={14} /> Submitted
                          </div>
                        ) : status === 'in_progress' ? (
                          <button
                            onClick={() => handleContinueExam(exam)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-warning text-white font-bold text-sm transition-all hover:bg-warning-dark active:scale-95 shadow-card-md whitespace-nowrap min-h-[44px]"
                          >
                            <Play size={14} /> Continue Exam
                          </button>
                        ) : active ? (
                          <button
                            onClick={() => handleStartExam(exam)}
                            disabled={startingExam === exam.id}
                            className="btn-primary text-sm whitespace-nowrap"
                          >
                            {startingExam === exam.id ? (
                              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Starting...</>
                            ) : (
                              <><Play size={14} /> Start Exam</>
                            )}
                          </button>
                        ) : (
                          <div className="px-4 py-2.5 rounded-xl bg-danger-light border border-danger/20 text-danger text-xs font-bold">
                            <Clock size={12} className="inline mr-1" /> Period Ended
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-content-muted text-xs pb-6">
          Having issues? Contact your teacher or exam supervisor.
        </p>
      </main>
    </div>
  );
}

export default function ExamInstructionsPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-surface-muted">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
        </div>
      }>
        <ExamInstructionsContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}
