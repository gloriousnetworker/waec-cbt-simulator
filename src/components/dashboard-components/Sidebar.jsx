// components/sidebar/StudentSidebar.jsx
'use client';

import { useStudentAuth } from '../../context/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  sidebarContainer,
  sidebarOverlay,
  sidebarHeader,
  sidebarHeaderInner,
  sidebarHeaderLogo,
  sidebarHeaderTitle,
  sidebarHeaderSubtitle,
  sidebarNav,
  sidebarNavItem,
  sidebarNavItemActive,
  sidebarNavItemInactive,
  sidebarNavItemIcon,
  sidebarNavItemLabel,
  sidebarNavItemBadge,
  sidebarFooter,
  sidebarLogout,
  sidebarLogoutIcon,
  sidebarLogoutText,
  sidebarHelp,
  sidebarHelpTitle,
  sidebarHelpButton
} from '../../styles/styles';

export default function StudentSidebar({ isOpen, onClose, activeSection, setActiveSection }) {
  const { logout, user } = useStudentAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', id: 'home' },
    { icon: '📝', label: 'Practice Exams', id: 'exams' },
    { icon: '⏱️', label: 'Timed Tests', id: 'timed-tests' },
    { icon: '📊', label: 'Performance', id: 'performance' },
    { icon: '🏆', label: 'Achievements', id: 'achievements' },
    { icon: '📚', label: 'Past Questions', id: 'past-questions' },
    { icon: '👥', label: 'Study Groups', id: 'study-groups' },
    { icon: '⚙️', label: 'Settings', id: 'settings' },
    { icon: '❓', label: 'Help', id: 'help' },
  ];

  const handleMenuItemClick = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (user?.examMode) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={sidebarOverlay}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: isOpen || !isMobile ? 0 : -280,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={sidebarContainer}
        style={{
          visibility: isOpen || !isMobile ? 'visible' : 'hidden'
        }}
      >
        <div className={sidebarHeader}>
          <div className={sidebarHeaderInner}>
            <div className={sidebarHeaderLogo}>
              <Image 
                src="/logo.png" 
                alt="WAEC Logo" 
                width={40} 
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className={sidebarHeaderTitle}>CBT Simulator</h2>
              <p className={sidebarHeaderSubtitle}>Student Portal</p>
            </div>
          </div>
        </div>

        <nav className={sidebarNav}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuItemClick(item.id)}
              className={`${sidebarNavItem} ${
                activeSection === item.id 
                  ? sidebarNavItemActive 
                  : sidebarNavItemInactive
              }`}
            >
              <span className={sidebarNavItemIcon}>{item.icon}</span>
              <span className={sidebarNavItemLabel}>{item.label}</span>
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className={sidebarNavItemBadge}
                />
              )}
            </button>
          ))}
        </nav>

        <div className={sidebarFooter}>
          <button
            onClick={handleLogout}
            className={sidebarLogout}
          >
            <span className={sidebarLogoutIcon}>🚪</span>
            <span className={sidebarLogoutText}>Sign Out</span>
          </button>

          <div className={sidebarHelp}>
            <p className={sidebarHelpTitle}>Need help?</p>
            <button 
              onClick={() => handleMenuItemClick('help')}
              className={sidebarHelpButton}
            >
              Contact Support →
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}