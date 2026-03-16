// app/dashboard/exam-mock-instructions/page.jsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import { Shield, Lock, AlertTriangle, Timer, FileText, Maximize } from 'lucide-react';

function MockExamInstructionsContent() {
  const router = useRouter();
  const { user, fetchWithAuth } = useStudentAuth();
  const [subject, setSubject] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);

  useEffect(() => {
    const mockData = localStorage.getItem('practice_subject');
    const mockActive = localStorage.getItem('mock_exam_active');
    if (mockData && mockActive) {
      setSubject(JSON.parse(mockData));
    } else {
      toast.error('No mock exam session found');
      router.push('/dashboard');
    }
    if (!document.documentElement.requestFullscreen) {
      setFullscreenError(true);
      toast.error('Your browser does not support fullscreen mode');
    }
  }, [router]);

  const enterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      return true;
    } catch {
      setFullscreenError(true);
      toast.error('Failed to enter fullscreen mode. Please enable it manually.');
      return false;
    }
  };

  const handleStartExam = async () => {
    if (!agreed) { toast.error('You must agree to the rules to continue'); return; }
    if (!subject) return;
    setStarting(true);
    setLoading(true);
    const toastId = toast.loading('Preparing mock exam...');
    try {
      const fullscreenSuccess = await enterFullscreen();
      if (!fullscreenSuccess) {
        toast.error('Fullscreen mode is required for mock exam.', { id: toastId });
        setStarting(false);
        setLoading(false);
        return;
      }
      const res = await fetchWithAuth(`/practice?subjectId=${subject.id}&count=30`);
      if (res?.ok) {
        const data = await res.json();
        if (!data.questions || data.questions.length === 0) {
          toast.error(`No questions available for ${subject.name}. Try a different subject.`, { id: toastId });
          setStarting(false); setLoading(false);
          if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
          return;
        }
        localStorage.setItem('practice_session', JSON.stringify({
          id: Date.now().toString(), subjectId: subject.id, subjectName: subject.name,
          questions: data.questions, totalQuestions: data.questions.length,
          currentQuestion: 0, answers: {}, startTime: new Date().toISOString(),
          timeLimit: 60 * 60, difficulty: 'all', status: 'in_progress', isMockExam: true
        }));
        toast.success('Mock exam ready!', { id: toastId });
        setTimeout(() => { router.push('/dashboard/exam-mock-room'); }, 500);
      } else {
        toast.error('Failed to load mock exam questions', { id: toastId });
        setStarting(false); setLoading(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      }
    } catch {
      toast.error('Failed to start mock exam', { id: toastId });
      setStarting(false); setLoading(false);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
  };

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface-muted">
        <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
      </div>
    );
  }

  const rules = [
    { icon: Maximize,     title: 'Fullscreen Mode',   desc: 'Exam opens in fullscreen. Exiting will trigger warnings.',      color: 'bg-danger-light border-danger/20' },
    { icon: Shield,       title: 'No Tab Switching',  desc: '3 tab switches = automatic submission.',                        color: 'bg-danger-light border-danger/20' },
    { icon: Timer,        title: 'Strict Timing',     desc: '60 minutes. Timer starts immediately. Auto-submit on expiry.', color: 'bg-danger-light border-danger/20' },
    { icon: FileText,     title: '30 Questions',      desc: 'You will answer 30 questions in this mock exam.',              color: 'bg-danger-light border-danger/20' },
  ];

  return (
    <div className="min-h-screen bg-surface-muted py-8 px-4 pb-safe">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card-md overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-danger to-danger-dark p-6 sm:p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-playfair">Mock Exam Instructions</h1>
                <p className="text-sm opacity-90 mt-0.5">{subject.name} &middot; Strict Examination Mode</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Warning banner */}
            <div className="mb-6 p-4 bg-danger-light border border-danger/30 rounded-xl">
              <p className="text-sm font-bold text-danger mb-1 flex items-center gap-1.5">
                <AlertTriangle size={14} /> Important: Mock Exam Rules
              </p>
              <p className="text-xs text-danger/80">
                This is a full WAEC simulation. Breaking any rule will result in automatic submission.
              </p>
            </div>

            {/* Rules grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {rules.map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className={`flex items-start gap-3 p-4 rounded-xl border ${color}`}>
                  <div className="w-8 h-8 bg-danger/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-danger" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-danger mb-0.5">{title}</p>
                    <p className="text-xs text-danger/75 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Fullscreen error */}
            {fullscreenError && (
              <div className="mb-5 p-4 bg-warning-light border border-warning/30 rounded-xl">
                <p className="text-sm text-warning-dark flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Fullscreen mode is required. Please ensure your browser allows fullscreen.
                </p>
              </div>
            )}

            {/* Student info */}
            <div className="mb-6 p-4 bg-surface-muted rounded-xl border border-border">
              <p className="text-xs font-bold text-content-primary mb-3 font-playfair">Student Information</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Name',     val: `${user?.firstName} ${user?.lastName}` },
                  { label: 'Login ID', val: user?.loginId },
                  { label: 'Class',    val: user?.class },
                  { label: 'Subject',  val: subject.name },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <p className="text-xs text-content-muted">{label}</p>
                    <p className="font-semibold text-content-primary">{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer mb-6 p-4 border border-border rounded-xl hover:bg-surface-muted transition-colors">
              <input
                type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-danger flex-shrink-0"
              />
              <span className="text-sm text-content-secondary leading-relaxed">
                I understand that this is a strict mock exam. I agree to follow all rules and understand that violations will lead to automatic submission.
              </span>
            </label>

            {agreed && (
              <p className="text-xs text-danger text-center mb-4 animate-pulse flex items-center justify-center gap-1">
                <Maximize size={12} /> The exam will open in fullscreen immediately when you click Start
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => router.push('/dashboard')} className="btn-secondary flex-1 text-sm">
                Cancel
              </button>
              <button
                onClick={handleStartExam}
                disabled={!agreed || starting}
                className="flex-1 py-3 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-2"
              >
                {starting ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Starting...</>
                ) : (
                  <><Shield size={14} /> Start Mock Exam</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function MockExamInstructionsPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-surface-muted">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin" />
        </div>
      }>
        <MockExamInstructionsContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}
