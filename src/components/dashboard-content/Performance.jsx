//PERFORMANCE.JSX COMPONENT
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStudentAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Performance() {
  const [timeRange, setTimeRange] = useState('month');
  const [performanceData, setPerformanceData] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      if (!isOffline) {
        const summaryResponse = await fetchWithAuth('/exam/performance/summary');
        const summaryData = await summaryResponse.json();
        setPerformanceData(summaryData.performance);

        const resultsResponse = await fetchWithAuth('/exam/results/all');
        const resultsData = await resultsResponse.json();
        setExamResults(resultsData.results || []);
      } else {
        const cachedSummary = getOfflineData('performanceSummary');
        if (cachedSummary) {
          setPerformanceData(cachedSummary);
        }
        
        const cachedResults = getOfflineData('examResults');
        if (cachedResults) {
          setExamResults(cachedResults);
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    const now = new Date();
    const filtered = examResults.filter(result => {
      const resultDate = new Date(result.date._seconds * 1000);
      const diffTime = Math.abs(now - resultDate);
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (timeRange === 'month') return diffDays <= 30;
      if (timeRange === 'quarter') return diffDays <= 90;
      return true;
    });

    return filtered.sort((a, b) => b.date._seconds - a.date._seconds);
  };

  const getScoreTrend = () => {
    const filtered = getFilteredResults();
    if (filtered.length === 0) return [];

    if (timeRange === 'month') {
      const weeks = [[], [], [], []];
      filtered.forEach(result => {
        const date = new Date(result.date._seconds * 1000);
        const weekOfMonth = Math.floor(date.getDate() / 7);
        if (weekOfMonth < 4) weeks[weekOfMonth].push(result.percentage || result.score);
      });
      return weeks.map(week => {
        if (week.length === 0) return 0;
        return Math.round(week.reduce((a, b) => a + b, 0) / week.length);
      });
    }

    if (timeRange === 'quarter') {
      const months = [[], [], []];
      filtered.forEach(result => {
        const date = new Date(result.date._seconds * 1000);
        const month = date.getMonth() % 3;
        months[month].push(result.percentage || result.score);
      });
      return months.map(month => {
        if (month.length === 0) return 0;
        return Math.round(month.reduce((a, b) => a + b, 0) / month.length);
      });
    }

    const years = {};
    filtered.forEach(result => {
      const date = new Date(result.date._seconds * 1000);
      const year = date.getFullYear();
      if (!years[year]) years[year] = [];
      years[year].push(result.percentage || result.score);
    });

    return Object.values(years).map(yearScores => 
      Math.round(yearScores.reduce((a, b) => a + b, 0) / yearScores.length)
    );
  };

  const getLabels = () => {
    if (timeRange === 'month') return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    if (timeRange === 'quarter') {
      const months = ['Jan', 'Feb', 'Mar'];
      return months.map(m => `${m}-Mar`);
    }
    const years = [...new Set(examResults.map(r => new Date(r.date._seconds * 1000).getFullYear()))];
    return years.sort();
  };

  const getSubjectPerformance = () => {
    if (!performanceData?.subjects) return [];
    
    return Object.entries(performanceData.subjects).map(([subject, data]) => {
      const avgPercentage = data.attempts > 0 
        ? Math.round((data.totalPercentage || data.totalScore) / data.attempts) 
        : 0;
      
      const recentExams = examResults
        .filter(r => r.subject === subject)
        .sort((a, b) => b.date._seconds - a.date._seconds);
      
      const lastScore = recentExams.length > 0 ? (recentExams[0].percentage || recentExams[0].score) : avgPercentage;
      
      let trend = 'stable';
      if (recentExams.length >= 2) {
        const current = recentExams[0].percentage || recentExams[0].score;
        const previous = recentExams[1].percentage || recentExams[1].score;
        if (current > previous) trend = 'up';
        if (current < previous) trend = 'down';
      }
      
      return {
        subject,
        score: lastScore,
        avgScore: avgPercentage,
        attempts: data.attempts,
        trend,
        icon: subjectIcons[subject] || '📘'
      };
    });
  };

  const getImprovement = () => {
    const scores = getScoreTrend().filter(s => s > 0);
    if (scores.length < 2) return '+0%';
    const first = scores[0];
    const last = scores[scores.length - 1];
    const change = ((last - first) / first * 100).toFixed(0);
    return change > 0 ? `+${change}%` : `${change}%`;
  };

  const calculateAverageScore = () => {
    if (!performanceData) return 0;
    return Math.round(performanceData.averagePercentage || performanceData.averageScore || 0);
  };

  const getRankMessage = () => {
    const avg = calculateAverageScore();
    if (avg >= 80) return 'Top 10%';
    if (avg >= 70) return 'Top 20%';
    if (avg >= 60) return 'Top 30%';
    if (avg >= 50) return 'Top 40%';
    return 'Keep improving';
  };

  const scores = getScoreTrend();
  const labels = getLabels();
  const subjectPerformance = getSubjectPerformance();
  const averageScore = calculateAverageScore();
  const totalExams = performanceData?.totalExams || 0;
  const improvement = getImprovement();

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{averageScore}%</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Average Score</div>
          <div className="flex items-center text-green-600">
            <span className="text-lg mr-1">📈</span>
            <span className="font-medium font-playfair">{improvement} improvement</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{getRankMessage()}</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Performance Rank</div>
          <div className="flex items-center text-blue-600">
            <span className="text-lg mr-1">🏆</span>
            <span className="font-medium font-playfair">
              {averageScore >= 50 ? 'Better than ' + (averageScore - 10) + '% of students' : 'Keep practicing'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-[#1E1E1E] mb-2 font-playfair">{totalExams}</div>
          <div className="text-[#626060] text-sm mb-4 font-playfair">Exams Completed</div>
          <div className="flex items-center text-purple-600">
            <span className="text-lg mr-1">🎯</span>
            <span className="font-medium font-playfair">
              {totalExams > 0 ? 'Consistent performance' : 'Start your first exam'}
            </span>
          </div>
        </div>
      </div>

      {scores.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Score Trend</h2>
          <div className="h-64 flex items-end space-x-4">
            {scores.map((score, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="text-sm text-[#626060] mb-2 font-playfair">{labels[index] || `Period ${index + 1}`}</div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${score}%` }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full bg-gradient-to-t from-[#039994] to-[#4fd1c5] rounded-t-lg"
                  style={{ maxHeight: '192px', height: `${score}%` }}
                />
                <div className="mt-2 font-medium text-[#1E1E1E] font-playfair">{score}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="text-sm text-[#626060] font-playfair">{subject.attempts} attempts</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-3">
                      <div
                        className={`h-full ${
                          subject.score >= 80 ? 'bg-green-500' : 
                          subject.score >= 70 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${subject.score}%` }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#1E1E1E] font-playfair">{subject.score}%</div>
                      <div className={`text-xs ${
                        subject.trend === 'up' ? 'text-green-600' : 
                        subject.trend === 'down' ? 'text-red-600' : 
                        'text-gray-600'
                      } font-playfair`}>
                        {subject.trend === 'up' ? '↑ Improving' : 
                         subject.trend === 'down' ? '↓ Needs work' : 
                         '→ Stable'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No subject performance data yet. Complete some exams to see your performance.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-[#1E1E1E] mb-6 font-playfair">Recent Exam Results</h2>
          <div className="space-y-4">
            {examResults.length > 0 ? (
              examResults.slice(0, 5).map((result) => {
                const date = new Date(result.date._seconds * 1000);
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                
                return (
                  <div key={result.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{subjectIcons[result.subject] || '📘'}</span>
                      <div>
                        <div className="font-medium text-[#1E1E1E] font-playfair">{result.subject}</div>
                        <div className="text-xs text-[#626060] font-playfair">{formattedDate}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold font-playfair ${
                        (result.percentage || result.score) >= 70 ? 'text-green-600' : 
                        (result.percentage || result.score) >= 50 ? 'text-yellow-600' : 
                        'text-red-600'
                      }`}>
                        {result.percentage || result.score}%
                      </div>
                      <div className="text-xs text-[#626060] font-playfair capitalize">{result.examType}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-[#626060] font-playfair">
                No exam results yet. Take your first exam to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}