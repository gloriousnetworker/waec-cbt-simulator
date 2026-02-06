'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
  examRoomContainer,
  examRoomHeader,
  examRoomHeaderInner,
  examRoomSubject,
  examRoomTimer,
  examRoomTimerText,
  examRoomTimerNormal,
  examRoomTimerWarning,
  examRoomTimerDanger,
  examRoomMain,
  examRoomContent,
  examRoomContentInner,
  examRoomQuestionCard,
  examRoomQuestionHeader,
  examRoomQuestionNumber,
  examRoomQuestionMark,
  examRoomQuestionText,
  examRoomOptionsGrid,
  examRoomOption,
  examRoomOptionInactive,
  examRoomOptionActive,
  examRoomOptionLabel,
  examRoomOptionLabelInactive,
  examRoomOptionLabelActive,
  examRoomOptionText,
  examRoomNavigation,
  examRoomNavButton,
  examRoomNavButtonPrimary,
  examRoomNavButtonSecondary,
  examRoomNavButtonDisabled,
  examRoomSidebar,
  examRoomSidebarTitle,
  examRoomProgressBar,
  examRoomProgressText,
  examRoomProgressBarBg,
  examRoomProgressBarFill,
  examRoomQuestionGrid,
  examRoomQuestionDot,
  examRoomQuestionDotUnanswered,
  examRoomQuestionDotAnswered,
  examRoomQuestionDotCurrent,
  examRoomActions,
  examRoomActionButton,
  examRoomSubmitButton,
  examRoomReviewButton,
  examWarningModal,
  examWarningCard,
  examWarningIcon,
  examWarningTitle,
  examWarningText,
  examWarningButton,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../../../styles/styles';

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

export default function ExamRoomPage() {
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
      <ProtectedRoute>
        <div className="fixed inset-0 flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading exam...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}