// components/dashboard-components/Sidebar.jsx
'use client';

import { useStudentAuth } from '../../context/StudentAuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Home,
  FileText,
  Timer,
  BarChart3,
  Trophy,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  X,
  PanelLeftClose,
  Headphones,
} from 'lucide-react';
import { sidebarContainer, sidebarOverlay } from '../../styles/styles';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { icon: Home,      label: 'Dashboard',      id: 'home' },
      { icon: FileText,  label: 'Practice Exams', id: 'exams' },
      { icon: Timer,     label: 'Timed Tests',     id: 'timed-tests' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { icon: BarChart3,  label: 'Performance',    id: 'performance' },
      { icon: Trophy,     label: 'Achievements',   id: 'achievements' },
      { icon: BookOpen,   label: 'Past Questions', id: 'past-questions' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Users,      label: 'Study Groups',  id: 'study-groups' },
      { icon: Settings,   label: 'Settings',      id: 'settings' },
      { icon: HelpCircle, label: 'Help',           id: 'help' },
    ],
  },
];

export default function StudentSidebar({ isOpen, onClose, activeSection, setActiveSection }) {
  const { logout, user } = useStudentAuth();

  const handleMenuItemClick = (id) => {
    setActiveSection(id);
    if (window.innerWidth < 1024) onClose();
  };

  if (user?.examMode) return null;

  return (
    <>
      {/* Overlay — dimmed on mobile, transparent on desktop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={sidebarOverlay}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={sidebarContainer}
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
        aria-label="Sidebar navigation"
        role="navigation"
      >
        {/* ── Header ── */}
        <div className="px-4 py-4 border-b border-white/10 bg-brand-navy flex-shrink-0">
          {/* Logo row + collapse button */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Einstein's CBT App"
                width={36}
                height={36}
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white font-playfair truncate">
                Einstein&apos;s CBT
              </h2>
              <p className="text-[11px] text-blue-300 mt-0.5">Student Portal</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <span className="lg:hidden"><X size={17} strokeWidth={2} /></span>
              <span className="hidden lg:flex"><PanelLeftClose size={17} strokeWidth={2} /></span>
            </button>
          </div>

          {/* User card */}
          {user && (
            <div className="mt-3 flex items-center gap-2.5 px-3 py-2.5 bg-white/8 rounded-xl border border-white/10">
              <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-navy text-xs font-bold flex-shrink-0">
                {`${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] text-blue-300 truncate mt-0.5">{user.class || 'Student'}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 px-2" aria-label="Dashboard sections">
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
              {/* Section label */}
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-content-muted uppercase select-none">
                {group.label}
              </p>

              {/* Items */}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`
                      relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                      text-sm font-medium transition-all duration-150 min-h-[44px]
                      cursor-pointer select-none mb-0.5
                      ${isActive
                        ? 'bg-brand-primary-lt text-brand-primary font-semibold'
                        : 'text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
                      }
                    `}
                  >
                    {/* Active left-border indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-primary rounded-r-full" />
                    )}

                    <Icon
                      size={17}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-content-muted'}`}
                    />
                    <span className="flex-1 text-left truncate">{item.label}</span>

                    {isActive && (
                      <motion.span
                        layoutId="sidebarActiveDot"
                        className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-2 py-3 border-t border-border">
          {/* Sign out */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-danger hover:bg-danger-light rounded-lg transition-colors min-h-[44px] cursor-pointer text-sm font-medium mb-2"
            aria-label="Sign out"
          >
            <LogOut size={17} strokeWidth={2} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>

          {/* Help card */}
          <div className="p-3 bg-brand-primary-lt rounded-xl border border-brand-primary/10">
            <div className="flex items-center gap-2 mb-1.5">
              <Headphones size={13} className="text-brand-primary flex-shrink-0" />
              <p className="text-xs font-semibold text-brand-primary">Need help?</p>
            </div>
            <button
              onClick={() => handleMenuItemClick('help')}
              className="text-xs text-brand-primary hover:underline font-medium"
            >
              Contact Support →
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
