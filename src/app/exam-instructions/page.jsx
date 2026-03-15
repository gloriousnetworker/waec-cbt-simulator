'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import toast from 'react-hot-toast';

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
    const toastId = toast.loading('Starting exam…');
    try {
      const res = await fetchWithAuth('/exams/start', {
        method: 'POST',
        body: JSON.stringify({ examSetupId: exam.id }),
      });

      if (res?.ok) {
        const data = await res.json();

        const startTime = new Date().toISOString();
        // duration is in minutes — convert to ms
        const durationMs = (exam.duration || 120) * 60 * 1000;
        const endTime = new Date(Date.now() + durationMs).toISOString();

        localStorage.setItem(`active_exam_${data.exam.id}`, JSON.stringify({
          id: data.exam.id,
          examSetupId: exam.id,
          title: exam.title,
          duration: exam.duration,
          startTime,
          endTime,
          questions: data.exam.questions || [],
          totalMarks: exam.subjects?.reduce((s, sub) => s + (sub.totalMarks || 0), 0) || 0,
        }));

        const updatedProgress = {
          ...examProgress,
          [exam.id]: {
            examId: data.exam.id,
            title: exam.title,
            status: 'in_progress',
            answers: {},
            startTime,
            endTime,
            duration: exam.duration,
            examSetupId: exam.id,
          },
        };
        localStorage.setItem('examProgress', JSON.stringify(updatedProgress));
        setExamProgress(updatedProgress);

        toast.success('Exam started! Good luck! 🎉', { id: toastId });
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
    if (progress?.examId) {
      router.push(`/exam-room?examId=${progress.examId}&examSetupId=${exam.id}`);
    }
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
      <div className="fixed inset-0 flex items-center justify-center bg-[#f0fffe]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full border-4 border-[#039994]/20"/>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#039994] animate-spin"/>
          </div>
          <p className="text-[#039994] font-bold text-xl font-playfair">Loading exams…</p>
          <p className="text-gray-400 text-sm mt-1 font-playfair">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══════════════ HEADER ══════════════ */}
      <header className="bg-white border-b-2 border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#039994] flex items-center justify-center text-white font-extrabold font-playfair text-sm shadow-sm shadow-[#039994]/30">
              {initials}
            </div>
            <div>
              <p className="text-gray-800 font-bold font-playfair text-sm leading-tight">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-400 text-xs font-playfair">{user?.class} · {user?.loginId}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-sm font-playfair font-medium hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ══════════════ WELCOME CARD ══════════════ */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#039994] to-emerald-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-[#039994]/20 overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 -translate-y-1/2 translate-x-1/4 pointer-events-none"/>
          <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/8 translate-y-1/2 pointer-events-none"/>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <p className="text-white/70 text-xs font-semibold tracking-widest uppercase font-playfair mb-1">Student Portal</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-playfair mb-1">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-white/80 text-sm font-playfair">
                {availableExams.length === 0
                  ? 'No exams are active right now.'
                  : `You have ${availableExams.length} exam${availableExams.length > 1 ? 's' : ''} available.`}
              </p>
            </div>

            <div className="flex gap-3">
              {[
                { label: 'Total', value: availableExams.length },
                { label: 'Done', value: completedCount },
                { label: 'Active', value: inProgressCount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/15 border border-white/20 rounded-xl px-4 py-3 text-center min-w-[64px]">
                  <div className="text-2xl font-extrabold font-playfair">{value}</div>
                  <div className="text-white/70 text-xs font-playfair mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ══════════════ INSTRUCTIONS ══════════════ */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
          <h2 className="text-gray-800 font-bold font-playfair mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-sm">📋</span>
            Before You Start — Read This
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '⏱️', title: 'Timer starts immediately', desc: 'Once you click Start, the countdown begins. You cannot pause it.', color: 'bg-blue-50 border-blue-100' },
              { icon: '⌨️', title: 'Use keyboard shortcuts', desc: 'Press A, B, C, D to select. Use ← → arrows to go between questions.', color: 'bg-green-50 border-green-100' },
              { icon: '🚫', title: 'Do not switch tabs', desc: 'Switching tabs gives you a warning. 3 warnings will auto-submit your exam.', color: 'bg-amber-50 border-amber-100' },
              { icon: '💾', title: 'Answers are auto-saved', desc: 'Your answers save automatically every 30 seconds. No need to worry.', color: 'bg-purple-50 border-purple-100' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} className={`flex gap-3 p-4 rounded-xl border ${color}`}>
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="font-bold text-gray-800 text-sm font-playfair mb-0.5">{title}</p>
                  <p className="text-gray-500 text-xs font-playfair leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════ EXAMS LIST ══════════════ */}
        <div>
          <h2 className="text-gray-700 font-bold font-playfair text-sm mb-3 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#039994" strokeWidth="2.5">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Your Exams
          </h2>

          {availableExams.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-gray-800 font-bold font-playfair text-lg mb-1">No Exams Yet</h3>
              <p className="text-gray-400 text-sm font-playfair">No active exams right now. Check back later.</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {availableExams.map((exam, i) => {
                const status = getExamStatus(exam.id);
                const active = isExamActive(exam);
                const totalQ = exam.subjects?.reduce((s, sub) => s + (sub.questionCount || 0), 0) || exam.questionCount || 0;
                const totalM = exam.subjects?.reduce((s, sub) => s + (sub.totalMarks || 0), 0) || exam.totalMarks || 0;

                // Style per status
                const styles = {
                  completed:   { border: 'border-emerald-200', bg: 'bg-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', label: '✓ Completed' },
                  in_progress: { border: 'border-amber-300', bg: 'bg-amber-50/50', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: '⏳ In Progress' },
                  not_started: active
                    ? { border: 'border-gray-200', bg: 'bg-white', badge: 'bg-[#039994]/10 text-[#039994]', dot: 'bg-[#039994]', label: '🟢 Available' }
                    : { border: 'border-red-100', bg: 'bg-red-50/30', badge: 'bg-red-100 text-red-600', dot: 'bg-red-400', label: '⏰ Expired' },
                };
                const s = styles[status] || styles.not_started;

                return (
                  <motion.div key={exam.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className={`${s.bg} border-2 ${s.border} rounded-2xl p-5 shadow-sm transition-all`}>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title + badge */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-gray-900 font-bold font-playfair text-base leading-snug">{exam.title}</h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-playfair flex-shrink-0 ${s.badge}`}>
                            {s.label}
                          </span>
                        </div>

                        {/* Key facts row */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 font-playfair mb-3">
                          <span className="flex items-center gap-1">🏫 {exam.class}</span>
                          <span className="flex items-center gap-1">❓ {totalQ} questions</span>
                          <span className="flex items-center gap-1">🏆 {totalM} marks</span>
                          <span className="flex items-center gap-1 font-bold text-[#039994]">⏱️ {formatDuration(exam.duration)}</span>
                          <span className="flex items-center gap-1">✅ Pass: {exam.passMark}%</span>
                        </div>

                        {/* Subjects */}
                        {exam.subjects?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {exam.subjects.map(sub => (
                              <span key={sub.subjectId}
                                className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 rounded-md text-xs font-playfair shadow-sm">
                                {sub.subjectName}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Times */}
                        <div className="flex flex-wrap gap-x-4 text-xs text-gray-400 font-playfair">
                          <span>🗓 Start: {formatDateTime(exam.startDateTime)}</span>
                          <span>🔚 End: {formatDateTime(exam.endDateTime)}</span>
                        </div>
                      </div>

                      {/* Action button */}
                      <div className="flex-shrink-0 sm:self-center">
                        {status === 'completed' ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 text-sm font-bold font-playfair">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            Submitted
                          </div>
                        ) : status === 'in_progress' ? (
                          <button onClick={() => handleContinueExam(exam)}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold font-playfair text-sm transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-200 whitespace-nowrap">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                            Continue Exam
                          </button>
                        ) : active ? (
                          <button onClick={() => handleStartExam(exam)}
                            disabled={startingExam === exam.id}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#039994] hover:bg-[#028a85] text-white font-bold font-playfair text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shadow-[#039994]/30 whitespace-nowrap">
                            {startingExam === exam.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                                Starting…
                              </>
                            ) : (
                              <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Start Exam
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs font-bold font-playfair">
                            Period Ended
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

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs font-playfair pb-6">
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
        <div className="fixed inset-0 flex items-center justify-center bg-[#f0fffe]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-[#039994]/20"/>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#039994] animate-spin"/>
            </div>
            <p className="text-[#039994] font-bold text-xl font-playfair">Loading…</p>
          </div>
        </div>
      }>
        <ExamInstructionsContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}