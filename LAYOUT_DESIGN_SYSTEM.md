# Layout & Mobile UI/UX Design System
## Einstein's CBT App — Reusable Patterns

Copy these patterns into any Next.js + Tailwind dashboard to get the same
sticky navbar, slide-in sidebar, scrollable main content, and mobile-first
behaviour used in this app.

---

## 1. Tailwind Config — Custom Tokens

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary':    '#1565C0',
        'brand-primary-dk': '#0D47A1',
        'brand-primary-lt': '#EDF0F7',
        'brand-navy':       '#0A1628',
        'brand-gold':       '#FFB300',
        'brand-gold-lt':    '#FFF8E1',
        'surface-muted':    '#EDF0F7',
        'surface-subtle':   '#F5F7FB',
        'border':           '#E8ECEF',
        'border-strong':    '#CBD5E1',
        'content-primary':  '#0D1117',
        'content-secondary':'#525F7F',
        'content-muted':    '#8898AA',
        'danger':           '#EF4444',
        'danger-light':     '#FEF2F2',
        'success':          '#10B981',
        'success-light':    '#F0FDF4',
        'warning':          '#F59E0B',
        'warning-light':    '#FFFBEB',
      },
      fontFamily: {
        inter:    ['Inter', 'system-ui', 'sans-serif'],
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        mono:     ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'brand':   '0 4px 14px rgba(21,101,192,0.25)',
      },
    },
  },
}
```

---

## 2. Global CSS — Base Reset (globals.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent; /* removes blue flash on tap (mobile) */
  }

  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
  }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.5;
    overflow-x: hidden;                         /* no horizontal scroll ever */
    padding-top:    env(safe-area-inset-top);    /* iPhone notch */
    padding-bottom: env(safe-area-inset-bottom); /* iPhone home indicator */
    padding-left:   env(safe-area-inset-left);
    padding-right:  env(safe-area-inset-right);
  }

  /* Prevent iOS auto-zoom when tapping inputs (must stay >= 16px on mobile) */
  input, select, textarea {
    font-size: 16px;
  }
  @media (min-width: 768px) {
    input, select, textarea {
      font-size: 15px;
    }
  }

  :focus-visible {
    outline: 2px solid #1565C0;
    outline-offset: 2px;
    border-radius: 6px;
  }
}

/* ── Utility classes ── */
@layer utilities {
  /* iOS safe-area padding helpers */
  .pb-safe {
    padding-bottom: max(16px, env(safe-area-inset-bottom));
  }
  .pt-safe {
    padding-top: max(0px, env(safe-area-inset-top));
  }

  /* 44px minimum touch target (WCAG 2.5.5) */
  .touch-target {
    min-width: 44px;
    min-height: 44px;
  }

  /* Hide scrollbar while keeping scroll functionality */
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .hide-scrollbar::-webkit-scrollbar { display: none; }
}

/* Prevent rubber-band scroll on the page itself */
html, body {
  overscroll-behavior: none;
}

/* Standalone PWA — status bar padding */
@media (display-mode: standalone) {
  body { padding-top: env(safe-area-inset-top); }
}
```

---

## 3. Root Layout (layout.jsx)

```jsx
// app/layout.jsx
import '../styles/globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ── Viewport — viewport-fit=cover is critical for iOS notch ── */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1565C0" />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Your App Name" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />

        {/* Android */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="format-detection" content="telephone=no" />
      </head>

      {/* min-h-screen on body ensures the page fills the viewport */}
      <body className="bg-surface-muted min-h-screen font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
```

---

## 4. Dashboard Shell Layout (page.jsx structure)

This is the exact pattern that gives you:
- Sticky top navbar (always visible, never scrolls away)
- Slide-in sidebar on mobile, persistent on desktop
- Main content area that scrolls independently

```jsx
// app/dashboard/page.jsx
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-muted">

      {/* ── 1. STICKY NAVBAR ── always on top, never scrolls ── */}
      <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />

      <div className="flex">

        {/* ── 2. SIDEBAR ── fixed on mobile, slides in/out ── */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── 3. MAIN CONTENT ── scrolls independently ── */}
        {/*  - flex-1 fills remaining width after sidebar               */}
        {/*  - min-h-screen so short pages still fill the viewport      */}
        {/*  - overflow-y-auto is the scroll container                  */}
        {/*  - transition-[margin-left] animates when sidebar pushes it */}
        <main className={`
          flex-1 min-h-screen overflow-y-auto
          transition-[margin-left] duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}>
          {/* Inner padding wrapper — max width, horizontal padding, safe bottom */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-safe">
            {/* page content here */}
          </div>
        </main>

      </div>
    </div>
  )
}
```

---

## 5. Navbar Style Tokens

```js
// Sticky top bar — sticks to top, never scrolls
export const navbarContainer =
  'sticky top-0 z-40 bg-white border-b border-border shadow-card pt-safe';

export const navbarInner    = 'px-4 sm:px-6';
export const navbarContent  = 'flex items-center justify-between h-16';
export const navbarLeft     = 'flex items-center gap-3';
export const navbarRight    = 'flex items-center gap-2 sm:gap-3';

// Hamburger menu button
export const navbarMenuButton =
  'p-2.5 text-content-secondary hover:text-brand-primary hover:bg-brand-primary-lt rounded-lg transition-colors touch-target flex items-center justify-center';

// Logo
export const navbarLogo     = 'flex items-center gap-2.5 ml-1';
export const navbarLogoImage = 'w-9 h-9 flex-shrink-0';
export const navbarLogoText =
  'text-base font-bold tracking-tight text-brand-primary hidden sm:block';

// Profile dropdown
export const navbarProfileButton =
  'flex items-center gap-2 p-2 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer touch-target';
export const navbarDropdown =
  'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-border shadow-card-lg z-50 overflow-hidden';
export const navbarDropdownItem =
  'w-full text-left px-3 py-2.5 text-sm text-content-secondary hover:bg-brand-primary-lt hover:text-brand-primary rounded-lg transition-colors min-h-[40px] flex items-center';
export const navbarDropdownItemDanger =
  'w-full text-left px-3 py-2.5 text-sm text-danger hover:bg-danger-light rounded-lg transition-colors min-h-[40px] flex items-center';
```

---

## 6. Sidebar Style Tokens + Component Pattern

```js
// fixed inset-y-0: spans full viewport height regardless of scroll position
// h-screen: locks it to viewport height
// z-40: sits above content, below modals (z-50)
export const sidebarContainer =
  'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col h-screen overflow-hidden';

// Semi-transparent overlay behind sidebar on mobile
export const sidebarOverlay =
  'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:pointer-events-none';
```

```jsx
// Sidebar component pattern
export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop — tap to close on mobile */}
      {isOpen && (
        <div className={sidebarOverlay} onClick={onClose} />
      )}

      {/* Sidebar panel */}
      {/* translate-x controls slide in/out on mobile */}
      {/* lg:translate-x-0 always visible on desktop */}
      <aside className={`
        ${sidebarContainer}
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo / header */}
        <div className="p-4 border-b border-border flex-shrink-0">
          {/* logo here */}
        </div>

        {/* Scrollable nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 hide-scrollbar">
          {/* nav items here */}
        </nav>

        {/* Fixed footer (logout, version, etc.) */}
        <div className="p-4 border-t border-border flex-shrink-0 pb-safe">
          {/* logout button */}
        </div>
      </aside>
    </>
  )
}
```

---

## 7. Nav Item Styles

```js
// Base nav item — 44px min height for touch target
export const navItem =
  'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px] cursor-pointer select-none';

// Active state
export const navItemActive =
  'bg-brand-primary-lt text-brand-primary';

// Inactive state
export const navItemInactive =
  'text-content-secondary hover:bg-surface-subtle hover:text-content-primary';

// Usage:
// <button className={`${navItem} ${isActive ? navItemActive : navItemInactive}`}>
//   <Icon size={18} /> Label
// </button>
```

---

## 8. Button Styles

```js
// Primary — filled blue
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold text-sm rounded-lg hover:bg-brand-primary-dk active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

// Secondary — outlined blue
export const btnSecondary =
  'inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-brand-primary font-semibold text-sm rounded-lg border-2 border-brand-primary hover:bg-brand-primary-lt active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

// Danger — red
export const btnDanger =
  'inline-flex items-center justify-center gap-2 px-6 py-3 bg-danger text-white font-semibold text-sm rounded-lg hover:bg-red-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';

// Gold / accent
export const btnGold =
  'inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-gold text-brand-navy font-semibold text-sm rounded-lg hover:bg-yellow-500 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]';
```

---

## 9. Input / Form Styles

```js
// Standard bordered input
export const inputField =
  'w-full px-4 py-3 bg-white border border-border rounded-lg text-sm text-content-primary placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200 min-h-[48px]';

// Underline-only input (used on login)
export const inputUnderline =
  'w-full px-0 py-3 bg-transparent border-b-2 border-border text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-brand-primary transition-colors duration-200';
```

```jsx
// Mobile-safe input attributes (prevents iOS auto-zoom, keeps standard keyboard)
<input
  type="text"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck={false}
  enterKeyHint="go"            // shows "Go" / "Next" on keyboard return key
  className={inputField}
/>

<input
  type="password"
  autoCapitalize="none"
  autoCorrect="off"
  spellCheck={false}
  enterKeyHint="go"
  className={inputField}
/>
```

---

## 10. Card Styles

```js
export const card =
  'bg-white rounded-xl border border-border shadow-card';

export const cardHover =
  'bg-white rounded-xl border border-border shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-md';

// Stat card (coloured background)
export const statCard =
  'rounded-xl p-5 text-white';

// Grid layouts for cards
export const statsGrid =
  'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6';

export const cardsGrid =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
```

---

## 11. Modal / Overlay Pattern

```js
export const modalOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';

export const modalPanel =
  'bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden';

export const modalHeader =
  'px-6 pt-6 pb-4 border-b border-border';

export const modalBody =
  'px-6 py-5';

export const modalFooter =
  'px-6 py-4 flex gap-3 border-t border-border';
```

```jsx
// Modal usage with framer-motion
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={modalOverlay}
      onClick={() => setShowModal(false)} // close on backdrop tap
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className={modalPanel}
        onClick={e => e.stopPropagation()} // don't close when clicking panel
      >
        {/* modal content */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 12. Loading / Spinner

```js
export const loadingScreen =
  'fixed inset-0 z-50 flex items-center justify-center bg-white';

export const spinner =
  'w-10 h-10 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin';

export const spinnerSm =
  'w-5 h-5 border-2 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin';
```

---

## 13. Status Badges

```js
export const badgeSuccess =
  'inline-flex items-center gap-1 px-2.5 py-1 bg-success-light text-green-800 text-xs font-semibold rounded-full';

export const badgeWarning =
  'inline-flex items-center gap-1 px-2.5 py-1 bg-warning-light text-yellow-800 text-xs font-semibold rounded-full';

export const badgeDanger =
  'inline-flex items-center gap-1 px-2.5 py-1 bg-danger-light text-red-800 text-xs font-semibold rounded-full';

export const badgeBrand =
  'inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary-lt text-brand-primary text-xs font-semibold rounded-full';
```

---

## 14. Page Section Heading

```js
export const sectionTitle =
  'text-2xl font-bold tracking-tight text-content-primary font-playfair';

export const sectionSubtitle =
  'text-sm text-content-secondary mt-1';

export const pageHeader =
  'mb-6';
```

---

## 15. The Complete Dashboard Shell (copy-paste ready)

```jsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Navbar ────────────────────────────────────────────────────
function Navbar({ onMenuClick }) {
  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-[#E8ECEF] shadow-[0_1px_3px_rgba(0,0,0,0.06)] pt-[env(safe-area-inset-top)]">
      <div className="px-4 sm:px-6 flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick}
            className="p-2.5 rounded-lg hover:bg-[#EDF0F7] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center lg:hidden">
            ☰
          </button>
          <span className="text-base font-bold text-[#1565C0]">Your App</span>
        </div>
        <div className="flex items-center gap-2">
          {/* profile / actions */}
        </div>
      </div>
    </nav>
  )
}

// ── Sidebar ───────────────────────────────────────────────────
function Sidebar({ isOpen, onClose, activeSection, setActiveSection }) {
  const links = [
    { id: 'home',     label: 'Home',     icon: '🏠' },
    { id: 'reports',  label: 'Reports',  icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#E8ECEF]
        flex flex-col h-screen overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-4 border-b border-[#E8ECEF] flex-shrink-0">
          <span className="font-bold text-[#1565C0]">Your App</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 [&::-webkit-scrollbar]:hidden">
          {links.map(link => (
            <button key={link.id}
              onClick={() => { setActiveSection(link.id); onClose(); }}
              className={`
                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                text-sm font-medium transition-all min-h-[44px]
                ${activeSection === link.id
                  ? 'bg-[#EDF0F7] text-[#1565C0]'
                  : 'text-[#525F7F] hover:bg-[#F5F7FB] hover:text-[#0D1117]'}
              `}>
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8ECEF] flex-shrink-0 pb-[max(16px,env(safe-area-inset-bottom))]">
          <button className="w-full text-sm text-red-500 hover:bg-red-50 rounded-lg px-3 py-2.5 text-left min-h-[44px]">
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

// ── Dashboard Page ────────────────────────────────────────────
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  return (
    <div className="min-h-screen bg-[#EDF0F7]">

      <Navbar onMenuClick={() => setSidebarOpen(v => !v)} />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        {/* Main — scrolls on its own, sidebar does not affect it vertically */}
        <main className={`
          flex-1 min-h-screen overflow-y-auto
          transition-[margin-left] duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-[max(16px,env(safe-area-inset-bottom))]"
          >
            {/* ← render your sections here */}
            <h1 className="text-2xl font-bold">{activeSection}</h1>
          </motion.div>
        </main>
      </div>
    </div>
  )
}
```

---

## 16. Key Mobile Rules (Quick Reference)

| Rule | Value | Why |
|------|-------|-----|
| Minimum touch target | `min-h-[44px] min-w-[44px]` | WCAG 2.5.5, prevents mis-taps |
| Input font size | `font-size: 16px` on mobile | Prevents iOS auto-zoom |
| Viewport meta | `maximum-scale=1, viewport-fit=cover` | Locks zoom, enables notch |
| iOS safe area | `env(safe-area-inset-*)` | Notch + home indicator clearance |
| Tap highlight | `-webkit-tap-highlight-color: transparent` | Removes blue flash on tap |
| Rubber-band scroll | `overscroll-behavior: none` on html/body | Keeps page fixed, no elastic bounce |
| Sticky navbar | `sticky top-0 z-40` | Always visible, scrolls with page then sticks |
| Sidebar z-index | `z-40` sidebar, `z-30` overlay, `z-50` modals | Layering order |
| Sidebar translate | `-translate-x-full` / `translate-x-0` | Hardware-accelerated slide, no layout shift |
| Main scroll area | `overflow-y-auto` on `<main>` | Only main scrolls, not the whole page |
| Safe bottom padding | `pb-[max(16px,env(safe-area-inset-bottom))]` | Content above home indicator |
