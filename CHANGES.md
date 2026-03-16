# Einstein's CBT App — UI/UX Migration & Change Log

**Project:** Einstein's CBT App powered by Mega Tech Solutions
**Tech Stack:** Next.js 15 (App Router), Tailwind CSS v3, Framer Motion, Lucide React
**Last Updated:** 2026-03-16

---

## Overview

This document records all UI/UX changes made during the full brand color migration and design system overhaul. The goal was to replace the legacy teal color scheme (`#039994`) with the app's official logo color — Deep Navy Blue (`#1F2A49`) — and establish a consistent, token-based design system across every page and component.

---

## Brand Color System

### Logo-Extracted Palette

The primary brand color was extracted directly from `logo.png`:

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#1F2A49` | Deep Navy Blue — buttons, active states, links, headings |
| `brand-primary-dk` | `#141C33` | Darker Navy — hover/pressed states |
| `brand-primary-lt` | `#EDF0F7` | Light Navy Tint — active nav bg, highlight backgrounds |
| `brand-accent` | `#3A4F7A` | Medium Navy — secondary accents, decorative elements |
| `brand-gold` | `#FFB300` | Golden — achievements, badges, premium accents |
| `brand-gold-lt` | `#FFF8E1` | Soft Gold — badge backgrounds |
| `brand-navy` | `#0D1220` | Deepest Navy — exam mode headers, dark containers |
| `brand-cyan` | `#00B4D8` | Electric Cyan — timer, progress accents |

### Previous Colors (Replaced)

| Old Value | Was Used For | Replaced By |
|-----------|-------------|-------------|
| `#039994` (Teal) | All primary brand color | `#1F2A49` (`brand-primary`) |
| `#028a85` (Dark Teal) | Hover/active states | `#141C33` (`brand-primary-dk`) |
| `#E6FFFA` (Teal Tint) | Light highlight backgrounds | `#EDF0F7` (`brand-primary-lt`) |
| `#1565C0` (Royal Blue) | Interim migration color | `#1F2A49` (final logo color) |
| `#0D47A1` (Dark Royal Blue) | Interim dark shade | `#141C33` (final dark shade) |
| `#E3F2FD` (Sky Blue Tint) | Interim light bg | `#EDF0F7` (final light tint) |

---

## Semantic Token System (`tailwind.config.js` + `globals.css`)

All hardcoded hex values were replaced with semantic tokens defined in `tailwind.config.js`. This means future brand color changes only require editing one file.

### Neutral Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `surface-muted` | `#F5F7FB` | Page backgrounds, section backgrounds |
| `surface-subtle` | `#EDF0F7` | Card hover states, light dividers |
| `border` | `#E8ECEF` | All borders, dividers |
| `border-strong` | `#CBD5E1` | Emphasized borders |

### Content (Text)

| Token | Value | Usage |
|-------|-------|-------|
| `content-primary` | `#0D1117` | Main body text, headings |
| `content-secondary` | `#525F7F` | Supporting text, labels |
| `content-muted` | `#8898AA` | Placeholders, captions, timestamps |
| `content-inverse` | `#FFFFFF` | Text on dark backgrounds |

### Status Colors

| Token | Value | Usage |
|-------|-------|-------|
| `success` / `success-light` / `success-dark` | `#10B981` / `#D1FAE5` / `#059669` | Correct answers, completed exams |
| `warning` / `warning-light` / `warning-dark` | `#F59E0B` / `#FEF3C7` / `#D97706` | Warnings, in-progress, expiring |
| `danger` / `danger-light` / `danger-dark` | `#EF4444` / `#FEE2E2` / `#DC2626` | Errors, mock exam rules, violations |
| `info` / `info-light` / `info-dark` | `#3B82F6` / `#DBEAFE` / `#2563EB` | Informational states |

---

## Reusable CSS Utilities (`globals.css` `@layer components`)

| Class | Description |
|-------|-------------|
| `.btn-primary` | Brand-primary filled button with hover/active/disabled states |
| `.btn-secondary` | Bordered secondary button |
| `.btn-danger` | Red filled button for destructive actions |
| `.card` | White card with border and `shadow-card` |
| `.shadow-card` | Subtle `0 1px 3px` shadow |
| `.shadow-card-md` | Medium `0 4px 12px` shadow for elevated cards |
| `.input-underline` | Underline-style input used in forms |
| `.pb-safe` / `.pt-safe` | iOS safe area padding (PWA support) |

---

## Files Modified

### Design System
- `tailwind.config.js` — brand palette, neutral tokens, shadows, keyframes
- `src/styles/globals.css` — CSS custom properties, `@layer components` utilities

### Pages
| File | Changes |
|------|---------|
| `src/app/login/page.jsx` | **Full redesign** — removed card, full-page dark navy layout with ghost logo background, underline inputs on dark bg, inverted white/navy submit button |
| `src/app/exam-instructions/page.jsx` | Full rewrite — brand tokens, Lucide icons, sticky header, color-coded exam card states |
| `src/app/exam-room/page.jsx` | Targeted replacements — all teal → brand-primary, all gray → semantic tokens, emerald → brand-primary-lt |
| `src/app/dashboard/practice-setup/page.jsx` | Full rewrite — brand gradient header, slider, difficulty select, timer toggle |
| `src/app/dashboard/exam-mock-instructions/page.jsx` | Full rewrite — danger gradient header, rules grid, fullscreen guard |
| `src/app/dashboard/practice-room/page.jsx` | Targeted replacements — teal → brand-primary, gray → semantic tokens, answer feedback colors |

### Dashboard Components
| File | Changes |
|------|---------|
| `src/components/dashboard-content/Performance.jsx` | Full rewrite — brand tokens, Lucide icons replacing emoji |
| `src/components/dashboard-content/TimedTests.jsx` | Full rewrite — semantic subject color badges, brand gradient banner |
| `src/components/dashboard-content/Achievements.jsx` | Full rewrite — brand/success/purple gradient stat cards, progress bars |
| `src/components/dashboard-content/PastQuestions.jsx` | Full rewrite — year/subject filter pills, hover states |
| `src/components/dashboard-content/Settings.jsx` | Full rewrite — Toggle component, tab sidebar, profile avatar, password modal |
| `src/components/dashboard-content/Help.jsx` | Full rewrite — FAQ accordion with Framer Motion, PWA guide, contact modal |

### Shared Components
| File | Changes |
|------|---------|
| `src/components/StudentProtectedRoute.jsx` | Loading screen updated to brand tokens |
| `src/components/Footer.jsx` | Logo gradient and column headings updated to brand tokens |
| `src/components/dashboard-components/Footer.jsx` | Same as above (duplicate file) |
| `src/components/OfflineDetector.jsx` | Yellow → `warning-light / warning-dark` semantic tokens |
| `src/components/UpdateNotification.jsx` | All `#039994` → `brand-primary` tokens, app name updated |

### Legacy Style Constants (Unused but updated for consistency)
| File | Changes |
|------|---------|
| `src/components/styles.js` | All `#039994` → `#1F2A49`, `#02857f` → `#0D47A1`, `#E8F8F6` → `#E3F2FD` |
| `src/app/styles.js` | Same as above |
| `src/app/login/styles.js` | Same as above |

---

## Login Page Redesign

### Before
- White `bg-surface-muted` page background
- White card (`bg-white rounded-2xl border shadow-card-md`) containing the form
- Light-mode text colors (`text-content-primary`, `text-brand-primary`)
- Standard underline inputs on white background

### After
- **Full-page dark navy gradient** background: `#1F2A49 → #141C33`
- **Ghost logo** — `logo.png` at 520×520px, 5% opacity, centered behind content as decorative element
- **Radial glow** — subtle `rgba(58,79,122,0.30)` centre highlight for depth
- **No card** — form fields placed directly on the dark background
- **Underline inputs** — white border-bottom (25% → 80% opacity on focus), white text, white/25% placeholder
- **Toggle** — `bg-white/8` pill, active tab is `bg-white text-[#1F2A49]`
- **Submit button** — inverted: `bg-white text-[#1F2A49]` (white bg, navy text)
- **Demo credentials block** — glassmorphism panel: `bg-white/6 border-white/12`
- **Feature pills** — `bg-white/5 border-white/8`
- All text uses `rgba(255,255,255, opacity)` for consistency on dark bg

---

## Bug Fix: Dev Server MODULE_NOT_FOUND

**Symptom:** After running `npm run build`, starting `npm run dev` threw:
```
Error: Cannot find module './331.js'
Error: Cannot find module './611.js'
```

**Cause:** The production build wrote chunk files to `.next/server/` with different numeric IDs than the dev build expected. The dev server's `webpack-runtime.js` tried to resolve production chunk references that don't exist in dev mode.

**Fix:** Delete the `.next` folder before starting dev:
```bash
rm -rf .next && npm run dev
```
This forces Next.js to do a clean dev compilation instead of using stale production artifacts.

---

## Design Principles Applied

1. **Token-first** — no hardcoded hex values in JSX. All colors go through Tailwind tokens or CSS variables.
2. **Semantic naming** — classes describe intent (`text-content-secondary`) not appearance (`text-gray-500`).
3. **Touch-friendly** — all interactive elements have `min-h-[44px]` touch targets.
4. **PWA-ready** — `pb-safe` / `pt-safe` on full-page layouts for iOS notch support.
5. **Font discipline** — `font-playfair` only on headings/brand elements; `Inter` (default) everywhere else.
6. **Accessible contrast** — light tint (`#EDF0F7`) on navy primary gives WCAG-compliant contrast ratios.
