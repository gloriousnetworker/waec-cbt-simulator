'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Performance() {
  const [timeRange, setTimeRange] = useState('month');

  const performanceData = {
    month: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      scores: [65, 72, 78, 85],
      average: 75,
      improvement: '+12%',
      rank: 'Top 20%'
    },
    quarter: {
      labels: ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'],
      scores: [68, 74, 79, 82],
      average: 76,
      improvement: '+8%',
      rank: 'Top 18%'
    },
    year: {
      labels: ['2022', '2023', '2024'],
      scores: [70, 75, 82],
      average: 76,
      improvement: '+15%',
      rank: 'Top 15%'
    }
  };

  const subjectPerformance = [
    { subject: 'Mathematics', score: 85, trend: 'up', icon: '🧮' },
    { subject: 'English', score: 72, trend: 'stable', icon: '📖' },
    { subject: 'Physics', score: 78, trend: 'up', icon: '⚛️' },
    { subject: 'Chemistry', score: 90, trend: 'up', icon: '🧪' },
    { subject: 'Biology', score: 68, trend: 'down', icon: '🧬' },
    { subject: 'Economics', score: 82, trend: 'up', icon: '📈' },
    { subject: 'Geography', score: 75, trend: 'stable', icon: '🗺️' },
    { subject: 'Government', score: 80, trend: 'up', icon: '🏛️' },
  ];

  const data = performanceData[timeRange];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Performance Analytics</h1>
          <p className="text-gray-600 mt-2">Track your progress and identify areas for improvement</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          {['month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">{data.average}%</div>
          <div className="text-gray-600 text-sm mb-4">Average Score</div>
          <div className="flex items-center text-green-600">
            <span className="text-lg mr-1">📈</span>
            <span className="font-medium">{data.improvement} improvement</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">{data.rank}</div>
          <div className="text-gray-600 text-sm mb-4">Global Rank</div>
          <div className="flex items-center text-blue-600">
            <span className="text-lg mr-1">🏆</span>
            <span className="font-medium">Better than 85% of students</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">18</div>
          <div className="text-gray-600 text-sm mb-4">Exams Completed</div>
          <div className="flex items-center text-purple-600">
            <span className="text-lg mr-1">🎯</span>
            <span className="font-medium">Consistent performance</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Score Trend</h2>
        <div className="h-64 flex items-end space-x-4">
          {data.scores.map((score, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="text-sm text-gray-500 mb-2">{data.labels[index]}</div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${score}%` }}
                transition={{ delay: index * 0.1 }}
                className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg max-h-48"
              />
              <div className="mt-2 font-medium">{score}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Subject Performance</h2>
          <div className="space-y-4">
            {subjectPerformance.map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{subject.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800">{subject.subject}</div>
                    <div className="text-sm text-gray-500">Last exam score</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-24 h-2 bg-gray-200 rounded-full overflow-hidden mr-3`}>
                    <div
                      className={`h-full ${subject.score >= 80 ? 'bg-green-500' : subject.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${subject.score}%` }}
                    />
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">{subject.score}%</div>
                    <div className={`text-xs ${subject.trend === 'up' ? 'text-green-600' : subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                      {subject.trend === 'up' ? '↑ Improving' : subject.trend === 'down' ? '↓ Needs work' : '→ Stable'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Recommendations</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <span className="text-blue-600 mr-2">🎯</span>
                <span className="font-medium text-blue-800">Focus Area: Biology</span>
              </div>
              <p className="text-sm text-blue-700">Your biology scores are below average. Try focusing on past questions from 2019-2023.</p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <span className="text-green-600 mr-2">📚</span>
                <span className="font-medium text-green-800">Study Plan</span>
              </div>
              <p className="text-sm text-green-700">Spend 30 minutes daily on timed mathematics practice to improve speed.</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <span className="text-purple-600 mr-2">🏆</span>
                <span className="font-medium text-purple-800">Goal Achievement</span>
              </div>
              <p className="text-sm text-purple-700">You're on track to reach 85% average by next month. Keep it up!</p>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 mr-2">⏱️</span>
                <span className="font-medium text-yellow-800">Time Management</span>
              </div>
              <p className="text-sm text-yellow-700">Your physics exam times are improving by 15%. Excellent progress!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}