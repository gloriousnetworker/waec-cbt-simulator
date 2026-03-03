// app/exam-instructions/page.jsx
'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import toast from 'react-hot-toast';

function ExamInstructionsContent() {
  const [subjects, setSubjects] = useState([]);
  const [examProgress, setExamProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [startingExam, setStartingExam] = useState(false);
  const [submittingAll, setSubmittingAll] = useState(false);
  const router = useRouter();
  const { user, fetchWithAuth, logout } = useStudentAuth();

  useEffect(() => {
    loadExamProgress();
    fetchSubjects();
  }, []);

  const loadExamProgress = () => {
    const saved = localStorage.getItem('examProgress');
    if (saved) {
      setExamProgress(JSON.parse(saved));
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetchWithAuth('/subjects');
      if (response && response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSubject = async (subject) => {
    setStartingExam(true);
    const toastId = toast.loading(`Starting ${subject.name} exam...`);

    try {
      const response = await fetchWithAuth('/exams/start', {
        method: 'POST',
        body: JSON.stringify({ subjectId: subject.id })
      });

      if (response && response.ok) {
        const data = await response.json();
        
        const updatedProgress = {
          ...examProgress,
          [subject.id]: {
            examId: data.exam.id,
            subject: subject.name,
            status: 'in_progress',
            answers: {},
            startTime: data.exam.startTime
          }
        };
        
        localStorage.setItem('examProgress', JSON.stringify(updatedProgress));
        setExamProgress(updatedProgress);
        
        toast.success(`${subject.name} exam started!`, { id: toastId });
        router.push(`/exam-room?subjectId=${subject.id}&examId=${data.exam.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start exam', { id: toastId });
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Failed to start exam', { id: toastId });
    } finally {
      setStartingExam(false);
    }
  };

  const handleContinueExam = (subjectId) => {
    const progress = examProgress[subjectId];
    router.push(`/exam-room?subjectId=${subjectId}&examId=${progress.examId}`);
  };

  const handleSubmitAllExams = async () => {
    const inProgressSubjects = subjects.filter(s => 
      examProgress[s.id] && examProgress[s.id].status === 'in_progress'
    );

    if (inProgressSubjects.length === 0) {
      toast.success('All exams completed! Logging out...');
      localStorage.removeItem('examProgress');
      setTimeout(() => {
        logout();
      }, 1500);
      return;
    }

    setSubmittingAll(true);
    const toastId = toast.loading(`Submitting ${inProgressSubjects.length} exams...`);

    try {
      const submissionPromises = inProgressSubjects.map(async (subject) => {
        const progress = examProgress[subject.id];
        if (progress.examId) {
          return fetchWithAuth(`/exams/${progress.examId}/submit`, {
            method: 'POST'
          });
        }
        return null;
      });

      const results = await Promise.all(submissionPromises);
      
      const allSuccessful = results.every(r => r && r.ok);

      if (allSuccessful) {
        toast.success('All exams submitted successfully! Logging out...', { id: toastId });
        localStorage.removeItem('examProgress');
        setTimeout(() => {
          logout();
        }, 2000);
      } else {
        toast.error('Some exams failed to submit. Please try again.', { id: toastId });
      }
    } catch (error) {
      console.error('Error submitting exams:', error);
      toast.error('Failed to submit exams. Please try again.', { id: toastId });
    } finally {
      setSubmittingAll(false);
    }
  };

  const getSubjectStatus = (subjectId) => {
    const progress = examProgress[subjectId];
    if (!progress) return 'not_started';
    return progress.status;
  };

  const allCompleted = subjects.every(s => getSubjectStatus(s.id) === 'completed');
  const completedCount = subjects.filter(s => getSubjectStatus(s.id) === 'completed').length;
  const inProgressCount = subjects.filter(s => getSubjectStatus(s.id) === 'in_progress').length;
  const hasStartedAny = subjects.some(s => getSubjectStatus(s.id) !== 'not_started');

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
                    {user?.class} • {user?.school || 'Kogi State College of Education'}
                  </p>
                </div>
              </div>
              {hasStartedAny && (
                <button
                  onClick={handleSubmitAllExams}
                  disabled={submittingAll}
                  className="px-6 py-3 bg-white text-[#039994] rounded-lg hover:bg-gray-100 transition-colors font-playfair text-sm font-medium disabled:opacity-50"
                >
                  {submittingAll ? 'Submitting...' : 'Submit & Logout'}
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-[#1E1E1E] mb-4 font-playfair">📋 Exam Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <span className="text-2xl">⏱️</span>
                <div>
                  <h3 className="font-semibold text-blue-800 mb-1">Timed Exams</h3>
                  <p className="text-sm text-blue-600">Each subject has a specific time limit. Timer starts immediately.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-green-800 mb-1">One Subject at a Time</h3>
                  <p className="text-sm text-green-600">Complete subjects in any order. Progress is saved automatically.</p>
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
                  <p className="text-sm text-purple-600">Answers are saved automatically every minute.</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#1E1E1E] font-playfair">Your Subjects</h2>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                  Progress: {completedCount}/{subjects.length} completed • {inProgressCount} in progress
                </div>
              </div>
              
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const status = getSubjectStatus(subject.id);
                  const statusColors = {
                    not_started: 'border-gray-200 hover:border-[#039994]',
                    in_progress: 'border-yellow-400 bg-yellow-50',
                    completed: 'border-green-400 bg-green-50'
                  };
                  
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border-2 rounded-xl p-6 transition-all ${statusColors[status]}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-[#1E1E1E] font-playfair">{subject.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              status === 'completed' ? 'bg-green-100 text-green-700' :
                              status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {status === 'completed' ? '✓ Completed' : 
                               status === 'in_progress' ? '⏳ In Progress' : 
                               '⏺️ Not Started'}
                            </span>
                          </div>
                          <p className="text-sm text-[#626060] mb-2">
                            Duration: {Math.floor(subject.duration / 60)}h {subject.duration % 60}m • Questions: {subject.questionCount || 50}
                          </p>
                        </div>
                        
                        {status === 'completed' ? (
                          <div className="text-green-600 text-2xl">✓</div>
                        ) : status === 'in_progress' ? (
                          <button
                            onClick={() => handleContinueExam(subject.id)}
                            disabled={startingExam || submittingAll}
                            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-playfair text-sm font-medium disabled:opacity-50"
                          >
                            Continue Exam
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartSubject(subject)}
                            disabled={startingExam || submittingAll}
                            className="px-6 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#02857f] transition-colors font-playfair text-sm font-medium disabled:opacity-50"
                          >
                            Start Exam
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {allCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
              >
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
                <p className="text-green-600 mb-4">You have completed all your exams. Logging out...</p>
                <button
                  onClick={logout}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-playfair"
                >
                  Logout
                </button>
              </motion.div>
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
}