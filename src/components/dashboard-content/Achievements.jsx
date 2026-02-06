'use client';

import { motion } from 'framer-motion';

export default function Achievements() {
  const achievements = [
    { id: 1, title: 'First Exam Completed', description: 'Complete your first practice exam', icon: '🎯', achieved: true, date: '2024-01-15', points: 50 },
    { id: 2, title: 'Speed Demon', description: 'Complete an exam in half the allotted time', icon: '⚡', achieved: true, date: '2024-01-20', points: 100 },
    { id: 3, title: 'Perfect Score', description: 'Score 100% on any exam', icon: '💯', achieved: false, target: 'Score 100%', points: 200 },
    { id: 4, title: 'Consistent Performer', description: 'Complete 10 exams with 80%+ score', icon: '📈', achieved: true, date: '2024-02-01', points: 150 },
    { id: 5, title: 'Subject Master', description: 'Achieve 90%+ in all subjects', icon: '👨‍🎓', achieved: false, target: '3/8 subjects', points: 300 },
    { id: 6, title: 'Early Bird', description: 'Complete 5 exams before 8 AM', icon: '🌅', achieved: false, target: '2/5 completed', points: 75 },
    { id: 7, title: 'Weekend Warrior', description: 'Complete 3 exams in one weekend', icon: '🏋️', achieved: true, date: '2024-02-10', points: 125 },
    { id: 8, title: 'Study Streak', description: 'Practice for 7 consecutive days', icon: '🔥', achieved: true, date: '2024-02-15', points: 100 },
    { id: 9, title: 'Top 10%', description: 'Rank in top 10% globally', icon: '🏆', achieved: false, target: 'Current: Top 15%', points: 250 },
    { id: 10, title: 'Quick Learner', description: 'Improve score by 20% in a week', icon: '📚', achieved: true, date: '2024-02-18', points: 150 },
    { id: 11, title: 'Exam Marathon', description: 'Complete 5 exams in one day', icon: '🏃', achieved: false, target: 'Maximum: 3 exams', points: 200 },
    { id: 12, title: 'All Subjects', description: 'Attempt exams in all subjects', icon: '🎓', achieved: false, target: '6/8 subjects', points: 175 },
  ];

  const totalPoints = achievements.filter(a => a.achieved).reduce((sum, a) => sum + a.points, 0);
  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Achievements</h1>
        <p className="text-gray-600 mt-2">Track your accomplishments and earn rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{achievedCount}</div>
          <div className="text-blue-100">Achievements Unlocked</div>
          <div className="mt-4 text-sm text-blue-200">Out of {achievements.length} total</div>
        </div>

        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">{totalPoints}</div>
          <div className="text-green-100">Total Points</div>
          <div className="mt-4 text-sm text-green-200">Earn more to unlock rewards</div>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl p-6 text-white">
          <div className="text-4xl font-bold mb-2">Level 8</div>
          <div className="text-purple-100">Current Level</div>
          <div className="mt-4">
            <div className="h-2 bg-purple-400 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4"></div>
            </div>
            <div className="text-xs text-purple-200 mt-2">750/1000 points to next level</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            whileHover={{ y: -4 }}
            className={`rounded-xl p-5 ${achievement.achieved ? 'bg-white border border-green-200 shadow-sm' : 'bg-gray-50 border border-gray-200'}`}
          >
            <div className="flex items-start mb-4">
              <div className={`text-3xl p-3 rounded-lg ${achievement.achieved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {achievement.icon}
              </div>
              <div className="ml-4 flex-1">
                <h3 className={`font-bold ${achievement.achieved ? 'text-gray-800' : 'text-gray-600'}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${achievement.achieved ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {achievement.achieved ? '✓ Achieved' : 'In Progress'}
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-800">{achievement.points} pts</div>
                <div className="text-xs text-gray-500">
                  {achievement.achieved ? (
                    <span>Earned: {new Date(achievement.date).toLocaleDateString()}</span>
                  ) : (
                    <span>{achievement.target}</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">🎁 Points Rewards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🏅</div>
            <div className="font-medium text-blue-700">500 pts</div>
            <div className="text-xs text-gray-600">Bronze Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🥈</div>
            <div className="font-medium text-blue-700">1000 pts</div>
            <div className="text-xs text-gray-600">Silver Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">🥇</div>
            <div className="font-medium text-blue-700">2000 pts</div>
            <div className="text-xs text-gray-600">Gold Badge</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
            <div className="text-2xl mb-2">👑</div>
            <div className="font-medium text-blue-700">5000 pts</div>
            <div className="text-xs text-gray-600">Platinum Rank</div>
          </div>
        </div>
      </div>
    </div>
  );
}