// app/dashboard/practice-room/page.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';

function PracticeRoomContent() {
  const router = useRouter();
  const { user, fetchWithAuth } = useStudentAuth();
  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveInterval = useRef(null);

  useEffect(() => {
    const storedSession = localStorage.getItem('practice_session');
    if (storedSession) {
      const parsed = JSON.parse(storedSession);
      setSession(parsed);
      setAnswers(parsed.answers || {});
      setCurrentQuestion(parsed.currentQuestion || 0);
      setTimeLeft(parsed.timeLimit || 0);
      setLoading(false);
    } else {
      toast.error('No practice session found');
      router.push('/dashboard');
    }

    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (session && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, session]);

  useEffect(() => {
    if (session) {
      autoSaveInterval.current = setInterval(() => {
        saveProgress();
      }, 30000);
    }
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [session, answers, currentQuestion]);

  const saveProgress = () => {
    if (!session) return;
    const updatedSession = {
      ...session,
      answers,
      currentQuestion,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('practice_session', JSON.stringify(updatedSession));
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Submitting your answers...');
    calculateResults(true);
  };

  const handleAnswerSelect = (questionId, optionIndex, optionText) => {
    const question = session.questions.find(q => q.id === questionId);
    const isCorrect = optionText === question.correctAnswer;
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        selected: optionText,
        selectedIndex: optionIndex,
        isCorrect: isCorrect,
        correctAnswer: question.correctAnswer
      }
    }));
  };

  const handleNext = () => {
    if (currentQuestion < session.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

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
          duration: session.timeLimit ? Math.floor(session.timeLimit / 60) : 0,
          difficulty: session.difficulty || 'all',
          isTimedTest: session.isTimedTest || false
        })
      });

      if (response && response.ok) {
        const data = await response.json();
        console.log('Practice result saved to database:', data);
      } else {
        console.error('Failed to save practice result to database');
      }
    } catch (error) {
      console.error('Error saving practice result:', error);
    }
  };

  const calculateResults = async (timedOut = false) => {
    const questions = session.questions;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    const questionResults = [];

    questions.forEach((q, index) => {
      const answer = answers[q.id];
      if (!answer) {
        unanswered++;
        questionResults.push({ 
          ...q, 
          status: 'unanswered', 
          selected: null, 
          correct: false,
          correctAnswer: q.correctAnswer 
        });
      } else if (answer.isCorrect) {
        correct++;
        questionResults.push({ 
          ...q, 
          status: 'correct', 
          selected: answer.selected, 
          correct: true,
          correctAnswer: q.correctAnswer 
        });
      } else {
        wrong++;
        questionResults.push({ 
          ...q, 
          status: 'wrong', 
          selected: answer.selected, 
          correct: false,
          correctAnswer: q.correctAnswer
        });
      }
    });

    const totalMarks = correct * (questions[0]?.marks || 2);
    const percentage = Math.round((correct / questions.length) * 100);

    const resultData = {
      totalQuestions: questions.length,
      correct,
      wrong,
      unanswered,
      totalMarks,
      percentage,
      timedOut,
      questions: questionResults,
      subjectName: session.subjectName,
      subjectId: session.subjectId
    };

    setSubmitting(true);
    await savePracticeToServer(resultData);
    
    const history = JSON.parse(localStorage.getItem('practice_history') || '[]');
    history.unshift({
      id: session.id,
      date: new Date().toISOString(),
      subject: session.subjectName,
      subjectId: session.subjectId,
      totalQuestions: resultData.totalQuestions,
      correct: resultData.correct,
      wrong: resultData.wrong,
      unanswered: resultData.unanswered,
      percentage: resultData.percentage,
      timedOut: resultData.timedOut,
      duration: session.timeLimit ? Math.floor(session.timeLimit / 60) : 0
    });
    localStorage.setItem('practice_history', JSON.stringify(history.slice(0, 50)));
    
    setSubmitting(false);
    setResults(resultData);
    setShowResults(true);

    localStorage.removeItem('practice_session');
  };

  const handleSubmit = () => {
    calculateResults(false);
  };

  const handleRestart = () => {
    localStorage.removeItem('practice_session');
    router.push('/dashboard/practice-setup');
  };

  const handleBack = () => {
    localStorage.removeItem('practice_session');
    router.push('/dashboard');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) return null;

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className={`p-8 text-white ${
              results.percentage >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
              results.percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <h1 className="text-2xl font-bold font-playfair mb-2">Practice Results</h1>
              <p className="text-sm opacity-90 font-playfair">{session.subjectName}</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#1E1E1E] font-playfair">{results.totalQuestions}</div>
                  <div className="text-xs text-[#626060] font-playfair">Total Qs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 font-playfair">{results.correct}</div>
                  <div className="text-xs text-[#626060] font-playfair">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 font-playfair">{results.wrong}</div>
                  <div className="text-xs text-[#626060] font-playfair">Wrong</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#039994] font-playfair">{results.percentage}%</div>
                  <div className="text-xs text-[#626060] font-playfair">Score</div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Question Review</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.questions.map((q, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      q.status === 'correct' ? 'border-green-200 bg-green-50' :
                      q.status === 'wrong' ? 'border-red-200 bg-red-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-bold text-[#1E1E1E]">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">{q.question}</p>
                          {q.selected && (
                            <p className={`text-xs mb-1 font-playfair ${
                              q.status === 'correct' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Your answer: {q.selected}
                            </p>
                          )}
                          {q.status === 'wrong' && (
                            <p className="text-xs text-green-600 font-playfair">
                              Correct answer: {q.correctAnswer}
                            </p>
                          )}
                          {q.explanation && q.explanation !== 'No explanation provided' && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-[#626060] font-playfair">
                                <span className="font-bold">Explanation:</span> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className={`text-lg ${
                          q.status === 'correct' ? 'text-green-600' :
                          q.status === 'wrong' ? 'text-red-600' :
                          'text-gray-400'
                        }`}>
                          {q.status === 'correct' ? '✓' : q.status === 'wrong' ? '✗' : '○'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  disabled={submitting}
                  className="flex-1 py-3 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition-colors font-playfair text-sm font-[600] disabled:opacity-50"
                >
                  Practice Again
                </button>
                <button
                  onClick={handleBack}
                  disabled={submitting}
                  className="flex-1 py-3 bg-white text-[#039994] border border-[#039994] rounded-lg hover:bg-[#F0F9F8] transition-colors font-playfair text-sm font-[600] disabled:opacity-50"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / session.questions.length) * 100;
  const isAnswered = answers[currentQ.id];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-[#1E1E1E] font-playfair">{session.subjectName} - Practice</h1>
            <p className="text-xs text-[#626060] font-playfair">
              Question {currentQuestion + 1} of {session.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {session.timeLimit > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#626060] font-playfair">Time:</span>
                <span className={`text-lg font-bold font-playfair ${
                  timeLeft < 300 ? 'text-red-600' : 'text-[#039994]'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#039994] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-[#E6FFFA] text-[#039994] rounded-full text-xs font-medium font-playfair mb-4">
              Question {currentQuestion + 1} of {session.questions.length}
            </span>
            <p className="text-lg font-medium text-[#1E1E1E] font-playfair">{currentQ.question}</p>
            {currentQ.topic && (
              <p className="text-xs text-[#626060] mt-2 font-playfair">Topic: {currentQ.topic}</p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            {currentQ.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const isSelected = answers[currentQ.id]?.selected === option;
              
              let borderColor = 'border-gray-200';
              if (isAnswered && showExplanation) {
                if (option === currentQ.correctAnswer) {
                  borderColor = 'border-green-500 bg-green-50';
                } else if (isSelected && option !== currentQ.correctAnswer) {
                  borderColor = 'border-red-500 bg-red-50';
                }
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, index, option)}
                  disabled={isAnswered && showExplanation}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected && !showExplanation
                      ? 'border-[#039994] bg-[#E6FFFA]'
                      : borderColor || 'border-gray-200 hover:border-[#039994] hover:bg-gray-50'
                  } ${isAnswered && showExplanation ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected && !showExplanation
                        ? 'bg-[#039994] text-white'
                        : isAnswered && showExplanation && option === currentQ.correctAnswer
                        ? 'bg-green-500 text-white'
                        : isAnswered && showExplanation && isSelected && option !== currentQ.correctAnswer
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-[#626060]'
                    }`}>
                      {letter}
                    </span>
                    <span className="flex-1 text-[#1E1E1E] font-playfair">{option}</span>
                    {isAnswered && showExplanation && option === currentQ.correctAnswer && (
                      <span className="text-green-600 text-sm font-bold">✓ Correct</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {isAnswered && !showExplanation && (
            <button
              onClick={() => setShowExplanation(true)}
              className="mb-4 px-4 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition-colors text-sm font-playfair"
            >
              Check Answer
            </button>
          )}

          <AnimatePresence>
            {showExplanation && currentQ.explanation && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
              >
                <p className="text-sm text-blue-800 font-playfair">
                  <span className="font-bold">Explanation:</span> {currentQ.explanation}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-playfair text-sm font-[600] transition ${
                currentQuestion === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-[#039994] border border-[#039994] hover:bg-[#F0F9F8]'
              }`}
            >
              ← Previous
            </button>
            
            {currentQuestion === session.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition font-playfair text-sm font-[600] disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Practice'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition font-playfair text-sm font-[600]"
              >
                Next →
              </button>
            )}
          </div>
        </motion.div>

        <div className="mt-6 grid grid-cols-10 gap-2">
          {session.questions.map((_, idx) => {
            const isAnswered = answers[session.questions[idx].id];
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                  idx === currentQuestion
                    ? 'bg-[#039994] text-white'
                    : isAnswered
                    ? 'bg-[#E6FFFA] text-[#039994] border border-[#039994]'
                    : 'bg-white border border-gray-200 text-[#626060] hover:border-[#039994]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PracticeRoomPage() {
  return (
    <StudentProtectedRoute>
      <PracticeRoomContent />
    </StudentProtectedRoute>
  );
}