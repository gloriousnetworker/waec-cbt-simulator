// app/dashboard/exam-mock-instructions/page.jsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';

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
      const parsed = JSON.parse(mockData);
      setSubject(parsed);
    } else {
      toast.error('No mock exam session found');
      router.push('/dashboard');
    }

    // Check if browser supports fullscreen
    const isFullscreenSupported = document.documentElement.requestFullscreen !== undefined;
    if (!isFullscreenSupported) {
      setFullscreenError(true);
      toast.error('Your browser does not support fullscreen mode');
    }
  }, [router]);

  const enterFullscreen = async () => {
    const elem = document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Fullscreen error:', err);
      setFullscreenError(true);
      toast.error('Failed to enter fullscreen mode. Please enable it manually.');
      return false;
    }
  };

  const handleStartExam = async () => {
    if (!agreed) {
      toast.error('You must agree to the rules to continue');
      return;
    }

    if (!subject) return;
    
    setStarting(true);
    setLoading(true);
    const toastId = toast.loading('Preparing mock exam...');

    try {
      // Enter fullscreen FIRST before any other operations
      const fullscreenSuccess = await enterFullscreen();
      
      // Even if fullscreen fails, we'll continue but show a warning
      if (!fullscreenSuccess) {
        toast.error('Fullscreen mode is required for mock exam. Please enable it.', { id: toastId });
        setStarting(false);
        setLoading(false);
        return;
      }

      const response = await fetchWithAuth(`/practice?subjectId=${subject.id}&count=30`);
      
      if (response && response.ok) {
        const data = await response.json();
        
        const practiceSession = {
          id: Date.now().toString(),
          subjectId: subject.id,
          subjectName: subject.name,
          questions: data.questions,
          totalQuestions: data.questions.length,
          currentQuestion: 0,
          answers: {},
          startTime: new Date().toISOString(),
          timeLimit: 60 * 60,
          difficulty: 'all',
          status: 'in_progress',
          isMockExam: true
        };
        
        localStorage.setItem('practice_session', JSON.stringify(practiceSession));
        toast.success('Mock exam ready!', { id: toastId });
        
        // Small delay to ensure fullscreen is properly activated
        setTimeout(() => {
          router.push('/dashboard/exam-mock-room');
        }, 500);
      } else {
        toast.error('Failed to load mock exam questions', { id: toastId });
        setStarting(false);
        setLoading(false);
        
        // Exit fullscreen if there's an error
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error starting mock exam:', error);
      toast.error('Failed to start mock exam', { id: toastId });
      setStarting(false);
      setLoading(false);
      
      // Exit fullscreen if there's an error
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                ⚠️
              </div>
              <div>
                <h1 className="text-3xl font-bold font-playfair mb-2">Mock Exam Instructions</h1>
                <p className="text-white/90 font-playfair">
                  {subject.name} • Strict Examination Mode
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-xl">
              <h2 className="text-xl font-bold text-red-800 mb-3 font-playfair">⚠️ Important: Mock Exam Rules</h2>
              <p className="text-red-700 text-sm mb-4">
                This is a full WAEC simulation. Breaking any rule will result in automatic submission.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <span className="text-2xl">🔒</span>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Fullscreen Mode</h3>
                  <p className="text-sm text-red-600">Exam will start in fullscreen immediately. Exiting will trigger warnings.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <span className="text-2xl">🚫</span>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">No Tab Switching</h3>
                  <p className="text-sm text-red-600">3 tab switches = auto-submit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Strict Timing</h3>
                  <p className="text-sm text-red-600">60 minutes timer starts immediately. Auto-submit when time expires.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">30 Questions</h3>
                  <p className="text-sm text-red-600">You will answer 30 questions in this mock exam.</p>
                </div>
              </div>
            </div>

            {fullscreenError && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm font-playfair">
                  ⚠️ Fullscreen mode is required for this exam. Please ensure your browser allows fullscreen.
                </p>
              </div>
            )}

            <div className="mb-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-[#1E1E1E] mb-4 font-playfair">Student Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#626060]">Name:</p>
                  <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-[#626060]">Login ID:</p>
                  <p className="font-medium">{user?.loginId}</p>
                </div>
                <div>
                  <p className="text-[#626060]">Class:</p>
                  <p className="font-medium">{user?.class}</p>
                </div>
                <div>
                  <p className="text-[#626060]">Subject:</p>
                  <p className="font-medium">{subject.name}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 text-[#DC2626]"
                />
                <span className="text-sm text-[#1E1E1E] font-playfair">
                  I understand that this is a strict mock exam. I agree to follow all rules and understand that violations will lead to automatic submission.
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 py-3 bg-white text-[#DC2626] border border-[#DC2626] rounded-lg hover:bg-red-50 transition-colors font-playfair text-sm font-[600]"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExam}
                disabled={!agreed || starting}
                className={`flex-1 py-3 bg-[#DC2626] text-white rounded-lg hover:bg-[#B91C1C] transition-colors font-playfair text-sm font-[600] ${
                  (!agreed || starting) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {starting ? 'Starting...' : 'Start Mock Exam'}
              </button>
            </div>

            {agreed && (
              <p className="text-xs text-[#DC2626] mt-4 text-center animate-pulse">
                ⚡ The exam will open in fullscreen mode immediately when you click Start
              </p>
            )}
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
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <MockExamInstructionsContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}