# Einstein's CBT App — Design System & Context Reference
**Product:** Einstein's CBT App
**Company:** Mega Tech Solutions
**Stack:** Next.js 15 (App Router + Pages Router), Tailwind CSS v3, Framer Motion, Lucide React
**Last Updated:** 2026-03-16
**Purpose:** Complete design context for building the Admin Panel — reuse every token, pattern, and component defined here.

---

## 1. App Identity

| Property | Value |
|----------|-------|
| **App Name** | Einstein's CBT App |
| **Tagline** | WAEC Exam Practice Portal |
| **Company** | Mega Tech Solutions |
| **Logo File** | `/public/logo.png` |
| **Logo Shape** | Circular / badge shape |
| **Primary Colour (from logo)** | `#1F2A49` — Deep Navy Blue |

### Logo Usage Rules

#### Standard Logo (navbar, sidebar header, loading screens)
```jsx
<Image src="/logo.png" alt="Einstein's CBT App" width={36} height={36} className="object-contain" />
```
- Size: `36×36px` in navbar/sidebar, `92×92px` on login page
- Always use `object-contain` — never crop or stretch

#### Ghost Logo Background (used on Login Page & Exam Fullscreen Prompt)
```jsx
{/* Ghost logo — large decorative background element */}
<div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
  <div className="relative w-[520px] h-[520px]" style={{ opacity: 0.05 }}>
    <Image src="/logo.png" alt="" fill className="object-contain" priority />
  </div>
</div>
```
- Opacity: `5%` (0.05)
- Size: `520×520px`
- Position: absolutely centered behind content
- Used whenever the background is the dark navy gradient

#### Logo Glow (Login Page — above the form)
```jsx
<div className="relative mb-5">
  {/* Blur glow ring behind logo */}
  <div
    className="absolute inset-0 rounded-full blur-2xl scale-[2]"
    style={{ background: 'rgba(58,79,122,0.35)' }}
  />
  <Image
    src="/logo.png"
    alt="Einstein's CBT App"
    width={92}
    height={92}
    priority
    className="relative z-10 object-contain drop-shadow-2xl"
    style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }}
  />
</div>
```

---

## 2. Brand Color Palette

All colours are defined in `tailwind.config.js` under `theme.extend.colors.brand` and mirrored as CSS custom properties in `src/styles/globals.css`.

### Primary Brand Colours

| Token | Tailwind Class | Hex | CSS Variable | Usage |
|-------|---------------|-----|--------------|-------|
| `brand-primary` | `bg-brand-primary` / `text-brand-primary` | `#1F2A49` | `--color-primary` | Buttons, active nav states, links, icon fills, progress bars |
| `brand-primary-dk` | `bg-brand-primary-dk` | `#141C33` | `--color-primary-dk` | Hover states, pressed buttons, dark gradients |
| `brand-primary-lt` | `bg-brand-primary-lt` | `#EDF0F7` | `--color-primary-lt` | Active nav background, card highlights, badge backgrounds, light tint fills |
| `brand-accent` | `bg-brand-accent` | `#3A4F7A` | `--color-accent` | Secondary accents, decorative borders, radial glow overlays |
| `brand-gold` | `bg-brand-gold` | `#FFB300` | `--color-gold` | Achievements, badges, premium highlights, user initials avatar background |
| `brand-gold-lt` | `bg-brand-gold-lt` | `#FFF8E1` | `--color-gold-lt` | Badge backgrounds for gold/achievement items |
| `brand-navy` | `bg-brand-navy` | `#0D1220` | `--color-navy` | Sidebar header background, darkest containers, exam mode headers |
| `brand-cyan` | `bg-brand-cyan` | `#00B4D8` | `--color-cyan` | Timer display, progress accents, data visualisation highlights |

### Dark Navy Gradient (Login Page + Exam Fullscreen Prompt)
```css
/* Full page background */
background: linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%);

/* Radial centre glow */
background: radial-gradient(ellipse 700px 500px at 50% 50%, rgba(58,79,122,0.30) 0%, transparent 70%);

/* Corner accent */
background: radial-gradient(circle, rgba(58,79,122,0.25) 0%, transparent 70%);
```

### Brand Dashboard Gradient (banners, section headers)
```css
/* Used on Home banner and section header backgrounds */
background: linear-gradient(135deg, #1F2A49 0%, #141C33 100%);
/* Tailwind: bg-gradient-to-r from-brand-primary to-brand-primary-dk */
```

---

## 3. Neutral & Surface Tokens

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `surface` (white) | `bg-white` | `#FFFFFF` | Cards, modals, input backgrounds, navbar |
| `surface-muted` | `bg-surface-muted` | `#F5F7FB` | Page background, section backgrounds |
| `surface-subtle` | `bg-surface-subtle` | `#EDF0F7` | Card hover states, light dividers, row hover |
| `border` | `border-border` | `#E8ECEF` | All card borders, dividers, input borders |
| `border-strong` | `border-border-strong` | `#CBD5E1` | Emphasized borders, active form fields |

---

## 4. Text / Content Tokens

| Token | Tailwind Class | Hex | Usage |
|-------|---------------|-----|-------|
| `content-primary` | `text-content-primary` | `#0D1117` | Main body text, headings, card titles |
| `content-secondary` | `text-content-secondary` | `#525F7F` | Supporting text, labels, metadata |
| `content-muted` | `text-content-muted` | `#8898AA` | Placeholders, captions, timestamps, disabled text |
| `content-inverse` | `text-content-inverse` | `#FFFFFF` | Text on dark/navy backgrounds |

> **Rule:** Never use raw `gray-*` Tailwind classes. Always use the semantic `content-*` tokens above.

---

## 5. Status / Semantic Colours

Each status colour has three variants: DEFAULT, light (background fills), dark (text on light).

### Success (correct answers, completed exams, online status)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| DEFAULT | `#10B981` | `text-success` / `bg-success` |
| Light | `#D1FAE5` | `bg-success-light` |
| Dark | `#059669` | `text-success-dark` |

### Warning (in-progress, expiring, moderate scores)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| DEFAULT | `#F59E0B` | `text-warning` / `bg-warning` |
| Light | `#FEF3C7` | `bg-warning-light` |
| Dark | `#D97706` | `text-warning-dark` |

### Danger (errors, violations, failed, destructive actions)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| DEFAULT | `#EF4444` | `text-danger` / `bg-danger` |
| Light | `#FEE2E2` | `bg-danger-light` |
| Dark | `#DC2626` | `text-danger-dark` |

### Info (informational states, neutral data, links)
| Variant | Hex | Tailwind Class |
|---------|-----|----------------|
| DEFAULT | `#3B82F6` | `text-info` / `bg-info` |
| Light | `#DBEAFE` | `bg-info-light` |
| Dark | `#2563EB` | `text-info-dark` |

---

## 6. Typography System

### Font Families

| Role | Font | Tailwind Class | CSS Variable | When to Use |
|------|------|---------------|--------------|-------------|
| **Display / Headings** | Playfair Display | `font-playfair` | `--font-display` | Page titles (h1–h3), card headings, brand text, modal titles, section headings, exam titles |
| **UI / Body** | Inter | `font-inter` (default) | `--font-body` | Body text, labels, inputs, buttons, descriptions, nav items, metadata |
| **Monospace / Timer** | JetBrains Mono | `font-mono` | `--font-mono` | Exam countdown timer, scores, code blocks, IDs |

> **Rule:** `font-playfair` is used ONLY for headings and brand elements. All UI text (buttons, labels, nav, inputs) defaults to Inter.

### Font Import (Google Fonts — already in `globals.css`)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
```

### Font Size Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-2xs` | 12px | 16px | Minimum size — captions, fine print |
| `text-xs` | 13px | 18px | Metadata, timestamps, badges |
| `text-sm` | 14px | 20px | Labels, secondary text, button text |
| `text-base` | 15px | 22px | Body text (default) |
| `text-md` | 16px | 24px | Inputs (iOS zoom prevention) |
| `text-lg` | 17px | 26px | Subheadings, card titles |
| `text-xl` | 20px | 28px | Section headings |
| `text-2xl` | 24px | 32px | Page headings |
| `text-3xl` | 30px | 38px | Hero headings |
| `text-4xl` | 36px | 44px | Large display |
| `text-5xl` | 48px | 56px | Hero / splash |

> **iOS Rule:** All `<input>`, `<select>`, `<textarea>` use `font-size: 16px` minimum to prevent auto-zoom on iOS. Override back to 14–15px on `md:` and above.

---

## 7. Component Classes (globals.css `@layer components`)

Copy-paste ready for the admin panel.

### Buttons

```html
<!-- Primary — navy fill, white text -->
<button class="btn-primary">Save Changes</button>

<!-- Secondary — white fill, navy border + text -->
<button class="btn-secondary">Cancel</button>

<!-- Gold — gold fill, navy text (premium actions) -->
<button class="btn-gold">Upgrade</button>

<!-- Danger — red fill, white text (destructive) -->
<button class="btn-danger">Delete</button>
```

**CSS definitions:**
```css
.btn-primary  → bg-brand-primary text-white hover:bg-brand-primary-dk
.btn-secondary → bg-white text-brand-primary border-2 border-brand-primary hover:bg-brand-primary-lt
.btn-gold     → bg-brand-gold text-brand-navy hover:bg-yellow-500
.btn-danger   → bg-danger text-white hover:bg-danger-dark
```
All buttons: `inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 min-h-[44px]`

### Input Fields

```html
<!-- Standard bordered input -->
<input class="input-field" placeholder="Enter value" />

<!-- Underline input (used on dark backgrounds) -->
<input class="input-underline" placeholder="Enter value" />
```

### Cards

```html
<!-- Standard card -->
<div class="card">content</div>

<!-- Card with hover lift effect -->
<div class="card-hover">content</div>

<!-- Glass card (on dark backgrounds) -->
<div class="glass">content</div>
```

**CSS definitions:**
```css
.card       → bg-white rounded-xl border border-border shadow-card
.card-hover → card + hover:-translate-y-1 hover:shadow-card-md transition-all duration-200
.glass      → bg-white/10 backdrop-blur-md border border-white/20
```

### Status Badges

```html
<span class="badge-success">Passed</span>
<span class="badge-warning">In Progress</span>
<span class="badge-danger">Failed</span>
<span class="badge-brand">Active</span>
<span class="badge-gold">Premium</span>
```

All badges: `inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full`

### Loading Spinners

```html
<!-- Large spinner (full-page loading) -->
<div class="spinner"></div>

<!-- Small spinner (inline, button loading states) -->
<div class="spinner-sm"></div>
```

### Progress Bar

```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 65%"></div>
</div>
```

### Section Headings

```html
<h2 class="section-title">Section Title</h2>
<p class="section-subtitle">Supporting description text</p>
```

### Nav Items (Sidebar)

```html
<!-- Active -->
<button class="nav-item nav-item-active font-semibold">Dashboard</button>

<!-- Inactive -->
<button class="nav-item nav-item-inactive">Settings</button>
```

---

## 8. Shadow & Border Radius System

### Shadows (`tailwind.config.js` — `theme.extend.boxShadow`)

| Token | Tailwind Class | CSS Value | Usage |
|-------|---------------|-----------|-------|
| `shadow-card` | `shadow-card` | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` | Default card shadow |
| `shadow-card-md` | `shadow-card-md` | `0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)` | Elevated cards, modals |
| `shadow-card-lg` | `shadow-card-lg` | `0 8px 24px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.06)` | Dropdowns, overlays |
| `shadow-brand` | `shadow-brand` | `0 4px 14px rgba(31,42,73,0.30)` | Brand-coloured elements |
| `shadow-gold` | `shadow-gold` | `0 4px 14px rgba(255,179,0,0.30)` | Gold/achievement elements |
| `shadow-inner` | `shadow-inner` | `inset 0 2px 4px rgba(0,0,0,0.06)` | Inset fields, pressed states |

### Border Radius (`tailwind.config.js`)

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Small UI chips, pills |
| `rounded` | 8px | Default (inputs, small cards) |
| `rounded-md` | 10px | Medium components |
| `rounded-lg` | 12px | Standard cards, buttons |
| `rounded-xl` | 16px | Large cards, modals |
| `rounded-2xl` | 20px | Hero cards, login container |
| `rounded-3xl` | 24px | Feature cards |
| `rounded-full` | 9999px | Pills, avatars, badges |

---

## 9. Page Design Patterns

### 9.1 Login Page

**Layout:** Full-page dark navy gradient — NO card wrapper, form fields placed directly on the gradient background.

```jsx
// Page background
style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #1a2340 50%, #141C33 100%)' }}

// Ghost logo (decorative background)
<div style={{ opacity: 0.05 }} className="absolute w-[520px] h-[520px]">
  <Image src="/logo.png" fill />
</div>

// Radial centre glow
style={{ background: 'radial-gradient(ellipse 700px 500px at 50% 50%, rgba(58,79,122,0.30) 0%, transparent 70%)' }}
```

**Form elements on dark background:**
- Labels: `rgba(255,255,255,0.75)`
- Input text: `text-white`
- Input border: underline only — `borderBottomColor: rgba(255,255,255,0.25)`, focus → `rgba(255,255,255,0.8)`
- Placeholder: `text-white/25`
- Submit button: **inverted** — `bg-white text-[#1F2A49]` (white background, navy text)
- Toggle tabs: `bg-white/8` container, active tab `bg-white text-[#1F2A49]`

**Glassmorphism demo/info panel:**
```jsx
style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
```

**Feature pills:**
```jsx
style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}
```

**Animations (Framer Motion):**
- Page wrapper: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} duration: 0.5`
- Logo block: `delay: 0.08`
- Toggle: `delay: 0.14`
- Form: `delay: 0.18`
- Demo block: `delay: 0.28`
- Feature pills: `delay: 0.32`
- Footer: `delay: 0.36`

---

### 9.2 Dashboard Shell

**Layout structure:**
```
┌─────────────────────────────────────────────────┐
│  Navbar (sticky top-0, z-40, h-16, bg-white)    │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │  Main content area                   │
│ fixed    │  flex-1, min-h-screen                │
│ z-40     │  lg:ml-64 (when sidebar open)        │
│ w-64     │  transition-[margin-left] 300ms      │
│ slide    │  max-w-7xl mx-auto px-4 sm:px-6 py-6│
└──────────┴──────────────────────────────────────┘
```

**Navbar (`src/components/dashboard-components/Navbar.jsx`):**
- `sticky top-0 z-40 bg-white border-b border-border shadow-card pt-safe`
- Height: `h-16` (64px)
- Hamburger toggle: visible on ALL screen sizes (no `lg:hidden`)
- Logo: `font-playfair` brand text
- Right: profile avatar (initials, gradient `from-brand-primary to-brand-primary-dk`) + dropdown

**Sidebar (`src/components/dashboard-components/Sidebar.jsx`):**
- `fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border`
- Always `fixed` — slides in/out via Framer Motion `x: isOpen ? 0 : -280`
- Overlay: `bg-black/40 backdrop-blur-sm` on mobile, transparent on desktop (`lg:bg-transparent`)
- Header background: `bg-brand-navy` (deepest navy `#0D1220`)
- Main content shifts: `lg:ml-64` (open) ↔ `lg:ml-0` (closed) with `transition-[margin-left] duration-300`
- Default state: **open on desktop** (≥1024px), **closed on mobile**

**Sidebar Navigation Groups:**
```
MAIN      → Dashboard, Practice Exams, Timed Tests
ANALYTICS → Performance, Achievements, Past Questions
ACCOUNT   → Study Groups, Settings, Help
```

**Sidebar Active State:**
- Background: `bg-brand-primary-lt`
- Text: `text-brand-primary font-semibold`
- Left border: `absolute left-0 w-[3px] h-5 bg-brand-primary rounded-r-full`
- Right dot: `w-1.5 h-1.5 rounded-full bg-brand-primary` (animated with Framer `layoutId`)

**Sidebar Footer:**
- Sign Out: `text-danger hover:bg-danger-light`
- Help card: `bg-brand-primary-lt rounded-xl border border-brand-primary/10`

**Page background:** `bg-surface-muted` (`#F5F7FB`)

---

### 9.3 Exam Room (Full-Screen Mode)

**Fullscreen Prompt Screen** (shown before exam starts — requires user gesture):
```jsx
// Background: same dark navy gradient as login
style={{ background: 'linear-gradient(135deg, #1F2A49 0%, #141C33 100%)' }}

// Enter button: inverted (same as login submit)
style={{ background: '#FFFFFF', color: '#1F2A49' }}
```

**Exam Header:** `sticky top-0 z-30 bg-white border-b-2 border-border shadow-sm h-16`

**Timer Display:**
- Font: `font-mono font-black text-2xl sm:text-3xl tracking-widest tabular-nums`
- Safe: `text-brand-primary border-brand-primary bg-brand-primary/5`
- Warning (<30min): `text-amber-600 border-amber-500 bg-amber-50`
- Danger (<10min): `text-red-600 border-red-500 bg-red-50 animate-pulse` + ping dot

**Anti-cheat violation banner:** `bg-gradient-to-r from-danger to-danger-dark text-white`

**Question options grid:**
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-3`
- Default: `border-2 border-border hover:border-brand-primary hover:bg-brand-primary-lt`
- Selected: `border-brand-primary bg-brand-primary-lt shadow-brand`

**Question navigator:** `grid grid-cols-10 gap-2` — square buttons `w-10 h-10`

---

### 9.4 Practice Room

Same layout as Exam Room but without the anti-cheat banner and with explanation toggle. Includes:
- Auto-advance after answer: 320ms setTimeout
- Keyboard shortcuts: `A/B/C/D` select, `←/→` navigate, `Enter` next
- Correct answer feedback: `border-green-500 bg-green-50`
- Wrong answer feedback: `border-red-500 bg-red-50`

---

## 10. Animation & Motion Patterns

### Framer Motion — Spring Config (sidebar, modals, cards)
```js
transition={{ type: 'spring', stiffness: 320, damping: 32 }}
```

### Page Section Transitions (dashboard content swap)
```js
initial={{ opacity: 0, x: 12 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -12 }}
transition={{ duration: 0.18 }}
```

### Modal Entry
```js
initial={{ scale: 0.92, y: 16 }}
animate={{ scale: 1, y: 0 }}
exit={{ scale: 0.92, y: 16 }}
transition={{ duration: 0.2 }}
```

### Staggered List Items
```js
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.06 }}
```

### CSS Keyframe Animations (globals.css)

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-spin` | Loading spinner rotation | — (Tailwind built-in) |
| `animate-pulse` | Danger timer pulse | — (Tailwind built-in) |
| `animate-gradient` | Background gradient shift | 8s infinite |
| `skeleton` | Shimmer loading placeholder | 1.5s infinite |
| `ping-once` | One-time ping effect | 0.6s forwards |

### Tailwind Custom Animations (`tailwind.config.js`)

| Name | Class | Effect |
|------|-------|--------|
| Rotate | `animate-rotate` | 360° continuous spin (2s) |
| Beep | `animate-beep` | Scale 1→1.2→1 (1.5s, timer warning) |
| Blink | `animate-blink` | Opacity 0→1→0 (1.2s) |
| Dot blink | `animate-dot-1/2/3` | Staggered dot blink |
| Fade up | `animate-fade-up` | Opacity+translateY (0.4s) |
| Shimmer | `animate-shimmer` | Background position sweep (2s) |
| Pulse glow | `animate-pulse-glow` | Box shadow expand (2s) |

---

## 11. Responsive Breakpoints

| Name | Min Width | Tailwind Prefix |
|------|-----------|----------------|
| xs | 375px | `xs:` |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

**Key breakpoint rules:**
- Sidebar toggle visible on all sizes (no `lg:hidden` on hamburger)
- Sidebar defaults: closed on `< lg`, open on `>= lg`
- Content max-width: `max-w-7xl mx-auto` with `px-4 sm:px-6`
- Two-column grids: `grid-cols-1 lg:grid-cols-2` or `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

### PWA / iOS Safe Area
```css
/* Defined in globals.css, used on full-page layouts */
.pb-safe { padding-bottom: max(16px, env(safe-area-inset-bottom)); }
.pt-safe { padding-top: max(0px, env(safe-area-inset-top)); }

/* Also available as Tailwind spacing tokens */
pt-safe-top, pb-safe-bottom, pl-safe-left, pr-safe-right
```

**Touch targets:** All interactive elements: `min-h-[44px]` (WCAG 2.5.5)

---

## 12. Icon Library

**Package:** `lucide-react` v0.507+
**Stroke width:** `strokeWidth={2}` default, `strokeWidth={2.5}` for active/emphasis states
**Size:** `size={18}` sidebar icons, `size={20}` navbar, `size={16}` inline/button icons

```js
// Icons used throughout the student app (reference for admin)
import {
  Home, FileText, Timer, BarChart3, Trophy, BookOpen,
  Users, Settings, HelpCircle, LogOut, X, Menu,
  ChevronDown, Eye, EyeOff, ArrowRight, ShieldCheck,
  PanelLeftClose, Headphones, AlertTriangle, Keyboard,
  Shield, Lock, Maximize, Smartphone, Zap,
} from 'lucide-react'
```

---

## 13. Style Constants File (`src/styles/styles.js`)

This file exports Tailwind class strings as named constants — used throughout all components to maintain consistency. Key groups:

| Export Group | Example Constants |
|-------------|-------------------|
| Splash/Loading | `splashContainer`, `splashTitle`, `splashProgressBar` |
| Login | `loginContainer`, `loginInput`, `loginButton` |
| Navbar | `navbarContainer`, `navbarMenuButton`, `navbarProfileButton` |
| Sidebar | `sidebarContainer`, `sidebarOverlay` |
| Dashboard Shell | `dashboardContainer`, `dashboardContent` |
| Dashboard Home | `homeCard`, `homeBanner`, `homeStatCard` |
| Exams Page | `examsSubjectCard`, `examsTabButton`, `examsSubjectsGrid` |
| Modal | `modalOverlay`, `modalContainer`, `modalButtonDanger` |

> **For the admin panel:** Create a parallel `src/styles/admin-styles.js` using the same pattern — import and reuse the modal, card, button, and navbar tokens directly.

---

## 14. Admin Panel — Design Guidance

### Reuse As-Is (zero changes needed)
- All colour tokens (`brand-*`, `content-*`, `surface-*`, `border`, status colours)
- All font families and size scale
- All button classes (`.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-gold`)
- All badge classes
- All shadow and radius tokens
- Modal pattern (`modalOverlay`, `modalContainer`)
- Card pattern (`.card`, `.card-hover`)
- Loading spinner (`.spinner`, `.spinner-sm`)
- Framer Motion spring/fade configs
- Breakpoints and responsive grid patterns

### Admin-Specific Additions to Consider
- **Admin sidebar:** Same structure as student sidebar — use the same `sidebarContainer` / `sidebarOverlay` tokens. Change nav group labels and items. Consider a **wider sidebar** (`w-72`) for admin since there may be more sections.
- **Data tables:** Use `bg-white rounded-xl border border-border shadow-card` for table wrappers. Header rows: `bg-surface-muted text-content-secondary text-xs font-semibold uppercase tracking-wider`. Rows: `hover:bg-surface-subtle transition-colors border-b border-border`.
- **Admin navbar:** Keep exact same navbar pattern. Change avatar gradient/initials. Add admin role badge: `badge-danger` or a custom `badge-admin`.
- **Stat cards:** Use `bg-gradient-to-r from-brand-primary to-brand-primary-dk text-white rounded-xl p-5` for top-level KPI cards (total students, active exams, etc.).
- **Charts/graphs:** Use brand colour palette — primary `#1F2A49`, accent `#3A4F7A`, cyan `#00B4D8`, gold `#FFB300`, success `#10B981`, danger `#EF4444`.
- **Page title pattern:** `text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair`

### Admin Login Page
Replicate the student login page exactly:
- Same dark navy gradient background
- Same ghost logo at 5% opacity
- Same radial glow
- Same underline inputs
- Same inverted white/navy submit button
- Change label from "Student Portal" → "Admin Portal"
- Change tagline from "WAEC Exam Practice Portal" → "Admin Management Console"

### Colour for Admin Role Distinction
To visually distinguish admin from student UI, add one admin-only accent:
```js
// Suggested admin accent — deep purple
admin: {
  primary:    '#4C1D95', // Deep Purple
  'primary-lt': '#EDE9FE',
  'primary-dk': '#3B0764',
}
```
Or keep the same brand colours (recommended for brand consistency) and just update the portal label text.

---

## 15. Tech Stack Reference

| Layer | Library | Version | Notes |
|-------|---------|---------|-------|
| Framework | Next.js | ^15.5.12 | App Router + Pages Router hybrid |
| Styling | Tailwind CSS | ^3.4.17 | `important: true`, custom token system |
| Animation | Framer Motion | ^12.34.2 | `motion`, `AnimatePresence` |
| Icons | Lucide React | ^0.507.0 | Consistent stroke-width system |
| Toasts | react-hot-toast | ^2.6.0 | `toast.success/error/loading` |
| UI Components | @nextui-org/react | ^2.6.11 | Supplemental UI (minimal usage) |
| Config | `next.config.js` | CJS format | `module.exports`, NOT `export default` |
| CSS Entry | `src/styles/globals.css` | — | Tokens, components, utilities |
| Style Constants | `src/styles/styles.js` | — | Named Tailwind class strings |
| Tailwind Config | `tailwind.config.js` | — | Single source of truth for tokens |

---

## 16. PWA & Mobile Auth Pattern

### Problem
Cross-origin cookies are blocked by iOS Safari ITP and Android PWA standalone mode.
`credentials: 'include'` works on desktop browsers but not in PWA installs on mobile.

### Root Causes Fixed
1. **Double `meCheck` after login** — after a successful `/api/student/login`, a second `/api/auth/me` call was made immediately. On mobile PWA the auth cookie from the first request is not yet propagated to the second, causing "Authentication verification failed."
2. **No localStorage fallback** — on cold start, `checkAuth()` failing on mobile cleared `user → null` and forced a redirect to `/login`.
3. **No Bearer token header** — requests only relied on cookies; no Authorization header fallback.

### Fix Applied (`src/context/StudentAuthContext.jsx`)

#### localStorage Keys
| Key | Purpose | TTL |
|-----|---------|-----|
| `cbt_user_cache` | Serialised `{ user, ts }` object | 24 hours |
| `cbt_auth_token` | JWT Bearer token (if returned by backend) | No expiry |

#### Cold-Start Auth Flow
```
1. loadCachedUser() → setUser(cached) immediately (UI shows dashboard, not login flash)
2. checkAuth() runs in background with Bearer header
3a. Server OK → update cache, keep user
3b. Network/CORS error (fetch throws) → keep cached user, don't log out
3c. Explicit 401 → clear cache + user, redirect to login
```

#### Login Flow (Simplified)
```
1. POST /api/student/login → data.user
2. setUser(data.user)
3. saveCachedUser(data.user)  ← cache for future cold starts
4. If data.token → localStorage.setItem('cbt_auth_token', token)
5. Navigate immediately — no second /api/auth/me call
```

#### Bearer Token Header (fetchWithAuth)
```js
const token = localStorage.getItem('cbt_auth_token');
headers: {
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  ...options.headers,
}
```

### Mobile Input Fix (`src/app/login/page.jsx`)
Password field uses `inputMode="numeric" pattern="[0-9]*"` to trigger numeric keypad on mobile — matching NIN field behaviour. Password masking is preserved via `type="password"`.

```jsx
<input
  type={showPassword ? 'text' : 'password'}
  inputMode="numeric"
  pattern="[0-9]*"
  autoComplete="current-password"
  ...
/>
```

---

*This document is the complete design context for Einstein's CBT App.
Use it as the single source of truth when building the Admin Panel.*

**Mega Tech Solutions © 2026**
