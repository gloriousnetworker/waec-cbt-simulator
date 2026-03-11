// components/dashboard-content/Exams.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';

export default function Exams() {
  const [activeTab, setActiveTab] = useState('practice');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [performance, setPerformance] = useState({});
  const [practiceStats, setPracticeStats] = useState({});
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

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

  useEffect(() => {
    fetchSubjectsAndPerformance();
  }, []);

  const fetchSubjectsAndPerformance = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const [subjectsRes, performanceRes, practiceStatsRes] = await Promise.all([
          fetchWithAuth('/subjects'),
          fetchWithAuth('/performance/summary'),
          fetchWithAuth('/practice/stats')
        ]);

        if (subjectsRes?.ok) {
          const subjectsData = await subjectsRes.json();
          setSubjects(subjectsData.subjects || []);
        }

        if (performanceRes?.ok) {
          const performanceData = await performanceRes.json();
          setPerformance(performanceData.performance || {});
        }

        if (practiceStatsRes?.ok) {
          const statsData = await practiceStatsRes.json();
          setPracticeStats(statsData.stats || {});
        }
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) setSubjects(cachedSubjects);
        
        const cachedPerformance = getOfflineData('performance');
        if (cachedPerformance) setPerformance(cachedPerformance);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (subject) => {
    if (activeTab === 'practice') {
      localStorage.setItem('practice_subject', JSON.stringify({ id: subject.id, name: subject.name }));
      router.push('/dashboard/practice-setup');
      return;
    }

    const toastId = toast.loading('Starting exam...');
    
    try {
      const response = await fetchWithAuth('/exams/start', {
        method: 'POST',
        body: JSON.stringify({ subjectId: subject.id })
      });

      if (response?.ok) {
        const data = await response.json();
        toast.success('Exam started!', { id: toastId });
        
        const examType = activeTab === 'timed' ? 'timed' : 'mock';
        router.push(`/dashboard/exam-room?examId=${data.exam.id}&subject=${encodeURIComponent(subject.name)}&type=${examType}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to start exam', { id: toastId });
      }
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Failed to start exam', { id: toastId });
    }
  };

  const getSubjectStats = (subjectName) => {
    const examPerf = performance.subjects?.[subjectName];
    const practicePerf = practiceStats.bySubject?.[subjectName];
    
    const examAttempts = examPerf?.attempts || 0;
    const practiceAttempts = practicePerf?.attempts || 0;
    const totalAttempts = examAttempts + practiceAttempts;
    
    const bestExamScore = examPerf?.bestScore || 0;
    const bestPracticeScore = practicePerf?.bestScore || 0;
    const bestScore = Math.max(bestExamScore, bestPracticeScore);

    return {
      bestScore,
      attempts: totalAttempts,
      examAttempts,
      practiceAttempts
    };
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

      {subjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-[18px] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Subjects Available</h3>
          <p className="text-[14px] text-[#626060] font-playfair">You haven't been assigned any subjects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.map((subject) => {
            const stats = getSubjectStats(subject.name);
            return (
              <motion.div
                key={subject.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className={`h-2 ${subjectColors[subject.name] || 'bg-[#039994]'}`}></div>
                <div className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-3xl">{subjectIcons[subject.name] || '📘'}</span>
                    <div>
                      <h3 className="text-[16px] font-[600] text-[#1E1E1E] font-playfair">{subject.name}</h3>
                      <p className="text-[12px] text-[#626060] font-playfair">{subject.questionCount || 50} questions</p>
                      <p className="text-[10px] text-[#626060] font-playfair">Class: {subject.class} | {subject.examType}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Duration:</span>
                      <span className="font-[600] text-[#1E1E1E] font-playfair">
                        {subject.duration ? `${Math.floor(subject.duration / 60)}h ${subject.duration % 60}m` : 'Variable'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Best Score:</span>
                      <span className={`font-[600] ${stats.bestScore >= 70 ? 'text-[#10B981]' : stats.bestScore >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'} font-playfair`}>
                        {stats.bestScore}%
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#626060] font-playfair">Attempts:</span>
                      <span className="font-[600] text-[#1E1E1E] font-playfair">
                        {stats.attempts} ({stats.examAttempts} exam, {stats.practiceAttempts} practice)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartExam(subject)}
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