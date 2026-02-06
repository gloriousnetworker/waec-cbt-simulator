'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../../../components/ProtectedRoute';

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
const examRoomQuestionDot = "w-10 h-10 rounded-full flex items-center justify-center text-[13px] leading-[100%] font-[600] font-playfair transition-all";
const examRoomQuestionDotUnanswered = "bg-white border border-[#E8E8E8] text-[#626060] hover:border-[#039994]";
const examRoomQuestionDotAnswered = "bg-[#E8F8F6] border border-[#039994] text-[#039994]";
const examRoomQuestionDotCurrent = "bg-[#039994] text-white";
const examRoomActions = "space-y-3";
const examRoomActionButton = "w-full py-3 rounded-lg font-playfair text-[14px] leading-[100%] font-[600] transition-all";
const examRoomSubmitButton = "bg-[#DC2626] text-white hover:bg-[#B91C1C]";
const examRoomReviewButton = "bg-white text-[#039994] border border-[#039994] hover:bg-[#F0F9F8]";
const examWarningModal = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
const examWarningCard = "bg-white rounded-xl p-6 max-w-md mx-4";
const examWarningIcon = "text-4xl mb-4 text-center";
const examWarningTitle = "text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 text-center font-playfair";
const examWarningText = "text-[14px] leading-[150%] font-[500] text-[#626060] mb-6 text-center font-playfair";
const examWarningButton = "w-full py-3 bg-[#039994] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#028a85]";
const modalOverlay = "fixed inset-0 bg-black/50 flex items-center justify-center z-50";
const modalContainer = "bg-white rounded-xl p-6 max-w-md mx-4";
const modalTitle = "text-[18px] leading-[120%] font-[600] text-[#1E1E1E] mb-2 font-playfair";
const modalText = "text-[14px] leading-[150%] font-[500] text-[#626060] mb-6 font-playfair";
const modalActions = "flex gap-3";
const modalButtonSecondary = "flex-1 py-3 bg-white text-[#039994] border border-[#039994] rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#F0F9F8]";
const modalButtonDanger = "flex-1 py-3 bg-[#DC2626] text-white rounded-lg font-playfair text-[14px] leading-[100%] font-[600] hover:bg-[#B91C1C]";

const generateQuestions = (subject, count) => {
  const questions = [];
  for (let i = 1; i <= count; i++) {
    questions.push({
      id: i,
      question: `This is question ${i} for ${subject}. What is the correct answer among the options below?`,
      options: [
        `Option A for question ${i}`,
        `Option B for question ${i}`,
        `Option C for question ${i}`,
        `Option D for question ${i}`
      ],
      correctAnswer: Math.floor(Math.random() * 4),
      marks: 1
    });
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
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);

  const subject = subjectData[subjectId] || subjectData.mathematics;
  const isTimed = examType === 'timed' || examType === 'mock';

  useEffect(() => {
    const generatedQuestions = generateQuestions(subject.name, subject.questions);
    setQuestions(generatedQuestions);
    if (isTimed) {
      setTimeLeft(subject.duration * 60);
    }
  }, [subject.name, subject.questions, subject.duration, isTimed]);

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

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && isTimed && !examSubmitted) {
      setTabSwitchCount((prev) => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          handleAutoSubmit('Tab switching detected');
        } else {
          setShowWarning(true);
        }
        return newCount;
      });
    }
  }, [isTimed, examSubmitted]);

  useEffect(() => {
    if (isTimed) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isTimed, handleVisibilityChange]);

  const handleAutoSubmit = (reason) => {
    setExamSubmitted(true);
    const score = calculateScore();
    router.push(`/dashboard/exam-result?score=${score}&total=${questions.length}&subject=${subject.name}&reason=${reason}`);
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
    setExamSubmitted(true);
    const score = calculateScore();
    router.push(`/dashboard/exam-result?score=${score}&total=${questions.length}&subject=${subject.name}`);
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

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

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
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className={examWarningCard}
            >
              <div className={examWarningIcon}>⚠️</div>
              <h3 className={examWarningTitle}>Warning: Tab Switch Detected</h3>
              <p className={examWarningText}>
                You have switched tabs {tabSwitchCount} time(s). After 3 tab switches, your exam will be automatically submitted. Please stay on this page.
              </p>
              <button
                onClick={() => setShowWarning(false)}
                className={examWarningButton}
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