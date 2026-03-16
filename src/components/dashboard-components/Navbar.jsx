// components/dashboard-components/Navbar.jsx
'use client';

import { useStudentAuth } from '../../context/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, Settings, BarChart3, LogOut, ChevronDown } from 'lucide-react';
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
  navbarRight,
  navbarNotification,
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
  modalButtonDanger,
} from '../../styles/styles';

export default function StudentNavbar({ setActiveSection, onMenuClick }) {
  const { user, logout } = useStudentAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route / section change
  useEffect(() => {
    setShowDropdown(false);
  }, [setActiveSection]);

  const getInitials = () => {
    if (!user) return 'ST';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  };

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  if (user?.examMode) return null;

  return (
    <>
      <nav className={navbarContainer} role="navigation" aria-label="Main navigation">
        <div className={navbarInner}>
          <div className={navbarContent}>

            {/* ── Left: Hamburger + Logo ── */}
            <div className={navbarLeft}>
              <button
                onClick={onMenuClick}
                className={navbarMenuButton}
                aria-label="Open navigation menu"
              >
                <Menu size={22} strokeWidth={2} />
              </button>

              <div className={navbarLogo}>
                <div className={navbarLogoImage}>
                  <Image
                    src="/logo.png"
                    alt="Einstein's CBT App"
                    width={36}
                    height={36}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div>
                  <h1 className={navbarLogoText}>Einstein&apos;s CBT</h1>
                  <p className={navbarLogoSubtext}>Student Portal</p>
                </div>
              </div>
            </div>

            {/* ── Right: Notifications + Profile ── */}
            <div className={navbarRight}>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown((v) => !v)}
                  className={navbarProfileButton}
                  aria-label="Open profile menu"
                  aria-expanded={showDropdown}
                  aria-haspopup="menu"
                >
                  {/* Avatar */}
                  <div className={navbarProfileAvatar}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-primary-dk flex items-center justify-center text-white text-sm font-bold select-none">
                      {getInitials()}
                    </div>
                  </div>

                  <div className={navbarProfileInfo}>
                    <p className={navbarProfileName}>
                      {user ? `${user.firstName} ${user.lastName}` : 'Student'}
                    </p>
                    <p className={navbarProfileId}>{user?.class || 'Student'}</p>
                  </div>

                  <ChevronDown
                    size={14}
                    strokeWidth={2.5}
                    className={`text-content-muted transition-transform duration-200 hidden lg:block ${showDropdown ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown menu — pure React state, no CSS hover conflict */}
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className={navbarDropdown}
                      role="menu"
                      aria-label="Profile menu"
                    >
                      <div className={navbarDropdownHeader}>
                        <p className={navbarDropdownHeaderName}>
                          {user ? `${user.firstName} ${user.lastName}` : 'Student'}
                        </p>
                        <p className={navbarDropdownHeaderEmail}>{user?.email}</p>
                      </div>

                      <div className={navbarDropdownMenu}>
                        <button
                          role="menuitem"
                          onClick={() => { setActiveSection('settings'); setShowDropdown(false); }}
                          className={navbarDropdownItem}
                        >
                          <Settings size={14} className="mr-2 text-content-muted" />
                          Profile Settings
                        </button>
                        <button
                          role="menuitem"
                          onClick={() => { setActiveSection('performance'); setShowDropdown(false); }}
                          className={navbarDropdownItem}
                        >
                          <BarChart3 size={14} className="mr-2 text-content-muted" />
                          Exam History
                        </button>
                        <div className="h-px bg-border my-1" />
                        <button
                          role="menuitem"
                          onClick={() => { setShowLogoutConfirm(true); setShowDropdown(false); }}
                          className={navbarDropdownItemDanger}
                        >
                          <LogOut size={14} className="mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={modalOverlay}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={modalContainer}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
            >
              <div className="w-12 h-12 bg-danger-light rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={20} className="text-danger" />
              </div>
              <h3 id="logout-title" className={modalTitle + ' text-center'}>
                Sign Out?
              </h3>
              <p className={modalText + ' text-center'}>
                You&apos;ll be signed out of Einstein&apos;s CBT App. Any unsaved progress may be lost.
              </p>
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
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
