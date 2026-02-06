'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function PastQuestions() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017'];
  const subjects = [
    { id: 'all', name: 'All Subjects', icon: '📚' },
    { id: 'math', name: 'Mathematics', icon: '🧮', count: 24 },
    { id: 'english', name: 'English', icon: '📖', count: 18 },
    { id: 'physics', name: 'Physics', icon: '⚛️', count: 16 },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', count: 15 },
    { id: 'biology', name: 'Biology', icon: '🧬', count: 17 },
    { id: 'economics', name: 'Economics', icon: '📈', count: 14 },
    { id: 'geography', name: 'Geography', icon: '🗺️', count: 12 },
    { id: 'government', name: 'Government', icon: '🏛️', count: 13 },
  ];

  const papers = [
    { id: 1, year: '2024', subject: 'Mathematics', paper: 'Paper 2', type: 'Essay', questions: 13, duration: '2h 30m', difficulty: 'Hard' },
    { id: 2, year: '2024', subject: 'English', paper: 'Paper 1', type: 'Objective', questions: 100, duration: '1h 45m', difficulty: 'Medium' },
    { id: 3, year: '2023', subject: 'Physics', paper: 'Paper 3', type: 'Practical', questions: 8, duration: '2h 45m', difficulty: 'Hard' },
    { id: 4, year: '2023', subject: 'Chemistry', paper: 'Paper 2', type: 'Essay', questions: 12, duration: '2h', difficulty: 'Medium' },
    { id: 5, year: '2022', subject: 'Biology', paper: 'Paper 1', type: 'Objective', questions: 50, duration: '1h', difficulty: 'Easy' },
    { id: 6, year: '2022', subject: 'Economics', paper: 'Paper 2', type: 'Essay', questions: 8, duration: '2h', difficulty: 'Medium' },
    { id: 7, year: '2021', subject: 'Mathematics', paper: 'Paper 1', type: 'Objective', questions: 50, duration: '1h 30m', difficulty: 'Medium' },
    { id: 8, year: '2021', subject: 'English', paper: 'Paper 3', type: 'Test of Orals', questions: 60, duration: '45m', difficulty: 'Easy' },
  ];

  const filteredPapers = papers.filter(paper => {
    if (selectedYear !== 'all' && paper.year !== selectedYear) return false;
    if (selectedSubject !== 'all' && paper.subject.toLowerCase() !== selectedSubject) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Past Questions</h1>
        <p className="text-gray-600 mt-2">Access WAEC past questions from previous years</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedYear === year ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {year}
            </button>
          ))}
        </div>
        <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
          Download All Papers
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 mb-8">
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`flex flex-col items-center p-3 rounded-lg ${selectedSubject === subject.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-white border border-gray-200 hover:border-blue-300'}`}
          >
            <span className="text-2xl mb-2">{subject.icon}</span>
            <span className="text-xs font-medium text-gray-700 text-center">{subject.name}</span>
            {subject.count && (
              <span className="text-xs text-gray-500 mt-1">{subject.count} papers</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.map((paper) => (
          <motion.div
            key={paper.id}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium mr-3 ${paper.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : paper.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {paper.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">WAEC {paper.year}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">{paper.subject} - {paper.paper}</h3>
                <p className="text-gray-600 text-sm">{paper.type} Questions</p>
              </div>
              <span className="text-3xl">
                {paper.subject === 'Mathematics' && '🧮'}
                {paper.subject === 'English' && '📖'}
                {paper.subject === 'Physics' && '⚛️'}
                {paper.subject === 'Chemistry' && '🧪'}
                {paper.subject === 'Biology' && '🧬'}
                {paper.subject === 'Economics' && '📈'}
                {paper.subject === 'Geography' && '🗺️'}
                {paper.subject === 'Government' && '🏛️'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{paper.questions}</div>
                <div className="text-xs text-gray-600">Questions</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">{paper.duration}</div>
                <div className="text-xs text-gray-600">Duration</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-800">85%</div>
                <div className="text-xs text-gray-600">Avg. Score</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                Practice Now
              </button>
              <button className="px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Past Question Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">129</div>
            <div className="text-sm text-gray-700">Total Papers</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">8</div>
            <div className="text-sm text-gray-700">Years Covered</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">75%</div>
            <div className="text-sm text-gray-700">Repeat Probability</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl font-bold text-blue-600 mb-2">98%</div>
            <div className="text-sm text-gray-700">Accuracy Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}