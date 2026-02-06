'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  examsContainer,
  examsHeader,
  examsTitle,
  examsSubtitle,
  examsTabsGrid,
  examsTabButton,
  examsTabButtonActive,
  examsTabButtonInactive,
  examsTabTitle,
  examsTabDesc,
  examsSubjectsGrid,
  examsSubjectCard,
  examsSubjectColorBar,
  examsSubjectCardInner,
  examsSubjectHeader,
  examsSubjectIcon,
  examsSubjectName,
  examsSubjectQuestions,
  examsSubjectStats,
  examsSubjectStatRow,
  examsSubjectStatLabel,
  examsSubjectStatValue,
  examsSubjectButton,
  examsInstructions,
  examsInstructionsTitle,
  examsInstructionsList,
  examsInstructionsItem,
  examsInstructionsBullet
} from '../../styles/styles';

export default function Exams() {
  const [activeTab, setActiveTab] = useState('practice');
  const router = useRouter();

  const subjects = [
    { id: 'mathematics', name: 'Mathematics', icon: '🧮', color: 'bg-[#3B82F6]', questions: 60, duration: '3h', bestScore: 85, attempts: 12 },
    { id: 'english', name: 'English Language', icon: '📖', color: 'bg-[#10B981]', questions: 100, duration: '2h 45m', bestScore: 78, attempts: 15 },
    { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-[#8B5CF6]', questions: 50, duration: '2h 30m', bestScore: 72, attempts: 8 },
    { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-[#EF4444]', questions: 50, duration: '2h 30m', bestScore: 90, attempts: 10 },
    { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-[#059669]', questions: 50, duration: '2h 30m', bestScore: 88, attempts: 11 },
    { id: 'economics', name: 'Economics', icon: '📈', color: 'bg-[#F59E0B]', questions: 50, duration: '2h', bestScore: 76, attempts: 9 },
    { id: 'geography', name: 'Geography', icon: '🗺️', color: 'bg-[#14B8A6]', questions: 50, duration: '2h', bestScore: 82, attempts: 7 },
    { id: 'government', name: 'Government', icon: '🏛️', color: 'bg-[#6366F1]', questions: 50, duration: '2h', bestScore: 79, attempts: 6 },
    { id: 'crk', name: 'Christian Religious Knowledge', icon: '✝️', color: 'bg-[#8B5CF6]', questions: 50, duration: '2h', bestScore: 91, attempts: 5 },
    { id: 'irk', name: 'Islamic Religious Knowledge', icon: '☪️', color: 'bg-[#059669]', questions: 50, duration: '2h', bestScore: 87, attempts: 4 },
    { id: 'literature', name: 'Literature in English', icon: '📚', color: 'bg-[#EC4899]', questions: 50, duration: '2h 30m', bestScore: 84, attempts: 8 },
    { id: 'commerce', name: 'Commerce', icon: '💼', color: 'bg-[#F97316]', questions: 50, duration: '2h', bestScore: 81, attempts: 7 },
    { id: 'accounting', name: 'Financial Accounting', icon: '💰', color: 'bg-[#10B981]', questions: 50, duration: '2h 30m', bestScore: 77, attempts: 9 },
    { id: 'agricscience', name: 'Agricultural Science', icon: '🌾', color: 'bg-[#84CC16]', questions: 50, duration: '2h 30m', bestScore: 86, attempts: 6 },
    { id: 'civiledu', name: 'Civic Education', icon: '🏛️', color: 'bg-[#0EA5E9]', questions: 50, duration: '2h', bestScore: 89, attempts: 5 },
    { id: 'dataprocessing', name: 'Data Processing', icon: '💻', color: 'bg-[#6366F1]', questions: 50, duration: '2h', bestScore: 92, attempts: 10 },
  ];

  const examTypes = [
    { id: 'practice', name: 'Practice Exam', desc: 'Untimed practice with detailed explanations' },
    { id: 'timed', name: 'Timed Exam', desc: 'Simulate real exam time conditions' },
    { id: 'mock', name: 'Mock Exam', desc: 'Full WAEC simulation with strict rules' },
  ];

  const handleStartExam = (subjectId) => {
    router.push(`/dashboard/exam-room?subject=${subjectId}&type=${activeTab}`);
  };

  return (
    <div className={examsContainer}>
      <div className={examsHeader}>
        <h1 className={examsTitle}>Practice Exams</h1>
        <p className={examsSubtitle}>Select a subject and exam type to begin your practice</p>
      </div>

      <div className={examsTabsGrid}>
        {examTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveTab(type.id)}
            className={`${examsTabButton} ${
              activeTab === type.id ? examsTabButtonActive : examsTabButtonInactive
            }`}
          >
            <div className={examsTabTitle}>{type.name}</div>
            <div className={examsTabDesc}>{type.desc}</div>
          </button>
        ))}
      </div>

      <div className={examsSubjectsGrid}>
        {subjects.map((subject) => (
          <motion.div
            key={subject.id}
            whileHover={{ y: -4 }}
            className={examsSubjectCard}
          >
            <div className={`${examsSubjectColorBar} ${subject.color}`}></div>
            <div className={examsSubjectCardInner}>
              <div className={examsSubjectHeader}>
                <span className={examsSubjectIcon}>{subject.icon}</span>
                <div>
                  <h3 className={examsSubjectName}>{subject.name}</h3>
                  <p className={examsSubjectQuestions}>{subject.questions} questions</p>
                </div>
              </div>
              
              <div className={examsSubjectStats}>
                <div className={examsSubjectStatRow}>
                  <span className={examsSubjectStatLabel}>Duration:</span>
                  <span className={examsSubjectStatValue}>{subject.duration}</span>
                </div>
                <div className={examsSubjectStatRow}>
                  <span className={examsSubjectStatLabel}>Best Score:</span>
                  <span className={`${examsSubjectStatValue} text-[#10B981]`}>{subject.bestScore}%</span>
                </div>
                <div className={examsSubjectStatRow}>
                  <span className={examsSubjectStatLabel}>Attempts:</span>
                  <span className={examsSubjectStatValue}>{subject.attempts}</span>
                </div>
              </div>

              <button
                onClick={() => handleStartExam(subject.id)}
                className={examsSubjectButton}
              >
                Start Exam
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className={examsInstructions}>
        <h3 className={examsInstructionsTitle}>📋 Exam Instructions</h3>
        <ul className={examsInstructionsList}>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>Each exam follows WAEC examination standards and format</span>
          </li>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>You cannot navigate away during timed and mock exams</span>
          </li>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>Auto-submission occurs if you switch tabs or windows</span>
          </li>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>All questions must be attempted before final submission</span>
          </li>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>Review your answers before submitting the exam</span>
          </li>
          <li className={examsInstructionsItem}>
            <span className={examsInstructionsBullet}>•</span>
            <span>Practice exams allow unlimited time and hints</span>
          </li>
        </ul>
      </div>
    </div>
  );
}