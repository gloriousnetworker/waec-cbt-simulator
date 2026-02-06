'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function StudyGroups() {
  const [activeTab, setActiveTab] = useState('joined');

  const groups = [
    { id: 1, name: 'Mathematics Wizards', subject: 'Mathematics', members: 245, active: 48, icon: '🧮', joined: true },
    { id: 2, name: 'English Excellence', subject: 'English', members: 189, active: 32, icon: '📖', joined: true },
    { id: 3, name: 'Physics Pioneers', subject: 'Physics', members: 156, active: 28, icon: '⚛️', joined: false },
    { id: 4, name: 'Chemistry Club', subject: 'Chemistry', members: 178, active: 35, icon: '🧪', joined: true },
    { id: 5, name: 'Biology Buffs', subject: 'Biology', members: 201, active: 42, icon: '🧬', joined: false },
    { id: 6, name: 'Economics Elite', subject: 'Economics', members: 134, active: 25, icon: '📈', joined: true },
    { id: 7, name: 'Geography Geniuses', subject: 'Geography', members: 98, active: 18, icon: '🗺️', joined: false },
    { id: 8, name: 'Government Gurus', subject: 'Government', members: 112, active: 21, icon: '🏛️', joined: true },
  ];

  const discussions = [
    { id: 1, group: 'Mathematics Wizards', title: 'Calculus Problem Help', author: 'John D.', time: '2 hours ago', replies: 12 },
    { id: 2, group: 'English Excellence', title: 'Essay Writing Tips', author: 'Sarah M.', time: '4 hours ago', replies: 8 },
    { id: 3, group: 'Chemistry Club', title: 'Organic Chemistry Questions', author: 'Mike T.', time: '1 day ago', replies: 15 },
    { id: 4, group: 'Economics Elite', title: 'Supply & Demand Graphs', author: 'David K.', time: '2 days ago', replies: 6 },
  ];

  const upcomingSessions = [
    { id: 1, group: 'Mathematics Wizards', topic: 'Trigonometry Review', time: 'Today, 4:00 PM', participants: 24 },
    { id: 2, group: 'English Excellence', topic: 'Comprehension Practice', time: 'Tomorrow, 10:00 AM', participants: 18 },
    { id: 3, group: 'Government Gurus', topic: 'Constitutional Law', time: 'Dec 20, 2:00 PM', participants: 15 },
  ];

  const filteredGroups = activeTab === 'joined' 
    ? groups.filter(g => g.joined)
    : groups.filter(g => !g.joined);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Study Groups</h1>
        <p className="text-gray-600 mt-2">Collaborate with fellow students and learn together</p>
      </div>

      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setActiveTab('joined')}
          className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'joined' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          My Groups
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`px-6 py-3 rounded-lg font-medium ${activeTab === 'discover' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Discover Groups
        </button>
        <button className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {activeTab === 'joined' ? 'My Study Groups' : 'Discover Groups'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGroups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-3xl p-3 bg-blue-100 text-blue-600 rounded-lg mr-4">
                      {group.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.subject}</p>
                    </div>
                  </div>
                  {group.joined ? (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      Joined
                    </span>
                  ) : (
                    <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      Join
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-5">
                  <div className="flex items-center">
                    <span className="mr-4">👥 {group.members} members</span>
                    <span>💬 {group.active} active</span>
                  </div>
                  <span className="text-green-600 font-medium">Active now</span>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                    Enter Group
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
                    View
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Active Discussions</h3>
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div key={discussion.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <div className="flex items-center mb-1">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded mr-3">
                        {discussion.group}
                      </span>
                      <h4 className="font-medium text-gray-800">{discussion.title}</h4>
                    </div>
                    <p className="text-sm text-gray-500">By {discussion.author} • {discussion.time}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-4">💬 {discussion.replies} replies</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Upcoming Sessions</h3>
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">{session.group}</span>
                    <span className="text-xs text-blue-600">👥 {session.participants}</span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{session.topic}</h4>
                  <p className="text-sm text-gray-600">{session.time}</p>
                  <button className="mt-3 w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
                    Join Session
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-green-500 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4">Create Study Group</h3>
            <p className="text-blue-100 mb-6">Start your own study group and invite classmates</p>
            <button className="w-full py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition">
              Create New Group
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Group Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Groups Joined</span>
                <span className="font-bold text-gray-800">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Members</span>
                <span className="font-bold text-gray-800">126</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discussions</span>
                <span className="font-bold text-gray-800">48</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions Attended</span>
                <span className="font-bold text-gray-800">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}