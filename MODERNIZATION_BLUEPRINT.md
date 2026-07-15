# Smart Student Planner — Modernization Blueprint

> **Master Plan Document** — This is the definitive roadmap that every future engineering effort on this project must follow.
>
> Generated: July 15, 2026
> Status: Approved for execution
> Principle: **Keep what is good. Improve what is weak. Never rewrite for the sake of rewriting.**

---

## Table of Contents

1. [Phase 1 — Complete Project Understanding](#phase-1--complete-project-understanding)
2. [Phase 2 — Current State Assessment](#phase-2--current-state-assessment)
3. [Phase 3 — Modernization Strategy](#phase-3--modernization-strategy)
4. [Phase 4 — Target Architecture](#phase-4--target-architecture)
5. [Phase 5 — Component Audit](#phase-5--component-audit)
6. [Phase 6 — Screen Refactoring](#phase-6--screen-refactoring)
7. [Phase 7 — TypeScript Strategy](#phase-7--typescript-strategy)
8. [Phase 8 — Performance Strategy](#phase-8--performance-strategy)
9. [Phase 9 — Testing Strategy](#phase-9--testing-strategy)
10. [Phase 10 — Portfolio Value](#phase-10--portfolio-value)
11. [Phase 11 — AI Features](#phase-11--ai-features)
12. [Phase 12 — Final Blueprint](#phase-12--final-blueprint)

---

## Phase 1 — Complete Project Understanding

### 1.1 Project Identity

Smart Student Planner is a full-stack mobile application built with **React Native (Expo SDK 54)** on the frontend and **Node.js/Express** on the backend, backed by **PostgreSQL** with **Sequelize ORM**. It helps university students manage tasks, subjects, weekly schedules, and productivity analytics.

### 1.2 Current File Inventory

#### Backend (25 files)

| Category | Files | Lines (approx.) |
|----------|-------|-----------------|
| Config & Setup | `server.js`, `setup-database.js`, `migrate.js`, `add-indexes.js`, `sequelize.config.js`, `tsconfig.json` | ~450 |
| Config (src) | `config/database.js`, `config/database.ts`, `config/constants.js`, `config/constants.ts` | ~85 |
| Models | `user.js`, `subject.js`, `task.js`, `schedule.js`, `index.js` | ~250 |
| Controllers | `authController.js`, `taskController.js`, `subjectController.js`, `scheduleController.js`, `analyticsController.js` | ~780 |
| Middleware | `auth.js` | ~27 |
| Routes | `authRoutes.js`, `taskRoutes.js`, `subjectRoutes.js`, `scheduleRoutes.js`, `analyticsRoutes.js` | ~70 |
| Types | `types/index.ts` | ~260 |
| Migrations | 7 migration files | ~300 |

#### Frontend (28 files)

| Category | Files | Lines (approx.) |
|----------|-------|-----------------|
| Root | `App.js`, `index.js`, `app.json` | ~280 |
| Context | `authContext.js`, `ThemeContext.js` | ~280 |
| Navigation | `MainTabNavigator.js` | ~63 |
| Screens | 10 screen files | ~6,400 |
| Services | `api.js`, `notificationService.js` | ~565 |
| Components | 11 component files + `index.js` | ~450 |
| Utils | `constants.js`, `dateUtils.js` | ~175 |

### 1.3 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Expo)                        │
│  App.js → Stack Navigator (Auth / Main)                  │
│  MainTabNavigator → 5 tabs (Dashboard, Tasks, Schedule,  │
│    Subjects, Analytics) + TaskDetail + Settings          │
│  Context: AuthContext (login/register/verify/logout)     │
│           ThemeContext (light/dark/system)                │
│  Services: api.js (Axios + interceptors)                 │
│            notificationService.js (expo-notifications)    │
│  Components: 11 extracted (FAB, PriorityBadge, etc.)     │
│  Utils: constants.js, dateUtils.js                       │
├─────────────────────────────────────────────────────────┤
│                    BACKEND (Express)                      │
│  server.js → Helmet + CORS + Rate Limiting + Routes      │
│  Routes → auth.js middleware → Controllers               │
│  Controllers → Sequelize Models → PostgreSQL             │
│  Security: JWT, bcrypt, account lockout, rate limiting   │
│  TypeScript prep: types/index.ts, .ts config files       │
├─────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL)                  │
│  Tables: users, subjects, tasks, schedule                │
│  7 migrations (Umzug)                                    │
│  Indexes on userId, subjectId, dueDate, completed, etc.  │
└─────────────────────────────────────────────────────────┘
```

### 1.4 Feature Inventory

| Feature | Frontend Files | Backend Files | Status |
|---------|---------------|---------------|--------|
| Authentication | LoginScreen, RegisterScreen, VerifyScreen, authContext | authController, auth middleware, user model | ✅ Complete |
| Task Management | TaskScreen, TaskDetailScreen | taskController, task model, taskRoutes | ✅ Complete |
| Subject Management | SubjectsScreen | subjectController, subject model, subjectRoutes | ✅ Complete (N+1 issue) |
| Weekly Schedule | ScheduleScreen | scheduleController, schedule model, scheduleRoutes | ✅ Complete |
| Analytics | AnalyticsScreen | analyticsController, analyticsRoutes | ✅ Complete |
| Notifications | notificationService, App.js | N/A (client-side only) | ✅ Complete |
| Dashboard | DashboardScreen | Multiple endpoints | ✅ Complete |
| Settings | SettingsScreen | N/A | ⚠️ Partial (stubs) |
| Theming | ThemeContext | N/A | ✅ Complete |

### 1.5 Database Schema

```
users (id, email, passwordHash, name, isVerified, 
       verificationCodeHash, verificationExpiresAt,
       failedLoginAttempts, failedVerificationAttempts,
       lockoutUntil, createdAt)
  │
  ├──< subjects (id, userId, name, color, createdAt)
  │       │
  │       └──< tasks (id, userId, subjectId, title, description,
  │                    priority, dueDate, estimatedDuration,
  │                    completed, reminderEnabled, 
  │                    reminderMinutesBefore, reminderSent, createdAt)
  │
  └──< schedule (id, userId, subjectId, taskId, dayOfWeek,
                 startTime, endTime, activityType, title,
                 isRecurring, reminderEnabled,
                 reminderMinutesBefore, createdAt)
```

### 1.6 Dependencies

**Frontend:** React 19.1, React Native 0.81, Expo SDK 54, React Navigation 7, Axios, expo-notifications, react-native-chart-kit, moment, AsyncStorage, DateTimePicker

**Backend:** Express 4.18, Sequelize 6.32, pg 8.11, jsonwebtoken, bcryptjs, nodemailer, helmet, express-rate-limit, cors, dotenv, umzug

**Backend DevDeps:** TypeScript 7.0, @types/* for all libraries, nodemon

---

## Phase 2 — Current State Assessment

### 2.1 What Is Already Well Designed (DO NOT REWRITE)

| Component | Why It's Good | Verdict |
|-----------|--------------|---------|
| `ThemeContext.js` | 48+ semantic color tokens, system auto-detection, AsyncStorage persistence, clean API | **Keep as-is** |
| `authContext.js` | Clean login/register/verify/logout flow, proper error handling, 401 interceptor integration | **Keep as-is** |
| `api.js` | Well-structured Axios instance, interceptors, service objects per domain | **Keep as-is** (minor TS typing later) |
| `notificationService.js` | Well-encapsulated singleton, complete CRUD, AsyncStorage persistence, deep-linking data | **Keep as-is** |
| `authController.js` | Account lockout, brute-force protection, email enumeration prevention, bcrypt codes | **Keep as-is** |
| `server.js` | Helmet, rate limiting, CORS config, health checks, JWT secret validation, proper error handling | **Keep as-is** |
| `auth.js` middleware | Clean JWT verification, user attachment to req | **Keep as-is** |
| All backend models | Proper field definitions, associations, ENUM types | **Keep as-is** (add TS types later) |
| All backend routes | Thin, RESTful, consistent | **Keep as-is** |
| `taskController.js` | Clean CRUD, proper userId filtering, today/upcoming queries | **Keep as-is** |
| `scheduleController.js` | Clean CRUD, weekly grouping, proper includes | **Keep as-is** |
| `subjectController.js` | Clean CRUD (but needs task-count optimization) | **Small improvement** |
| `MainTabNavigator.js` | Clean tab setup, theme-aware | **Keep as-is** |
| `utils/constants.js` | Well-organized constants, extracted priority/activity colors | **Keep as-is** |
| `utils/dateUtils.js` | Clean date formatting utilities | **Keep as-is** |
| Component library (11 components) | Already extracted, barrel exported, theme-aware | **Keep, expand usage** |
| Migration system (7 migrations) | Proper Umzug setup, security fields migration | **Keep as-is** |

### 2.2 What Should Receive Small Improvements Only

| Component | Issue | Fix |
|-----------|-------|-----|
| `subjectController.js` | `getSubjects` doesn't return task counts → N+1 on frontend | Add `COUNT` query with `GROUP BY` |
| `analyticsController.js` | Raw SQL for tasksBySubject, study hours in JS | Can stay, but wrap in try/catch and add types |
| `App.js` | Hardcoded header colors (`#4A90E2`) instead of theme | Use theme colors in screenOptions |
| `DashboardScreen.js` | Doesn't use extracted components (StatCard, SectionHeader) | Replace inline with components |
| `TaskScreen.js` | Doesn't use FAB, PriorityBadge, SubjectBadge, FilterChips | Replace inline with components |
| `SubjectsScreen.js` | Doesn't use FAB, EmptyState | Replace inline with components |
| `ScheduleScreen.js` | Doesn't use FAB, EmptyState | Replace inline with components |
| `AnalyticsScreen.js` | Doesn't use StatCard, FilterChips, EmptyState | Replace inline with components |
| `SettingsScreen.js` | Doesn't use ModalWrapper, Input | Replace inline with components |

### 2.3 What Is Technical Debt

| Debt Item | Severity | Impact |
|-----------|----------|--------|
| No TypeScript on frontend | High | Runtime-only type errors, no IDE safety |
| Backend has parallel .js and .ts files | Medium | Confusion about which is active |
| Screens don't use extracted components | High | Defeats purpose of component library |
| `getPriorityColor` duplicated in 3 screens | Medium | Already extracted to constants but not used |
| N+1 queries in SubjectsScreen | High | Performance degradation with many subjects |
| Duplicate `useEffect` + `useFocusEffect` calls | Medium | Double API calls on screen mount |
| No memoization anywhere | Medium | Unnecessary re-renders |
| No custom hooks (useApi, useForm, useTasks) | Medium | Logic duplication across screens |
| No tests (0% coverage) | Critical | No regression safety net |
| No ESLint/Prettier config | Medium | Inconsistent code style |
| No CI/CD pipeline | Medium | No automated quality gates |
| No error boundaries | Medium | White screen on React errors |
| Settings stubs (change password, export, delete) | Low | Incomplete features |
| `reminderSent` field unused on backend | Low | Dead field |
| No pagination on task list | Low | Fine for current scale, future concern |
| No input validation library (Zod/Joi) | Medium | Manual validation is incomplete |
| No API documentation (OpenAPI/Swagger) | Low | Portfolio gap |

### 2.4 Dangerously Large Files

| File | Lines | Risk |
|------|-------|------|
| `ScheduleScreen.js` | 1,486 | **Critical** — Contains schedule rendering, modal form, time picker, day selector, conflict detection, all styles |
| `TaskDetailScreen.js` | 918 | **High** — Contains detail view, edit mode, reminder modal, all inline |
| `SettingsScreen.js` | 860 | **High** — Contains profile, notifications, theme, account, danger zone, 3 modals |
| `AnalyticsScreen.js` | 741 | **Medium** — Contains 8 chart sections, all data preparation inline |
| `TaskScreen.js` | 697 | **Medium** — Contains list, filter, create modal, all inline |
| `SubjectsScreen.js` | 575 | **Medium** — Contains list, create/edit modal, color picker inline |
| `notificationService.js` | 447 | **Low** — Large but well-structured singleton |
| `DashboardScreen.js` | 364 | **Low** — Acceptable size |

### 2.5 Separation of Concerns Violations

| Violation | Location | Impact |
|-----------|----------|--------|
| UI + business logic + data fetching in screens | All screens | Screens do everything — no hook extraction |
| Form state management inline | TaskScreen, ScheduleScreen, SubjectsScreen, SettingsScreen | No shared form hook |
| Time/schedule calculations inline | ScheduleScreen | `timeToMinutes`, `checkScheduleConflict`, `formatTime` should be utilities |
| Chart data preparation inline | AnalyticsScreen | `prepareProductivityData`, `prepareSubjectDistributionData` should be utilities |
| Inline styles with hardcoded colors | SettingsScreen, AnalyticsScreen, TaskDetailScreen | Should use theme tokens |
| Modal rendering inline in every screen | All screens with modals | Should use ModalWrapper (exists but unused) |

---

## Phase 3 — Modernization Strategy

### 3.1 The Three Options

#### Option A: Layer by Layer (JS → TS)

**Approach:** Convert all files to TypeScript first, then refactor.

**Pros:**
- Type safety catches bugs during refactoring
- Uniform transformation

**Cons:**
- ❌ Massive upfront effort with no visible improvement
- ❌ High risk of introducing type errors in working code
- ❌ Demotivating — weeks of work with no user-facing change
- ❌ Types would be wrong (typing bad code locks in bad patterns)
- ❌ Backend already has parallel .ts files creating confusion

**Risk: HIGH** — You'd be typing code that's about to be restructured.

#### Option B: Feature by Feature (Auth → Tasks → Subjects → Analytics → Schedule)

**Approach:** Fully modernize one feature at a time (types + components + hooks + tests).

**Pros:**
- Each feature is independently deployable
- Clear progress milestones
- Can stop at any point with working software

**Cons:**
- ❌ Cross-cutting concerns (component library, hooks, types) get done piecemeal
- ❌ Shared utilities would be created multiple times
- ❌ Inconsistent state — some features modernized, others not
- ❌ Auth feature is already good, so starting there wastes effort

**Risk: MEDIUM** — Better than A, but creates inconsistency.

#### Option C: Hybrid — Foundation First, Then Feature Verticals ✅ RECOMMENDED

**Approach:**
1. **Foundation layer:** TypeScript setup, shared types, hooks, utilities, component adoption, ESLint/Prettier, testing infrastructure
2. **Feature verticals:** Refactor each screen using the foundation, one at a time
3. **Backend hardening:** Complete TS migration, add validation, add tests

**Why this is optimal:**
- ✅ Foundation work benefits ALL features simultaneously
- ✅ Each screen refactor is small and safe once foundation exists
- ✅ TypeScript is introduced alongside refactoring (not before, not after)
- ✅ Every milestone leaves the app in a deployable state
- ✅ Component library already exists — just needs adoption
- ✅ Backend security is already done — focus shifts to types and tests
- ✅ Highest portfolio impact per hour invested

**Risks:**
- Foundation phase has no visible UI changes (mitigated by showing test coverage)
- Must resist temptation to refactor screens during foundation phase

### 3.2 Recommended Strategy: Option C (Hybrid)

**Execution order:**
1. Tooling & infrastructure (ESLint, Prettier, test setup)
2. Shared TypeScript types (frontend + backend)
3. Custom hooks extraction (useApi, useForm, useTasks, etc.)
4. Utility extraction (schedule utils, analytics utils)
5. Component adoption (replace inline UI with library components)
6. Screen refactoring (one at a time, smallest first)
7. Backend TypeScript migration (file by file)
8. Backend validation + tests
9. Feature completion (Settings stubs → real APIs)
10. CI/CD + documentation

---

## Phase 4 — Target Architecture

### 4.1 Target Frontend Folder Structure

```
frontend/
├── App.tsx                          # Root: providers + navigation
├── index.js                         # Entry point (registerRootComponent)
├── app.json                         # Expo config
├── package.json
├── tsconfig.json                    # TypeScript config
├── .eslintrc.js                     # ESLint config
├── .prettierrc                      # Prettier config
├── assets/                          # Static images/icons
└── src/
    ├── components/                  # Shared UI component library
    │   ├── index.ts                 # Barrel export
    │   ├── FAB.tsx                  # Floating Action Button
    │   ├── PriorityBadge.tsx        # Priority indicator
    │   ├── SubjectBadge.tsx         # Subject color tag
    │   ├── FilterChips.tsx          # Filter tab selector
    │   ├── StatCard.tsx             # Statistics card
    │   ├── EmptyState.tsx           # Empty state with CTA
    │   ├── SectionHeader.tsx        # Section title + action
    │   ├── ModalWrapper.tsx         # Reusable modal shell
    │   ├── LoadingScreen.tsx        # Full-screen loading
    │   ├── ConfirmDialog.tsx        # Confirmation dialog
    │   ├── Input.tsx                # Themed text input
    │   ├── Button.tsx               # ★ NEW: Themed button
    │   ├── Card.tsx                 # ★ NEW: Themed card wrapper
    │   ├── TaskCard.tsx             # ★ NEW: Task list item
    │   ├── ScheduleBlock.tsx        # ★ NEW: Schedule time slot
    │   ├── SubjectCard.tsx          # ★ NEW: Subject list item
    │   ├── DaySelector.tsx          # ★ NEW: Schedule day picker
    │   ├── TimePickerModal.tsx      # ★ NEW: Reusable time picker
    │   ├── ColorPicker.tsx          # ★ NEW: Subject color picker
    │   ├── SettingsRow.tsx          # ★ NEW: Settings toggle/action row
    │   ├── ThemeSelector.tsx        # ★ NEW: Light/Dark/System selector
    │   └── ErrorBoundary.tsx        # ★ NEW: React error boundary
    ├── context/                     # Global state (React Context)
    │   ├── AuthContext.tsx          # Auth state + methods
    │   └── ThemeContext.tsx         # Theme state + tokens
    ├── navigation/                  # Navigation configuration
    │   ├── RootNavigator.tsx        # Auth vs Main switch
    │   ├── MainTabNavigator.tsx     # Bottom tabs
    │   └── types.ts                 # Navigation param types
    ├── screens/                     # Screen components (thin orchestrators)
    │   ├── LoginScreen.tsx
    │   ├── RegisterScreen.tsx
    │   ├── VerifyScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── TaskScreen.tsx
    │   ├── TaskDetailScreen.tsx
    │   ├── ScheduleScreen.tsx
    │   ├── SubjectsScreen.tsx
    │   ├── AnalyticsScreen.tsx
    │   └── SettingsScreen.tsx
    ├── hooks/                       # ★ NEW: Custom React hooks
    │   ├── useApi.ts                # Generic API call hook
    │   ├── useAuth.ts               # Auth context wrapper
    │   ├── useTheme.ts              # Theme context wrapper
    │   ├── useTasks.ts              # Task CRUD + state
    │   ├── useSubjects.ts           # Subject CRUD + state
    │   ├── useSchedule.ts           # Schedule CRUD + state
    │   ├── useAnalytics.ts          # Analytics data + transformations
    │   ├── useForm.ts               # Form state + validation
    │   ├── useNotifications.ts      # Notification state + methods
    │   └── useFocusRefresh.ts       # useFocusEffect + refresh logic
    ├── services/                    # External service integrations
    │   ├── api.ts                   # Axios instance + interceptors
    │   ├── authService.ts           # ★ NEW: Auth API calls
    │   ├── taskService.ts           # ★ NEW: Task API calls
    │   ├── subjectService.ts        # ★ NEW: Subject API calls
    │   ├── scheduleService.ts       # ★ NEW: Schedule API calls
    │   ├── analyticsService.ts      # ★ NEW: Analytics API calls
    │   └── notificationService.ts   # Expo notifications
    ├── types/                       # ★ NEW: TypeScript types
    │   ├── index.ts                 # Barrel export
    │   ├── auth.ts                  # User, AuthResponse, etc.
    │   ├── task.ts                  # Task, TaskFilters, etc.
    │   ├── subject.ts               # Subject, SubjectCreateInput
    │   ├── schedule.ts              # Schedule, WeeklySchedule
    │   ├── analytics.ts             # Analytics response types
    │   ├── navigation.ts            # Route param types
    │   └── theme.ts                 # Theme type definition
    ├── utils/                       # Pure utility functions
    │   ├── constants.ts             # Colors, presets, palettes
    │   ├── dateUtils.ts             # Date formatting/parsing
    │   ├── scheduleUtils.ts         # ★ NEW: Time/conflict logic
    │   ├── analyticsUtils.ts        # ★ NEW: Chart data preparation
    │   ├── validation.ts            # ★ NEW: Form validation helpers
    │   └── storage.ts               # ★ NEW: AsyncStorage wrapper
    └── config/                      # ★ NEW: App configuration
        └── env.ts                   # Environment variables
```

### 4.2 Target Backend Folder Structure

```
backend/
├── server.ts                        # Express entry point
├── package.json
├── tsconfig.json
├── sequelize.config.ts              # Multi-env DB config
├── setup-database.ts                # DB init script
├── migrate.ts                       # Umzug migration runner
├── migrations/                      # Database migrations
│   ├── 001-create-users.ts
│   ├── 002-create-subjects.ts
│   ├── ...
│   └── 007-add-security-fields.ts
└── src/
    ├── config/
    │   ├── database.ts              # Sequelize instance
    │   ├── constants.ts             # Auth constants, error messages
    │   └── env.ts                   # ★ NEW: Validated env vars
    ├── controllers/                 # Request handlers (thin)
    │   ├── authController.ts
    │   ├── taskController.ts
    │   ├── subjectController.ts
    │   ├── scheduleController.ts
    │   └── analyticsController.ts
    ├── middleware/
    │   ├── auth.ts                  # JWT verification
    │   ├── validate.ts              # ★ NEW: Zod validation middleware
    │   └── errorHandler.ts          # ★ NEW: Centralized error handler
    ├── models/                      # Sequelize models
    │   ├── index.ts                 # Associations + exports
    │   ├── user.ts
    │   ├── subject.ts
    │   ├── task.ts
    │   └── schedule.ts
    ├── routes/                      # Express route definitions
    │   ├── authRoutes.ts
    │   ├── taskRoutes.ts
    │   ├── subjectRoutes.ts
    │   ├── scheduleRoutes.ts
    │   └── analyticsRoutes.ts
    ├── services/                    # ★ NEW: Business logic layer
    │   ├── authService.ts           # Token generation, email sending
    │   ├── taskService.ts           # Task queries + filtering
    │   ├── subjectService.ts        # Subject queries + counts
    │   ├── scheduleService.ts       # Schedule queries + grouping
    │   └── analyticsService.ts      # Analytics aggregations
    ├── schemas/                     # ★ NEW: Zod validation schemas
    │   ├── authSchema.ts
    │   ├── taskSchema.ts
    │   ├── subjectSchema.ts
    │   └── scheduleSchema.ts
    ├── types/                       # TypeScript type definitions
    │   └── index.ts                 # All shared types
    └── utils/                       # ★ NEW: Backend utilities
        └── apiResponse.ts           # Standard response helpers
```

### 4.3 Why Each Folder Exists

| Folder | Purpose | Why It Exists |
|--------|---------|---------------|
| `components/` | Reusable UI elements | DRY — one component, used everywhere |
| `context/` | Global state | Cross-cutting state (auth, theme) available to all screens |
| `navigation/` | Route configuration | Separates navigation structure from screen logic |
| `screens/` | Page-level components | Thin orchestrators that compose components + hooks |
| `hooks/` | Reusable stateful logic | Extract data fetching, forms, and business logic from screens |
| `services/` | API + external integrations | Single source of truth for all network calls |
| `types/` | TypeScript definitions | Shared type safety between files |
| `utils/` | Pure functions | No state, no side effects — easily testable |
| `config/` | App configuration | Environment, constants, setup |
| `controllers/` | HTTP request handlers | Parse request, call service, format response |
| `middleware/` | Express middleware | Cross-cutting HTTP concerns (auth, validation, errors) |
| `models/` | Database models | ORM definitions mapping to database tables |
| `routes/` | Route definitions | URL → controller mapping |
| `services/` (backend) | Business logic | Separates logic from HTTP layer — testable without Express |
| `schemas/` | Validation schemas | Zod schemas for request body validation |

### 4.4 State Management Strategy

**Keep React Context.** Do NOT introduce Redux or Zustand.

**Rationale:**
- The app has only 2 global state concerns: auth and theme
- Context is sufficient and already working well
- Adding Redux would be over-engineering for this scale
- Custom hooks (`useTasks`, `useSubjects`) will handle feature-level state

**Data fetching pattern:**
- Custom hooks (`useTasks`, `useSchedule`) manage loading/error/data state
- Each hook calls the appropriate service
- No global data cache needed at current scale (can add React Query later if needed)

---

## Phase 5 — Component Audit

### 5.1 Already Extracted Components (11)

| Component | File | Used By | Status |
|-----------|------|---------|--------|
| FAB | `FAB.js` | ❌ Not used by any screen | Needs adoption |
| PriorityBadge | `PriorityBadge.js` | ❌ Not used by any screen | Needs adoption |
| SubjectBadge | `SubjectBadge.js` | ❌ Not used by any screen | Needs adoption |
| FilterChips | `FilterChips.js` | ❌ Not used by any screen | Needs adoption |
| StatCard | `StatCard.js` | ❌ Not used by any screen | Needs adoption |
| EmptyState | `EmptyState.js` | ❌ Not used by any screen | Needs adoption |
| SectionHeader | `SectionHeader.js` | ❌ Not used by any screen | Needs adoption |
| ModalWrapper | `ModalWrapper.js` | ❌ Not used by any screen | Needs adoption |
| LoadingScreen | `LoadingScreen.js` | ❌ Not used by any screen | Needs adoption |
| ConfirmDialog | `ConfirmDialog.js` | ❌ Not used by any screen | Needs adoption |
| Input | `Input.js` | ❌ Not used by any screen | Needs adoption |

**Critical finding:** All 11 components exist but ZERO screens use them. Every screen still has inline implementations. This is the #1 quick win.

### 5.2 Duplicated UI Elements Found

| Duplicated Element | Found In | Recommendation |
|-------------------|----------|----------------|
| FAB button (60px circle, shadow) | TaskScreen, ScheduleScreen, SubjectsScreen | Use `<FAB />` |
| Priority badge (colored pill) | TaskScreen, TaskDetailScreen, DashboardScreen | Use `<PriorityBadge />` |
| Subject tag (colored pill) | TaskScreen, TaskDetailScreen, ScheduleScreen, DashboardScreen | Use `<SubjectBadge />` |
| Filter chips (row of toggle buttons) | TaskScreen, AnalyticsScreen | Use `<FilterChips />` |
| Stat cards (icon + number + label) | DashboardScreen, AnalyticsScreen | Use `<StatCard />` |
| Empty state (icon + title + subtitle) | TaskScreen, SubjectsScreen, ScheduleScreen, AnalyticsScreen | Use `<EmptyState />` |
| Section header (title + "See All") | DashboardScreen, AnalyticsScreen | Use `<SectionHeader />` |
| Modal structure (overlay + content + close) | TaskScreen, ScheduleScreen, SubjectsScreen, SettingsScreen, TaskDetailScreen | Use `<ModalWrapper />` |
| Text input (border + placeholder + theme) | All screens with forms | Use `<Input />` |
| Confirm dialog (Alert.alert with Cancel/Delete) | TaskScreen, ScheduleScreen, SubjectsScreen, TaskDetailScreen, SettingsScreen | Use `ConfirmDialog` |
| Loading text/spinner | App.js, TaskDetailScreen | Use `<LoadingScreen />` |
| `getPriorityColor` function | DashboardScreen, TaskScreen, TaskDetailScreen | Already in `constants.js` — import it |
| `getActivityColor` function | ScheduleScreen | Already in `constants.js` — import it |
| `formatTime` function | ScheduleScreen | Extract to `scheduleUtils.ts` |
| `timeToMinutes` function | ScheduleScreen | Extract to `scheduleUtils.ts` |
| `checkScheduleConflict` function | ScheduleScreen | Extract to `scheduleUtils.ts` |

### 5.3 New Components to Create

| Component | Purpose | Used By | Priority |
|-----------|---------|---------|----------|
| `Button` | Themed button with variants (primary, secondary, danger) | All screens | High |
| `Card` | Themed card wrapper with shadow + border | Dashboard, Tasks, Subjects, Analytics | High |
| `TaskCard` | Task list item with checkbox, title, badges, due date | TaskScreen, DashboardScreen | High |
| `ScheduleBlock` | Time slot block with positioning logic | ScheduleScreen | High |
| `SubjectCard` | Subject list item with color, counts, actions | SubjectsScreen | Medium |
| `DaySelector` | Horizontal day picker with session count badges | ScheduleScreen | Medium |
| `TimePickerModal` | Reusable time picker with card overlay | ScheduleScreen | Medium |
| `ColorPicker` | Color palette selector grid | SubjectsScreen | Medium |
| `SettingsRow` | Settings toggle/action row | SettingsScreen | Medium |
| `ThemeSelector` | Light/Dark/System selector | SettingsScreen | Medium |
| `ErrorBoundary` | React error boundary | App root | Medium |
| `ReminderOption` | Reminder preset selector row | TaskDetailScreen | Low |
| `QuickActionButton` | Dashboard quick action grid button | DashboardScreen | Low |

### 5.4 Component-to-Screen Mapping

```
LoginScreen          → Input, Button
RegisterScreen       → Input, Button
VerifyScreen         → Input, Button
DashboardScreen      → StatCard, SectionHeader, TaskCard, QuickActionButton, EmptyState
TaskScreen           → FilterChips, TaskCard, FAB, ModalWrapper, Input, Button, EmptyState
TaskDetailScreen     → PriorityBadge, SubjectBadge, ModalWrapper, ReminderOption, ConfirmDialog
ScheduleScreen       → DaySelector, ScheduleBlock, FAB, ModalWrapper, TimePickerModal, EmptyState
SubjectsScreen       → SubjectCard, FAB, ModalWrapper, ColorPicker, Input, ConfirmDialog, EmptyState
AnalyticsScreen      → FilterChips, StatCard, EmptyState, SectionHeader
SettingsScreen       → SettingsRow, ThemeSelector, ModalWrapper, Input, ConfirmDialog
```

---

## Phase 6 — Screen Refactoring

### 6.1 Screen-by-Screen Analysis

#### LoginScreen (205 lines → ~120 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 205 lines | ~120 lines |
| Components used | None (inline) | Input, Button |
| Hooks | useAuth, useTheme | useAuth, useTheme |
| Issues | Inline TextInput, inline styles, hardcoded colors | Use Input component, use theme |
| Split into | — | No split needed, just component adoption |
| Verdict | **Small improvement** — replace inline inputs with `<Input />`, create `<Button />` |

#### RegisterScreen (similar to Login)

| Aspect | Current | Target |
|--------|---------|--------|
| Verdict | **Small improvement** — same as LoginScreen |

#### VerifyScreen (similar to Login)

| Aspect | Current | Target |
|--------|---------|--------|
| Verdict | **Small improvement** — same as LoginScreen |

#### DashboardScreen (364 lines → ~180 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 364 lines | ~180 lines |
| Components used | None (inline) | StatCard, SectionHeader, TaskCard, EmptyState |
| Hooks | useAuth, useTheme | useAuth, useTheme, useDashboardData (new) |
| Issues | Inline stat cards, inline section headers, inline task items, duplicate getPriorityColor, duplicate useEffect+useFocusEffect | Use components, extract data hook, import getPriorityColor |
| Split into | — | `useDashboardData` hook, use `<StatCard>`, `<SectionHeader>`, `<TaskCard>` |
| Verdict | **Medium refactor** — extract data hook + adopt components |

#### TaskScreen (697 lines → ~250 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 697 lines | ~250 lines |
| Components used | None (inline) | FilterChips, TaskCard, FAB, ModalWrapper, Input, Button, EmptyState |
| Hooks | useTheme | useTheme, useTasks (new), useForm (new) |
| Issues | Inline filter buttons, inline task items, inline FAB, inline modal, inline form, duplicate getPriorityColor, duplicate useEffect+useFocusEffect | Use all components, extract useTasks + useForm hooks |
| Split into | — | `useTasks` hook, `useForm` hook, `TaskCard` component, `TaskFormModal` component |
| Verdict | **Major refactor** — extract hooks + components + form modal |

#### TaskDetailScreen (918 lines → ~300 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 918 lines | ~300 lines |
| Components used | None (inline) | PriorityBadge, SubjectBadge, ModalWrapper, ReminderOption, ConfirmDialog, Input, Button |
| Hooks | useTheme | useTheme, useTaskDetail (new), useForm (new) |
| Issues | Inline everything, duplicate getPriorityColor, duplicate getSubjectColor/Name, inline reminder modal, inline date/time pickers | Extract hooks, use components, extract reminder modal |
| Split into | — | `useTaskDetail` hook, `ReminderModal` component, `TaskEditForm` component |
| Verdict | **Major refactor** — largest reduction after ScheduleScreen |

#### ScheduleScreen (1486 lines → ~350 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 1,486 lines | ~350 lines |
| Components used | None (inline) | DaySelector, ScheduleBlock, FAB, ModalWrapper, TimePickerModal, EmptyState |
| Hooks | useTheme | useTheme, useSchedule (new), useForm (new) |
| Issues | EVERYTHING inline — time utils, conflict detection, day selector, time slot rendering, modal form, time picker, activity type selector, subject selector, task selector, recurring toggle, reminder settings | Extract to `scheduleUtils.ts`, `useSchedule` hook, `ScheduleFormModal` component, `DaySelector` component, `ScheduleBlock` component, `TimePickerModal` component |
| Split into | `scheduleUtils.ts` (timeToMinutes, formatTime, checkScheduleConflict, getSubjectColor, getActivityColor), `useSchedule` hook, `ScheduleFormModal` component, `DaySelector` component, `ScheduleBlock` component, `TimePickerModal` component | Screen becomes thin orchestrator |
| Verdict | **Critical refactor** — largest file, most complex, highest impact |

#### SubjectsScreen (575 lines → ~200 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 575 lines | ~200 lines |
| Components used | None (inline) | SubjectCard, FAB, ModalWrapper, ColorPicker, Input, ConfirmDialog, EmptyState |
| Hooks | useTheme | useTheme, useSubjects (new), useForm (new) |
| Issues | N+1 API calls (one per subject), inline color palette, inline modal, inline subject card, duplicate useEffect+useFocusEffect | Fix N+1 via backend, extract hooks, use components |
| Split into | — | `useSubjects` hook, `SubjectCard` component, `SubjectFormModal` component, `ColorPicker` component |
| Verdict | **Major refactor** — includes backend N+1 fix |

#### AnalyticsScreen (741 lines → ~250 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 741 lines | ~250 lines |
| Components used | None (inline) | FilterChips, StatCard, EmptyState, SectionHeader |
| Hooks | useTheme | useTheme, useAnalytics (new) |
| Issues | All chart data preparation inline, all chart rendering inline, inline filter, inline stat cards, hardcoded colors in styles | Extract `analyticsUtils.ts`, `useAnalytics` hook, use components |
| Split into | `analyticsUtils.ts` (prepareProductivityData, prepareSubjectDistributionData, prepareStudyHoursData, getPriorityDistribution), `useAnalytics` hook, chart components stay inline but use prepared data | Screen becomes composition of chart sections |
| Verdict | **Major refactor** — extract data preparation + hooks |

#### SettingsScreen (860 lines → ~300 lines target)

| Aspect | Current | Target |
|--------|---------|--------|
| Size | 860 lines | ~300 lines |
| Components used | None (inline) | SettingsRow, ThemeSelector, ModalWrapper, Input, ConfirmDialog |
| Hooks | useAuth, useTheme | useAuth, useTheme, useSettings (new) |
| Issues | 3 inline modals, inline settings rows, inline theme selector, many hardcoded colors, stubbed features | Extract `useSettings` hook, use components, implement stubs |
| Split into | `useSettings` hook, `SettingsRow` component, `ThemeSelector` component, `ProfileEditModal` component, `PasswordChangeModal` component, `RemindersModal` component | Screen becomes section composition |
| Verdict | **Major refactor** — extract modals + implement stubs |

### 6.2 Refactoring Priority Order

1. **ScheduleScreen** (1,486 → 350) — Highest impact, largest file
2. **TaskDetailScreen** (918 → 300) — Second largest, most inline
3. **SettingsScreen** (860 → 300) — Third largest, has stubs to implement
4. **AnalyticsScreen** (741 → 250) — Data preparation extraction
5. **TaskScreen** (697 → 250) — Hook + component extraction
6. **SubjectsScreen** (575 → 200) — Includes N+1 fix
7. **DashboardScreen** (364 → 180) — Component adoption
8. **LoginScreen** (205 → 120) — Simple component adoption
9. **RegisterScreen** — Same as Login
10. **VerifyScreen** — Same as Login

### 6.3 Largest Architectural Problems

1. **ScheduleScreen is a monolith** — 1,486 lines mixing rendering, business logic, form state, time calculations, and styles. This is the single biggest architectural problem.

2. **No hook extraction** — Every screen manages its own data fetching, loading state, and error handling inline. This means the same patterns are reimplemented 10 times.

3. **Component library exists but is unused** — 11 components were extracted but no screen imports them. This means the extraction work was done but never connected.

4. **N+1 query in SubjectsScreen** — The frontend loops through subjects making individual API calls for task counts. This should be a single backend query.

5. **Duplicate useEffect + useFocusEffect** — Multiple screens call `loadData()` in both `useEffect` and `useFocusEffect`, causing duplicate API calls on initial mount.

---

## Phase 7 — TypeScript Strategy

### 7.1 When to Introduce TypeScript

**Answer: DURING refactoring, not before, not after.**

**Why not before:**
- Typing bad code locks in bad patterns
- You'd type functions that are about to be moved/deleted
- High effort, zero visible improvement
- Demotivating

**Why not after:**
- Refactoring without types is riskier
- You'd refactor, then retype everything
- Double the work

**Why during:**
- Each file is typed as it's refactored
- Types guide the refactoring (catch mistakes in real-time)
- Natural progression — file by file
- Every milestone has typed + refactored code

### 7.2 Migration Path

**Step 1: Setup (Foundation milestone)**
- Add `tsconfig.json` to frontend
- Install TypeScript dev dependencies
- Configure `allowJs: true` so JS and TS coexist
- Add ESLint with TypeScript support

**Step 2: Types first (Foundation milestone)**
- Create `src/types/` folder
- Define all shared types (User, Task, Subject, Schedule, Analytics)
- These types are used by both old JS files (via JSDoc) and new TS files

**Step 3: File-by-file conversion (during screen refactoring)**
- When a screen is refactored, it becomes `.tsx`
- When a hook is created, it's `.ts`
- When a component is updated, it becomes `.tsx`
- When a utility is extracted, it's `.ts`
- JS files that aren't touched stay as JS (no forced conversion)

**Step 4: Backend conversion (after frontend)**
- Backend already has `tsconfig.json` and `types/index.ts`
- Convert `.js` → `.ts` file by file
- Delete parallel `.js` files once `.ts` is verified
- `server.js` → `server.ts` last (entry point)

**Step 5: Strict mode (final)**
- Enable `strict: true` in tsconfig
- Fix all type errors
- Enable `noUnusedLocals` and `noUnusedParameters`

### 7.3 How to Avoid Introducing Bugs

1. **`allowJs: true`** — JS and TS coexist during migration
2. **One file at a time** — Never batch-convert
3. **Test after each conversion** — Manual test the screen/endpoint
4. **Types match runtime** — Don't use `any` as a shortcut
5. **Shared types from backend** — `types/index.ts` already exists, reuse it
6. **JSDoc for unconverted files** — Add `@type` annotations to JS files for partial safety
7. **No `// @ts-ignore`** — If there's a type error, fix it properly

### 7.4 Backend TypeScript Status

The backend already has:
- `tsconfig.json` (configured with `strict: true`)
- `src/types/index.ts` (comprehensive type definitions)
- `src/config/constants.ts` (parallel to `.js`)
- `src/config/database.ts` (parallel to `.js`)

**Issue:** Both `.js` and `.ts` versions exist for config files. The `.js` files are being used (require statements in `server.js`). The `.ts` files are dormant.

**Fix:** During backend migration, delete `.js` versions and update imports to use `.ts` versions. Convert `server.js` → `server.ts` and update `package.json` scripts.

---

## Phase 8 — Performance Strategy

### 8.1 Optimizations Worth Implementing

#### High Impact (DO THESE)

| Optimization | Location | Impact | Effort |
|-------------|----------|--------|--------|
| Fix N+1 in SubjectsScreen | Backend `getSubjects` + frontend | Eliminates N API calls | Low |
| Fix duplicate useEffect + useFocusEffect | Dashboard, Tasks, Subjects, Schedule | Eliminates duplicate API calls | Low |
| Extract ScheduleBlock with React.memo | ScheduleScreen | Prevents re-rendering all time slots on state change | Medium |
| useMemo for chart data preparation | AnalyticsScreen | Prevents recalculating chart data on every render | Low |
| useCallback for handlers in list items | TaskScreen, SubjectsScreen | Prevents re-rendering all list items on parent state change | Low |
| React.memo on TaskCard, SubjectCard | Component library | Prevents unnecessary list item re-renders | Low |

#### Medium Impact (CONSIDER)

| Optimization | Location | Impact | Effort |
|-------------|----------|--------|--------|
| Optimistic update for task toggle | TaskScreen | Instant UI feedback | Medium |
| Pagination for task list | Backend + frontend | Handles large task lists | Medium |
| In-memory cache for subjects | useSubjects hook | Avoids refetching on every screen focus | Low |
| Lazy load chart components | AnalyticsScreen | Faster initial render | Low |

#### Low Impact (SKIP FOR NOW)

| Optimization | Why Skip |
|-------------|----------|
| Debounce filter changes | Filters are instant API calls, not search |
| Image caching | No network images currently |
| Request queuing | Not needed at current scale |
| SQLite local database | AsyncStorage is sufficient |
| React Query / SWR | Custom hooks are sufficient; add if caching becomes complex |

### 8.2 Performance Anti-Patterns to Fix

| Anti-Pattern | Location | Fix |
|-------------|----------|-----|
| `useEffect` + `useFocusEffect` both calling `loadData()` | Dashboard, Tasks, Subjects, Schedule | Use only `useFocusEffect` with a ref guard |
| Inline function creation in renderItem | TaskScreen, SubjectsScreen | Extract to `useCallback` |
| No `React.memo` on list items | All FlatLists | Wrap TaskCard, SubjectCard in `React.memo` |
| No `keyExtractor` optimization | TaskScreen (uses `.toString()`) | Use `item.id` directly |
| Chart re-renders on every state change | AnalyticsScreen | `useMemo` for chart data |
| Schedule re-renders all slots on any change | ScheduleScreen | Extract `ScheduleBlock` with `React.memo` |

### 8.3 Backend Performance

| Optimization | Impact | Effort | Priority |
|-------------|--------|--------|----------|
| Add task count to subjects query | High (fixes N+1) | Low | **Do now** |
| Add index on `schedule.taskId` | Low | Low | Later |
| Remove `sync({ alter: true })` in production | Safety | Low | **Do now** |
| Add pagination to tasks endpoint | Medium | Medium | Later |
| Cache analytics results | Low | Medium | Skip for now |

---

## Phase 9 — Testing Strategy

### 9.1 Testing Roadmap

#### Priority 1: Backend Unit Tests (Do First)

| What to Test | Tool | Why First |
|-------------|------|-----------|
| `authController` (register, login, verify) | Jest + Supertest | Security-critical, well-defined inputs/outputs |
| `taskController` (CRUD, filters, toggle) | Jest + Supertest | Core business logic |
| `subjectController` (CRUD, task counts) | Jest + Supertest | Includes N+1 fix to verify |
| `scheduleController` (CRUD, weekly grouping) | Jest + Supertest | Core business logic |
| `analyticsController` (aggregations) | Jest + Supertest | Complex queries, most likely to break |
| `auth` middleware | Jest | Security-critical |

**Setup:** Jest + Supertest + test database (separate PostgreSQL database)

#### Priority 2: Frontend Component Tests

| What to Test | Tool | Why |
|-------------|------|-----|
| All 11+ components | Jest + React Native Testing Library | Verify they render correctly with different props |
| `useForm` hook | Jest + renderHook | Form validation logic |
| `useTasks` hook | Jest + renderHook + MSW | Data fetching + state |
| `scheduleUtils` | Jest | Pure functions, easy to test |
| `analyticsUtils` | Jest | Pure functions, easy to test |
| `dateUtils` | Jest | Pure functions, easy to test |

#### Priority 3: Integration Tests

| What to Test | Tool |
|-------------|------|
| Auth flow (register → verify → login → profile) | Jest + Supertest |
| Task CRUD flow (create → list → update → toggle → delete) | Jest + Supertest |
| Subject CRUD flow | Jest + Supertest |
| Schedule CRUD flow | Jest + Supertest |

#### Priority 4: Navigation Tests

| What to Test | Tool |
|-------------|------|
| Auth → Main navigation switch | Jest + React Native Testing Library |
| Tab navigation | Jest + React Native Testing Library |
| Deep linking from notifications | Manual / E2E |

#### Priority 5: E2E Tests (Later)

| What to Test | Tool |
|-------------|------|
| Full registration flow | Detox |
| Full task management flow | Detox |
| Schedule creation flow | Detox |

### 9.2 Testing Order

```
1. Backend setup (Jest + Supertest + test DB)     ← Milestone 2
2. Backend controller tests (auth, task)          ← Milestone 2
3. Frontend setup (Jest + RNTL)                   ← Milestone 3
4. Utility tests (scheduleUtils, analyticsUtils)  ← Milestone 3
5. Component tests (as components are created)    ← Ongoing
6. Hook tests (as hooks are created)              ← Ongoing
7. Integration tests (after backend TS migration) ← Milestone 9
8. E2E tests (final, optional)                    ← Milestone 12
```

### 9.3 Coverage Targets

| Layer | Target Coverage | Priority |
|-------|----------------|----------|
| Backend controllers | 80% | High |
| Backend middleware | 90% | High |
| Frontend utils | 90% | High |
| Frontend hooks | 70% | Medium |
| Frontend components | 60% | Medium |
| Frontend screens | 30% (smoke tests) | Low |

---

## Phase 10 — Portfolio Value

### 10.1 Reviewer Perspectives

#### Google / Microsoft / Amazon (FAANG)

**What they look for:** Scale, testing, CI/CD, system design, production readiness

**Current score:** 5/10
**After modernization:** 8/10

**What increases value most for them:**
1. ✅ TypeScript (shows engineering maturity)
2. ✅ Test coverage (shows quality mindset)
3. ✅ CI/CD pipeline (shows DevOps awareness)
4. ✅ Clean architecture (shows systems thinking)
5. ✅ API documentation (shows professional practices)

**What's not worth the time for them:**
- ❌ AI features (they care about engineering, not features)
- ❌ More UI polish (they care about code, not design)
- ❌ Offline support (too complex for portfolio level)

#### Startup

**What they look for:** Full-stack capability, shipping speed, product thinking

**Current score:** 7/10
**After modernization:** 9/10

**What increases value most for them:**
1. ✅ Feature completion (implement Settings stubs)
2. ✅ Clean component architecture (shows you can iterate fast)
3. ✅ TypeScript (shows you can work in their codebase)
4. ✅ Testing (shows you won't break production)

#### Internship

**What they look for:** Potential, learning ability, working software

**Current score:** 9/10
**After modernization:** 10/10

**What increases value most for them:**
1. ✅ The app already works (most impressive thing)
2. ✅ TypeScript shows growth
3. ✅ Tests show professionalism
4. ✅ Clean code shows mentorability

#### Junior Full-Stack Role

**What they look for:** Real-world experience, understanding of architecture, code quality

**Current score:** 8/10
**After modernization:** 9.5/10

**What increases value most for them:**
1. ✅ Full-stack ownership (already have this)
2. ✅ TypeScript (expected in 2026)
3. ✅ Testing (differentiates from other juniors)
4. ✅ Component architecture (shows you think about reuse)
5. ✅ CI/CD (shows you understand the full development lifecycle)

### 10.2 Highest Portfolio Impact Improvements

| Rank | Improvement | Impact | Effort | ROI |
|------|------------|--------|--------|-----|
| 1 | TypeScript migration | Very High | Medium | ⭐⭐⭐⭐⭐ |
| 2 | Test suite (backend + frontend) | Very High | High | ⭐⭐⭐⭐⭐ |
| 3 | Component adoption (use existing library) | High | Low | ⭐⭐⭐⭐⭐ |
| 4 | Screen refactoring (hooks + utils) | High | Medium | ⭐⭐⭐⭐ |
| 5 | CI/CD pipeline (GitHub Actions) | High | Low | ⭐⭐⭐⭐⭐ |
| 6 | README + architecture docs | High | Low | ⭐⭐⭐⭐⭐ |
| 7 | Implement Settings stubs | Medium | Medium | ⭐⭐⭐ |
| 8 | ESLint + Prettier | Medium | Low | ⭐⭐⭐⭐ |
| 9 | API documentation (OpenAPI) | Medium | Low | ⭐⭐⭐⭐ |
| 10 | N+1 fix | Medium | Low | ⭐⭐⭐⭐ |

### 10.3 Improvements NOT Worth the Time

| Improvement | Why Skip |
|-------------|----------|
| Redux/Zustand | Context is sufficient, adding state manager is over-engineering |
| React Query/SWR | Custom hooks are sufficient at this scale |
| Offline support | Complex, low portfolio return for effort |
| Microservices | Monolith is correct for this scale |
| GraphQL | REST is fine for this API surface |
| Docker | Nice but not necessary for a portfolio project |
| WebSocket real-time | Not needed for a single-user productivity app |
| Custom animations | Nice but not engineering value |
| Storybook | Overkill for this component count |
| Multi-language/i18n | Not needed for portfolio |

---

## Phase 11 — AI Features

> **IMPORTANT:** Only implement these AFTER the modernization is complete. AI features on a weak foundation create more technical debt.

### 11.1 Recommended AI Features (Ranked by Impact)

#### Rank 1: Smart Task Scheduling (HIGH IMPACT, REALISTIC)

**What it does:** When a student creates a task with a due date, the AI suggests the best time to work on it based on their schedule, existing workload, and task priority.

**Why it's not a gimmick:** Students genuinely struggle with time allocation. This solves a real problem.

**How it works:**
- Analyze existing schedule for free time slots
- Check upcoming workload (other tasks due around the same time)
- Consider task priority and estimated duration
- Suggest 2-3 optimal study sessions in the schedule

**Implementation:** Backend endpoint that takes task data + user's schedule + workload and returns suggested time slots. Can use simple heuristics (no LLM needed) or an LLM for natural language suggestions.

#### Rank 2: Study Time Predictor (HIGH IMPACT, REALISTIC)

**What it does:** Predicts how long a task will take based on task description, subject, and historical completion data.

**Why it's not a gimmick:** Students consistently underestimate task duration. This helps them plan better.

**How it works:**
- Track actual completion time vs. estimated duration
- Build a simple model: `predicted = avg(subject, priority) * adjustment_factor`
- Show prediction when creating a task: "Based on your history, this will take ~2.5 hours"

**Implementation:** Backend analytics query + simple statistical model. No external AI API needed.

#### Rank 3: Deadline Conflict Warning (MEDIUM IMPACT, REALISTIC)

**What it does:** When a student adds a task, the AI checks if multiple high-priority tasks are due around the same time and warns them.

**Why it's not a gimmick:** Students often don't realize they have 3 major assignments due the same week.

**How it works:**
- Check tasks due within ±3 days of the new task's due date
- If 2+ high-priority tasks exist, show a warning
- Suggest spreading out the work

**Implementation:** Backend query + frontend warning banner. No AI needed — just smart logic.

#### Rank 4: Natural Language Task Input (MEDIUM IMPACT, MODERATE EFFORT)

**What it does:** Student types "Math homework due Friday at 5pm, high priority" and the app creates a structured task.

**Why it's not a gimmick:** Faster input = more likely to use the app.

**How it works:**
- Use an LLM API (OpenAI/Anthropic) to parse natural language
- Extract: title, subject, due date, priority
- Pre-fill the task creation form

**Implementation:** Backend endpoint that calls LLM API, returns structured data. Requires API key.

#### Rank 5: Productivity Insights Summary (LOW IMPACT, NICE TO HAVE)

**What it does:** Weekly AI-generated summary of productivity patterns: "You're most productive on Tuesdays, and you complete 80% of Math tasks on time."

**Why it's not a gimmick:** Self-awareness improves productivity.

**How it works:**
- Analyze analytics data
- Generate natural language insights
- Show in dashboard or weekly recap notification

**Implementation:** Backend analytics + LLM API for natural language generation.

### 11.2 AI Features NOT Recommended

| Feature | Why Not |
|---------|---------|
| AI chatbot | Gimmick — students don't need to chat with their planner |
| AI-generated study materials | Out of scope — this is a planner, not a study tool |
| AI subject recommendations | Students know what subjects they have |
| AI grade prediction | Not enough data, potentially misleading |
| AI photo-to-task | Gimmick — OCR for syllabus is complex and unreliable |

---

## Phase 12 — Final Blueprint

### 12.1 Milestone Roadmap

```
Milestone 1: Foundation — Tooling & Infrastructure
Milestone 2: Backend Hardening — Tests & Validation
Milestone 3: Frontend Foundation — Types, Hooks, Utils
Milestone 4: Component Library — New Components + Adoption
Milestone 5: Screen Refactoring — Schedule (largest)
Milestone 6: Screen Refactoring — TaskDetail + Settings
Milestone 7: Screen Refactoring — Analytics + Tasks
Milestone 8: Screen Refactoring — Subjects + Dashboard + Auth
Milestone 9: Backend TypeScript Migration
Milestone 10: Feature Completion — Settings Stubs
Milestone 11: CI/CD & Documentation
Milestone 12: AI Features (Optional, Post-Modernization)
```

---

### Milestone 1: Foundation — Tooling & Infrastructure

| Attribute | Value |
|-----------|-------|
| **Objective** | Set up ESLint, Prettier, frontend TypeScript config, test infrastructure, error boundary |
| **Estimated time** | 1-2 days |
| **Risk level** | Low |
| **Portfolio impact** | High (shows professional tooling) |
| **Files affected** | `frontend/package.json`, `frontend/tsconfig.json` (new), `frontend/.eslintrc.js` (new), `frontend/.prettierrc` (new), `frontend/src/components/ErrorBoundary.js` (new), `frontend/App.js` (wrap in ErrorBoundary) |
| **Testing requirements** | Verify app still runs, ESLint passes with 0 errors |
| **Git commit** | `chore: add ESLint, Prettier, TypeScript config, and ErrorBoundary` |

**Tasks:**
- [ ] Install dev dependencies: `typescript`, `@types/react`, `@types/react-native`, `eslint`, `prettier`, `eslint-config-universe` (Expo's preset)
- [ ] Create `frontend/tsconfig.json` with `allowJs: true`, `strict: false` (enable strict later)
- [ ] Create `.eslintrc.js` with Expo + React Native rules
- [ ] Create `.prettierrc` with consistent formatting
- [ ] Create `ErrorBoundary.js` component
- [ ] Wrap `AppContent` in `ErrorBoundary` in `App.js`
- [ ] Run ESLint on existing code — fix only errors, not warnings

---

### Milestone 2: Backend Hardening — Tests & Validation

| Attribute | Value |
|-----------|-------|
| **Objective** | Add Jest + Supertest, write controller tests, add Zod validation, fix N+1 query |
| **Estimated time** | 3-4 days |
| **Risk level** | Low (additive only, no existing code changed except N+1 fix) |
| **Portfolio impact** | Very High (tests + validation = professional) |
| **Files affected** | `backend/package.json`, `backend/jest.config.js` (new), `backend/src/middleware/validate.js` (new), `backend/src/schemas/*.js` (new), `backend/src/controllers/subjectController.js` (N+1 fix), `backend/tests/` (new) |
| **Testing requirements** | Auth controller tests, task controller tests, subject controller tests |
| **Git commit** | `feat: add backend tests, Zod validation, and fix N+1 subject query` |

**Tasks:**
- [ ] Install `jest`, `supertest`, `zod`, `@types/jest`, `@types/supertest`
- [ ] Create `jest.config.js` with test database config
- [ ] Create test setup file that syncs test database before each suite
- [ ] Write `authController.test.js` (register, login, verify, profile)
- [ ] Write `taskController.test.js` (CRUD, filters, toggle, today, upcoming)
- [ ] Write `subjectController.test.js` (CRUD, task counts)
- [ ] Create `validate.js` middleware using Zod
- [ ] Create `authSchema.js`, `taskSchema.js`, `subjectSchema.js`, `scheduleSchema.js`
- [ ] Apply validation middleware to routes
- [ ] Fix N+1: Update `getSubjects` to include task counts via `GROUP BY` + `COUNT`
- [ ] Update frontend `SubjectsScreen` to use new task count data (remove N+1 loop)

---

### Milestone 3: Frontend Foundation — Types, Hooks, Utils

| Attribute | Value |
|-----------|-------|
| **Objective** | Create shared types, custom hooks, and extract utilities from screens |
| **Estimated time** | 3-4 days |
| **Risk level** | Low (new files only, no screen changes yet) |
| **Portfolio impact** | High (shows architecture thinking) |
| **Files affected** | `frontend/src/types/*.ts` (new), `frontend/src/hooks/*.ts` (new), `frontend/src/utils/scheduleUtils.ts` (new), `frontend/src/utils/analyticsUtils.ts` (new), `frontend/src/utils/validation.ts` (new) |
| **Testing requirements** | Unit tests for `scheduleUtils`, `analyticsUtils`, `validation` |
| **Git commit** | `feat: add shared types, custom hooks, and extracted utilities` |

**Tasks:**
- [ ] Create `src/types/` with all shared types (auth, task, subject, schedule, analytics, navigation, theme)
- [ ] Create `src/hooks/useApi.ts` — generic API call hook (loading, error, data, refetch)
- [ ] Create `src/hooks/useForm.ts` — form state + validation
- [ ] Create `src/hooks/useTasks.ts` — task CRUD + state
- [ ] Create `src/hooks/useSubjects.ts` — subject CRUD + state
- [ ] Create `src/hooks/useSchedule.ts` — schedule CRUD + state
- [ ] Create `src/hooks/useAnalytics.ts` — analytics data + transformations
- [ ] Create `src/hooks/useFocusRefresh.ts` — fixes duplicate useEffect+useFocusEffect
- [ ] Create `src/utils/scheduleUtils.ts` — `timeToMinutes`, `formatTime`, `checkScheduleConflict`, `timeStringToDate`, `dateToTimeString`
- [ ] Create `src/utils/analyticsUtils.ts` — `prepareProductivityData`, `prepareSubjectDistributionData`, `prepareStudyHoursData`, `getPriorityDistribution`
- [ ] Create `src/utils/validation.ts` — `validateEmail`, `validatePassword`, `validateRequired`
- [ ] Write tests for all utility functions

---

### Milestone 4: Component Library — New Components + Adoption

| Attribute | Value |
|-----------|-------|
| **Objective** | Create missing components, convert existing to .tsx, adopt in screens |
| **Estimated time** | 3-4 days |
| **Risk level** | Medium (modifying screen render code) |
| **Portfolio impact** | High (shows component architecture) |
| **Files affected** | All files in `frontend/src/components/`, all screen files (component imports only) |
| **Testing requirements** | Component render tests for new components |
| **Git commit** | `feat: complete component library and adopt across all screens` |

**Tasks:**
- [ ] Convert existing 11 components from `.js` → `.tsx` with proper props types
- [ ] Create `Button.tsx` (primary, secondary, danger variants)
- [ ] Create `Card.tsx` (themed wrapper)
- [ ] Create `TaskCard.tsx` (task list item with memo)
- [ ] Create `ScheduleBlock.tsx` (time slot with memo)
- [ ] Create `SubjectCard.tsx` (subject list item with memo)
- [ ] Create `DaySelector.tsx` (horizontal day picker)
- [ ] Create `TimePickerModal.tsx` (reusable time picker)
- [ ] Create `ColorPicker.tsx` (color palette grid)
- [ ] Create `SettingsRow.tsx` (toggle/action row)
- [ ] Create `ThemeSelector.tsx` (light/dark/system)
- [ ] Update `components/index.ts` barrel export
- [ ] Adopt components in ALL screens (replace inline implementations)
- [ ] Replace inline `getPriorityColor` with import from `constants`
- [ ] Replace inline `getActivityColor` with import from `constants`
- [ ] Write component tests

---

### Milestone 5: Screen Refactoring — Schedule (Largest)

| Attribute | Value |
|-----------|-------|
| **Objective** | Refactor ScheduleScreen from 1,486 → ~350 lines using hooks, utils, and components |
| **Estimated time** | 2-3 days |
| **Risk level** | High (most complex screen, most logic to extract) |
| **Portfolio impact** | Very High (most impressive refactoring) |
| **Files affected** | `frontend/src/screens/ScheduleScreen.js` → `.tsx`, `frontend/src/components/ScheduleFormModal.tsx` (new) |
| **Testing requirements** | `scheduleUtils` tests, manual test of schedule CRUD + conflict detection |
| **Git commit** | `refactor: decompose ScheduleScreen into hooks, utils, and components` |

**Tasks:**
- [ ] Convert `ScheduleScreen.js` → `ScheduleScreen.tsx`
- [ ] Replace inline time utilities with `scheduleUtils.ts`
- [ ] Replace inline conflict detection with `scheduleUtils.ts`
- [ ] Replace inline data fetching with `useSchedule` hook
- [ ] Replace inline form state with `useForm` hook
- [ ] Extract schedule form modal to `ScheduleFormModal.tsx`
- [ ] Replace inline day selector with `<DaySelector />`
- [ ] Replace inline time slots with `<ScheduleBlock />` (with React.memo)
- [ ] Replace inline FAB with `<FAB />`
- [ ] Replace inline empty state with `<EmptyState />`
- [ ] Replace inline time picker with `<TimePickerModal />`
- [ ] Replace inline `getActivityColor` with import
- [ ] Fix duplicate useEffect + useFocusEffect with `useFocusRefresh`
- [ ] Verify all functionality works identically

---

### Milestone 6: Screen Refactoring — TaskDetail + Settings

| Attribute | Value |
|-----------|-------|
| **Objective** | Refactor TaskDetailScreen (918 → ~300) and SettingsScreen (860 → ~300) |
| **Estimated time** | 3-4 days |
| **Risk level** | Medium |
| **Portfolio impact** | High |
| **Files affected** | `TaskDetailScreen.js` → `.tsx`, `SettingsScreen.js` → `.tsx`, new modal components |
| **Testing requirements** | Manual test of task edit, reminder scheduling, settings toggles |
| **Git commit** | `refactor: decompose TaskDetail and Settings screens` |

**Tasks:**
- [ ] Convert `TaskDetailScreen.js` → `.tsx`
- [ ] Extract `useTaskDetail` hook
- [ ] Extract `ReminderModal` component
- [ ] Replace inline badges with `<PriorityBadge />` and `<SubjectBadge />`
- [ ] Replace inline modal with `<ModalWrapper />`
- [ ] Replace inline confirm with `ConfirmDialog`
- [ ] Replace inline `getPriorityColor` with import
- [ ] Convert `SettingsScreen.js` → `.tsx`
- [ ] Extract `useSettings` hook
- [ ] Extract `ProfileEditModal`, `PasswordChangeModal`, `RemindersModal` components
- [ ] Replace inline settings rows with `<SettingsRow />`
- [ ] Replace inline theme selector with `<ThemeSelector />`
- [ ] Replace inline modals with `<ModalWrapper />`
- [ ] Replace inline inputs with `<Input />`
- [ ] Replace hardcoded colors with theme tokens

---

### Milestone 7: Screen Refactoring — Analytics + Tasks

| Attribute | Value |
|-----------|-------|
| **Objective** | Refactor AnalyticsScreen (741 → ~250) and TaskScreen (697 → ~250) |
| **Estimated time** | 2-3 days |
| **Risk level** | Medium |
| **Portfolio impact** | High |
| **Files affected** | `AnalyticsScreen.js` → `.tsx`, `TaskScreen.js` → `.tsx`, `TaskFormModal.tsx` (new) |
| **Testing requirements** | `analyticsUtils` tests, manual test of charts + task CRUD |
| **Git commit** | `refactor: decompose Analytics and Tasks screens` |

**Tasks:**
- [ ] Convert `AnalyticsScreen.js` → `.tsx`
- [ ] Replace inline data preparation with `analyticsUtils.ts`
- [ ] Replace inline data fetching with `useAnalytics` hook
- [ ] Replace inline filter with `<FilterChips />`
- [ ] Replace inline stat cards with `<StatCard />`
- [ ] Replace inline empty states with `<EmptyState />`
- [ ] Add `useMemo` for chart data
- [ ] Convert `TaskScreen.js` → `.tsx`
- [ ] Replace inline data fetching with `useTasks` hook
- [ ] Replace inline form with `useForm` hook
- [ ] Extract `TaskFormModal` component
- [ ] Replace inline filter with `<FilterChips />`
- [ ] Replace inline task items with `<TaskCard />` (with React.memo)
- [ ] Replace inline FAB with `<FAB />`
- [ ] Replace inline modal with `<ModalWrapper />`
- [ ] Replace inline empty state with `<EmptyState />`
- [ ] Fix duplicate useEffect + useFocusEffect

---

### Milestone 8: Screen Refactoring — Subjects + Dashboard + Auth

| Attribute | Value |
|-----------|-------|
| **Objective** | Refactor remaining screens: SubjectsScreen, DashboardScreen, Login/Register/Verify |
| **Estimated time** | 2-3 days |
| **Risk level** | Low (smaller screens, straightforward changes) |
| **Portfolio impact** | Medium |
| **Files affected** | `SubjectsScreen.js` → `.tsx`, `DashboardScreen.js` → `.tsx`, `LoginScreen.js` → `.tsx`, `RegisterScreen.js` → `.tsx`, `VerifyScreen.js` → `.tsx` |
| **Testing requirements** | Manual test of all screens |
| **Git commit** | `refactor: complete screen refactoring for remaining screens` |

**Tasks:**
- [ ] Convert `SubjectsScreen.js` → `.tsx`
- [ ] Replace inline data fetching with `useSubjects` hook
- [ ] Replace inline form with `useForm` hook
- [ ] Extract `SubjectFormModal` component
- [ ] Replace inline color picker with `<ColorPicker />`
- [ ] Replace inline subject cards with `<SubjectCard />`
- [ ] Replace inline FAB with `<FAB />`
- [ ] Replace inline confirm with `ConfirmDialog`
- [ ] Convert `DashboardScreen.js` → `.tsx`
- [ ] Extract `useDashboardData` hook
- [ ] Replace inline stat cards with `<StatCard />`
- [ ] Replace inline section headers with `<SectionHeader />`
- [ ] Replace inline task items with `<TaskCard />`
- [ ] Fix duplicate useEffect + useFocusEffect
- [ ] Convert `LoginScreen.js`, `RegisterScreen.js`, `VerifyScreen.js` → `.tsx`
- [ ] Replace inline inputs with `<Input />`
- [ ] Replace inline buttons with `<Button />`

---

### Milestone 9: Backend TypeScript Migration

| Attribute | Value |
|-----------|-------|
| **Objective** | Convert all backend `.js` files to `.ts`, delete parallel files, update scripts |
| **Estimated time** | 2-3 days |
| **Risk level** | Medium (must verify server starts and all endpoints work) |
| **Portfolio impact** | High (full-stack TypeScript) |
| **Files affected** | All `backend/src/**/*.js` → `.ts`, `backend/server.js` → `server.ts`, `backend/package.json` |
| **Testing requirements** | All existing backend tests must pass, manual API test |
| **Git commit** | `feat: complete backend TypeScript migration` |

**Tasks:**
- [ ] Convert `config/database.js` → delete (use existing `database.ts`)
- [ ] Convert `config/constants.js` → delete (use existing `constants.ts`)
- [ ] Convert `models/user.js` → `user.ts` with typed model
- [ ] Convert `models/subject.js` → `subject.ts`
- [ ] Convert `models/task.js` → `task.ts`
- [ ] Convert `models/schedule.js` → `schedule.ts`
- [ ] Convert `models/index.js` → `index.ts`
- [ ] Convert `middleware/auth.js` → `auth.ts` with `AuthRequest` type
- [ ] Convert `controllers/authController.js` → `authController.ts`
- [ ] Convert `controllers/taskController.js` → `taskController.ts`
- [ ] Convert `controllers/subjectController.js` → `subjectController.ts`
- [ ] Convert `controllers/scheduleController.js` → `scheduleController.ts`
- [ ] Convert `controllers/analyticsController.js` → `analyticsController.ts`
- [ ] Convert all routes to `.ts`
- [ ] Convert `server.js` → `server.ts`
- [ ] Update `package.json` scripts (`start`, `dev` to use `ts-node`)
- [ ] Delete all `.js` files that have `.ts` equivalents
- [ ] Enable `strict: true` in `tsconfig.json`
- [ ] Fix all type errors
- [ ] Run all tests — verify 100% pass

---

### Milestone 10: Feature Completion — Settings Stubs

| Attribute | Value |
|-----------|-------|
| **Objective** | Implement change password, export data, clear data, delete account |
| **Estimated time** | 2-3 days |
| **Risk level** | Medium (new backend endpoints, data modification) |
| **Portfolio impact** | Medium (shows feature completion) |
| **Files affected** | `backend/src/controllers/authController.ts`, `backend/src/routes/authRoutes.ts`, `backend/src/schemas/authSchema.ts`, `frontend/src/screens/SettingsScreen.tsx`, `frontend/src/services/api.ts` |
| **Testing requirements** | Tests for all new endpoints |
| **Git commit** | `feat: implement change password, data export, account deletion` |

**Tasks:**
- [ ] Backend: Add `changePassword` endpoint (verify current, hash new, update)
- [ ] Backend: Add `exportData` endpoint (return all user data as JSON)
- [ ] Backend: Add `clearAllData` endpoint (delete all tasks, subjects, schedules)
- [ ] Backend: Add `deleteAccount` endpoint (delete user → cascade deletes all data)
- [ ] Backend: Add Zod schemas for all new endpoints
- [ ] Backend: Write tests for all new endpoints
- [ ] Frontend: Wire `handleChangePassword` to real API
- [ ] Frontend: Wire `handleClearData` to real API
- [ ] Frontend: Wire delete account to real API
- [ ] Frontend: Implement export data (download/share JSON)
- [ ] Frontend: Update profile to call real API (not just AsyncStorage)

---

### Milestone 11: CI/CD & Documentation

| Attribute | Value |
|-----------|-------|
| **Objective** | GitHub Actions pipeline, README, API documentation |
| **Estimated time** | 1-2 days |
| **Risk level** | Low |
| **Portfolio impact** | Very High (shows DevOps maturity) |
| **Files affected** | `.github/workflows/ci.yml` (new), `README.md` (new/updated), `backend/API_DOCS.md` (new) |
| **Testing requirements** | CI pipeline runs and passes |
| **Git commit** | `chore: add CI/CD pipeline, README, and API documentation` |

**Tasks:**
- [ ] Create `.github/workflows/ci.yml`:
  - Backend: install, lint, test
  - Frontend: install, lint, type-check
- [ ] Create comprehensive `README.md`:
  - Project overview
  - Architecture diagram
  - Setup instructions (backend + frontend)
  - Environment variables
  - Database setup
  - Scripts
  - Tech stack
  - Screenshots
- [ ] Create `backend/API_DOCS.md` with all endpoints documented
- [ ] Add `CONTRIBUTING.md` with coding standards
- [ ] Update `.gitignore` to ensure `.env` is excluded
- [ ] Verify CI pipeline passes on push

---

### Milestone 12: AI Features (Optional, Post-Modernization)

| Attribute | Value |
|-----------|-------|
| **Objective** | Implement smart task scheduling and deadline conflict warnings |
| **Estimated time** | 3-5 days |
| **Risk level** | Low (additive features on stable foundation) |
| **Portfolio impact** | Medium (nice differentiator) |
| **Files affected** | New backend endpoints, new frontend components |
| **Testing requirements** | Tests for new endpoints |
| **Git commit** | `feat: add smart task scheduling and deadline conflict warnings` |

**Tasks:**
- [ ] Backend: Add `GET /api/tasks/suggest-times` endpoint (analyzes schedule + workload)
- [ ] Backend: Add deadline conflict check to task creation response
- [ ] Frontend: Show suggested study times in TaskDetailScreen
- [ ] Frontend: Show conflict warning banner when creating tasks with clustered deadlines
- [ ] Backend: Add study time predictor (historical average by subject + priority)
- [ ] Frontend: Show predicted duration when creating tasks

---

### 12.2 Summary Timeline

| Milestone | Time | Risk | Portfolio Impact |
|-----------|------|------|-----------------|
| M1: Foundation Tooling | 1-2 days | Low | High |
| M2: Backend Tests + Validation | 3-4 days | Low | Very High |
| M3: Frontend Types + Hooks + Utils | 3-4 days | Low | High |
| M4: Component Library + Adoption | 3-4 days | Medium | High |
| M5: ScheduleScreen Refactor | 2-3 days | High | Very High |
| M6: TaskDetail + Settings Refactor | 3-4 days | Medium | High |
| M7: Analytics + Tasks Refactor | 2-3 days | Medium | High |
| M8: Subjects + Dashboard + Auth Refactor | 2-3 days | Low | Medium |
| M9: Backend TypeScript Migration | 2-3 days | Medium | High |
| M10: Feature Completion | 2-3 days | Medium | Medium |
| M11: CI/CD + Documentation | 1-2 days | Low | Very High |
| M12: AI Features (Optional) | 3-5 days | Low | Medium |

**Total estimated time: 27-40 days (4-8 weeks part-time, 2-3 weeks full-time)**

### 12.3 Rules for Future Engineers (Human or AI)

1. **Every milestone leaves the app in a deployable state.** Never merge broken code.
2. **One milestone per PR.** Do not combine unrelated work.
3. **Tests must pass before merging.** No exceptions.
4. **Do not rewrite code that works.** Refactor = extract + reorganize, not rewrite.
5. **TypeScript is added during refactoring, not before.** Type what you touch.
6. **Components are adopted before new ones are created.** Use what exists first.
7. **No `any` types.** If you can't type it, you don't understand it well enough.
8. **No `// @ts-ignore`.** Fix the type error properly.
9. **Keep the backend security hardening.** Never remove Helmet, rate limiting, or lockout logic.
10. **Keep the ThemeContext as-is.** It is well-designed and needs no changes.
11. **Keep the notificationService as-is.** It is well-structured and needs no changes.
12. **Do not introduce Redux, Zustand, or React Query.** Context + custom hooks are sufficient.
13. **Every new file must have a clear purpose.** If you can't explain why it exists, don't create it.
14. **Follow the folder structure in Phase 4.** Do not create new top-level folders.
15. **Commit messages follow conventional commits.** `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`.

---

### 12.4 What NOT to Change

| File/Component | Reason |
|---------------|--------|
| `ThemeContext.js` | Well-designed, 48+ tokens, system detection, persistence — production quality |
| `authContext.js` | Clean API, proper error handling, 401 integration — production quality |
| `api.js` (Axios setup) | Well-structured interceptors, service objects — production quality |
| `notificationService.js` | Well-encapsulated singleton, complete CRUD — production quality |
| `authController.js` | Account lockout, brute-force protection, email enumeration prevention — production quality |
| `server.js` security middleware | Helmet, rate limiting, CORS, JWT validation — production quality |
| `auth.js` middleware | Clean JWT verification — production quality |
| All backend models | Proper definitions, associations, ENUMs — production quality |
| All backend routes | Thin, RESTful, consistent — production quality |
| `utils/constants.js` | Well-organized, extracted colors/presets — production quality |
| `utils/dateUtils.js` | Clean date utilities — production quality |
| Migration system | Proper Umzug setup — production quality |

---

### 12.5 Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| TypeScript coverage | 0% frontend, ~15% backend | 100% both |
| Test coverage | 0% | 70%+ backend, 50%+ frontend |
| Largest file | 1,486 lines (ScheduleScreen) | <400 lines |
| Components used by screens | 0/11 | 25+/25+ |
| Custom hooks | 0 | 10+ |
| ESLint errors | Unknown | 0 |
| CI/CD pipeline | None | GitHub Actions |
| API documentation | None | Complete |
| Settings stubs | 4 stubbed | 0 stubbed |
| N+1 queries | 1 (SubjectsScreen) | 0 |
| Duplicate API calls | 4 screens | 0 |
| Portfolio score | 6.5/10 | 9/10 |

---

*This document is the master plan. Every future engineering effort on Smart Student Planner must reference this blueprint and follow its milestones in order.*