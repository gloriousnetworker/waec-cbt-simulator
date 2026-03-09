// app/exam-instructions/page.jsx
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
  const [startingExam, setStartingExam] = useState(false);
  const router = useRouter();
  const { user, fetchWithAuth, logout } = useStudentAuth();

  useEffect(() => {
    loadExamProgress();
    fetchAvailableExams();
  }, []);

  const loadExamProgress = () => {
    const saved = localStorage.getItem('examProgress');
    if (saved) {
      setExamProgress(JSON.parse(saved));
    }
  };

  const fetchAvailableExams = async () => {
    try {
      const response = await fetchWithAuth('/available-exams');
      if (response && response.ok) {
        const data = await response.json();
        setAvailableExams(data.exams || []);
      }
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam) => {
    setStartingExam(true);
    const toastId = toast.loading(`Starting exam...`);

    try {
      const response = await fetchWithAuth('/exams/start', {
        method: 'POST',
        body: JSON.stringify({ examSetupId: exam.id })
      });

      if (response && response.ok) {
        const data = await response.json();
        
        const updatedProgress = {
          ...examProgress,
          [exam.id]: {
            examId: data.exam.id,
            title: exam.title,
            status: 'in_progress',
            answers: {},
            startTime: data.exam.startTime,
            duration: data.exam.duration
          }
        };
        
        localStorage.setItem('examProgress', JSON.stringify(updatedProgress));
        setExamProgress(updatedProgress);
        
        toast.success(`Exam started!`, { id: toastId });
        router.push(`/exam-room?examId=${data.exam.id}&examSetupId=${exam.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start exam', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to start exam', { id: toastId });
    } finally {
      setStartingExam(false);
    }
  };

  const handleContinueExam = (examId, examSetupId) => {
    const progress = examProgress[examId];
    router.push(`/exam-room?examId=${progress.examId}&examSetupId=${examSetupId}`);
  };

  const handleLogout = async () => {
    await logout();
  };

  const getExamStatus = (examId) => {
    const progress = examProgress[examId];
    if (!progress) return 'not_started';
    return progress.status;
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const isExamActive = (exam) => {
    const now = new Date();
    const start = exam.startDateTime?._seconds ? new Date(exam.startDateTime._seconds * 1000) : new Date(exam.startDateTime);
    const end = exam.endDateTime?._seconds ? new Date(exam.endDateTime._seconds * 1000) : new Date(exam.endDateTime);
    return now >= start && now <= end;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const completedCount = availableExams.filter(e => getExamStatus(e.id) === 'completed').length;
  const inProgressCount = availableExams.filter(e => getExamStatus(e.id) === 'in_progress').length;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#039994]/10 to-[#02857f]/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-playfair">Loading exam instructions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-[#039994] to-[#02857f] p-8 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h1 className="text-3xl font-bold font-playfair mb-2">
                    Welcome, {user?.firstName} {user?.lastName}!
                  </h1>
                  <p className="text-white/90 font-playfair">
                    {user?.class} • Login ID: {user?.loginId}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-playfair text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4 font-playfair">📋 Exam Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Timed Exams</h3>
                  <p className="text-sm text-blue-600">Each exam has a specific time limit. Timer starts immediately.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">Answer Format</h3>
                  <p className="text-sm text-green-600">Select answers by clicking or using keys A, B, C, D.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">No Tab Switching</h3>
                  <p className="text-sm text-yellow-600">Switching tabs will result in warnings. 3 warnings = auto-submit.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                <span className="text-2xl">💾</span>
                <div>
                  <h3 className="font-semibold text-purple-800 mb-1">Auto-Save</h3>
                  <p className="text-sm text-purple-600">Answers are saved automatically.</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1E1E1E] font-playfair">Your Exams</h2>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  {completedCount} completed • {inProgressCount} in progress
                </div>
              </div>
              
              <div className="space-y-4">
                {availableExams.map((exam) => {
                  const status = getExamStatus(exam.id);
                  const isActive = isExamActive(exam);
                  const statusColors = {
                    not_started: isActive ? 'border-gray-200 hover:border-[#039994]' : 'border-gray-200 bg-gray-50 opacity-60',
                    in_progress: 'border-yellow-400 bg-yellow-50',
                    completed: 'border-green-400 bg-green-50'
                  };
                  
                  const totalQuestions = exam.subjects?.reduce((sum, s) => sum + (s.questionCount || 0), 0) || 0;
                  const totalMarks = exam.subjects?.reduce((sum, s) => sum + (s.totalMarks || 0), 0) || 0;
                  
                  return (
                    <motion.div
                      key={exam.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border-2 rounded-xl p-6 transition-all ${statusColors[status]}`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-bold text-[#1E1E1E] font-playfair">{exam.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'completed' ? 'bg-green-100 text-green-700' :
                              status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              isActive ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {status === 'completed' ? '✓ Completed' : 
                               status === 'in_progress' ? '⏳ In Progress' : 
                               isActive ? '⏺️ Available' : '⏰ Expired'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-[#626060] mb-3">
                            {exam.class} • {totalQuestions} questions • Total Marks: {totalMarks} • Pass Mark: {exam.passMark}% • Duration: {formatDuration(exam.duration)}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs text-[#626060]">
                            <div>
                              <span className="font-[600]">Starts:</span> {formatDateTime(exam.startDateTime)}
                            </div>
                            <div>
                              <span className="font-[600]">Ends:</span> {formatDateTime(exam.endDateTime)}
                            </div>
                          </div>
                        </div>
                        
                        {status === 'completed' ? (
                          <div className="text-green-600 text-2xl">✓</div>
                        ) : status === 'in_progress' ? (
                          <button
                            onClick={() => handleContinueExam(exam.id, exam.id)}
                            disabled={startingExam}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-playfair text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Continue Exam
                          </button>
                        ) : isActive ? (
                          <button
                            onClick={() => handleStartExam(exam)}
                            disabled={startingExam}
                            className="px-6 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#02857f] transition-colors font-playfair text-sm font-medium disabled:opacity-50 whitespace-nowrap"
                          >
                            Start Exam
                          </button>
                        ) : (
                          <div className="text-red-500 text-sm font-medium whitespace-nowrap">
                            Exam Period Ended
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {availableExams.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-[#1E1E1E] mb-2 font-playfair">No Exams Available</h3>
                <p className="text-[#626060] mb-4">You don't have any active exams at the moment.</p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-[#039994] text-white rounded-lg hover:bg-[#02857f] transition-colors font-playfair"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ExamInstructionsPage() {
  return (
    <StudentProtectedRoute>
      <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#039994]/10 to-[#02857f]/10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-playfair">Loading...</p>
          </div>
        </div>
      }>
        <ExamInstructionsContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}whats