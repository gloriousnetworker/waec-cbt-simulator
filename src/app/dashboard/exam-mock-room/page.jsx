// app/dashboard/exam-mock-room/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';

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
      } catch (error) {
        toast.error('Invalid session data');
        router.push('/dashboard');
      }
    } else {
      toast.error('No mock exam session found');
      router.push('/dashboard');
    }

    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
      if (fullscreenCheckInterval.current) {
        clearInterval(fullscreenCheckInterval.current);
      }
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!session || examSubmitted || !fullscreenAttempted) return;

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
  }, [session, examSubmitted, fullscreenAttempted]);

  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
        .then(() => {
          setFullscreenAttempted(true);
        })
        .catch(() => {
          toast.error('Please enable fullscreen for mock exam');
          setFullscreenAttempted(true);
        });
    } else {
      setFullscreenAttempted(true);
    }
  }, []);

  useEffect(() => {
    if (session && !fullscreenAttempted) {
      enterFullscreen();
    }
  }, [session, fullscreenAttempted, enterFullscreen]);

  useEffect(() => {
    if (!session || examSubmitted || !fullscreenAttempted) return;

    fullscreenCheckInterval.current = setInterval(() => {
      if (!document.fullscreenElement && !examSubmitted && !warningDismissedRef.current) {
        handleViolation('Exited fullscreen mode');
        enterFullscreen();
      }
    }, 2000);

    return () => {
      if (fullscreenCheckInterval.current) {
        clearInterval(fullscreenCheckInterval.current);
      }
    };
  }, [session, examSubmitted, fullscreenAttempted]);

  const savePracticeToServer = async (resultData) => {
    try {
      const response = await fetchWithAuth('/practice/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId: session.subjectId,
          subjectName: session.subjectName,
          totalQuestions: resultData.totalQuestions,
          correct: resultData.correct,
          wrong: resultData.wrong,
          unanswered: resultData.unanswered,
          percentage: resultData.percentage,
          duration: 60,
          difficulty: 'all',
          isTimedTest: true,
          isMockExam: true,
          date: new Date().toISOString()
        })
      });

      if (response && response.ok) {
        console.log('Mock exam result saved to database');
      }
    } catch (error) {
      console.error('Error saving mock exam result:', error);
    }
  };

  const handleViolation = useCallback((type) => {
    if (examSubmitted || !session) return;

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
    }

    setWarningCount((prev) => {
      const newCount = prev + 1;
      setLastViolationType(type);
      setShowWarning(true);
      warningDismissedRef.current = false;

      if (newCount === 2) {
        setAutoSubmitCountdown(5);
        const countdownInterval = setInterval(() => {
          setAutoSubmitCountdown((prevCount) => {
            if (prevCount <= 1) {
              clearInterval(countdownInterval);
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      }

      if (newCount >= 3) {
        violationTimeoutRef.current = setTimeout(() => {
          handleAutoSubmit(`Malpractice detected: ${type}`);
        }, 500);
      }

      return newCount;
    });
  }, [examSubmitted, session]);

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && !examSubmitted && session && !warningDismissedRef.current) {
      handleViolation('Tab switched');
    }
  }, [examSubmitted, session, handleViolation]);

  const handleFullscreenChange = useCallback(() => {
    if (!document.fullscreenElement && !examSubmitted && session && !warningDismissedRef.current && fullscreenAttempted) {
      handleViolation('Exited fullscreen mode');
      setTimeout(() => {
        if (!examSubmitted && !warningDismissedRef.current) {
          enterFullscreen();
        }
      }, 500);
    }
  }, [examSubmitted, session, fullscreenAttempted, enterFullscreen, handleViolation]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'c') || (e.ctrlKey && e.key === 'v')) {
      e.preventDefault();
      if (!examSubmitted && session && !warningDismissedRef.current) {
        handleViolation('Forbidden key combination');
      }
    }
    
    if (!examSubmitted && session?.questions?.length > 0) {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        const index = key.charCodeAt(0) - 65;
        if (index < (session.questions[currentQuestion]?.options.length || 0)) {
          handleAnswerSelect(session.questions[currentQuestion].id, index);
        }
      }
      
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (currentQuestion < session.questions.length - 1) {
          handleNext();
        }
      }
      
      if (e.key === ' ' && !e.shiftKey) {
        e.preventDefault();
        if (currentQuestion < session.questions.length - 1) {
          handleNext();
        }
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

  const handleAutoSubmit = async (reason) => {
    if (examSubmitted || !session) return;
    await submitExam(true, reason);
  };

  const submitExam = async (isAuto = false, reason = '') => {
    if (examSubmitted || !session) return;
    
    setExamSubmitted(true);
    setSubmitting(true);

    const questions = session.questions;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const answer = answers[q.id];
      if (!answer) {
        unanswered++;
      } else if (answer.isCorrect) {
        correct++;
      } else {
        wrong++;
      }
    });

    const percentage = Math.round((correct / questions.length) * 100);

    const resultData = {
      totalQuestions: questions.length,
      correct,
      wrong,
      unanswered,
      percentage,
      subjectName: session.subjectName,
      subjectId: session.subjectId,
      date: new Date().toISOString(),
      isMockExam: true,
      isAuto: isAuto,
      reason: reason
    };

    await savePracticeToServer(resultData);

    // Save to local history for immediate display
    const history = JSON.parse(localStorage.getItem('practice_history') || '[]');
    const newHistoryItem = {
      id: session.id,
      date: new Date().toISOString(),
      subject: session.subjectName,
      subjectId: session.subjectId,
      totalQuestions: resultData.totalQuestions,
      correct: resultData.correct,
      wrong: resultData.wrong,
      unanswered: resultData.unanswered,
      percentage: resultData.percentage,
      timedOut: isAuto,
      isMockExam: true
    };
    
    history.unshift(newHistoryItem);
    localStorage.setItem('practice_history', JSON.stringify(history.slice(0, 50)));

    // Clear exam session
    localStorage.removeItem('practice_session');
    localStorage.removeItem('mock_exam_active');

    if (!toastShownRef.current) {
      toastShownRef.current = true;
    }

    setSubmitting(false);

    // Exit fullscreen before redirect
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    // Redirect back to dashboard with result parameters
    setTimeout(() => {
      router.push(`/dashboard?examResult=true&score=${correct}&total=${questions.length}&percentage=${percentage}&subject=${encodeURIComponent(session.subjectName)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`);
    }, 1000);
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    if (!session || examSubmitted) return;
    
    const question = session.questions.find(q => q.id === questionId);
    const optionText = question.options[optionIndex];
    const isCorrect = optionText === question.correctAnswer;
    
    setAnswers(prev => {
      const newAnswers = {
        ...prev,
        [questionId]: {
          selected: optionText,
          selectedIndex: optionIndex,
          isCorrect: isCorrect,
          correctAnswer: question.correctAnswer
        }
      };
      
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
      
      autoAdvanceTimer.current = setTimeout(() => {
        if (currentQuestion < session.questions.length - 1 && !examSubmitted) {
          setCurrentQuestion(prevQ => prevQ + 1);
        }
        autoAdvanceTimer.current = null;
      }, 500);
      
      return newAnswers;
    });
  };

  const handleNext = () => {
    if (!session || examSubmitted) return;
    
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (currentQuestion < session.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (!session || examSubmitted) return;
    
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuestionJump = (index) => {
    if (!session || examSubmitted) return;
    
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setCurrentQuestion(index);
  };

  const handleSubmit = () => {
    if (!session || examSubmitted) return;
    
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    setShowSubmitModal(true);
  };

  const confirmSubmit = () => {
    submitExam(false);
  };

  const handleDismissWarning = () => {
    setShowWarning(false);
    warningDismissedRef.current = true;
    setAutoSubmitCountdown(null);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft > 1800) return 'text-[#039994]';
    if (timeLeft > 600) return 'text-[#F59E0B]';
    return 'text-[#DC2626]';
  };

  const getWarningColor = () => {
    if (warningCount === 1) return { bg: 'bg-[#FEF3C7]', text: 'text-[#F59E0B]', icon: '⚠️' };
    if (warningCount === 2) return { bg: 'bg-[#FED7AA]', text: 'text-[#EA580C]', icon: '🚨' };
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', icon: '🛑' };
  };

  if (loading || !session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-24 h-24 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-[#626060] font-playfair">Loading mock exam...</p>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / session.questions.length) * 100;
  const warningStyle = getWarningColor();

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-lg">
      <div className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] text-white sticky top-0 z-10 py-3">
        <div className="max-w-7xl mx-auto px-4 text-center text-xl font-bold">
          ⚠️ MOCK EXAM - STRICT MODE ENABLED ⚠️
        </div>
      </div>
      
      <div className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">
              {session.subjectName} - Mock Exam
            </h1>
            <div className="flex flex-wrap gap-4 mt-2 text-base">
              <p className="text-[#626060] font-playfair">
                <span className="font-bold">Student:</span> {user?.firstName} {user?.lastName}
              </p>
              <p className="text-[#626060] font-playfair">
                <span className="font-bold">ID:</span> {user?.loginId}
              </p>
              <p className="text-[#626060] font-playfair">
                <span className="font-bold">Class:</span> {user?.class}
              </p>
            </div>
            <p className="text-base text-[#DC2626] font-playfair mt-1">
              Strict Mode • {warningCount} warnings
              {warningCount > 0 && (
                <span className={`ml-2 ${warningStyle.text} font-bold`}>
                  • Warning {warningCount}/3
                </span>
              )}
              {autoSubmitCountdown > 0 && (
                <span className="ml-2 text-[#DC2626] font-bold animate-pulse">
                  • Auto-submit in {autoSubmitCountdown}s
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-lg text-[#626060] font-playfair">Time Left:</span>
              <span className={`text-3xl md:text-4xl font-bold font-playfair ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={() => setShowShortcutGuide(!showShortcutGuide)}
              className="px-4 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition text-base font-bold"
            >
              ⌨️ Shortcuts
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {showShortcutGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#F5F3FF] border-t border-[#E8E8E8]"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#039994] block">A</span>
                    <span className="text-sm">Option A</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#039994] block">B</span>
                    <span className="text-sm">Option B</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#039994] block">C</span>
                    <span className="text-sm">Option C</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#039994] block">D</span>
                    <span className="text-sm">Option D</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#F59E0B] block">Enter / Space</span>
                    <span className="text-sm">Next Question</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#F59E0B] block">← →</span>
                    <span className="text-sm">Navigate</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#DC2626] block">F12 / Ctrl</span>
                    <span className="text-sm">Forbidden</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg">
                    <span className="text-2xl font-bold text-[#10B981] block">Auto</span>
                    <span className="text-sm">Auto-advance</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-8 border border-[#E8E8E8] shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold text-[#039994] font-playfair">
                  Question {currentQuestion + 1} of {session.questions.length}
                </span>
                <span className="text-xl font-bold text-[#626060] font-playfair">
                  {currentQ.marks || 1} {currentQ.marks === 1 ? 'mark' : 'marks'}
                </span>
              </div>

              <p className="text-2xl md:text-3xl font-medium text-[#1E1E1E] mb-8 font-playfair leading-relaxed">
                {currentQ.question}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQ.options.map((option, index) => {
                  const letter = String.fromCharCode(65 + index);
                  const isSelected = answers[currentQ.id]?.selected === option;
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleAnswerSelect(currentQ.id, index)}
                      className={`border-2 rounded-xl p-6 flex items-center gap-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#039994] bg-[#E8F8F6] shadow-md'
                          : 'border-gray-300 hover:border-[#039994] hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold font-playfair flex-shrink-0 ${
                        isSelected
                          ? 'bg-[#039994] text-white'
                          : 'bg-gray-100 text-[#626060] border-2 border-gray-300'
                      }`}>
                        {letter}
                      </div>
                      <span className="text-xl font-medium text-[#1E1E1E] font-playfair flex-1">{option}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-base text-blue-800 font-playfair">
                  <span className="font-bold">💡 Tip:</span> Press A, B, C, or D keys to select answers. Answer will auto-advance.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className={`px-8 py-4 rounded-xl font-playfair text-xl font-bold transition-all ${
                  currentQuestion === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-[#039994] border-2 border-[#039994] hover:bg-[#F0F9F8]'
                }`}
              >
                ← Previous
              </button>
              
              {currentQuestion === session.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-4 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition font-playfair text-xl font-bold disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Mock Exam'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-[#039994] text-white rounded-xl hover:bg-[#028a85] transition font-playfair text-xl font-bold"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E8] sticky top-32 shadow-lg">
            <h3 className="text-2xl font-bold text-[#1E1E1E] mb-6 font-playfair">Exam Progress</h3>
            
            <div className="mb-6">
              <div className="flex justify-between text-lg text-[#626060] mb-2 font-playfair">
                <span>Answered</span>
                <span className="font-bold">{answeredCount} / {session.questions.length}</span>
              </div>
              <div className="h-4 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#039994] rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <h4 className="text-xl font-bold text-[#1E1E1E] mb-4 font-playfair">Questions</h4>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {session.questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionJump(index)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-playfair transition-all ${
                    index === currentQuestion
                      ? 'bg-[#039994] text-white scale-110 shadow-md'
                      : answers[q.id] !== undefined
                      ? 'bg-[#E8F8F6] border-2 border-[#039994] text-[#039994]'
                      : 'bg-white border-2 border-gray-300 text-[#626060] hover:border-[#039994]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 bg-[#DC2626] text-white rounded-xl hover:bg-[#B91C1C] transition font-playfair text-xl font-bold disabled:opacity-50"
              >
                Submit Mock Exam
              </button>
            </div>

            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <p className="text-lg text-red-600 font-playfair font-bold">
                ⚠️ Warnings: {warningCount}/3
              </p>
              {warningCount === 2 && (
                <p className="text-base text-red-500 mt-2 font-playfair">
                  Next violation will auto-submit your exam!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl p-8 max-w-lg mx-4"
            >
              <div className="text-7xl mb-4 text-center">{warningStyle.icon}</div>
              <h3 className={`text-3xl font-bold mb-3 text-center font-playfair ${warningStyle.text}`}>
                Warning {warningCount} of 3
              </h3>
              <p className="text-xl text-[#626060] mb-6 text-center font-playfair">
                Violation detected: <strong className="font-bold">{lastViolationType}</strong>
              </p>

              <div className={`p-6 ${warningStyle.bg} rounded-lg mb-6`}>
                <p className={`text-xl font-bold ${warningStyle.text} font-playfair text-center`}>
                  {warningCount === 1 && 'First warning! Stay on this page.'}
                  {warningCount === 2 && 'Second warning! One more violation will auto-submit your exam!'}
                  {warningCount >= 3 && 'Third warning! Your exam is being submitted...'}
                </p>
              </div>

              <button
                onClick={handleDismissWarning}
                className="w-full py-4 bg-[#039994] text-white rounded-xl font-playfair text-xl font-bold hover:bg-[#028a85]"
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-xl p-8 max-w-lg mx-4"
            >
              <h3 className="text-2xl font-bold text-[#1E1E1E] mb-3 font-playfair">Submit Mock Exam?</h3>
              <p className="text-xl text-[#626060] mb-6 font-playfair">
                You have answered {answeredCount} out of {session.questions.length} questions. 
                {answeredCount < session.questions.length && ` ${session.questions.length - answeredCount} questions remain unanswered.`}
                <br /><br />
                This is a mock exam. Once submitted, you cannot change your answers.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-4 bg-white text-[#039994] border-2 border-[#039994] rounded-xl font-playfair text-xl font-bold hover:bg-[#F0F9F8]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 py-4 bg-[#DC2626] text-white rounded-xl font-playfair text-xl font-bold hover:bg-[#B91C1C] disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
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
          <div className="w-24 h-24 border-4 border-[#039994] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <MockExamRoomContent />
      </Suspense>
    </StudentProtectedRoute>
  );
}