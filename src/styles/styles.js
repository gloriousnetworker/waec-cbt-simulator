/* ============================================================
   Einstein's CBT App — Shared Style Tokens
   Brand: Royal Blue #1565C0 | Gold #FFB300 | Navy #0A1628
   ============================================================ */

// ─── Splash ──────────────────────────────────────────────────
export const splashContainer =
  'fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden';
export const splashContent =
  'text-center px-6 w-full max-w-md';
export const splashLogo =
  'text-5xl leading-none font-bold tracking-tight text-brand-primary mb-8 font-playfair';
export const splashTitle =
  'text-3xl leading-tight font-bold tracking-tight text-content-primary mb-2 font-playfair';
export const splashSubtitle =
  'text-base leading-relaxed font-normal text-content-secondary mb-10';
export const splashProgressBar =
  'w-full h-1.5 bg-surface-subtle rounded-full overflow-hidden mb-3';
export const splashProgressFill =
  'h-full bg-brand-primary transition-all duration-300 ease-out rounded-full';
export const splashProgressText =
  'text-sm font-medium text-content-secondary';
export const splashDots =
  'flex justify-center space-x-2 mt-8';
export const splashDot =
  'w-2 h-2 bg-brand-primary rounded-full';

// ─── Login ───────────────────────────────────────────────────
// app-shell: 100dvh fixed container — keyboard opens over it, not under it
export const loginContainer =
  'app-shell flex items-center justify-center bg-surface-muted px-4 py-8';
export const loginContent =
  'w-full max-w-sm';
export const loginLogo =
  'text-5xl leading-none font-bold tracking-tight text-brand-primary text-center mb-2 font-playfair';
export const loginTitle =
  'text-2xl leading-tight font-bold tracking-tight text-content-primary text-center mb-1 font-playfair';
export const loginSubtitle =
  'text-sm leading-normal font-normal text-content-secondary text-center mb-8';
export const loginForm =
  'space-y-5 mb-5';
export const loginLabel =
  'block mb-1.5 text-sm font-medium text-content-primary';
export const loginInput =
  'input-underline';
export const loginPasswordWrapper =
  'relative';
export const loginPasswordToggle =
  'absolute right-0 top-1/2 -translate-y-1/2 text-content-muted hover:text-brand-primary transition-colors p-1 touch-target flex items-center justify-center';
export const loginRememberRow =
  'flex items-center justify-between';
export const loginCheckboxLabel =
  'flex items-center gap-2 cursor-pointer';
export const loginCheckbox =
  'w-4 h-4 border-2 border-border rounded cursor-pointer accent-brand-primary';
export const loginCheckboxText =
  'text-sm font-normal text-content-secondary';
export const loginForgotPassword =
  'text-sm font-medium text-brand-primary hover:text-brand-primary-dk hover:underline cursor-pointer transition-colors';
export const loginButton =
  'btn-primary w-full text-base mt-2';
export const loginDivider =
  'flex items-center my-5';
export const loginDividerLine =
  'flex-1 h-px bg-border';
export const loginDividerText =
  'px-4 text-xs font-medium text-content-muted';
export const loginDemoSection =
  'space-y-3';
export const loginDemoTitle =
  'text-sm font-semibold text-content-primary mb-2';
export const loginDemoButton =
  'w-full px-4 py-3 border-2 border-brand-primary text-left rounded-lg hover:bg-brand-primary-lt transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]';
export const loginDemoEmail =
  'text-sm font-medium text-content-primary mb-0.5';
export const loginDemoPassword =
  'text-xs font-normal text-content-secondary';
export const loginDemoArrow =
  'text-brand-primary text-lg';
export const loginNote =
  'mt-5 px-4 py-3 bg-brand-primary-lt border-l-4 border-brand-primary rounded-r-lg';
export const loginNoteText =
  'text-xs leading-relaxed font-normal text-blue-800';
export const loginFeatures =
  'mt-6 grid grid-cols-2 gap-3';
export const loginFeatureItem =
  'text-center py-3';
export const loginFeatureIcon =
  'text-2xl mb-1.5';
export const loginFeatureText =
  'text-xs font-medium text-content-secondary';

// ─── Loading ─────────────────────────────────────────────────
export const loadingSpinner =
  'inline-flex items-center justify-center';
export const loadingSpinnerSvg =
  'spinner-sm';
export const loadingText =
  'ml-2 text-sm font-semibold';

// ─── Dashboard Shell ─────────────────────────────────────────
// app-shell: full dvh scroll container defined in globals.css
// flex flex-col on the outer shell, flex-1 on inner panels to fill remaining height
export const dashboardContainer =
  'app-shell bg-surface-muted flex flex-col';
export const dashboardMain =
  'flex flex-1 min-h-0'; /* min-h-0 allows flex children to shrink below content size */
export const dashboardContent =
  'flex-1 min-h-0 scroll-area'; /* scroll-area: overflow-y-auto + overscroll-contain */
export const dashboardInner =
  'max-w-7xl mx-auto px-4 sm:px-6 py-6';
export const dashboardLoading =
  'fixed inset-0 z-50 flex items-center justify-center bg-white';
export const dashboardLoadingInner =
  'text-center';
export const dashboardLoadingSpinner =
  'w-14 h-14 border-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin mx-auto mb-4';
export const dashboardLoadingText =
  'text-sm font-medium text-content-secondary';

// ─── Navbar ──────────────────────────────────────────────────
export const navbarContainer =
  'sticky top-0 z-40 bg-white border-b border-border shadow-card pt-safe';
export const navbarInner =
  'px-4 sm:px-6';
export const navbarContent =
  'flex items-center justify-between h-16';
export const navbarLeft =
  'flex items-center gap-3';
export const navbarMenuButton =
  'p-2.5 text-content-secondary hover:text-brand-primary hover:bg-brand-primary-lt rounded-lg transition-colors touch-target flex items-center justify-center';
export const navbarLogo =
  'flex items-center gap-2.5 ml-1';
export const navbarLogoImage =
  'w-9 h-9 flex-shrink-0';
export const navbarLogoText =
  'text-base font-bold tracking-tight text-brand-primary font-playfair hidden sm:block';
export const navbarLogoSubtext =
  'text-xs font-normal text-content-muted hidden lg:block mt-0.5';
export const navbarRight =
  'flex items-center gap-2 sm:gap-3';
export const navbarSearch =
  'hidden md:block relative';
export const navbarSearchIcon =
  'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted';
export const navbarSearchInput =
  'pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary w-56 text-sm placeholder-content-muted bg-surface-muted transition-all';
export const navbarNotification =
  'relative p-2.5 text-content-secondary hover:text-brand-primary hover:bg-brand-primary-lt rounded-lg transition-colors touch-target flex items-center justify-center';
export const navbarNotificationBadge =
  'absolute top-1.5 right-1.5 h-2 w-2 bg-danger rounded-full ring-2 ring-white';
export const navbarProfileButton =
  'flex items-center gap-2 p-2 rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer touch-target';
export const navbarProfileAvatar =
  'w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0';
export const navbarProfileAvatarText =
  'text-white text-sm font-semibold';
export const navbarProfileInfo =
  'hidden lg:block text-left';
export const navbarProfileName =
  'text-sm font-semibold text-content-primary leading-tight';
export const navbarProfileId =
  'text-xs font-normal text-content-muted mt-0.5';
export const navbarDropdown =
  'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-border shadow-card-lg z-50 overflow-hidden';
export const navbarDropdownHeader =
  'px-4 py-3 border-b border-border bg-surface-muted';
export const navbarDropdownHeaderName =
  'font-semibold text-sm text-content-primary';
export const navbarDropdownHeaderEmail =
  'text-xs font-normal text-content-muted mt-0.5';
export const navbarDropdownMenu =
  'p-1.5';
export const navbarDropdownItem =
  'w-full text-left px-3 py-2.5 text-sm font-normal text-content-secondary hover:bg-brand-primary-lt hover:text-brand-primary rounded-lg transition-colors min-h-[40px] flex items-center';
export const navbarDropdownItemDanger =
  'w-full text-left px-3 py-2.5 text-sm font-normal text-danger hover:bg-danger-light rounded-lg transition-colors min-h-[40px] flex items-center';

// ─── Sidebar ─────────────────────────────────────────────────
// h-full: inherits from locked html/body (100dvh) — avoids 100vh keyboard reflow
export const sidebarContainer =
  'fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border flex flex-col h-full overflow-hidden';
// overflow-hidden on overlay body-locks scroll behind open sidebar on mobile
export const sidebarOverlay =
  'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:bg-transparent lg:pointer-events-none overflow-hidden';

// ─── Dashboard Home ───────────────────────────────────────────
export const homeContainer = 'max-w-7xl mx-auto';
export const homeHeader = 'mb-6';
export const homeTitle =
  'text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair';
export const homeSubtitle =
  'text-sm text-content-secondary mt-1.5';
export const homeStatsGrid =
  'grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6';
export const homeStatCard =
  'rounded-xl p-5 text-white';
export const homeStatCardTop =
  'flex items-center justify-between mb-2';
export const homeStatCardIcon = 'text-3xl';
export const homeStatCardValue =
  'text-2xl font-bold';
export const homeStatCardLabel =
  'text-xs font-normal opacity-90 mt-1';
export const homeActionsGrid =
  'grid grid-cols-2 md:grid-cols-4 gap-3 mb-6';
export const homeActionButton =
  'p-4 rounded-xl border-2 transition-all hover:shadow-card-md bg-white min-h-[80px] flex flex-col items-start';
export const homeActionIcon = 'text-2xl mb-2';
export const homeActionTitle =
  'font-semibold text-sm leading-tight';
export const homeContentGrid =
  'grid grid-cols-1 lg:grid-cols-2 gap-5';
export const homeCard =
  'bg-white rounded-xl border border-border p-5 shadow-card';
export const homeCardTitle =
  'text-base font-bold text-content-primary mb-4 font-playfair';
export const homeActivityItem =
  'flex items-center justify-between p-3 hover:bg-surface-subtle rounded-lg transition-colors cursor-pointer';
export const homeActivityLeft = 'flex items-center gap-3';
export const homeActivityIcon =
  'w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0';
export const homeActivitySubject =
  'font-medium text-sm text-content-primary';
export const homeActivityTime =
  'text-xs text-content-muted mt-0.5';
export const homeActivityScore =
  'font-bold text-base text-content-primary text-right';
export const homeActivityContinue =
  'text-xs font-semibold text-brand-primary hover:underline';
export const homeSubjectGrid = 'grid grid-cols-2 gap-3';
export const homeSubjectButton =
  'p-3 rounded-lg border border-border hover:border-brand-primary hover:bg-brand-primary-lt transition-all text-left';
export const homeSubjectInner = 'flex items-center gap-2';
export const homeSubjectIcon = 'text-2xl flex-shrink-0';
export const homeSubjectName =
  'font-medium text-content-primary text-sm';
export const homeSubjectCount =
  'text-xs text-content-muted mt-0.5';
export const homeViewAllButton =
  'w-full mt-4 py-2.5 btn-secondary text-sm';
export const homeBanner =
  'mt-6 bg-gradient-to-r from-brand-primary to-brand-primary-dk rounded-xl p-6 text-white';
export const homeBannerContent =
  'flex flex-col md:flex-row md:items-center justify-between gap-4';
export const homeBannerTitle =
  'text-xl font-bold font-playfair';
export const homeBannerText =
  'text-sm opacity-90 mt-1';
export const homeBannerActions =
  'flex flex-wrap gap-3 mt-4 md:mt-0';
export const homeBannerButtonPrimary =
  'bg-white text-brand-primary px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors';
export const homeBannerButtonSecondary =
  'bg-white/20 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-white/30 transition-colors border border-white/30';
export const homeBannerStats =
  'mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-white/20';
export const homeBannerStatItem = 'text-center';
export const homeBannerStatValue =
  'text-2xl font-bold font-playfair';
export const homeBannerStatLabel =
  'text-xs opacity-90 mt-0.5';

// ─── Modal ────────────────────────────────────────────────────
export const modalOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4';
export const modalContainer =
  'bg-white rounded-2xl p-6 max-w-sm w-full shadow-card-lg';
export const modalTitle =
  'text-lg font-bold tracking-tight text-content-primary mb-3 font-playfair';
export const modalText =
  'text-sm leading-relaxed text-content-secondary mb-5';
export const modalActions = 'flex gap-3';
export const modalButtonSecondary =
  'flex-1 px-4 py-2.5 border border-border text-content-secondary rounded-lg hover:bg-surface-subtle transition-colors text-sm font-semibold min-h-[44px]';
export const modalButtonDanger =
  'flex-1 px-4 py-2.5 bg-danger text-white rounded-lg hover:bg-danger-dark transition-colors text-sm font-semibold min-h-[44px]';

// ─── Exams Page ───────────────────────────────────────────────
export const examsContainer = 'max-w-7xl mx-auto';
export const examsHeader = 'mb-6';
export const examsTitle =
  'text-2xl md:text-3xl font-bold tracking-tight text-content-primary font-playfair';
export const examsSubtitle =
  'text-sm text-content-secondary mt-1.5';
export const examsTabsGrid =
  'flex gap-3 mb-6 flex-wrap';
export const examsTabButton =
  'px-5 py-2.5 rounded-xl border-2 transition-all text-sm font-semibold min-h-[44px]';
export const examsTabButtonActive =
  'border-brand-primary bg-brand-primary-lt text-brand-primary';
export const examsTabButtonInactive =
  'border-border bg-white text-content-secondary hover:border-brand-primary hover:text-brand-primary';
export const examsTabTitle =
  'font-semibold text-base mb-0.5';
export const examsTabDesc =
  'text-xs text-content-muted font-normal';
export const examsSubjectsGrid =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5';
export const examsSubjectCard =
  'bg-white rounded-xl border border-border overflow-hidden hover:border-brand-primary hover:shadow-card-md transition-all';
export const examsSubjectColorBar = 'h-1.5';
export const examsSubjectCardInner = 'p-5';
export const examsSubjectHeader = 'flex items-start gap-3 mb-4';
export const examsSubjectIcon = 'text-3xl flex-shrink-0';
export const examsSubjectName =
  'font-bold text-base text-content-primary font-playfair leading-tight';
export const examsSubjectQuestions =
  'text-xs text-content-muted mt-0.5';
export const examsSubjectStats = 'space-y-2 mb-5';
export const examsSubjectStatRow = 'flex justify-between text-sm';
export const examsSubjectStatLabel = 'text-content-secondary';
export const examsSubjectStatValue = 'font-semibold text-content-primary';
export const examsSubjectButton =
  'w-full py-3 font-semibold rounded-lg transition-colors text-sm min-h-[44px]';
export const examsInstructions =
  'mt-6 bg-brand-primary-lt border border-brand-primary rounded-xl p-5';
export const examsInstructionsTitle =
  'text-base font-bold tracking-tight text-brand-primary mb-3 font-playfair';
export const examsInstructionsList = 'space-y-2';
export const examsInstructionsItem =
  'flex items-start text-sm leading-relaxed text-content-primary';
export const examsInstructionsBullet = 'mr-2 text-brand-primary mt-0.5 flex-shrink-0';

// ─── Exam Room ────────────────────────────────────────────────
export const examRoomContainer =
  'fixed inset-0 bg-surface-muted overflow-hidden flex flex-col';
export const examRoomHeader =
  'bg-white border-b border-border px-4 sm:px-6 py-3 sticky top-0 z-10';
export const examRoomHeaderInner =
  'max-w-7xl mx-auto flex items-center justify-between';
export const examRoomSubject =
  'text-base font-bold tracking-tight text-content-primary font-playfair';
export const examRoomTimer = 'flex items-center gap-3';
export const examRoomTimerText = 'font-mono text-xl font-bold';
export const examRoomTimerNormal = 'text-brand-primary';
export const examRoomTimerWarning = 'text-warning';
export const examRoomTimerDanger = 'text-danger animate-pulse';
export const examRoomMain = 'flex-1 overflow-hidden flex';
export const examRoomContent = 'flex-1 overflow-y-auto p-4 sm:p-6';
export const examRoomContentInner = 'max-w-3xl mx-auto';
export const examRoomQuestionCard =
  'bg-white border border-border rounded-xl p-5 sm:p-6 mb-5 shadow-card';
export const examRoomQuestionHeader =
  'flex items-start justify-between mb-4';
export const examRoomQuestionNumber =
  'text-sm font-bold text-brand-primary';
export const examRoomQuestionMark =
  'text-xs font-medium text-content-secondary';
export const examRoomQuestionText =
  'text-base leading-relaxed font-medium text-content-primary mb-5';
export const examRoomOptionsGrid = 'space-y-3';
export const examRoomOption =
  'flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all min-h-[56px]';
export const examRoomOptionInactive =
  'border-border hover:border-brand-primary hover:bg-brand-primary-lt';
export const examRoomOptionActive =
  'border-brand-primary bg-brand-primary-lt';
export const examRoomOptionLabel =
  'w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 font-bold text-sm';
export const examRoomOptionLabelInactive =
  'bg-surface-subtle text-content-secondary';
export const examRoomOptionLabelActive =
  'bg-brand-primary text-white';
export const examRoomOptionText =
  'text-sm leading-relaxed text-content-primary flex-1 pt-0.5';
export const examRoomNavigation =
  'flex items-center justify-between mt-6 pt-5 border-t border-border';
export const examRoomNavButton =
  'px-5 py-3 rounded-xl font-semibold text-sm transition-all min-h-[48px]';
export const examRoomNavButtonPrimary =
  'bg-brand-primary text-white hover:bg-brand-primary-dk';
export const examRoomNavButtonSecondary =
  'border-2 border-border text-content-secondary hover:border-brand-primary hover:text-brand-primary';
export const examRoomNavButtonDisabled =
  'opacity-40 cursor-not-allowed';
export const examRoomSidebar =
  'w-72 bg-white border-l border-border overflow-y-auto p-5 hidden lg:block';
export const examRoomSidebarTitle =
  'text-base font-bold tracking-tight text-content-primary mb-4 font-playfair';
export const examRoomProgressBar = 'mb-5';
export const examRoomProgressText =
  'flex justify-between text-xs font-medium text-content-secondary mb-1.5';
export const examRoomProgressBarBg =
  'w-full h-2 bg-surface-subtle rounded-full overflow-hidden';
export const examRoomProgressBarFill =
  'h-full bg-brand-primary transition-all duration-300 rounded-full';
export const examRoomQuestionGrid = 'grid grid-cols-5 gap-2';
export const examRoomQuestionDot =
  'aspect-square rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all min-h-[36px]';
export const examRoomQuestionDotUnanswered =
  'bg-surface-subtle text-content-secondary hover:bg-surface-muted';
export const examRoomQuestionDotAnswered =
  'bg-brand-primary-lt text-brand-primary hover:bg-blue-100';
export const examRoomQuestionDotCurrent =
  'bg-brand-primary text-white shadow-brand';
export const examRoomActions = 'mt-5 space-y-2.5';
export const examRoomActionButton =
  'w-full py-3 rounded-xl font-semibold text-sm transition-all min-h-[48px]';
export const examRoomSubmitButton =
  'bg-danger text-white hover:bg-danger-dark';
export const examRoomReviewButton =
  'border-2 border-brand-primary text-brand-primary hover:bg-brand-primary-lt';

// ─── Exam Warning Modal ───────────────────────────────────────
export const examWarningModal =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4';
export const examWarningCard =
  'bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-card-lg';
export const examWarningIcon = 'text-5xl mb-4';
export const examWarningTitle =
  'text-xl font-bold tracking-tight text-danger mb-2 font-playfair';
export const examWarningText =
  'text-sm leading-relaxed text-content-secondary mb-5';
export const examWarningButton =
  'btn-danger w-full text-sm';

// ─── Form Shared ─────────────────────────────────────────────
export const mainContainer =
  'min-h-screen w-full flex flex-col items-center justify-center py-8 px-4 bg-surface-muted';
export const headingContainer = 'relative w-full flex flex-col items-center mb-4';
export const backArrow =
  'absolute left-4 top-0 text-brand-primary cursor-pointer z-10 touch-target flex items-center';
export const pageTitle =
  'text-3xl font-bold tracking-tight text-brand-primary text-center font-playfair mb-4';
export const progressContainer =
  'w-full max-w-md flex items-center justify-between mb-5';
export const progressBarWrapper =
  'flex-1 h-1.5 bg-surface-subtle rounded-full mr-4';
export const progressBarActive =
  'h-1.5 bg-brand-primary w-2/3 rounded-full';
export const progressStepText =
  'text-sm font-medium text-content-secondary';
export const formWrapper =
  'w-full max-w-md space-y-5';
export const labelClass =
  'block mb-1.5 text-sm font-medium text-content-primary';
export const selectClass =
  'w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-content-primary bg-white min-h-[48px]';
export const inputClass =
  'w-full rounded-lg border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary text-content-primary bg-white min-h-[48px]';
export const fileInputWrapper =
  'relative flex-1 border border-border rounded-lg px-4 py-3 text-sm text-content-muted bg-surface-muted focus-within:ring-2 focus-within:ring-brand-primary cursor-pointer';
export const noteText =
  'mt-1.5 text-xs leading-relaxed italic text-content-secondary';
export const rowWrapper = 'flex gap-4';
export const halfWidth = 'w-1/2';
export const grayPlaceholder = 'bg-surface-subtle';
export const buttonPrimary =
  'btn-primary w-full text-sm mt-2';
export const spinnerOverlay =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/20';
export const spinner =
  'h-12 w-12 border-4 border-t-4 border-brand-primary-lt border-t-brand-primary rounded-full animate-spin';
export const termsTextContainer =
  'mt-5 text-center text-xs font-semibold underline text-content-secondary cursor-pointer';
export const uploadHeading =
  'block mb-1.5 text-sm font-medium text-content-primary';
export const uploadFieldWrapper = 'flex items-center gap-3';
export const uploadInputLabel =
  'relative flex-1 border border-border rounded-lg px-4 py-3 text-sm text-content-muted bg-surface-muted focus-within:ring-2 focus-within:ring-brand-primary cursor-pointer';
export const uploadIconContainer =
  'absolute right-3 top-1/2 -translate-y-1/2 text-content-muted';
export const uploadButtonStyle =
  'px-4 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dk text-sm font-semibold min-h-[44px]';
export const uploadNoteStyle =
  'mt-1.5 text-xs italic text-content-secondary';
