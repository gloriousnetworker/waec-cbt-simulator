// components/dashboard-content/Performance.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      if (!isOffline) {
        const [historyRes, practiceRes, statsRes, performanceRes] = await Promise.all([
          fetchWithAuth('/history'),
          fetchWithAuth('/practice/history?limit=100'),
          fetchWithAuth('/practice/stats'),
          fetchWithAuth('/performance/summary')
        ]);

        if (historyRes?.ok) {
          const historyData = await historyRes.json();
          const formatted = (historyData.exams || []).map(exam => ({
            id: exam.id,
            subject: exam.subjects?.[0]?.subjectName || 'Unknown',
            subjectId: exam.subjects?.[0]?.subjectId,
            score: exam.percentage || 0,
            totalMarks: exam.totalMarks || 0,
            percentage: exam.percentage || 0,
            date: exam.endTime || exam.createdAt,
            duration: exam.duration,
            status: exam.status,
            type: 'exam'
          }));
          setExamHistory(formatted);
        }

        if (practiceRes?.ok) {
          const practiceData = await practiceRes.json();
          setPracticeHistory(practiceData.practices || []);
        }

        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          setPracticeStats(statsData.stats);
        }

        if (performanceRes?.ok) {
          const perfData = await performanceRes.json();
          setPerformanceData(perfData.performance);
        }
      } else {
        const cachedExams = getOfflineData('examHistory');
        if (cachedExams) setExamHistory(cachedExams);
        
        const cachedPractices = getOfflineData('practiceHistory');
        if (cachedPractices) setPracticeHistory(cachedPractices);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
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
      const resultDate = result.date?._seconds ? new Date(result.date._seconds * 1000) : new Date(result.date);
      const diffTime = Math.abs(now - resultDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (timeRange === 'month') return diffDays <= 30;
      if (timeRange === 'quarter') return diffDays <= 90;
      return true;
    }).sort((a, b) => {
      const dateA = a.date?._seconds || new Date(a.date).getTime() / 1000;
      const dateB = b.date?._seconds || new Date(b.date).getTime() / 1000;
      return dateB - dateA;
    });
  };

  const getSubjectPerformance = () => {
    const subjectStats = {};
    
    examHistory.forEach(result => {
      if (!result.subject) return;
      if (!subjectStats[result.subject]) {
        subjectStats[result.subject] = { 
          total: 0, 
          count: 0, 
          lastScore: 0, 
          icon: subjectIcons[result.subject] || '📘',
          examAttempts: 0,
          practiceAttempts: 0
        };
      }
      subjectStats[result.subject].total += result.percentage || 0;
      subjectStats[result.subject].count++;
      subjectStats[result.subject].lastScore = result.percentage || 0;
      subjectStats[result.subject].examAttempts++;
    });

    practiceHistory.forEach(practice => {
      if (!practice.subjectName) return;
      if (!subjectStats[practice.subjectName]) {
        subjectStats[practice.subjectName] = { 
          total: 0, 
          count: 0, 
          lastScore: 0, 
          icon: subjectIcons[practice.subjectName] || '📘',
          examAttempts: 0,
          practiceAttempts: 0
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
      icon: data.icon
    })).sort((a, b) => b.avgScore - a.avgScore);
  };

  const filteredResults = getFilteredResults();
  const subjectPerformance = getSubjectPerformance();
  const totalExams = examHistory.length + practiceHistory.length;
  const averageScore = filteredResults.length > 0 
    ? Math.round(filteredResults.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / filteredResults.length) 
    : 0;

  const getRankMessage = () => {
    if (averageScore >= 80) return 'Top 10%';
    if (averageScore >= 70) return 'Top 20%';
    if (averageScore >= 60) return 'Top 30%';
    if (averageScore >= 50) return 'Top 40%';
    return 'Keep improving';
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
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{practiceStats?.bestScore || 0}%</div>
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
          <div className="space-y-4">
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
          <div className="space-y-4">
            {filteredResults.slice(0, 8).map((result, index) => {
              const date = result.date?._seconds 
                ? new Date(result.date._seconds * 1000) 
                : new Date(result.date);
              const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              
              const subject = result.subject || result.subjectName;
              const score = result.percentage || result.score || 0;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{subjectIcons[subject] || (result.type === 'practice' ? '📝' : '📘')}</span>
                    <div>
                      <div className="font-medium text-[#1E1E1E] font-playfair">{subject}</div>
                      <div className="text-xs text-[#626060] font-playfair">
                        {formattedDate} • {result.type === 'practice' ? 'Practice' : 'Exam'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`font-bold font-playfair ${
                      score >= 70 ? 'text-green-600' : 
                      score >= 50 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {score}%
                    </div>
                    {result.type === 'practice' && (
                      <button
                        onClick={() => handleReviewPractice(result)}
                        className="text-xs text-[#039994] hover:underline font-playfair"
                      >
                        Review
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

      {practiceHistory.length > 0 && (
        <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-xl p-6 border border-yellow-300">
          <h2 className="text-lg font-bold text-yellow-800 mb-4 font-playfair flex items-center gap-2">
            <span>📝</span> Recent Practice Sessions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {practiceHistory.slice(0, 3).map((practice, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#1E1E1E] font-playfair">{practice.subjectName}</p>
                  <p className="text-xs text-[#626060] font-playfair">
                    {new Date(practice.date._seconds * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${
                    practice.percentage >= 70 ? 'text-green-600' : 
                    practice.percentage >= 50 ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {practice.percentage}%
                  </span>
                  <button
                    onClick={() => handleReviewPractice(practice)}
                    className="block text-xs text-[#039994] hover:underline mt-1"
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}