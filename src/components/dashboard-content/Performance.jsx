// components/dashboard-content/Performance.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function Performance() {
  const [timeRange, setTimeRange] = useState('month');
  const [examHistory, setExamHistory] = useState([]);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [practiceStats, setPracticeStats] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [practiceToDelete, setPracticeToDelete] = useState(null);
  const { fetchWithAuth, isOffline, getOfflineData } = useStudentAuth();
  const router = useRouter();

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
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      // First get local storage history for immediate display
      const localPracticeHistory = JSON.parse(localStorage.getItem('practice_history') || '[]');
      const localExamHistory = JSON.parse(localStorage.getItem('exam_history') || '[]');
      
      if (!isOffline) {
        // Fetch from APIs
        const [examHistoryRes, practiceRes, statsRes] = await Promise.all([
          fetchWithAuth('/student/history'), // Fetch exam history
          fetchWithAuth('/practice/history?limit=100'), // Fetch practice history
          fetchWithAuth('/practice/stats') // Fetch practice stats
        ]);

        // Handle Exam History
        if (examHistoryRes?.ok) {
          const examData = await examHistoryRes.json();
          const apiExams = examData.exams || [];
          
          // Format API exams to match our display format
          const formattedApiExams = apiExams.map(exam => {
            // Handle multi-subject exams - take the first subject for display
            const mainSubject = exam.subjects && exam.subjects.length > 0 
              ? exam.subjects[0] 
              : { subjectName: 'General', questionCount: exam.questionCount || 0 };
            
            // If there are multiple subjects, create a combined subject name
            const subjectName = exam.subjects && exam.subjects.length > 1
              ? `${exam.subjects.length} Subjects Combined`
              : mainSubject.subjectName || 'General';
            
            return {
              id: exam.id,
              examSetupId: exam.examSetupId,
              subject: subjectName,
              subjectName: subjectName,
              subjects: exam.subjects || [], // Keep full subjects array for detailed view
              score: exam.score || 0,
              totalMarks: exam.totalMarks || 0,
              percentage: exam.percentage || 0,
              date: exam.date?._seconds ? new Date(exam.date._seconds * 1000).toISOString() : new Date().toISOString(),
              duration: exam.duration,
              questionCount: exam.questionCount || 0,
              status: exam.status || 'completed',
              type: 'exam',
              isMockExam: true, // Mark as real exam
              source: 'api'
            };
          });
          
          // Merge with local exam history, avoiding duplicates
          const mergedExams = [...formattedApiExams];
          localExamHistory.forEach(local => {
            if (!mergedExams.some(api => api.id === local.id)) {
              mergedExams.push(local);
            }
          });
          
          setExamHistory(mergedExams);
          
          // Save to localStorage for offline access
          localStorage.setItem('exam_history', JSON.stringify(mergedExams));
        } else {
          // If API fails, use local history
          setExamHistory(localExamHistory);
        }

        // Handle Practice History
        if (practiceRes?.ok) {
          const practiceData = await practiceRes.json();
          const apiPractices = practiceData.practices || [];
          
          // Format API practices to match our local format
          const formattedApiPractices = apiPractices.map(p => ({
            id: p.id,
            subjectId: p.subjectId,
            subjectName: p.subjectName,
            totalQuestions: p.totalQuestions,
            correct: p.correct,
            wrong: p.wrong,
            unanswered: p.unanswered,
            percentage: p.percentage,
            date: p.date?._seconds ? new Date(p.date._seconds * 1000).toISOString() : p.date,
            duration: p.duration,
            difficulty: p.difficulty,
            isTimedTest: p.isTimedTest,
            isMockExam: p.isMockExam || false,
            studentClass: p.studentClass,
            questions: p.questions || [],
            type: 'practice',
            source: 'api'
          }));
          
          // Merge with local history, avoiding duplicates
          const mergedPractices = [...formattedApiPractices];
          localPracticeHistory.forEach(local => {
            if (!mergedPractices.some(api => api.id === local.id)) {
              mergedPractices.push(local);
            }
          });
          
          setPracticeHistory(mergedPractices);
          
          // Save to localStorage for offline access
          localStorage.setItem('practice_history', JSON.stringify(mergedPractices));
        } else {
          // If API fails, use local history
          setPracticeHistory(localPracticeHistory);
        }

        // Handle Practice Stats
        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          setPracticeStats(statsData.stats);
        }
      } else {
        // Offline mode - use cached data
        const cachedExams = getOfflineData('examHistory') || localExamHistory;
        setExamHistory(cachedExams);
        
        const cachedPractices = getOfflineData('practiceHistory') || localPracticeHistory;
        setPracticeHistory(cachedPractices);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
      
      // Fallback to local storage
      const localPracticeHistory = JSON.parse(localStorage.getItem('practice_history') || '[]');
      const localExamHistory = JSON.parse(localStorage.getItem('exam_history') || '[]');
      setPracticeHistory(localPracticeHistory);
      setExamHistory(localExamHistory);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePractice = async () => {
    if (!practiceToDelete) return;
    
    setDeletingId(practiceToDelete.id);
    const toastId = toast.loading('Deleting practice record...');

    try {
      if (!isOffline && practiceToDelete.source === 'api') {
        const response = await fetchWithAuth(`/practice/${practiceToDelete.id}`, {
          method: 'DELETE'
        });

        if (response?.ok) {
          // Remove from state
          setPracticeHistory(prev => prev.filter(p => p.id !== practiceToDelete.id));
          
          // Remove from localStorage
          const localHistory = JSON.parse(localStorage.getItem('practice_history') || '[]');
          const updatedLocal = localHistory.filter(p => p.id !== practiceToDelete.id);
          localStorage.setItem('practice_history', JSON.stringify(updatedLocal));
          
          toast.success('Practice record deleted', { id: toastId });
        } else {
          toast.error('Failed to delete practice record', { id: toastId });
        }
      } else {
        // Offline mode - just remove from localStorage
        const localHistory = JSON.parse(localStorage.getItem('practice_history') || '[]');
        const updatedLocal = localHistory.filter(p => p.id !== practiceToDelete.id);
        localStorage.setItem('practice_history', JSON.stringify(updatedLocal));
        
        setPracticeHistory(prev => prev.filter(p => p.id !== practiceToDelete.id));
        toast.success('Practice record deleted', { id: toastId });
      }
    } catch (error) {
      console.error('Error deleting practice:', error);
      toast.error('Failed to delete practice record', { id: toastId });
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setPracticeToDelete(null);
    }
  };

  const handleReviewPractice = (practice) => {
    const results = {
      totalQuestions: practice.totalQuestions,
      correct: practice.correct,
      wrong: practice.wrong,
      unanswered: practice.unanswered,
      percentage: practice.percentage,
      subjectName: practice.subjectName,
      questions: practice.questions || []
    };
    localStorage.setItem('practice_review', JSON.stringify(results));
    router.push('/dashboard/practice-review');
  };

  const handleViewExamDetails = (exam) => {
    // Store exam details in localStorage for review
    const examDetails = {
      id: exam.id,
      examSetupId: exam.examSetupId,
      subject: exam.subject,
      subjects: exam.subjects,
      score: exam.score,
      totalMarks: exam.totalMarks,
      percentage: exam.percentage,
      date: exam.date,
      duration: exam.duration,
      questionCount: exam.questionCount
    };
    localStorage.setItem('exam_review', JSON.stringify(examDetails));
    // You can navigate to an exam review page if you have one
    // router.push('/dashboard/exam-review');
    toast.success('Exam details loaded');
  };

  const getFilteredResults = () => {
    const now = new Date();
    const allResults = [
      ...examHistory.map(e => ({ ...e, type: 'exam' })),
      ...practiceHistory.map(p => ({ 
        ...p, 
        type: 'practice',
        subject: p.subjectName,
        date: p.date
      }))
    ];
    
    return allResults.filter(result => {
      const resultDate = result.date ? new Date(result.date) : new Date();
      const diffTime = Math.abs(now - resultDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (timeRange === 'month') return diffDays <= 30;
      if (timeRange === 'quarter') return diffDays <= 90;
      return true;
    }).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  };

  const getSubjectPerformance = () => {
    const subjectStats = {};
    
    // Process exam history
    examHistory.forEach(result => {
      if (result.subjects && result.subjects.length > 0) {
        // Handle multi-subject exams
        result.subjects.forEach(subject => {
          const subjectName = subject.subjectName;
          if (!subjectName) return;
          
          if (!subjectStats[subjectName]) {
            subjectStats[subjectName] = { 
              total: 0, 
              count: 0, 
              lastScore: 0, 
              icon: subjectIcons[subjectName] || '📘',
              examAttempts: 0,
              practiceAttempts: 0,
              totalPossibleMarks: 0,
              totalAchievedMarks: 0
            };
          }
          
          // For subjects in multi-subject exams, we need to calculate individual scores
          // This is simplified - you might need to adjust based on your data structure
          const subjectScore = (result.score / result.subjects.length) || 0;
          const subjectTotal = (result.totalMarks / result.subjects.length) || 0;
          const subjectPercentage = subjectTotal > 0 ? (subjectScore / subjectTotal) * 100 : result.percentage;
          
          subjectStats[subjectName].total += subjectPercentage || 0;
          subjectStats[subjectName].count++;
          subjectStats[subjectName].lastScore = subjectPercentage || 0;
          subjectStats[subjectName].examAttempts++;
          subjectStats[subjectName].totalAchievedMarks += subjectScore;
          subjectStats[subjectName].totalPossibleMarks += subjectTotal;
        });
      } else {
        // Single subject exam
        const subjectName = result.subject;
        if (!subjectName) return;
        
        if (!subjectStats[subjectName]) {
          subjectStats[subjectName] = { 
            total: 0, 
            count: 0, 
            lastScore: 0, 
            icon: subjectIcons[subjectName] || '📘',
            examAttempts: 0,
            practiceAttempts: 0,
            totalPossibleMarks: 0,
            totalAchievedMarks: 0
          };
        }
        subjectStats[subjectName].total += result.percentage || 0;
        subjectStats[subjectName].count++;
        subjectStats[subjectName].lastScore = result.percentage || 0;
        subjectStats[subjectName].examAttempts++;
        subjectStats[subjectName].totalAchievedMarks += result.score || 0;
        subjectStats[subjectName].totalPossibleMarks += result.totalMarks || 0;
      }
    });

    // Process practice history
    practiceHistory.forEach(practice => {
      if (!practice.subjectName) return;
      if (!subjectStats[practice.subjectName]) {
        subjectStats[practice.subjectName] = { 
          total: 0, 
          count: 0, 
          lastScore: 0, 
          icon: subjectIcons[practice.subjectName] || '📘',
          examAttempts: 0,
          practiceAttempts: 0,
          totalPossibleMarks: 0,
          totalAchievedMarks: 0
        };
      }
      subjectStats[practice.subjectName].total += practice.percentage || 0;
      subjectStats[practice.subjectName].count++;
      subjectStats[practice.subjectName].lastScore = practice.percentage || 0;
      subjectStats[practice.subjectName].practiceAttempts++;
    });

    return Object.entries(subjectStats).map(([subject, data]) => ({
      subject,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      lastScore: data.lastScore,
      attempts: data.count,
      examAttempts: data.examAttempts,
      practiceAttempts: data.practiceAttempts,
      icon: data.icon,
      totalAchievedMarks: data.totalAchievedMarks,
      totalPossibleMarks: data.totalPossibleMarks
    })).sort((a, b) => b.avgScore - a.avgScore);
  };

  const filteredResults = getFilteredResults();
  const subjectPerformance = getSubjectPerformance();
  const totalExams = examHistory.length + practiceHistory.length;
  const averageScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / filteredResults.length) 
    : 0;

  const getBestScore = () => {
    if (filteredResults.length === 0) return 0;
    return Math.max(...filteredResults.map(r => r.percentage || r.score || 0));
  };

  const getRankMessage = () => {
    if (averageScore >= 80) return 'Top 10%';
    if (averageScore >= 70) return 'Top 20%';
    if (averageScore >= 60) return 'Top 30%';
    if (averageScore >= 50) return 'Top 40%';
    return 'Keep improving';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#039994] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[14px] leading-[100%] font-[500] text-[#626060] font-playfair">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1E1E1E] font-playfair">Performance Analytics</h1>
          <p className="text-[#626060] mt-2 font-playfair">Track your progress and identify areas for improvement</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {['month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range 
                  ? 'bg-[#039994] text-white' 
                  : 'bg-gray-100 text-[#626060] hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{totalExams}</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Total Activities</div>
          <div className="flex items-center text-purple-600">
            <span className="text-lg mr-1">📊</span>
            <span className="font-medium font-playfair">
              {examHistory.length} exams • {practiceHistory.length} practice
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{averageScore}%</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Average Score</div>
          <div className="flex items-center text-green-600">
            <span className="text-lg mr-1">📈</span>
            <span className="font-medium font-playfair">
              {averageScore >= 70 ? 'Excellent' : averageScore >= 50 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{getBestScore()}%</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Best Score</div>
          <div className="flex items-center text-blue-600">
            <span className="text-lg mr-1">🏆</span>
            <span className="font-medium font-playfair">
              {getRankMessage()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{subjectPerformance.length}</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Subjects Active</div>
          <div className="flex items-center text-yellow-600">
            <span className="text-lg mr-1">🎯</span>
            <span className="font-medium font-playfair">
              {subjectPerformance.filter(s => s.avgScore >= 70).length} above 70%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Subject Performance</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {subjectPerformance.length > 0 ? (
              subjectPerformance.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{subject.icon}</span>
                    <div>
                      <div className="font-medium text-[#1E1E1E] font-playfair">{subject.subject}</div>
                      <div className="text-xs text-[#626060] font-playfair">
                        {subject.examAttempts} exams • {subject.practiceAttempts} practice
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                      <div
                        className={`h-full ${
                          subject.avgScore >= 80 ? 'bg-green-500' : 
                          subject.avgScore >= 70 ? 'bg-yellow-500' : 
                          subject.avgScore >= 50 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${subject.avgScore}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1E1E1E] font-playfair">{subject.avgScore}%</div>
                      <div className="text-xs text-[#626060] font-playfair">Last: {subject.lastScore}%</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No subject performance data yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Recent Activity</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {filteredResults.slice(0, 8).map((result, index) => {
              const formattedDate = formatDate(result.date);
              const subject = result.subject || result.subjectName;
              const score = result.percentage || result.score || 0;
              
              return (
                <div key={result.id || index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {subjectIcons[subject] || (result.type === 'practice' ? '📝' : '📘')}
                    </span>
                    <div>
                      <div className="font-medium text-[#1E1E1E] font-playfair">{subject}</div>
                      <div className="text-xs text-[#626060] font-playfair">
                        {formattedDate} • {result.type === 'practice' ? 'Practice' : 'Exam'}
                        {result.isMockExam && ' • Mock Exam'}
                        {result.subjects && result.subjects.length > 1 && ' • Combined Exam'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-bold font-playfair ${
                      score >= 70 ? 'text-green-600' : 
                      score >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {typeof score === 'number' ? score.toFixed(1) : score}%
                    </div>
                    {result.type === 'practice' ? (
                      <>
                        <button
                          onClick={() => handleReviewPractice(result)}
                          className="text-xs text-[#039994] hover:underline font-playfair"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => {
                            setPracticeToDelete(result);
                            setShowDeleteModal(true);
                          }}
                          className="text-xs text-red-500 hover:underline font-playfair"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleViewExamDetails(result)}
                        className="text-xs text-[#039994] hover:underline font-playfair"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredResults.length === 0 && (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No activity in this period.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exam History Section */}
      {examHistory.length > 0 && (
        <div className="bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE] rounded-xl p-6 border border-blue-300 mb-6">
          <h2 className="text-lg font-bold text-blue-800 mb-4 font-playfair flex items-center gap-2">
            <span>📋</span> Exam History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examHistory.slice(0, 6).map((exam, idx) => {
              const subjectName = exam.subject || 
                (exam.subjects && exam.subjects.length > 0 ? 
                  (exam.subjects.length > 1 ? `${exam.subjects.length} Subjects` : exam.subjects[0].subjectName) 
                  : 'General');
              
              return (
                <div key={exam.id || idx} className="bg-white rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-[#1E1E1E] font-playfair">{subjectName}</p>
                      <p className="text-xs text-[#626060] font-playfair">
                        {formatDate(exam.date)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      exam.percentage >= 70 ? 'bg-green-100 text-green-700' : 
                      exam.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {typeof exam.percentage === 'number' ? exam.percentage.toFixed(1) : exam.percentage}%
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                    <div>
                      <span className="block font-bold text-green-600">{exam.score || 0}</span>
                      <span className="text-[#626060]">Score</span>
                    </div>
                    <div>
                      <span className="block font-bold text-blue-600">{exam.totalMarks || 0}</span>
                      <span className="text-[#626060]">Total</span>
                    </div>
                  </div>
                  
                  {exam.subjects && exam.subjects.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-[#626060] mb-1 font-playfair">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {exam.subjects.map((subject, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {subject.subjectName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleViewExamDetails(exam)}
                    className="w-full py-2 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
          {examHistory.length > 6 && (
            <button className="mt-4 text-sm text-blue-600 hover:underline font-playfair">
              View All {examHistory.length} Exams →
            </button>
          )}
        </div>
      )}

      {/* Practice History Section */}
      {practiceHistory.length > 0 && (
        <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-xl p-6 border border-yellow-300">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 font-playfair flex items-center gap-2">
            <span>📝</span> Practice History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceHistory.slice(0, 6).map((practice, idx) => (
              <div key={practice.id || idx} className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-[#1E1E1E] font-playfair">{practice.subjectName}</p>
                    <p className="text-xs text-[#626060] font-playfair">
                      {formatDate(practice.date)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    practice.percentage >= 70 ? 'bg-green-100 text-green-700' : 
                    practice.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-red-100 text-red-700'
                  }`}>
                    {typeof practice.percentage === 'number' ? practice.percentage.toFixed(1) : practice.percentage}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div>
                    <span className="block font-bold text-green-600">{practice.correct || 0}</span>
                    <span className="text-[#626060]">Correct</span>
                  </div>
                  <div>
                    <span className="block font-bold text-red-600">{practice.wrong || 0}</span>
                    <span className="text-[#626060]">Wrong</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-600">{practice.unanswered || 0}</span>
                    <span className="text-[#626060]">Unanswered</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReviewPractice(practice)}
                    className="flex-1 py-2 bg-[#039994] text-white rounded text-xs font-bold hover:bg-[#028a85] transition"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => {
                      setPracticeToDelete(practice);
                      setShowDeleteModal(true);
                    }}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded text-xs font-bold hover:bg-red-200 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          {practiceHistory.length > 6 && (
            <button className="mt-4 text-sm text-[#039994] hover:underline font-playfair">
              View All {practiceHistory.length} Practices →
            </button>
          )}
        </div>
      )}

      <AnimatePresence>
        {showDeleteModal && practiceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl p-8 max-w-md mx-4"
            >
              <div className="text-5xl mb-4 text-center">🗑️</div>
              <h3 className="text-2xl font-bold text-[#1E1E1E] mb-3 text-center font-playfair">
                Delete Practice Record
              </h3>
              <p className="text-lg text-[#626060] mb-6 text-center font-playfair">
                Are you sure you want to delete this {practiceToDelete.subjectName} practice record from {formatDate(practiceToDelete.date)}?
                <br /><br />
                <span className="text-sm text-red-500">This action cannot be undone.</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-white text-[#039994] border-2 border-[#039994] rounded-xl font-playfair text-lg font-bold hover:bg-[#F0F9F8]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePractice}
                  disabled={deletingId === practiceToDelete.id}
                  className="flex-1 py-4 bg-red-600 text-white rounded-xl font-playfair text-lg font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === practiceToDelete.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}