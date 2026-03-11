// components/dashboard-content/TimedTests.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

export default function TimedTests() {
  const [subjects, setSubjects] = useState([]);
  const [subjectNames, setSubjectNames] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  const subjectIcons = {
    Mathematics: '🧮',
    English: '📖',
    Physics: '⚛️',
    Chemistry: '🧪',
    Biology: '🧬',
    Economics: '📈',
    Geography: '🗺️',
    Government: '🏛️',
    'Christian Religious Knowledge': '✝️',
    'Islamic Religious Knowledge': '☪️',
    'Literature in English': '📚',
    Commerce: '💼',
    'Financial Accounting': '💰',
    'Agricultural Science': '🌾',
    'Civic Education': '🏛️',
    'Data Processing': '💻'
  };

  const subjectColors = {
    Mathematics: 'bg-[#3B82F6]',
    English: 'bg-[#10B981]',
    Physics: 'bg-[#8B5CF6]',
    Chemistry: 'bg-[#EF4444]',
    Biology: 'bg-[#059669]',
    Economics: 'bg-[#F59E0B]',
    Geography: 'bg-[#14B8A6]',
    Government: 'bg-[#6366F1]',
    'Christian Religious Knowledge': 'bg-[#8B5CF6]',
    'Islamic Religious Knowledge': 'bg-[#059669]',
    'Literature in English': 'bg-[#EC4899]',
    Commerce: 'bg-[#F97316]',
    'Financial Accounting': 'bg-[#10B981]',
    'Agricultural Science': 'bg-[#84CC16]',
    'Civic Education': 'bg-[#0EA5E9]',
    'Data Processing': 'bg-[#6366F1]'
  };

  // Generate timed tests based on student's subjects
  const getTimedTestsForSubject = (subject) => {
    return [
      {
        id: `${subject.id}-quick`,
        name: `Quick ${subject.name} Challenge`,
        subjectId: subject.id,
        subjectName: subject.name,
        icon: subjectIcons[subject.name] || '📘',
        color: subjectColors[subject.name] || 'bg-[#039994]',
        duration: 5,
        questionCount: 10,
        difficulty: 'Easy',
        description: `Test your basic ${subject.name} skills`
      },
      {
        id: `${subject.id}-medium`,
        name: `${subject.name} Sprint`,
        subjectId: subject.id,
        subjectName: subject.name,
        icon: subjectIcons[subject.name] || '📘',
        color: subjectColors[subject.name] || 'bg-[#039994]',
        duration: 10,
        questionCount: 20,
        difficulty: 'Medium',
        description: `Intermediate ${subject.name} problems`
      },
      {
        id: `${subject.id}-hard`,
        name: `${subject.name} Marathon`,
        subjectId: subject.id,
        subjectName: subject.name,
        icon: subjectIcons[subject.name] || '📘',
        color: subjectColors[subject.name] || 'bg-[#039994]',
        duration: 15,
        questionCount: 30,
        difficulty: 'Hard',
        description: `Advanced ${subject.name} challenge`
      }
    ];
  };

  useEffect(() => {
    fetchSubjects();
    loadPracticeHistory();
  }, []);

  const loadPracticeHistory = () => {
    const history = JSON.parse(localStorage.getItem('practice_history') || '[]');
    setPracticeHistory(history);
  };

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const subjectsResponse = await fetchWithAuth('/subjects');
        if (subjectsResponse && subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData.subjects || []);
          setSubjectNames(subjectsData.subjectNames || []);
        }
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) setSubjects(cachedSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimedTest = (test) => {
    const practiceSetup = {
      id: test.subjectId,
      name: test.subjectName,
      duration: test.duration,
      questionCount: test.questionCount,
      isTimedTest: true,
      testName: test.name,
      difficulty: test.difficulty.toLowerCase()
    };
    localStorage.setItem('practice_subject', JSON.stringify(practiceSetup));
    localStorage.setItem('timed_test_config', JSON.stringify({
      duration: test.duration,
      questionCount: test.questionCount,
      difficulty: test.difficulty.toLowerCase()
    }));
    router.push('/dashboard/practice-setup');
  };

  const getBestScore = (subjectId) => {
    const subjectPractices = practiceHistory.filter(p => p.subjectId === subjectId);
    if (subjectPractices.length === 0) return null;
    return Math.max(...subjectPractices.map(p => p.percentage));
  };

  const getRecentAttempts = (subjectId) => {
    return practiceHistory.filter(p => p.subjectId === subjectId).length;
  };

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Hard: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading timed tests...</p>
        </div>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Timed Tests</h1>
          <p className="text-[#626060] mt-2 font-playfair">Test your speed and accuracy under pressure</p>
        </div>
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">⏱️</div>
          <h3 className="text-[18px] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Subjects Available</h3>
          <p className="text-[14px] text-[#626060] font-playfair">You haven't been assigned any subjects yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Timed Tests</h1>
        <p className="text-[#626060] mt-2 font-playfair">Test your speed and accuracy under pressure</p>
      </div>

      {subjects.map((subject) => {
        const timedTests = getTimedTestsForSubject(subject);
        const bestScore = getBestScore(subject.id);
        const attempts = getRecentAttempts(subject.id);

        return (
          <div key={subject.id} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{subjectIcons[subject.name] || '📘'}</span>
              <h2 className="text-xl font-bold text-[#1E1E1E] font-playfair">{subject.name}</h2>
              {attempts > 0 && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {attempts} attempt{attempts !== 1 ? 's' : ''}
                </span>
              )}
              {bestScore !== null && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Best: {bestScore}%
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {timedTests.map((test) => (
                <motion.div
                  key={test.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className={`h-2 ${test.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-[#1E1E1E] font-playfair">{test.name}</h3>
                        <p className="text-xs text-[#626060] font-playfair mt-1">{test.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[test.difficulty]}`}>
                        {test.difficulty}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-[#039994]">{test.duration}min</div>
                        <div className="text-[10px] text-[#626060] font-playfair">Duration</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-lg font-bold text-[#039994]">{test.questionCount}</div>
                        <div className="text-[10px] text-[#626060] font-playfair">Questions</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartTimedTest(test)}
                      className="w-full py-3 bg-[#039994] text-white font-semibold rounded-lg hover:bg-[#028a85] transition"
                    >
                      Start Test
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="bg-gradient-to-r from-[#039994] to-[#028a85] rounded-xl p-8 text-white mt-8">
        <h3 className="text-xl font-bold mb-4 font-playfair">⏱️ Your Practice Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">{practiceHistory.length}</div>
            <div className="text-sm opacity-90">Total Practice Sessions</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {practiceHistory.length > 0 
                ? Math.round(practiceHistory.reduce((sum, p) => sum + p.percentage, 0) / practiceHistory.length)
                : 0}%
            </div>
            <div className="text-sm opacity-90">Average Score</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="text-2xl font-bold">
              {practiceHistory.length > 0 ? Math.max(...practiceHistory.map(p => p.percentage)) : 0}%
            </div>
            <div className="text-sm opacity-90">Best Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}