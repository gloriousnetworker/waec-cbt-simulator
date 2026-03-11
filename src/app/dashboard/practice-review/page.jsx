// app/dashboard/practice-review/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import StudentProtectedRoute from '../../../components/StudentProtectedRoute';

function PracticeReviewContent() {
  const router = useRouter();
  const [results, setResults] = useState(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('practice_review');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      router.push('/dashboard');
    }
  }, []);

  if (!results) return null;

  const handleBackToDashboard = () => {
    // Navigate back to dashboard with a query parameter to show performance section
    router.push('/dashboard?section=performance');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-[#039994] to-[#028a85] p-8 text-white">
            <h1 className="text-2xl font-bold font-playfair mb-2">Practice Review</h1>
            <p className="text-sm opacity-90 font-playfair">{results.subjectName}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#1E1E1E] font-playfair">{results.totalQuestions}</div>
                <div className="text-xs text-[#626060] font-playfair">Total Qs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 font-playfair">{results.correct}</div>
                <div className="text-xs text-[#626060] font-playfair">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 font-playfair">{results.wrong}</div>
                <div className="text-xs text-[#626060] font-playfair">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#039994] font-playfair">{results.percentage}%</div>
                <div className="text-xs text-[#626060] font-playfair">Score</div>
              </div>
            </div>

            {results.questions && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-playfair">Question Review</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.questions.map((q, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border ${
                      q.status === 'correct' ? 'border-green-200 bg-green-50' :
                      q.status === 'wrong' ? 'border-red-200 bg-red-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg font-bold text-[#1E1E1E]">{idx + 1}.</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1E1E1E] mb-2 font-playfair">{q.question}</p>
                          {q.selected && (
                            <p className={`text-xs mb-1 font-playfair ${
                              q.status === 'correct' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Your answer: {q.selected}
                            </p>
                          )}
                          {q.status === 'wrong' && (
                            <p className="text-xs text-green-600 font-playfair">
                              Correct: {q.correctAnswer}
                            </p>
                          )}
                          {q.explanation && q.explanation !== 'No explanation provided' && (
                            <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                              <p className="text-xs text-[#626060] font-playfair">
                                <span className="font-bold">Explanation:</span> {q.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className={`text-lg ${
                          q.status === 'correct' ? 'text-green-600' :
                          q.status === 'wrong' ? 'text-red-600' :
                          'text-gray-400'
                        }`}>
                          {q.status === 'correct' ? '✓' : q.status === 'wrong' ? '✗' : '○'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleBackToDashboard}
              className="w-full py-3 bg-[#039994] text-white rounded-lg hover:bg-[#028a85] transition-colors font-playfair text-sm font-[600]"
            >
              Back to Performance
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function PracticeReviewPage() {
  return (
    <StudentProtectedRoute>
      <PracticeReviewContent />
    </StudentProtectedRoute>
  );
}