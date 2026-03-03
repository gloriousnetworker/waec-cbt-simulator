// components/navbar/StudentNavbar.jsx
'use client';

import { useStudentAuth } from '../../context/StudentAuthContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  navbarContainer,
  navbarInner,
  navbarContent,
  navbarLeft,
  navbarMenuButton,
  navbarLogo,
  navbarLogoImage,
  navbarLogoText,
  navbarLogoSubtext,
  navbarNav,
  navbarNavButton,
  navbarNavButtonActive,
  navbarNavButtonInactive,
  navbarRight,
  navbarSearch,
  navbarSearchIcon,
  navbarSearchInput,
  navbarNotification,
  navbarNotificationBadge,
  navbarProfile,
  navbarProfileButton,
  navbarProfileAvatar,
  navbarProfileInfo,
  navbarProfileName,
  navbarProfileId,
  navbarDropdown,
  navbarDropdownHeader,
  navbarDropdownHeaderName,
  navbarDropdownHeaderEmail,
  navbarDropdownMenu,
  navbarDropdownItem,
  navbarDropdownItemDanger,
  modalOverlay,
  modalContainer,
  modalTitle,
  modalText,
  modalActions,
  modalButtonSecondary,
  modalButtonDanger
} from '../../styles/styles';

export default function StudentNavbar({ activeSection, setActiveSection, onMenuClick }) {
  const { user, logout } = useStudentAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getInitials = () => {
    if (!user) return 'ST';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const navSections = [
    { id: 'home', label: 'Dashboard', icon: '🏠' },
    { id: 'exams', label: 'Exams', icon: '📝' },
    { id: 'timed-tests', label: 'Timed', icon: '⏱️' },
    { id: 'performance', label: 'Performance', icon: '📊' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
    { id: 'past-questions', label: 'Past Q', icon: '📚' },
    { id: 'study-groups', label: 'Groups', icon: '👥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  if (user?.examMode) {
    return null;
  }

  return (
    <>
      <nav className={navbarContainer}>
        <div className={navbarInner}>
          <div className={navbarContent}>
            <div className={navbarLeft}>
              <button
                onClick={onMenuClick}
                className={navbarMenuButton}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className={navbarLogo}>
                <div className={navbarLogoImage}>
                  <Image 
                    src="/logo.png" 
                    alt="WAEC Logo" 
                    width={40} 
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className={navbarLogoText}>WAEC CBT Simulator</h1>
                  <p className={navbarLogoSubtext}>Student Portal</p>
                </div>
              </div>
            </div>

            <div className={navbarNav}>
              {navSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`${navbarNavButton} ${
                    activeSection === section.id
                      ? navbarNavButtonActive
                      : navbarNavButtonInactive
                  }`}
                >
                  <span className="mr-2">{section.icon}</span>
                  {section.label}
                </button>
              ))}
            </div>

            <div className={navbarRight}>
              <div className={navbarSearch}>
                <div className={navbarSearchIcon}>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="search"
                  className={navbarSearchInput}
                  placeholder="Search subjects..."
                />
              </div>

              <button className={navbarNotification}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className={navbarNotificationBadge}></span>
              </button>

              <div className="profile-container relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className={navbarProfileButton}
                >
                  <div className={navbarProfileAvatar}>
                    <div className="w-9 h-9 rounded-full bg-[#039994] flex items-center justify-center text-white text-[14px] leading-[100%] font-[600]">
                      {getInitials()}
                    </div>
                  </div>
                  <div className={navbarProfileInfo}>
                    <p className={navbarProfileName}>
                      {user ? `${user.firstName} ${user.lastName}` : 'Student'}
                    </p>
                    <p className={navbarProfileId}>{user?.class || 'Student'}</p>
                  </div>
                </button>
                
                {showDropdown && (
                  <div className={navbarDropdown}>
                    <div className={navbarDropdownHeader}>
                      <p className={navbarDropdownHeaderName}>
                        {user ? `${user.firstName} ${user.lastName}` : 'Student'}
                      </p>
                      <p className={navbarDropdownHeaderEmail}>{user?.email}</p>
                    </div>
                    <div className={navbarDropdownMenu}>
                      <button 
                        onClick={() => {
                          setActiveSection('settings');
                          setShowDropdown(false);
                        }}
                        className={navbarDropdownItem}
                      >
                        Profile Settings
                      </button>
                      <button 
                        onClick={() => {
                          setActiveSection('performance');
                          setShowDropdown(false);
                        }}
                        className={navbarDropdownItem}
                      >
                        Exam History
                      </button>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(true);
                          setShowDropdown(false);
                        }}
                        className={navbarDropdownItemDanger}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {showLogoutConfirm && (
        <div className={modalOverlay}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={modalContainer}
          >
            <h3 className={modalTitle}>Confirm Logout</h3>
            <p className={modalText}>Are you sure you want to logout?</p>
            <div className={modalActions}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={modalButtonSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className={modalButtonDanger}
              >
                Logout
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}