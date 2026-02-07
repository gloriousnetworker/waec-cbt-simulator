'use client';

import { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../../../components/ProtectedRoute';
import toast from 'react-hot-toast';
import { getSubjectQuestions } from '@/app/data/questions';

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
const examRoomNavButtonPrimary = "bg-[#039994] text-white hover:bg-[#028a85]";
const examRoomNavButtonSecondary = "bg-white text-[#039994] border border-[#039994] hover:bg-[#F0F9F8]";
const examRoomNavButtonDisabled = "opacity-50 cursor-not-allowed";
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
const examRoomReviewButton = "bg-white text-[#039994] border border-[#039994] hover:bg-[#F0F9F8]";
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

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const shuffleOptions = (question) => {
  const options = [...question.options];
  const correctAnswerIndex = question.correctAnswer;
  const correctOption = options[correctAnswerIndex];
  
  const shuffledOptions = shuffleArray(options);
  const newCorrectAnswerIndex = shuffledOptions.indexOf(correctOption);
  
  return {
    ...question,
    options: shuffledOptions,
    correctAnswer: newCorrectAnswerIndex
  };
};

const generateExamQuestions = (subjectId, requiredCount) => {
  const availableQuestions = getSubjectQuestions(subjectId);
  if (availableQuestions.length >= requiredCount) {
    const selected = shuffleArray(availableQuestions).slice(0, requiredCount);
    return selected.map(q => ({ ...q, id: Math.random().toString(36).substr(2, 9) }));
  }
  
  const questions = [];
  let questionPool = [...availableQuestions];
  let poolIndex = 0;
  
  while (questions.length < requiredCount) {
    if (poolIndex >= questionPool.length) {
      questionPool = shuffleArray(availableQuestions);
      poolIndex = 0;
    }
    
    const baseQuestion = { ...questionPool[poolIndex] };
    const shuffledQuestion = shuffleOptions(baseQuestion);
    
    questions.push({
      ...shuffledQuestion,
      id: `q${questions.length + 1}_${Math.random().toString(36).substr(2, 4)}`
    });
    
    poolIndex++;
  }
  
  return questions;
};

const subjectData = {
  mathematics: { name: 'Mathematics', icon: '🧮', questions: 60, duration: 180 },
  english: { name: 'English Language', icon: '📖', questions: 100, duration: 165 },
  physics: { name: 'Physics', icon: '⚛️', questions: 50, duration: 150 },
  chemistry: { name: 'Chemistry', icon: '🧪', questions: 50, duration: 150 },
  biology: { name: 'Biology', icon: '🧬', questions: 50, duration: 150 },
  economics: { name: 'Economics', icon: '📈', questions: 50, duration: 120 },
  geography: { name: 'Geography', icon: '🗺️', questions: 50, duration: 120 },
  government: { name: 'Government', icon: '🏛️', questions: 50, duration: 120 },
  crk: { name: 'Christian Religious Knowledge', icon: '✝️', questions: 50, duration: 120 },
  irk: { name: 'Islamic Religious Knowledge', icon: '☪️', questions: 50, duration: 120 },
  literature: { name: 'Literature in English', icon: '📚', questions: 50, duration: 150 },
  commerce: { name: 'Commerce', icon: '💼', questions: 50, duration: 120 },
  accounting: { name: 'Financial Accounting', icon: '💰', questions: 50, duration: 150 },
  agricscience: { name: 'Agricultural Science', icon: '🌾', questions: 50, duration: 150 },
  civiledu: { name: 'Civic Education', icon: '🏛️', questions: 50, duration: 120 },
  dataprocessing: { name: 'Data Processing', icon: '💻', questions: 50, duration: 120 },
};

function ExamRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get('subject');
  const examType = searchParams.get('type') || 'practice';

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
  const violationTimeoutRef = useRef(null);
  const toastShownRef = useRef(false);

  const subject = subjectData[subjectId] || subjectData.mathematics;
  const isTimed = examType === 'timed' || examType === 'mock';
  const isStrictMode = examType === 'mock';

  useEffect(() => {
    const loadQuestions = () => {
      setLoading(true);
      try {
        const generatedQuestions = generateExamQuestions(subjectId, subject.questions);
        setQuestions(generatedQuestions);
        if (isTimed) {
          setTimeLeft(subject.duration * 60);
        }
        if (isStrictMode) {
          enterFullscreen();
        }
      } catch (error) {
        console.error('Error loading questions:', error);
        toast.error('Failed to load exam questions');
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
    };
  }, [subjectId, subject.questions, subject.duration, isTimed, isStrictMode]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    }
  };

  useEffect(() => {
    if (!isTimed || timeLeft <= 0 || examSubmitted) return;

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
  }, [isTimed, timeLeft, examSubmitted]);

  const handleViolation = useCallback((type) => {
    if (examSubmitted) return;

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    setWarningCount((prev) => {
      const newCount = prev + 1;
      setLastViolationType(type);
      setShowWarning(true);

      if (newCount >= 3) {
        violationTimeoutRef.current = setTimeout(() => {
          handleAutoSubmit(`Malpractice detected after 3 warnings: ${type}`);
        }, 100);
      }

      return newCount;
    });
  }, [examSubmitted]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isTimed && !examSubmitted) {
      handleViolation('Tab switched');
    }
  }, [isTimed, examSubmitted, handleViolation]);

  const handleBlur = useCallback(() => {
    if (isTimed && !examSubmitted && !document.hidden) {
      handleViolation('Window lost focus');
    }
  }, [isTimed, examSubmitted, handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && isStrictMode && !examSubmitted) {
      handleViolation('Exited fullscreen mode');
      setTimeout(() => {
        if (!examSubmitted) {
          enterFullscreen();
        }
      }, 100);
    }
  }, [isStrictMode, examSubmitted, handleViolation]);

  const handleContextMenu = useCallback((e) => {
    if (isTimed) {
      e.preventDefault();
    }
  }, [isTimed]);

  const handleKeyDown = useCallback((e) => {
    if (isTimed && (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I'))) {
      e.preventDefault();
    }
  }, [isTimed]);

  useEffect(() => {
    if (isTimed) {
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
    }
  }, [isTimed, handleVisibilityChange, handleBlur, handleFullscreenChange, handleContextMenu, handleKeyDown]);

  const handleAutoSubmit = (reason) => {
    if (examSubmitted) return;
    
    setExamSubmitted(true);
    const score = calculateScore();
    const percentage = ((score / questions.length) * 100).toFixed(1);
    
    if (!toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(reason, { duration: 4000 });
    }
    
    setTimeout(() => {
      router.push(`/dashboard?examResult=true&score=${score}&total=${questions.length}&percentage=${percentage}&subject=${encodeURIComponent(subject.name)}&reason=${encodeURIComponent(reason)}`);
    }, 1000);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
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
    if (examSubmitted) return;
    
    setExamSubmitted(true);
    const score = calculateScore();
    const percentage = ((score / questions.length) * 100).toFixed(1);
    
    if (!toastShownRef.current) {
      toastShownRef.current = true;
      toast.success('Exam submitted successfully!');
    }
    
    setTimeout(() => {
      router.push(`/dashboard?examResult=true&score=${score}&total=${questions.length}&percentage=${percentage}&subject=${encodeURIComponent(subject.name)}`);
    }, 500);
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
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading exam questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#DC2626] font-playfair">No questions available for this subject</p>
          <button
            onClick={() => router.push('/dashboard/exams')}
            className="mt-4 px-6 py-2 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85]"
          >
            Back to Exams
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
              {subject.icon} {subject.name}
            </h1>
            <p className="text-[11px] leading-[100%] font-[400] text-[#626060] font-playfair mt-1">
              {examType === 'practice' ? 'Practice Mode' : examType === 'timed' ? 'Timed Mode' : 'Mock Exam'}
              {warningCount > 0 && (
                <span className={`ml-2 ${warningStyle.text} font-[600]`}>
                  • Warning {warningCount}/3
                </span>
              )}
            </p>
          </div>
          {isTimed && (
            <div className={examRoomTimer}>
              <span className="text-[13px] leading-[100%] font-[500] text-[#626060] font-playfair">Time Left:</span>
              <span className={`${examRoomTimerText} ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
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
                  {currentQ.marks} {currentQ.marks === 1 ? 'mark' : 'marks'}
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
                  currentQuestion === 0 ? examRoomNavButtonDisabled : ''
                }`}
              >
                ← Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentQuestion === questions.length - 1}
                className={`${examRoomNavButton} ${examRoomNavButtonPrimary} ${
                  currentQuestion === questions.length - 1 ? examRoomNavButtonDisabled : ''
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
              onClick={() => setCurrentQuestion(0)}
              className={`${examRoomActionButton} ${examRoomReviewButton}`}
            >
              Review Answers
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
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}