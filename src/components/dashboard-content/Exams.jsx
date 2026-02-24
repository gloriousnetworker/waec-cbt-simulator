//EXAMS.JSX COMPONENT - Updated with correct endpoints
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { getAllQuestionsCount } from '../../app/data/questions';

const API_BASE_URL = 'https://cbt-simulator-backend.vercel.app/api';

export default function Exams() {
  const [activeTab, setActiveTab] = useState('practice');
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({});
  const [questionsCount, setQuestionsCount] = useState({});
  const router = useRouter();
  const { user, fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  const examTypes = [
    { id: 'practice', name: 'Practice Exam', desc: 'Untimed practice with detailed explanations' },
    { id: 'timed', name: 'Timed Exam', desc: 'Simulate real exam time conditions' },
    { id: 'mock', name: 'Mock Exam', desc: 'Full WAEC simulation with strict rules' },
  ];

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

  const subjectDurations = {
    Mathematics: 180,
    English: 165,
    Physics: 150,
    Chemistry: 150,
    Biology: 150,
    Economics: 120,
    Geography: 120,
    Government: 120,
    'Christian Religious Knowledge': 120,
    'Islamic Religious Knowledge': 120,
    'Literature in English': 150,
    Commerce: 120,
    'Financial Accounting': 150,
    'Agricultural Science': 150,
    'Civic Education': 120,
    'Data Processing': 120
  };

  const subjectIdMap = {
    Mathematics: 'mathematics',
    English: 'english',
    Physics: 'physics',
    Chemistry: 'chemistry',
    Biology: 'biology',
    Economics: 'economics',
    Geography: 'geography',
    Government: 'government',
    'Christian Religious Knowledge': 'crk',
    'Islamic Religious Knowledge': 'irk',
    'Literature in English': 'literature',
    Commerce: 'commerce',
    'Financial Accounting': 'accounting',
    'Agricultural Science': 'agricscience',
    'Civic Education': 'civiledu',
    'Data Processing': 'dataprocessing'
  };

  useEffect(() => {
    const counts = getAllQuestionsCount();
    setQuestionsCount(counts);
    fetchSubjectsAndPerformance();
  }, []);

  const fetchSubjectsAndPerformance = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const subjectsResponse = await fetchWithAuth('/subjects'); // Changed from /student/subjects
        const subjectsData = await subjectsResponse.json();
        setStudentSubjects(subjectsData.subjects || []);

        const performanceResponse = await fetchWithAuth('/exam/performance/summary'); // Changed from /student/exam/performance/summary
        const performanceData = await performanceResponse.json();
        setPerformance(performanceData.performance || {});
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) {
          setStudentSubjects(cachedSubjects);
        }
        
        const cachedPerformance = getOfflineData('performance');
        if (cachedPerformance) {
          setPerformance(cachedPerformance);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (subjectName) => {
    const subjectId = subjectIdMap[subjectName] || subjectName.toLowerCase().replace(/\s+/g, '');
    const duration = subjectDurations[subjectName] || 60;
    const questionCount = questionsCount[subjectId] || 50;
    
    router.push(`/dashboard/exam-room?subject=${encodeURIComponent(subjectName)}&subjectId=${subjectId}&type=${activeTab}&duration=${duration}&questionCount=${questionCount}`);
  };

  const getSubjectStats = (subjectName) => {
    const subjectPerf = performance.subjects?.[subjectName];
    if (subjectPerf) {
      const avgScore = subjectPerf.attempts > 0 
        ? Math.round(subjectPerf.totalScore / subjectPerf.attempts) 
        : 0;
      return {
        bestScore: avgScore,
        attempts: subjectPerf.attempts || 0
      };
    }
    return {
      bestScore: 0,
      attempts: 0
    };
  };

  const getQuestionCountForSubject = (subjectName) => {
    const subjectId = subjectIdMap[subjectName] || subjectName.toLowerCase().replace(/\s+/g, '');
    return questionsCount[subjectId] || 50;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Practice Exams</h1>
        <p className="text-[#626060] mt-2 font-playfair">Select a subject and exam type to begin your practice</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {examTypes.map((type) => (
          <button
            key={type.id}
            data-tab={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              activeTab === type.id
                ? 'border-[#039994] bg-[#E6FFFA]'
                : 'border-gray-200 hover:border-[#039994] bg-white'
            }`}
          >
            <div className={`text-[16px] leading-[120%] font-[600] mb-1 font-playfair ${
              activeTab === type.id ? 'text-[#039994]' : 'text-[#1E1E1E]'
            }`}>{type.name}</div>
            <div className="text-[12px] leading-[140%] text-[#626060] font-playfair">{type.desc}</div>
          </button>
        ))}
      </div>

      {studentSubjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-[18px] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Subjects Available</h3>
          <p className="text-[14px] text-[#626060] font-playfair">You haven't been assigned any subjects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {studentSubjects.map((subjectName) => {
            const stats = getSubjectStats(subjectName);
            const questionCount = getQuestionCountForSubject(subjectName);
            return (
              <motion.div
                key={subjectName}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className={`h-2 ${subjectColors[subjectName] || 'bg-[#039994]'}`}></div>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{subjectIcons[subjectName] || '📘'}</span>
                    <div>
                      <h3 className="text-[16px] font-[600] text-[#1E1E1E] font-playfair">{subjectName}</h3>
                      <p className="text-[12px] text-[#626060] font-playfair">{questionCount} questions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Duration:</span>
                      <span className="font-[600] text-[#1E1E1E] font-playfair">
                        {Math.floor(subjectDurations[subjectName] / 60)}h {subjectDurations[subjectName] % 60}m
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Best Score:</span>
                      <span className={`font-[600] ${stats.bestScore >= 70 ? 'text-[#10B981]' : 'text-[#F59E0B]'} font-playfair`}>
                        {stats.bestScore}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Attempts:</span>
                      <span className="font-[600] text-[#1E1E1E] font-playfair">{stats.attempts}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(subjectName)}
                    className="w-full py-3 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition-colors text-[14px] font-[600] font-playfair"
                  >
                    Start {activeTab === 'practice' ? 'Practice' : activeTab === 'timed' ? 'Timed' : 'Mock'} Exam
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="bg-gradient-to-r from-[#039994] to-[#028a85] rounded-xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4 font-playfair">📋 Exam Instructions</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>Each exam follows WAEC examination standards and format</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>You cannot navigate away during timed and mock exams</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>Auto-submission occurs if you switch tabs or windows</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>All questions must be attempted before final submission</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>Review your answers before submitting the exam</span>
          </li>
          <li className="flex items-center gap-2 text-sm">
            <span>•</span>
            <span>Practice exams allow unlimited time and hints</span>
          </li>
        </ul>
      </div>
    </div>
  );
}