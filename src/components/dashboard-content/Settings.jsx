// components/dashboard-content/Settings.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudentAuth } from '../../context/StudentAuthContext';
import toast from 'react-hot-toast';
import StudentProtectedRoute from '../StudentProtectedRoute';
import { User, Bell, FileText, Palette, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const tabs = [
  { id: 'profile',       label: 'Profile',       icon: User     },
  { id: 'notifications', label: 'Notifications', icon: Bell     },
  { id: 'exam',          label: 'Exam Settings', icon: FileText },
  { id: 'appearance',    label: 'Appearance',    icon: Palette  },
];

const themeOptions = [
  { id: 'blue',   label: 'Blue Theme',   from: 'from-brand-primary',  to: 'to-brand-primary-dk' },
  { id: 'green',  label: 'Green Theme',  from: 'from-success',        to: 'to-success-dark'      },
  { id: 'purple', label: 'Purple Theme', from: 'from-purple-600',     to: 'to-purple-700'        },
  { id: 'orange', label: 'Orange Theme', from: 'from-orange-500',     to: 'to-orange-600'        },
];

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-surface-subtle rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary" />
    </label>
  );
}

function SettingsContent() {
  const { user, updateUser, fetchWithAuth, refreshUser } = useStudentAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', class: '', school: '', nin: '', dateOfBirth: ''
  });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [notificationSettings, setNotificationSettings] = useState({
    notifications: true, examReminders: true, studyReminders: true
  });
  const [examSettings, setExamSettings] = useState({
    autoSave: true, timerSound: true, tabWarning: true
  });
  const [appearanceSettings, setAppearanceSettings] = useState({ darkMode: false, theme: 'blue' });

  useEffect(() => { fetchProfileData(); }, []);

  const fetchProfileData = async () => {
    setProfileLoading(true);
    try {
      const res = await fetchWithAuth('/profile');
      if (res?.ok) {
        const data = await res.json();
        if (data.student) {
          setProfileData({
            firstName: data.student.firstName || '', lastName: data.student.lastName || '',
            email: data.student.email || '', phone: data.student.phone || '',
            class: data.student.class || '', school: data.student.school || '',
            nin: data.student.nin || '', dateOfBirth: data.student.dateOfBirth || ''
          });
        }
      }
    } catch { toast.error('Failed to load profile data'); }
    finally { setProfileLoading(false); }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    const toastId = toast.loading('Updating profile...');
    try {
      const res = await fetchWithAuth('/profile', {
        method: 'PUT', body: JSON.stringify({ phone: profileData.phone, dateOfBirth: profileData.dateOfBirth })
      });
      if (res?.ok) {
        updateUser(profileData);
        setIsEditing(false);
        toast.success('Profile updated successfully!', { id: toastId });
        await refreshUser();
      } else {
        const data = await res?.json();
        toast.error(data?.message || 'Failed to update profile', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) { toast.error('New passwords do not match'); return; }
    if (passwordData.new.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const toastId = toast.loading('Changing password...');
    try {
      const res = await fetchWithAuth('/change-password', {
        method: 'PUT', body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new })
      });
      if (res?.ok) {
        toast.success('Password changed successfully!', { id: toastId });
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        const data = await res?.json();
        toast.error(data?.message || 'Failed to change password', { id: toastId });
      }
    } catch { toast.error('Network error', { id: toastId }); }
    finally { setLoading(false); }
  };

  const saveSettings = async (label) => {
    const toastId = toast.loading(`Saving ${label}...`);
    await new Promise(r => setTimeout(r, 500));
    toast.success(`${label} saved!`, { id: toastId });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    const toastId = toast.loading('Deleting account...');
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Account deleted', { id: toastId });
    setTimeout(() => { window.location.href = '/login'; }, 2000);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-content-secondary">Loading settings...</p>
        </div>
      </div>
    );
  }

  const inputClass = `w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 disabled:bg-surface-muted disabled:text-content-muted transition-colors`;
  const labelClass = `block text-xs font-semibold text-content-primary mb-1.5`;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-content-primary font-playfair">Settings</h1>
        <p className="text-sm text-content-secondary mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-card">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full px-4 py-3.5 text-left flex items-center gap-3 transition-colors min-h-[48px] ${
                  activeTab === id
                    ? 'bg-brand-primary-lt text-brand-primary border-l-[3px] border-brand-primary font-semibold'
                    : 'hover:bg-surface-muted text-content-secondary'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0">
          {/* Profile */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6 shadow-card"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-content-primary font-playfair">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-brand-primary border border-brand-primary rounded-xl hover:bg-brand-primary-lt transition-colors text-sm font-semibold"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dk flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {profileData.firstName ? profileData.firstName[0] + (profileData.lastName?.[0] || '') : 'ST'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-content-primary font-playfair">{profileData.firstName} {profileData.lastName}</h3>
                  <p className="text-xs text-content-secondary mt-0.5">Class: {profileData.class || 'Not set'}</p>
                  <p className="text-xs text-content-muted mt-0.5">{profileData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'firstName', label: 'First Name',    type: 'text'     },
                  { key: 'lastName',  label: 'Last Name',     type: 'text'     },
                  { key: 'email',     label: 'Email Address', type: 'email'    },
                  { key: 'phone',     label: 'Phone Number',  type: 'text'     },
                  { key: 'class',     label: 'Class',         type: 'text'     },
                  { key: 'school',    label: 'School',        type: 'text'     },
                  { key: 'nin',       label: 'NIN',           type: 'text'     },
                  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date'   },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <input
                      type={type}
                      value={profileData[key]}
                      onChange={e => setProfileData({ ...profileData, [key]: e.target.value })}
                      disabled={!isEditing}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-3 mt-6 pt-6 border-t border-border">
                <button onClick={() => setShowPasswordModal(true)} className="btn-secondary text-sm">
                  <Lock size={14} /> Change Password
                </button>
                {isEditing && (
                  <>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary text-sm">Cancel</button>
                    <button onClick={handleProfileUpdate} disabled={loading} className="btn-primary text-sm">
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6 shadow-card"
            >
              <h2 className="text-base font-bold text-content-primary mb-5 font-playfair">Notification Settings</h2>
              <div className="space-y-3 mb-6">
                {[
                  { key: 'notifications', label: 'Enable Notifications', desc: 'Receive app notifications' },
                  { key: 'examReminders', label: 'Exam Reminders',       desc: 'Remind me before scheduled exams' },
                  { key: 'studyReminders', label: 'Study Reminders',     desc: 'Daily study session reminders' },
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-content-primary">{s.label}</p>
                      <p className="text-xs text-content-muted">{s.desc}</p>
                    </div>
                    <Toggle checked={notificationSettings[s.key]} onChange={e => setNotificationSettings({ ...notificationSettings, [s.key]: e.target.checked })} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => saveSettings('Notification settings')} className="btn-primary text-sm">Save Settings</button>
              </div>
            </motion.div>
          )}

          {/* Exam Settings */}
          {activeTab === 'exam' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6 shadow-card"
            >
              <h2 className="text-base font-bold text-content-primary mb-5 font-playfair">Exam Settings</h2>
              <div className="space-y-3 mb-6">
                {[
                  { key: 'autoSave',    label: 'Auto-save Progress', desc: 'Automatically save exam progress every minute' },
                  { key: 'timerSound',  label: 'Timer Sound',         desc: 'Play sound when time is running out' },
                  { key: 'tabWarning',  label: 'Tab Switch Warning',  desc: 'Warn when switching tabs during exams' },
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between p-4 border border-border rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-content-primary">{s.label}</p>
                      <p className="text-xs text-content-muted">{s.desc}</p>
                    </div>
                    <Toggle checked={examSettings[s.key]} onChange={e => setExamSettings({ ...examSettings, [s.key]: e.target.checked })} />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => saveSettings('Exam settings')} className="btn-primary text-sm">Save Settings</button>
              </div>
            </motion.div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-border p-6 shadow-card"
            >
              <h2 className="text-base font-bold text-content-primary mb-5 font-playfair">Appearance</h2>
              <div className="flex items-center justify-between p-4 border border-border rounded-xl mb-5">
                <div>
                  <p className="text-sm font-semibold text-content-primary">Dark Mode</p>
                  <p className="text-xs text-content-muted">Switch to dark theme</p>
                </div>
                <Toggle checked={appearanceSettings.darkMode} onChange={e => setAppearanceSettings({ ...appearanceSettings, darkMode: e.target.checked })} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {themeOptions.map(({ id, label, from, to }) => (
                  <button
                    key={id}
                    onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: id })}
                    className={`p-4 rounded-xl border-2 transition-all ${appearanceSettings.theme === id ? 'border-brand-primary bg-brand-primary-lt' : 'border-border hover:border-brand-primary/50'}`}
                  >
                    <div className={`h-8 rounded-xl mb-2 bg-gradient-to-r ${from} ${to}`} />
                    <p className="text-xs font-semibold text-content-primary">{label}</p>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <button onClick={() => saveSettings('Appearance')} className="btn-primary text-sm">Save Appearance</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-danger-light border border-danger/30 rounded-xl p-5">
        <h3 className="text-base font-bold text-danger mb-3 font-playfair flex items-center gap-2">
          <AlertTriangle size={16} /> Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-danger">Delete Account</p>
            <p className="text-xs text-danger/80">Permanently delete your account and all data</p>
          </div>
          <button onClick={handleDeleteAccount} className="px-5 py-2.5 border border-danger text-danger font-semibold rounded-xl hover:bg-danger hover:text-white transition-colors text-sm min-h-[44px]">
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-card-lg"
            >
              <div className="w-12 h-12 bg-brand-primary-lt rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={20} className="text-brand-primary" />
              </div>
              <h3 className="text-lg font-bold text-content-primary text-center mb-5 font-playfair">Change Password</h3>
              <div className="space-y-4 mb-5">
                {[
                  { key: 'current', label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { key: 'new',     label: 'New Password',     show: showNew,     toggle: () => setShowNew(v => !v)     },
                  { key: 'confirm', label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                ].map(({ key, label, show, toggle }) => (
                  <div key={key}>
                    <label className={labelClass}>{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={passwordData[key]}
                        onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })}
                        className={inputClass + ' pr-10'}
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-primary transition-colors">
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPasswordModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={handlePasswordChange} disabled={loading} className="btn-primary flex-1 text-sm">
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Settings() {
  return (
    <StudentProtectedRoute>
      <SettingsContent />
    </StudentProtectedRoute>
  );
}
