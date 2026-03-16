// components/dashboard-content/Performance.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BarChart3, BookOpen, Trophy, Target, Trash2, Eye, ClipboardList } from 'lucide-react';

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
    Mathematics: '🧮', English: '📖', Physics: '⚛️', Chemistry: '🧪',
    Biology: '🧬', Economics: '📈', Geography: '🗺️', Government: '🏛️',
    'Christian Religious Knowledge': '✝️', 'Islamic Religious Knowledge': '☪️',
    'Literature in English': '📚', Commerce: '💼', 'Financial Accounting': '💰',
    'Agricultural Science': '🌾', 'Civic Education': '🏛️', 'Data Processing': '💻'
  };

  useEffect(() => { fetchPerformanceData(); }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const localPracticeHistory = JSON.parse(localStorage.getItem('practice_history') || '[]');
      const localExamHistory = JSON.parse(localStorage.getItem('exam_history') || '[]');

      if (!isOffline) {
        const [examHistoryRes, practiceRes, statsRes] = await Promise.all([
          fetchWithAuth('/student/history'),
          fetchWithAuth('/practice/history?limit=100'),
          fetchWithAuth('/practice/stats')
        ]);

        if (examHistoryRes?.ok) {
          const examData = await examHistoryRes.json();
          const apiExams = examData.exams || [];
          const formattedApiExams = apiExams.map(exam => {
            const mainSubject = exam.subjects?.length > 0 ? exam.subjects[0] : { subjectName: 'General', questionCount: exam.questionCount || 0 };
            const subjectName = exam.subjects?.length > 1 ? `${exam.subjects.length} Subjects Combined` : mainSubject.subjectName || 'General';
            return {
              id: exam.id, examSetupId: exam.examSetupId, subject: subjectName, subjectName,
              subjects: exam.subjects || [], score: exam.score || 0, totalMarks: exam.totalMarks || 0,
              percentage: exam.percentage || 0,
              date: exam.date?._seconds ? new Date(exam.date._seconds * 1000).toISOString() : new Date().toISOString(),
              duration: exam.duration, questionCount: exam.questionCount || 0,
              status: exam.status || 'completed', type: 'exam', isMockExam: true, source: 'api'
            };
          });
          const mergedExams = [...formattedApiExams];
          localExamHistory.forEach(local => { if (!mergedExams.some(api => api.id === local.id)) mergedExams.push(local); });
          setExamHistory(mergedExams);
          localStorage.setItem('exam_history', JSON.stringify(mergedExams));
        } else {
          setExamHistory(localExamHistory);
        }

        if (practiceRes?.ok) {
          const practiceData = await practiceRes.json();
          const formattedApiPractices = (practiceData.practices || []).map(p => ({
            id: p.id, subjectId: p.subjectId, subjectName: p.subjectName, totalQuestions: p.totalQuestions,
            correct: p.correct, wrong: p.wrong, unanswered: p.unanswered, percentage: p.percentage,
            date: p.date?._seconds ? new Date(p.date._seconds * 1000).toISOString() : p.date,
            duration: p.duration, difficulty: p.difficulty, isTimedTest: p.isTimedTest,
            isMockExam: p.isMockExam || false, studentClass: p.studentClass, questions: p.questions || [],
            type: 'practice', source: 'api'
          }));
          const mergedPractices = [...formattedApiPractices];
          localPracticeHistory.forEach(local => { if (!mergedPractices.some(api => api.id === local.id)) mergedPractices.push(local); });
          setPracticeHistory(mergedPractices);
          localStorage.setItem('practice_history', JSON.stringify(mergedPractices));
        } else {
          setPracticeHistory(localPracticeHistory);
        }

        if (statsRes?.ok) {
          const statsData = await statsRes.json();
          setPracticeStats(statsData.stats);
        }
      } else {
        setExamHistory(getOfflineData('examHistory') || localExamHistory);
        setPracticeHistory(getOfflineData('practiceHistory') || localPracticeHistory);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
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
        const response = await fetchWithAuth(`/practice/${practiceToDelete.id}`, { method: 'DELETE' });
        if (response?.ok) {
          setPracticeHistory(prev => prev.filter(p => p.id !== practiceToDelete.id));
          const updatedLocal = JSON.parse(localStorage.getItem('practice_history') || '[]').filter(p => p.id !== practiceToDelete.id);
          localStorage.setItem('practice_history', JSON.stringify(updatedLocal));
          toast.success('Practice record deleted', { id: toastId });
        } else {
          toast.error('Failed to delete practice record', { id: toastId });
        }
      } else {
        const updatedLocal = JSON.parse(localStorage.getItem('practice_history') || '[]').filter(p => p.id !== practiceToDelete.id);
        localStorage.setItem('practice_history', JSON.stringify(updatedLocal));
        setPracticeHistory(prev => prev.filter(p => p.id !== practiceToDelete.id));
        toast.success('Practice record deleted', { id: toastId });
      }
    } catch (error) {
      toast.error('Failed to delete practice record', { id: toastId });
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setPracticeToDelete(null);
    }
  };

  const handleReviewPractice = (practice) => {
    localStorage.setItem('practice_review', JSON.stringify({
      totalQuestions: practice.totalQuestions, correct: practice.correct, wrong: practice.wrong,
      unanswered: practice.unanswered, percentage: practice.percentage,
      subjectName: practice.subjectName, questions: practice.questions || []
    }));
    router.push('/dashboard/practice-review');
  };

  const handleViewExamDetails = (exam) => {
    localStorage.setItem('exam_review', JSON.stringify({
      id: exam.id, examSetupId: exam.examSetupId, subject: exam.subject, subjects: exam.subjects,
      score: exam.score, totalMarks: exam.totalMarks, percentage: exam.percentage,
      date: exam.date, duration: exam.duration, questionCount: exam.questionCount
    }));
    toast.success('Exam details loaded');
  };

  const getFilteredResults = () => {
    const now = new Date();
    return [
      ...examHistory.map(e => ({ ...e, type: 'exam' })),
      ...practiceHistory.map(p => ({ ...p, type: 'practice', subject: p.subjectName, date: p.date }))
    ].filter(result => {
      const diffDays = Math.abs(now - new Date(result.date || now)) / (1000 * 60 * 60 * 24);
      if (timeRange === 'month') return diffDays <= 30;
      if (timeRange === 'quarter') return diffDays <= 90;
      return true;
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  };

  const getSubjectPerformance = () => {
    const subjectStats = {};
    examHistory.forEach(result => {
      if (result.subjects?.length > 0) {
        result.subjects.forEach(subject => {
          const n = subject.subjectName;
          if (!n) return;
          if (!subjectStats[n]) subjectStats[n] = { total: 0, count: 0, lastScore: 0, icon: subjectIcons[n] || '📘', examAttempts: 0, practiceAttempts: 0 };
          const pct = (result.totalMarks / result.subjects.length) > 0
            ? ((result.score / result.subjects.length) / (result.totalMarks / result.subjects.length)) * 100
            : result.percentage;
          subjectStats[n].total += pct || 0;
          subjectStats[n].count++;
          subjectStats[n].lastScore = pct || 0;
          subjectStats[n].examAttempts++;
        });
      } else {
        const n = result.subject;
        if (!n) return;
        if (!subjectStats[n]) subjectStats[n] = { total: 0, count: 0, lastScore: 0, icon: subjectIcons[n] || '📘', examAttempts: 0, practiceAttempts: 0 };
        subjectStats[n].total += result.percentage || 0;
        subjectStats[n].count++;
        subjectStats[n].lastScore = result.percentage || 0;
        subjectStats[n].examAttempts++;
      }
    });
    practiceHistory.forEach(p => {
      const n = p.subjectName;
      if (!n) return;
      if (!subjectStats[n]) subjectStats[n] = { total: 0, count: 0, lastScore: 0, icon: subjectIcons[n] || '📘', examAttempts: 0, practiceAttempts: 0 };
      subjectStats[n].total += p.percentage || 0;
      subjectStats[n].count++;
      subjectStats[n].lastScore = p.percentage || 0;
      subjectStats[n].practiceAttempts++;
    });
    return Object.entries(subjectStats).map(([subject, data]) => ({
      subject, avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
      lastScore: data.lastScore, attempts: data.count,
      examAttempts: data.examAttempts, practiceAttempts: data.practiceAttempts, icon: data.icon
    })).sort((a, b) => b.avgScore - a.avgScore);
  };

  const filteredResults = getFilteredResults();
  const subjectPerformance = getSubjectPerformance();
  const totalExams = examHistory.length + practiceHistory.length;
  const averageScore = filteredResults.length > 0
    ? Math.round(filteredResults.reduce((sum, r) => sum + (r.percentage || r.score || 0), 0) / filteredResults.length) : 0;
  const getBestScore = () => filteredResults.length === 0 ? 0 : Math.max(...filteredResults.map(r => r.percentage || r.score || 0));
  const getRankMessage = () => {
    if (averageScore >= 80) return 'Top 10%';
    if (averageScore >= 70) return 'Top 20%';
    if (averageScore >= 60) return 'Top 30%';
    if (averageScore >= 50) return 'Top 40%';
    return 'Keep improving';
  };
  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return 'Invalid date'; }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair">
            Performance Analytics
          </h1>
          <p className="text-sm text-content-secondary mt-1.5">Track your progress and identify areas for improvement</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {['month', 'quarter', 'year'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                timeRange === range
                  ? 'bg-brand-primary text-white'
                  : 'bg-white border border-border text-content-secondary hover:border-brand-primary'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { val: totalExams, label: 'Total Activities', icon: BarChart3, color: 'text-brand-primary', sub: `${examHistory.length} exams · ${practiceHistory.length} practice`, subColor: 'text-brand-primary' },
          { val: `${averageScore}%`, label: 'Average Score', icon: BookOpen, color: 'text-success', sub: averageScore >= 70 ? 'Excellent' : averageScore >= 50 ? 'Good' : 'Needs Improvement', subColor: 'text-success' },
          { val: `${getBestScore()}%`, label: 'Best Score', icon: Trophy, color: 'text-brand-gold', sub: getRankMessage(), subColor: 'text-brand-gold' },
          { val: subjectPerformance.length, label: 'Subjects Active', icon: Target, color: 'text-info', sub: `${subjectPerformance.filter(s => s.avgScore >= 70).length} above 70%`, subColor: 'text-info' },
        ].map(({ val, label, icon: Icon, color, sub, subColor }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-5 shadow-card">
            <p className={`text-2xl font-bold font-playfair ${color}`}>{val}</p>
            <p className="text-xs text-content-muted mt-1 mb-3">{label}</p>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${subColor}`}>
              <Icon size={13} />
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Subject + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Subject Performance */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">Subject Performance</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {subjectPerformance.length > 0 ? subjectPerformance.map((subject, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-surface-muted rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{subject.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{subject.subject}</p>
                    <p className="text-xs text-content-muted">{subject.examAttempts} exams · {subject.practiceAttempts} practice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-surface-subtle rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${subject.avgScore >= 80 ? 'bg-success' : subject.avgScore >= 70 ? 'bg-warning' : subject.avgScore >= 50 ? 'bg-warning' : 'bg-danger'}`}
                      style={{ width: `${subject.avgScore}%` }}
                    />
                  </div>
                  <div className="text-right min-w-[48px]">
                    <p className="text-sm font-bold text-content-primary">{subject.avgScore}%</p>
                    <p className="text-xs text-content-muted">Last: {subject.lastScore}%</p>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-8 text-sm text-content-muted">No subject performance data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-border p-5 shadow-card">
          <h2 className="text-base font-bold text-content-primary mb-4 font-playfair">Recent Activity</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredResults.slice(0, 8).map((result, i) => {
              const subject = result.subject || result.subjectName;
              const score = result.percentage || result.score || 0;
              return (
                <div key={result.id || i} className="flex items-center justify-between p-3 hover:bg-surface-muted rounded-xl transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg flex-shrink-0">{subjectIcons[subject] || (result.type === 'practice' ? '📝' : '📘')}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-content-primary truncate">{subject}</p>
                      <p className="text-xs text-content-muted">
                        {formatDate(result.date)} · {result.type === 'practice' ? 'Practice' : 'Exam'}
                        {result.isMockExam ? ' · Mock' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-sm font-bold ${score >= 70 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'}`}>
                      {typeof score === 'number' ? score.toFixed(1) : score}%
                    </span>
                    {result.type === 'practice' ? (
                      <>
                        <button onClick={() => handleReviewPractice(result)} className="text-xs text-brand-primary hover:underline font-medium">Review</button>
                        <button onClick={() => { setPracticeToDelete(result); setShowDeleteModal(true); }} className="text-xs text-danger hover:underline font-medium">Delete</button>
                      </>
                    ) : (
                      <button onClick={() => handleViewExamDetails(result)} className="text-xs text-brand-primary hover:underline font-medium">Details</button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredResults.length === 0 && (
              <p className="text-center py-8 text-sm text-content-muted">No activity in this period.</p>
            )}
          </div>
        </div>
      </div>

      {/* Exam History */}
      {examHistory.length > 0 && (
        <div className="bg-brand-primary-lt rounded-xl p-5 border border-brand-primary/20 mb-5">
          <h2 className="text-base font-bold text-brand-primary-dk mb-4 font-playfair flex items-center gap-2">
            <ClipboardList size={16} /> Exam History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {examHistory.slice(0, 6).map((exam, idx) => {
              const subjectName = exam.subject || (exam.subjects?.length > 0 ? (exam.subjects.length > 1 ? `${exam.subjects.length} Subjects` : exam.subjects[0].subjectName) : 'General');
              return (
                <div key={exam.id || idx} className="bg-white rounded-xl p-4 border border-border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-semibold text-content-primary">{subjectName}</p>
                      <p className="text-xs text-content-muted">{formatDate(exam.date)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${exam.percentage >= 70 ? 'bg-success-light text-success' : exam.percentage >= 50 ? 'bg-warning-light text-warning-dark' : 'bg-danger-light text-danger'}`}>
                      {typeof exam.percentage === 'number' ? exam.percentage.toFixed(1) : exam.percentage}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                    <div className="bg-surface-muted p-2 rounded-lg">
                      <span className="block font-bold text-success">{exam.score || 0}</span>
                      <span className="text-content-muted">Score</span>
                    </div>
                    <div className="bg-surface-muted p-2 rounded-lg">
                      <span className="block font-bold text-brand-primary">{exam.totalMarks || 0}</span>
                      <span className="text-content-muted">Total</span>
                    </div>
                  </div>
                  {exam.subjects?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {exam.subjects.map((s, i) => (
                        <span key={i} className="text-xs bg-brand-primary-lt text-brand-primary px-2 py-0.5 rounded-full">{s.subjectName}</span>
                      ))}
                    </div>
                  )}
                  <button onClick={() => handleViewExamDetails(exam)} className="w-full py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary-dk transition-colors">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
          {examHistory.length > 6 && (
            <button className="mt-4 text-sm text-brand-primary hover:underline font-medium">View All {examHistory.length} Exams →</button>
          )}
        </div>
      )}

      {/* Practice History */}
      {practiceHistory.length > 0 && (
        <div className="bg-warning-light rounded-xl p-5 border border-warning/30">
          <h2 className="text-base font-bold text-warning-dark mb-4 font-playfair flex items-center gap-2">
            <BookOpen size={16} /> Practice History
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practiceHistory.slice(0, 6).map((practice, idx) => (
              <div key={practice.id || idx} className="bg-white rounded-xl p-4 border border-border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm font-semibold text-content-primary">{practice.subjectName}</p>
                    <p className="text-xs text-content-muted">{formatDate(practice.date)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${practice.percentage >= 70 ? 'bg-success-light text-success' : practice.percentage >= 50 ? 'bg-warning-light text-warning-dark' : 'bg-danger-light text-danger'}`}>
                    {typeof practice.percentage === 'number' ? practice.percentage.toFixed(1) : practice.percentage}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="bg-surface-muted p-2 rounded-lg">
                    <span className="block font-bold text-success">{practice.correct || 0}</span>
                    <span className="text-content-muted">Correct</span>
                  </div>
                  <div className="bg-surface-muted p-2 rounded-lg">
                    <span className="block font-bold text-danger">{practice.wrong || 0}</span>
                    <span className="text-content-muted">Wrong</span>
                  </div>
                  <div className="bg-surface-muted p-2 rounded-lg">
                    <span className="block font-bold text-content-secondary">{practice.unanswered || 0}</span>
                    <span className="text-content-muted">Skipped</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleReviewPractice(practice)} className="flex-1 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-primary-dk transition-colors flex items-center justify-center gap-1">
                    <Eye size={12} /> Review
                  </button>
                  <button onClick={() => { setPracticeToDelete(practice); setShowDeleteModal(true); }} className="px-3 py-2 bg-danger-light text-danger rounded-xl text-xs font-bold hover:bg-danger hover:text-white transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {practiceHistory.length > 6 && (
            <button className="mt-4 text-sm text-brand-primary hover:underline font-medium">View All {practiceHistory.length} Practices →</button>
          )}
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && practiceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-card-lg"
            >
              <div className="w-14 h-14 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-danger" />
              </div>
              <h3 className="text-lg font-bold text-content-primary text-center mb-2 font-playfair">Delete Practice Record</h3>
              <p className="text-sm text-content-secondary text-center mb-1">
                Delete <span className="font-semibold text-content-primary">{practiceToDelete.subjectName}</span> from {formatDate(practiceToDelete.date)}?
              </p>
              <p className="text-xs text-danger text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button
                  onClick={handleDeletePractice}
                  disabled={deletingId === practiceToDelete.id}
                  className="flex-1 py-3 bg-danger text-white rounded-xl font-semibold text-sm hover:bg-danger-dark transition-colors disabled:opacity-50 min-h-[44px]"
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
