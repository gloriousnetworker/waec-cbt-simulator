// app/dashboard/practice-setup/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';
import { useStudentAuth } from '../../../context/StudentAuthContext';
import toast from 'react-hot-toast';

function PracticeSetupContent() {
  const router = useRouter();
  const { fetchWithAuth } = useStudentAuth();
  const [subject, setSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(0);
  const [enableTimer, setEnableTimer] = useState(false);
  const [difficulty, setDifficulty] = useState('all');
  const [loading, setLoading] = useState(false);
  const [isTimedTest, setIsTimedTest] = useState(false);

  useEffect(() => {
    const storedSubject = localStorage.getItem('practice_subject');
    const timedConfig = localStorage.getItem('timed_test_config');
    
    if (storedSubject) {
      const parsed = JSON.parse(storedSubject);
      setSubject(parsed);
      
      if (parsed.isTimedTest || timedConfig) {
        setIsTimedTest(true);
        setEnableTimer(true);
        if (parsed.duration) {
          setTimeLimit(parsed.duration);
        }
        if (parsed.questionCount) {
          setQuestionCount(parsed.questionCount);
        }
        if (parsed.difficulty && parsed.difficulty !== 'all') {
          setDifficulty(parsed.difficulty.toLowerCase());
        }
      }
    } else {
      toast.error('No subject selected');
      router.push('/dashboard');
    }

    return () => {
      localStorage.removeItem('timed_test_config');
    };
  }, []);

  const handleStartPractice = async () => {
    if (!subject) return;
    
    setLoading(true);
    const toastId = toast.loading('Preparing practice session...');

    try {
      let url = `/practice?subjectId=${subject.id}&count=${questionCount}`;
      if (difficulty !== 'all') {
        url += `&difficulty=${difficulty}`;
      }
      
      const response = await fetchWithAuth(url);
      
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
          timeLimit: enableTimer ? timeLimit * 60 : 0,
          difficulty: difficulty,
          status: 'in_progress',
          isTimedTest: isTimedTest
        };
        
        localStorage.setItem('practice_session', JSON.stringify(practiceSession));
        toast.success('Practice session ready!', { id: toastId });
        router.push('/dashboard/practice-room');
      } else {
        toast.error('Failed to load practice questions', { id: toastId });
      }
    } catch (error) {
      console.error('Error starting practice:', error);
      toast.error('Failed to start practice', { id: toastId });
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#039994] to-[#028a85] p-8 text-white">
            <h1 className="text-2xl font-bold font-playfair mb-2">
              {isTimedTest ? 'Timed Test Setup' : 'Practice Setup'}
            </h1>
            <p className="text-sm opacity-90 font-playfair">
              {isTimedTest 
                ? `Ready for your ${subject.duration}-minute ${subject.name} challenge`
                : `Customize your practice session for ${subject.name}`
              }
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {!isTimedTest && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">
                      Number of Questions
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-[#626060] font-playfair">5 questions</span>
                      <span className="text-sm font-medium text-[#039994] font-playfair">{questionCount} questions</span>
                      <span className="text-xs text-[#626060] font-playfair">50 questions</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#039994] text-[13px] font-playfair"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#1E1E1E] font-playfair">Enable Timer</h3>
                      <p className="text-xs text-[#626060] font-playfair">Challenge yourself with time limits</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableTimer}
                        onChange={(e) => setEnableTimer(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#039994] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#039994]"></div>
                    </label>
                  </div>

                  {enableTimer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <label className="block text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">
                        Time Limit (minutes)
                      </label>
                      <div className="flex gap-2">
                        {[5, 10, 15, 20, 30, 45, 60].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => setTimeLimit(mins)}
                            className={`flex-1 py-2 rounded-lg text-sm font-playfair transition ${
                              timeLimit === mins
                                ? 'bg-[#039994] text-white'
                                : 'bg-gray-100 text-[#626060] hover:bg-gray-200'
                            }`}
                          >
                            {mins}m
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {isTimedTest && (
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-3 font-playfair">Test Configuration</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p>• Duration: <span className="font-bold">{subject.duration} minutes</span></p>
                    <p>• Questions: <span className="font-bold">{subject.questionCount}</span></p>
                    <p>• Difficulty: <span className="font-bold">{subject.difficulty}</span></p>
                    <p>• Timer will start automatically</p>
                    <p>• Auto-submit when time expires</p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-medium text-[#1E1E1E] mb-3 font-playfair">Session Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#626060] font-playfair">Subject:</span>
                    <span className="font-medium text-[#1E1E1E] font-playfair">{subject.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#626060] font-playfair">Questions:</span>
                    <span className="font-medium text-[#1E1E1E] font-playfair">{questionCount}</span>
                  </div>
                  {!isTimedTest && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#626060] font-playfair">Difficulty:</span>
                      <span className="font-medium text-[#1E1E1E] font-playfair capitalize">{difficulty}</span>
                    </div>
                  )}
                  {enableTimer && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#626060] font-playfair">Time Limit:</span>
                      <span className="font-medium text-[#1E1E1E] font-playfair">{timeLimit} minutes</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 py-3 bg-white text-[#039994] border border-[#039994] rounded-lg hover:bg-[#F0F9F8] transition-colors font-playfair text-sm font-[600]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartPractice}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition-colors font-playfair text-sm font-[600] disabled:opacity-50"
                >
                  {loading ? 'Starting...' : 'Start Practice'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeSetupPage() {
  return (
    <StudentProtectedRoute>
      <PracticeSetupContent />
    </StudentProtectedRoute>
  );
}