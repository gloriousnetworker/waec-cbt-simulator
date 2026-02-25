//PastQuestions.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStudentAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function PastQuestions() {
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjects, setSubjects] = useState([]);
  const [pastQuestions, setPastQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();

  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const subjectsResponse = await fetchWithAuth('/subjects');
        const subjectsData = await subjectsResponse.json();
        setSubjects(subjectsData.subjects || []);

        const resultsResponse = await fetchWithAuth('/exam/results/all');
        const resultsData = await resultsResponse.json();
        
        const questions = [];
        resultsData.results.forEach(result => {
          const date = new Date(result.date._seconds * 1000);
          const year = date.getFullYear().toString();
          questions.push({
            id: result.id,
            year: year,
            subject: result.subject,
            subjectId: result.subjectId,
            paper: 'Past Question',
            type: result.examType === 'practice' ? 'Practice' : 'Exam',
            questions: 50,
            duration: '2h',
            difficulty: result.percentage >= 70 ? 'Easy' : result.percentage >= 50 ? 'Medium' : 'Hard',
            score: result.percentage || result.score
          });
        });
        setPastQuestions(questions);
      } else {
        const cachedSubjects = getOfflineData('studentSubjects');
        if (cachedSubjects) {
          setSubjects(cachedSubjects);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load past questions');
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeNow = (subject) => {
    const duration = subject.examType === 'WAEC' ? 120 : 60;
    router.push(`/dashboard/exam-room?subjectId=${subject.id}&subject=${encodeURIComponent(subject.name)}&type=practice&duration=${duration}&questionCount=${subject.questionCount || 50}`);
  };

  const filteredQuestions = pastQuestions.filter(question => {
    if (selectedYear !== 'all' && question.year !== selectedYear) return false;
    if (selectedSubject !== 'all' && question.subjectId !== selectedSubject) return false;
    return true;
  });

  const subjectOptions = [
    { id: 'all', name: 'All Subjects', icon: '📚' },
    ...subjects.map(s => ({
      id: s.id,
      name: s.name,
      icon: subjectIcons[s.name] || '📘',
      count: pastQuestions.filter(q => q.subjectId === s.id).length
    }))
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading past questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Past Questions</h1>
        <p className="text-[#626060] mt-2 font-playfair">Access WAEC past questions from previous years</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedYear === 'all' ? 'bg-[#039994] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All Years
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedYear === year ? 'bg-[#039994] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 mb-8">
        {subjectOptions.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`flex flex-col items-center p-3 rounded-lg ${selectedSubject === subject.id ? 'bg-[#E6FFFA] border-2 border-[#039994]' : 'bg-white border border-gray-200 hover:border-[#039994]'}`}
          >
            <span className="text-2xl mb-2">{subject.icon}</span>
            <span className="text-xs font-medium text-gray-700 text-center">{subject.name}</span>
            {subject.count !== undefined && (
              <span className="text-xs text-gray-500 mt-1">{subject.count} papers</span>
            )}
          </button>
        ))}
      </div>

      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-[18px] font-[600] text-[#1E1E1E] mb-2 font-playfair">No Past Questions Found</h3>
          <p className="text-[14px] text-[#626060] font-playfair">No past questions match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((question) => (
            <motion.div
              key={question.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${
                      question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {question.difficulty}
                    </span>
                    <span className="text-sm text-gray-500">WAEC {question.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{question.subject}</h3>
                  <p className="text-gray-600 text-sm">{question.type} Questions</p>
                </div>
                <span className="text-3xl">
                  {subjectIcons[question.subject] || '📘'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{question.questions}</div>
                  <div className="text-xs text-gray-600">Questions</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{question.duration}</div>
                  <div className="text-xs text-gray-600">Duration</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-800">{question.score || 0}%</div>
                  <div className="text-xs text-gray-600">Avg. Score</div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const subject = subjects.find(s => s.id === question.subjectId);
                    if (subject) handlePracticeNow(subject);
                  }}
                  className="flex-1 py-2.5 bg-[#039994] text-white font-medium rounded-lg hover:bg-[#028a85] transition"
                >
                  Practice Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3 font-playfair">📊 Past Question Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">{pastQuestions.length}</div>
            <div className="text-sm text-gray-700">Total Papers</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">{years.length}</div>
            <div className="text-sm text-gray-700">Years Covered</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">{subjects.length}</div>
            <div className="text-sm text-gray-700">Subjects</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round(pastQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / (pastQuestions.length || 1))}%
            </div>
            <div className="text-sm text-gray-700">Avg. Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}