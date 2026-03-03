// components/dashboard-content/TimedTests.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

export default function TimedTests() {
  const [subjects, setSubjects] = useState([]);
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

  useEffect(() => {
    fetchTimedTests();
  }, []);

  const fetchTimedTests = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const subjectsResponse = await fetchWithAuth('/subjects');
        if (subjectsResponse && subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          const filteredSubjects = subjectsData.subjects?.filter(s => s.duration > 0) || [];
          setSubjects(filteredSubjects);
        }
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) {
          const filteredSubjects = cachedSubjects.filter(s => s.duration > 0);
          setSubjects(filteredSubjects);
        }
      }
    } catch (error) {
      console.error('Error fetching timed tests:', error);
      toast.error('Failed to load timed tests');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = (subject) => {
    router.push(`/dashboard/exam-room?subjectId=${subject.id}&subject=${encodeURIComponent(subject.name)}&type=timed&duration=${subject.duration || 60}&questionCount=${subject.questionCount || 50}`);
  };

  const getDifficultyLevel = (subject) => {
    if (subject.difficulty) return subject.difficulty;
    const random = Math.random();
    if (random < 0.33) return 'Easy';
    if (random < 0.66) return 'Medium';
    return 'Hard';
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Timed Tests</h1>
        <p className="text-[#626060] mt-2 font-playfair">Test your speed and accuracy under pressure</p>
      </div>

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">⏱️</div>
          <h3 className="text-[18px] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Timed Tests Available</h3>
          <p className="text-[14px] text-[#626060] font-playfair">You haven't been assigned any timed tests yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {subjects.map((subject) => {
            const difficulty = getDifficultyLevel(subject);
            const difficultyColor = {
              Easy: 'bg-green-100 text-green-800',
              Medium: 'bg-yellow-100 text-yellow-800',
              Hard: 'bg-red-100 text-red-800'
            }[difficulty];

            return (
              <motion.div
                key={subject.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className={`h-2 ${subjectColors[subject.name] || 'bg-[#039994]'}`}></div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-3xl mr-3">{subjectIcons[subject.name] || '📘'}</span>
                      <div>
                        <h3 className="font-bold text-[#1E1E1E] font-playfair">{subject.name}</h3>
                        <p className="text-sm text-[#626060] font-playfair">{subject.questionCount || 50} questions</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                      {difficulty}
                    </span>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#626060] font-playfair">Duration:</span>
                      <span className="font-medium text-[#1E1E1E] font-playfair">
                        {subject.duration ? `${Math.floor(subject.duration / 60)}h ${subject.duration % 60}m` : '60 mins'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#626060] font-playfair">Class:</span>
                      <span className="font-medium text-[#1E1E1E] font-playfair">{subject.class || 'SS3'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#626060] font-playfair">Exam Type:</span>
                      <span className="font-medium text-[#1E1E1E] font-playfair">{subject.examType || 'WAEC'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartTest(subject)}
                    className="w-full py-2.5 bg-[#039994] text-white font-semibold rounded-lg hover:bg-[#028a85] transition"
                  >
                    Start Test
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3 font-playfair">⏱️ Timing Rules</h3>
        <ul className="space-y-2 text-sm text-yellow-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Timer continues even if you navigate away</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Test auto-submits when time expires</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>No pausing allowed in official timed tests</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>Quick thinking and accuracy are key</span>
          </li>
        </ul>
      </div>
    </div>
  );
}