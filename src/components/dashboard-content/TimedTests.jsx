'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TimedTests() {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const timedTests = [
    { id: 1, name: 'Mathematics Speed Test', duration: 1800, questions: 30, difficulty: 'Medium', icon: '🧮' },
    { id: 2, name: 'English Comprehension', duration: 2700, questions: 40, difficulty: 'Hard', icon: '📖' },
    { id: 3, name: 'Physics Quick Test', duration: 1500, questions: 25, difficulty: 'Medium', icon: '⚛️' },
    { id: 4, name: 'Chemistry Flash Test', duration: 1200, questions: 20, difficulty: 'Easy', icon: '🧪' },
    { id: 5, name: 'Biology Sprint Test', duration: 1800, questions: 30, difficulty: 'Medium', icon: '🧬' },
    { id: 6, name: 'Economics Rapid Test', duration: 1500, questions: 25, difficulty: 'Easy', icon: '📈' },
  ];

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTest = (test) => {
    setSelectedTest(test);
    setTimeLeft(test.duration);
    setIsRunning(true);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Timed Tests</h1>
        <p className="text-gray-600 mt-2">Test your speed and accuracy under pressure</p>
      </div>

      {selectedTest && (
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Active Test: {selectedTest.name}</h2>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
                  <div className="text-sm text-blue-100">Time Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedTest.questions}</div>
                  <div className="text-sm text-blue-100">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{selectedTest.difficulty}</div>
                  <div className="text-sm text-blue-100">Difficulty</div>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition"
              >
                {isRunning ? 'Pause Test' : 'Resume Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timedTests.map((test) => (
          <motion.div
            key={test.id}
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">{test.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-800">{test.name}</h3>
                  <p className="text-sm text-gray-500">{test.questions} questions</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                {test.difficulty}
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{Math.floor(test.duration / 60)} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Best Time:</span>
                <span className="font-medium text-green-600">24:30</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Attempts:</span>
                <span className="font-medium">8</span>
              </div>
            </div>

            <button
              onClick={() => startTest(test)}
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Start Test
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-3">⏱️ Timing Rules</h3>
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