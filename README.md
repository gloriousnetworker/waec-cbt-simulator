WAEC CBT Exam Simulator - Student App

A comprehensive Computer-Based Testing (CBT) simulation application for Nigerian students preparing for WAEC examinations. This app provides a real-world exam experience with practice tests, timed assessments, and performance tracking.

Live Demo: https://waec-cbt-simulator.vercel.app/
Features
🎯 Core Features

    Real Exam Simulation: Experience what it feels like writing a WAEC CBT exam

    Practice Exams: Unlimited practice with subject-based questions

    Timed Tests: Simulate real exam conditions with countdown timers

    Performance Tracking: Detailed analytics of your progress and scores

    Achievement System: Earn badges and rewards as you improve

    Past Questions: Access and practice with previous WAEC questions

    Study Groups: Collaborate with other students preparing for exams

    Support System: Reach out to administrators for help when needed

📱 User Features

    Dashboard Overview: Quick stats on exams taken, average scores, and achievements

    Subject Selection: Choose from Mathematics, English, Physics, Chemistry, Biology, and more

    Exam Modes: Practice mode, timed mode, and full mock exam simulation

    Auto-Save: Progress saves automatically during exams

    Tab Switching Detection: Maintains exam integrity with violation warnings

    Instant Results: Get immediate feedback and scores upon completion

    Performance Analytics: Subject-wise breakdown of strengths and areas for improvement

    Offline Support: PWA capabilities for offline access

    Mobile Responsive: Works perfectly on all devices

📊 Available Subjects

    Mathematics

    English Language

    Physics

    Chemistry

    Biology

    Economics

    Geography

    Government

    Christian Religious Knowledge (CRK)

    Islamic Religious Knowledge (IRK)

    Literature in English

    Commerce

    Financial Accounting

    Agricultural Science

    Civic Education

    Data Processing

Tech Stack
Frontend

    Next.js 14 - React framework with App Router

    React - UI library

    Framer Motion - Animation library

    Tailwind CSS - Utility-first CSS framework

Key Dependencies

    next: ^14.0.0

    react: ^18.0.0

    framer-motion: ^10.0.0

    react-hot-toast: ^2.4.0

    next/image: Built-in image optimization

    next/link: Client-side navigation

Installation
Prerequisites

    Node.js 18.0 or higher

    npm or yarn package manager

Setup Instructions

    Clone the repository
    bash

git clone https://github.com/yourusername/waec-cbt-simulator.git
cd waec-cbt-simulator

Install dependencies
bash

npm install
# or
yarn install

Run the development server
bash

npm run dev
# or
yarn dev

    Open your browser
    Navigate to http://localhost:3000

Project Structure
text

waec-cbt-simulator/
├── app/
│   ├── layout.jsx           # Root layout with AuthProvider
│   ├── page.jsx             # Landing page with splash screen
│   ├── login/               # Login page
│   ├── dashboard/           # Student dashboard
│   │   └── page.jsx         # Dashboard with exam sections
│   └── exam-room/           # Exam taking interface
│       └── page.jsx         # Active exam room
├── components/
│   ├── dashboard-components/
│   │   ├── Navbar.jsx       # Dashboard navigation
│   │   └── Sidebar.jsx      # Dashboard sidebar menu
│   ├── dashboard-content/
│   │   ├── Home.jsx         # Dashboard home/overview
│   │   ├── Exams.jsx        # Practice exams section
│   │   ├── TimedTests.jsx   # Timed tests section
│   │   ├── Performance.jsx  # Performance analytics
│   │   ├── Achievements.jsx # Achievements and badges
│   │   ├── PastQuestions.jsx # Past questions library
│   │   ├── StudyGroups.jsx  # Study groups management
│   │   ├── Settings.jsx     # User settings
│   │   └── Help.jsx         # Help and support
│   ├── SplashScreen.jsx     # App loading screen
│   └── ProtectedRoute.jsx   # Route protection HOC
├── context/
│   └── AuthContext.jsx      # Authentication context
├── data/
│   └── questions.js         # Question bank database
├── public/
│   ├── icons/               # PWA icons
│   ├── logo.png             # App logo
│   └── manifest.json        # PWA manifest
├── styles/
│   └── globals.css          # Global styles
└── package.json

Usage Guide
For Students
Getting Started

    Access the App

        Visit the live URL or open locally

        Splash screen appears with loading progress

    Login

        Use provided credentials from your school administrator

        Default password: 123456 (change after first login)

        Demo accounts available for testing

    Dashboard Navigation

        Home: Overview of your stats and quick actions

        Exams: Browse and start practice exams by subject

        Timed Tests: Take exams under time constraints

        Performance: View detailed analytics of your progress

        Achievements: Track badges and rewards earned

        Past Questions: Access historical WAEC questions

        Study Groups: Join or create study groups

        Settings: Customize your preferences

        Help: Access support resources

Taking an Exam

    Select a subject from the Exams section

    Choose exam type:

        Practice Exam: Untimed with explanations

        Timed Exam: Simulates real exam time conditions

        Mock Exam: Full WAEC simulation with strict rules

    Answer questions by clicking on options

    Navigate using Previous/Next buttons

    Track progress with the sidebar question grid

    Submit when complete or auto-submit on timer expiry

    View instant results with grade and percentage

Exam Rules

    Tab switching triggers warnings (3 warnings = auto-submit)

    Fullscreen mode enforced for mock exams

    Cannot navigate away during timed/mock exams

    All questions must be attempted before final submission

Performance Tracking

    Subject-wise average scores

    Best scores and recent attempts

    Pass rates and grade distribution

    Strengths and areas for improvement identified

    Performance insights with recommendations

PWA Features

The app is a Progressive Web Application with:

    Installable: Add to home screen on mobile devices

    Offline Support: Access previously loaded content offline

    Push Notifications: Get updates on exam schedules

    Fast Loading: Optimized for quick startup

    Responsive Design: Works on all screen sizes

To install:

    Mobile: Open in Chrome/Safari → Share menu → Add to Home Screen

    Desktop: Click install icon in address bar

Demo Credentials

For testing purposes:

    Email: student001@megatechsolutions.org

    Password: 123456

Alternative demo:

    Email: student001@yourschool.org

    Password: 123456

Roadmap
Phase 1 (Completed)

    Basic exam simulation

    User authentication

    Dashboard interface

    Performance tracking

    Multiple subject support

Phase 2 (In Progress)

    Study groups integration

    Real-time collaboration

    Advanced analytics

    Leaderboards

    Certificate generation

Phase 3 (Planned)

    AI-powered recommendations

    Video tutorials

    Live proctoring

    Mobile app (React Native)

    Parent/guardian portal

Support

For support, use the in-app help section or contact your school administrator.

Built for Kogi State Ministry of Education in alliance with Mega Tech Solutions.

© 2026 Mega Tech Solutions. All rights reserved.