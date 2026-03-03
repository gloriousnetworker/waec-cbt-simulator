// app/exam-room/page.jsx
'use client';
import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProtectedRoute from '../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

const examRoomContainer = "min-h-screen bg-[#F9FAFB]";
const examRoomHeader = "bg-white border-b border-[#E8E8E8] sticky top-0 z-10";
const examRoomHeaderInner = "max-w-7xl mx-auto px-4 py-3 flex justify-between items-center";
const examRoomSubject = "text-[16px] leading-[120%] font-[600] text-[#1E1E1E] font-playfair";
const examRoomTimer = "flex items-center gap-2";
const examRoomTimerText = "text-[16px] leading-[100%] font-[600] font-playfair";
const examRoomTimerNormal = "text-[#039994]";
const examRoomTimerWarning = "text-[#F59E0B]";
const examRoomTimerDanger = "text-[#DC2626]";
const examRoomMain = "max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6";
const examRoomContent = "lg:col-span-2";
const examRoomContentInner = "space-y-6";
const examRoomQuestionCard = "bg-white rounded-xl p-6 border border-[#E8E8E8]";
const examRoomQuestionHeader = "flex justify-between items-center mb-4";
const examRoomQuestionNumber = "text-[14px] leading-[100%] font-[600] text-[#039994] font-playfair";
const examRoomQuestionMark = "text-[14px] leading-[100%] font-[600] text-[#626060] font-playfair";
const examRoomQuestionText = "text-[14px] leading-[150%] font-[500] text-[#1E1E1E] mb-6 font-playfair";
const examRoomOptionsGrid = "grid grid-cols-1 md:grid-cols-2 gap-3";
const examRoomOption = "border rounded-lg p-4 flex items-start gap-3 cursor-pointer transition-all";
const examRoomOptionInactive = "border-[#E8E8E8] hover:border-[#039994]";
const examRoomOptionActive = "border-[#039994] bg-[#E8F8F6]";
const examRoomOptionLabel = "w-8 h-8 rounded-full flex items-center justify-center text-[14px] leading-[100%] font-[600] font-playfair flex-shrink-0";
const examRoomOptionLabelInactive = "border border-[#E8E8E8] text-[#626060]";
const examRoomOptionLabelActive = "bg-[#039994] text-white";
const examRoomOptionText = "text-[14px] leading-[150%] font-[500] text-[#1E1E1E] font-playfair";
const examRoomNavigation = "flex justify-between";
const examRoomNavButton = "px-6 py-3 rounded-lg font-playfair text-[14px] leading-[100%] font-[600] transition-all";
const examRoomNavButtonPrimary = "bg-[#039994] text-white hover:bg-[#028a85] disabled:opacity-50 disabled:cursor-not-allowed";
const examRoomNavButtonSecondary = "bg-white text-[#039994] border border-[#039994] hover:bg-[#F0F9F8] disabled:opacity-50 disabled:cursor-not-allowed";
const examRoomSidebar = "lg:col-span-1 bg-white rounded-xl p-6 border border-[#E8E8E8] h-fit sticky top-20";
const examRoomSidebarTitle = "text-[16px] leading-[120%] font-[600] text-[#1E1E1E] mb-4 font-playfair";
const examRoomProgressBar = "mb-6";
const examRoomProgressText = "flex justify-between text-[13px] leading-[100%] font-[500] text-[#626060] mb-2 font-playfair";
const examRoomProgressBarBg = "h-2 bg-[#F0F0F0] rounded-full overflow-hidden";
const examRoomProgressBarFill = "h-full bg-[#039994] rounded-full transition-all";
const examRoomQuestionGrid = "grid grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2 mb-6";
const examRoomQuestionDot = "w-10 h-10 rounded-full flex items-center justify-center text-[13px] leading-[100%] font-[600] font-playfair transition-all cursor-pointer";
const examRoomQuestionDotUnanswered = "bg-white border border-[#E8E8E8] text-[#626060] hover:border-[#039994]";
const examRoomQuestionDotAnswered = "bg-[#E8F8F6] border border-[#039994] text-[#039994]";
const examRoomQuestionDotCurrent = "bg-[#039994] text-white";
const examRoomActions = "space-y-3";
const examRoomActionButton = "w-full py-3 rounded-lg font-playfair text-[14px] leading-[100%] font-[600] transition-all";
const examRoomSubmitButton = "bg-[#DC2626] text-white hover:bg-[#B91C1C]";
const examRoomFinishButton = "bg-[#10B981] text-white hover:bg-[#059669]";
const examWarningModal = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
const examWarningCard = "bg-white rounded-xl p-6 max-w-md mx-4";
const examWarningIcon = "text-5xl mb-4 text-center";
const examWarningTitle = "text-[20px] leading-[120%] font-[700] tracking-[-0.03em] mb-2 text-center font-playfair";
const examWarningText = "text-[14px] leading-[150%] font-[500] text-[#626060] mb-6 text-center font-playfair";
const examWarningButton = "w-full py-3 rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:opacity-90 transition-all";
const modalOverlay = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
const modalContainer = "bg-white rounded-xl p-6 max-w-md mx-4";
const modalTitle = "text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair";
const modalText = "text-[14px] leading-[150%] font-[500] text-[#626060] mb-6 font-playfair";
const modalActions = "flex gap-3";
const modalButtonSecondary = "flex-1 py-3 bg-white text-[#039994] border border-[#039994] rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#F0F9F8]";
const modalButtonDanger = "flex-1 py-3 bg-[#DC2626] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#B91C1C]";

function ExamRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subjectId');
  const examId = searchParams.get('examId');
  const subjectName = searchParams.get('subject');
  const { fetchWithAuth, saveOfflineData, getOfflineData } = useStudentAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [showWarning, setShowWarning] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState('');
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [totalMarks, setTotalMarks] = useState(0);
  const [duration, setDuration] = useState(0);
  const violationTimeoutRef = useRef(null);
  const toastShownRef = useRef(false);
  const autoSaveIntervalRef = useRef(null);

  useEffect(() => {
    if (!examId || !subjectId) {
      toast.error('Invalid exam session');
      router.push('/exam-instructions');
      return;
    }

    fetchExam();

    enterFullscreen();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [examId, subjectId]);

  const fetchExam = async () => {
    setLoading(true);
    try {
      const offlineData = getOfflineData(`exam_${examId}`);
      
      if (offlineData) {
        setQuestions(offlineData.questions || []);
        setAnswers(offlineData.answers || {});
        setDuration(offlineData.duration || 0);
        setTimeLeft(offlineData.timeLeft || offlineData.duration * 60 || 0);
        setTotalMarks(offlineData.totalMarks || 0);
        setLoading(false);
        return;
      }

      const response = await fetchWithAuth(`/exams/${examId}`);
      
      if (response && response.ok) {
        const data = await response.json();
        setQuestions(data.exam.questions || []);
        setAnswers(data.exam.answers || {});
        setDuration(data.exam.duration || 0);
        setTimeLeft(data.exam.duration * 60 || 0);
        const total = data.exam.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
        setTotalMarks(total);
      } else {
        toast.error('Failed to load exam');
        router.push('/exam-instructions');
      }
    } catch (error) {
      console.error('Error loading exam:', error);
      toast.error('Failed to load exam');
      router.push('/exam-instructions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!examId || examSubmitted) return;

    autoSaveIntervalRef.current = setInterval(() => {
      saveCurrentAnswers();
    }, 30000);

    return () => clearInterval(autoSaveIntervalRef.current);
  }, [examId, answers, examSubmitted]);

  const saveCurrentAnswers = async () => {
    if (!examId || Object.keys(answers).length === 0 || examSubmitted) return;

    try {
      const answerEntries = Object.entries(answers);
      for (const [questionId, index] of answerEntries) {
        const answer = String.fromCharCode(65 + index);
        await fetchWithAuth(`/exams/${examId}/save-answer`, {
          method: 'POST',
          body: JSON.stringify({ questionId, answer })
        }).catch(() => {});
      }

      saveOfflineData(`exam_${examId}`, {
        questions,
        answers,
        duration,
        timeLeft: timeLeft,
        totalMarks
      });
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (timeLeft <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit('Time expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examSubmitted]);

  const recordTabSwitch = async () => {
    if (!examId || examSubmitted) return;

    try {
      const response = await fetchWithAuth(`/exams/${examId}/tab-switch`, {
        method: 'POST'
      });
      
      if (response && response.ok) {
        const data = await response.json();
        setTabSwitches(data.tabSwitches);
        
        if (data.autoSubmitted) {
          handleAutoSubmit('Auto-submitted due to multiple tab switches');
        }
      }
    } catch (error) {
      console.error('Error recording tab switch:', error);
    }
  };

  const handleViolation = useCallback((type) => {
    if (examSubmitted) return;

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    setWarningCount((prev) => {
      const newCount = prev + 1;
      setLastViolationType(type);
      setShowWarning(true);
      recordTabSwitch();

      if (newCount >= 3) {
        violationTimeoutRef.current = setTimeout(() => {
          handleAutoSubmit(`Malpractice detected after 3 warnings: ${type}`);
        }, 100);
      }

      return newCount;
    });
  }, [examSubmitted]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !examSubmitted) {
      handleViolation('Tab switched');
    }
  }, [examSubmitted, handleViolation]);

  const handleBlur = useCallback(() => {
    if (!examSubmitted && !document.hidden) {
      handleViolation('Window lost focus');
    }
  }, [examSubmitted, handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !examSubmitted) {
      handleViolation('Exited fullscreen mode');
      setTimeout(() => {
        if (!examSubmitted) {
          enterFullscreen();
        }
      }, 100);
    }
  }, [examSubmitted, handleViolation]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleVisibilityChange, handleBlur, handleFullscreenChange, handleContextMenu, handleKeyDown]);

  const handleAutoSubmit = async (reason) => {
    if (examSubmitted) return;
    await submitExam(true, reason);
  };

  const submitExam = async (isAuto = false, reason = '') => {
    if (examSubmitted) return;
    
    setExamSubmitted(true);
    
    try {
      const response = await fetchWithAuth(`/exams/${examId}/submit`, {
        method: 'POST'
      });
      
      if (response && response.ok) {
        const data = await response.json();
        
        const examProgress = JSON.parse(localStorage.getItem('examProgress') || '{}');
        examProgress[subjectId] = {
          ...examProgress[subjectId],
          status: 'completed',
          score: data.exam.score,
          percentage: data.exam.percentage
        };
        localStorage.setItem('examProgress', JSON.stringify(examProgress));
        
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          if (isAuto) {
            toast.error(reason, { duration: 4000 });
          } else {
            toast.success('Exam submitted successfully!');
          }
        }
        
        setTimeout(() => {
          router.push('/exam-instructions');
        }, 2000);
      } else {
        toast.error('Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: optionIndex
      };
      
      if (examId) {
        const answer = String.fromCharCode(65 + optionIndex);
        fetchWithAuth(`/exams/${examId}/save-answer`, {
          method: 'POST',
          body: JSON.stringify({ questionId, answer })
        }).catch(() => {});
      }
      
      saveOfflineData(`exam_${examId}`, {
        questions,
        answers: newAnswers,
        duration,
        timeLeft,
        totalMarks
      });
      
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (index) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = () => {
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    submitExam(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 1800) return examRoomTimerNormal;
    if (timeLeft > 600) return examRoomTimerWarning;
    return examRoomTimerDanger;
  };

  const getWarningColor = () => {
    if (warningCount === 1) return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', icon: '⚠️' };
    if (warningCount === 2) return { bg: 'bg-[#FED7AA]', text: 'text-[#EA580C]', icon: '🚨' };
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', icon: '🛑' };
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-4">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-[20px] leading-[120%] font-[700] tracking-[-0.03em] text-[#1E1E1E] mb-2 font-playfair">
            No Questions Available
          </h2>
          <p className="text-[14px] leading-[150%] font-[400] text-[#626060] mb-6 font-playfair">
            No questions available for this subject.
          </p>
          <button
            onClick={() => router.push('/exam-instructions')}
            className="px-6 py-3 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85] transition-colors"
          >
            Back to Instructions
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const warningStyle = getWarningColor();

  return (
    <div className={examRoomContainer}>
      <div className={examRoomHeader}>
        <div className={examRoomHeaderInner}>
          <div>
            <h1 className={examRoomSubject}>
              {subjectName || 'Exam'}
            </h1>
            <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
              Strict Mode • {warningCount} warnings
              {warningCount > 0 && (
                <span className={`ml-2 ${warningStyle.text} font-[600]`}>
                  • Warning {warningCount}/3
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className={examRoomTimer}>
              <span className="text-[13px] leading-[100%] font-[500] text-[#626060] font-playfair">Time Left:</span>
              <span className={`${examRoomTimerText} ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={examRoomMain}>
        <div className={examRoomContent}>
          <div className={examRoomContentInner}>
            <div className={examRoomQuestionCard}>
              <div className={examRoomQuestionHeader}>
                <span className={examRoomQuestionNumber}>
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <span className={examRoomQuestionMark}>
                  {currentQ.marks || 1} {currentQ.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>

              <p className={examRoomQuestionText}>{currentQ.question}</p>

              <div className={examRoomOptionsGrid}>
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(currentQ.id, index)}
                    className={`${examRoomOption} ${
                      answers[currentQ.id] === index
                        ? examRoomOptionActive
                        : examRoomOptionInactive
                    }`}
                  >
                    <div className={`${examRoomOptionLabel} ${
                      answers[currentQ.id] === index
                        ? examRoomOptionLabelActive
                        : examRoomOptionLabelInactive
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={examRoomOptionText}>{option}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={examRoomNavigation}>
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`${examRoomNavButton} ${examRoomNavButtonSecondary} ${
                  currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className={`${examRoomNavButton} ${examRoomNavButtonPrimary} ${
                  currentQuestion === questions.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <div className={examRoomSidebar}>
          <h3 className={examRoomSidebarTitle}>Exam Progress</h3>
          
          <div className={examRoomProgressBar}>
            <div className={examRoomProgressText}>
              <span>Answered</span>
              <span>{answeredCount} / {questions.length}</span>
            </div>
            <div className={examRoomProgressBarBg}>
              <div 
                className={examRoomProgressBarFill}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h4 className="text-[14px] leading-[120%] font-[600] text-[#1E1E1E] mb-3 font-playfair">Questions</h4>
          <div className={examRoomQuestionGrid}>
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => handleQuestionJump(index)}
                className={`${examRoomQuestionDot} ${
                  index === currentQuestion
                    ? examRoomQuestionDotCurrent
                    : answers[q.id] !== undefined
                    ? examRoomQuestionDotAnswered
                    : examRoomQuestionDotUnanswered
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className={examRoomActions}>
            <button
              onClick={handleSubmit}
              className={`${examRoomActionButton} ${examRoomSubmitButton}`}
            >
              Submit Exam
            </button>
            <button
              onClick={() => router.push('/exam-instructions')}
              className={`${examRoomActionButton} bg-gray-500 text-white hover:bg-gray-600`}
            >
              Back to Subjects
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={examWarningModal}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={examWarningCard}
            >
              <div className={examWarningIcon}>{warningStyle.icon}</div>
              <h3 className={`${examWarningTitle} ${warningStyle.text}`}>
                Warning {warningCount} of 3
              </h3>
              <p className={examWarningText}>
                Violation detected: <strong>{lastViolationType}</strong>
              </p>

              <div className={`p-4 ${warningStyle.bg} rounded-lg mb-6`}>
                <p className={`text-[13px] leading-[140%] font-[600] ${warningStyle.text} font-playfair text-center`}>
                  {warningCount === 1 && 'First warning! Stay on this page.'}
                  {warningCount === 2 && 'Second warning! One more violation will auto-submit your exam!'}
                  {warningCount >= 3 && 'Third warning! Your exam is being submitted...'}
                </p>
              </div>

              <button
                onClick={() => setShowWarning(false)}
                className={`${examWarningButton} bg-[#039994] text-white`}
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubmitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={modalContainer}
            >
              <h3 className={modalTitle}>Submit Exam?</h3>
              <p className={modalText}>
                You have answered {answeredCount} out of {questions.length} questions. 
                {answeredCount < questions.length && ` ${questions.length - answeredCount} questions remain unanswered.`}
                <br /><br />
                Are you sure you want to submit?
              </p>
              <div className={modalActions}>
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className={modalButtonSecondary}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className={modalButtonDanger}
                >
                  Submit
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
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading exam...</p>
          </div>
        </div>
      }>
        <ExamRoomContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}