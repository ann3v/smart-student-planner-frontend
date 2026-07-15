# Smart Student Planner — Complete Engineering Report

---

## PHASE 1 — PROJECT DISCOVERY

### Repository Structure Overview

```
SchoolProject/
├── backend/
│   ├── .env                         # Environment variables (secrets, DB credentials)
│   ├── .gitignore
│   ├── package.json                 # Backend dependencies & scripts
│   ├── server.js                    # Express entry point & server startup
│   ├── sequelize.config.js          # Sequelize multi-environment DB config
│   ├── setup-database.js            # Database initialization script
│   ├── migrate.js                   # Umzug migration runner
│   ├── add-indexes.js               # Manual index creation utility
│   ├── migrations/
│   │   ├── 001-create-users.js
│   │   ├── 002-create-subjects.js
│   │   ├── 003-create-tasks.js
│   │   ├── 004-create-schedule.js
│   │   ├── 005-add-reminders.js
│   │   ├── 006-add-task-indexes.js
│   │   └── 1767981752401-undefined.js    # Empty/placeholder migration
│   └── src/
│       ├── config/
│       │   └── database.js          # Sequelize instance configuration
│       ├── controllers/
│       │   ├── authController.js    # Register, login, verify email, profile
│       │   ├── taskController.js    # CRUD + toggle completion + today/upcoming tasks
│       │   ├── subjectController.js # CRUD subjects
│       │   ├── scheduleController.js# CRUD + today/weekly schedule
│       │   └── analyticsController.js # Productivity stats, overdue, workload
│       ├── middleware/
│       │   └── auth.js             # JWT verification middleware
│       ├── models/
│       │   ├── index.js            # Model associations and exports
│       │   ├── user.js             # User model with password methods
│       │   ├── subject.js          # Subject model
│       │   ├── task.js             # Task model (priority, reminders, duration)
│       │   └── schedule.js         # Schedule model (day/time slots, activity type)
│       └── routes/
│           ├── authRoutes.js
│           ├── taskRoutes.js
│           ├── subjectRoutes.js
│           ├── scheduleRoutes.js
│           └── analyticsRoutes.js
├── frontend/
│   ├── .gitignore
│   ├── package.json                # Frontend dependencies & scripts
│   ├── app.json                    # Expo configuration
│   ├── App.js                      # Root component, navigation, notifications
│   ├── index.js                    # Entry point (registerRootComponent)
│   ├── assets/                     # Icons and splash images (4 PNG files)
│   └── src/
│       ├── context/
│       │   ├── authContext.js       # Authentication state & methods
│       │   └── ThemeContext.js      # Light/dark theme with persistence
│       ├── navigation/
│       │   └── MainTabNavigator.js # Bottom tab navigator (5 tabs)
│       ├── screens/
│       │   ├── LoginScreen.js       # Email/password login
│       │   ├── RegisterScreen.js    # Registration with validation
│       │   ├── VerifyScreen.js      # Email verification code entry
│       │   ├── DashboradScreen.js   # Dashboard overview (stats, today's tasks, schedule)
│       │   ├── TaskScreen.js        # Task list with filters, CRUD modal
│       │   ├── TaskDetailScreen.js  # Task detail view, edit, reminders
│       │   ├── ScheduleScreen.js    # Weekly schedule with visual time slots
│       │   ├── SubjectsScreen.js    # Subject management with task counts
│       │   ├── AnalyticsScreen.js   # Charts, stats, completion rate, workload
│       │   └── SettingsScreen.js    # Profile, notifications, theme, logout
│       ├── services/
│       │   ├── api.js               # Axios instance, interceptors, all API services
│       │   └── notificationService.js # Expo notification scheduling & management
│       └── utils/
│           └── dateUtils.js         # Date formatting/parsing utilities
```

### File Count Summary

| Layer | Files | Lines of Code (approx.) |
|-------|-------|------------------------|
| Backend Config & Setup | 6 | ~350 |
| Backend Models | 5 | ~250 |
| Backend Controllers | 5 | ~900 |
| Backend Middleware | 1 | ~27 |
| Backend Routes | 5 | ~65 |
| Backend Migrations | 7 | ~300 |
| Frontend Config | 4 | ~300 |
| Frontend Context | 2 | ~280 |
| Frontend Navigation | 1 | ~63 |
| Frontend Screens | 10 | ~5,800 |
| Frontend Services | 2 | ~545 |
| Frontend Utils | 1 | ~60 |
| **TOTAL** | **~49** | **~8,940** |

-------------------------------------------------------

## PHASE 2 — EXECUTIVE SUMMARY

### What This Application Is

Smart Student Planner is a full-stack mobile productivity application built with React Native (Expo) and a Node.js/Express backend backed by PostgreSQL. It is designed specifically for university students to manage their academic life — tasks, subjects, weekly schedules, and productivity analytics — all within a single mobile app.

### What Problem It Solves

University students struggle with:
- Tracking assignments, homework, and deadlines across multiple subjects
- Managing weekly class schedules and study sessions
- Understanding their own productivity patterns
- Keeping all academic organization in one place

This app solves these problems by providing:
- A centralized task management system with priority levels and due dates
- A weekly schedule planner with visual time slots and conflict detection
- Subject organization with color coding
- Productivity analytics with charts (completion rates, study hours, task distribution)
- Push notification reminders for tasks and scheduled sessions
- Email-verified authentication for secure access

### Target Audience

- University/college students (primary)
- High school students with complex schedules
- Anyone needing structured academic task and schedule management

### Main Purpose

To be a comprehensive academic companion that replaces scattered tools (paper planners, separate todo apps, calendar apps) with a single, purpose-built mobile application.

### Current Maturity

**MVP/Beta** — The application has a complete, working feature set with functioning authentication, CRUD operations for all entities, schedule management, and analytics. However, several features are stubbed out (change password API, export data, clear all data, account deletion), the profile update only works locally, and there are some quality issues that suggest it has not been through rigorous QA or production hardening.

It feels like a **well-executed MVP** that has evolved with additional features (reminders, dark mode, analytics) but hasn't yet been polished for production release.

-------------------------------------------------------

## PHASE 3 — TECH STACK

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | (runtime) | JavaScript runtime for server-side code |
| **Express.js** | ^4.18.2 | Web framework for REST API routing and middleware |
| **PostgreSQL** | (database) | Relational database for structured data storage |
| **Sequelize** | ^6.32.1 | ORM for database modeling, queries, and migrations |
| **Umzug** | ^3.8.2 | Migration framework for managing database schema changes |
| **bcryptjs** | ^2.4.3 | Password hashing with bcrypt algorithm (10 salt rounds) |
| **jsonwebtoken** | ^9.0.0 | JWT creation and verification for stateless authentication |
| **nodemailer** | ^6.9.8 | Email sending (SMTP) for verification codes |
| **dotenv** | ^16.0.3 | Environment variable loading from .env file |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing for API access |
| **nodemon** | ^2.0.22 | Development server auto-restart on file changes |
| **pg** | ^8.11.0 | PostgreSQL native driver for Node.js |
| **moment** | ^2.29.4 | Date/time manipulation in the backend |

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React Native** | 0.81.5 | Mobile UI framework |
| **Expo** | ~54.0.30 | Managed React Native development platform |
| **TypeScript** | (via Expo) | Type safety (though most code is plain JS with JSX) |
| **React Navigation** | ^7.x | Stack + Bottom Tab navigation |
| **@react-navigation/stack** | ^7.6.13 | Stack navigator for auth flow and detail screens |
| **@react-navigation/bottom-tabs** | ^7.9.0 | Bottom tab navigator for main app sections |
| **Axios** | ^1.13.2 | HTTP client with interceptors for API calls |
| **AsyncStorage** | 2.2.0 | Persistent local key-value storage |
| **expo-notifications** | ~0.27.0 | Local push notification scheduling |
| **react-native-chart-kit** | ^6.12.0 | Chart components (Line, Pie, Bar charts) |
| **react-native-svg** | 15.12.1 | SVG rendering (dependency of chart-kit) |
| **@react-native-community/datetimepicker** | ^8.4.4 | Native date/time picker modals |
| **react-native-gesture-handler** | ~2.28.0 | Gesture handling (navigation dependency) |
| **react-native-safe-area-context** | ~5.6.0 | Safe area insets for notches/status bars |
| **react-native-screens** | ~4.16.0 | Native screen containers (navigation optimization) |
| **@expo/vector-icons** | ^15.0.3 | Material Icons for UI elements |
| **moment** | ^2.30.1 | Date manipulation and formatting |
| **expo-status-bar** | ~3.0.9 | Status bar configuration |
| **victory-native** | ^41.20.2 | Alternative charting library (listed but not used in current code) |

### Why Each Key Technology Was Chosen

1. **Express.js** — Lightweight, unopinionated web framework; ideal for a RESTful API with no overhead. The developer chose it over heavier frameworks like Nest.js for simplicity.

2. **PostgreSQL + Sequelize** — PostgreSQL provides ACID compliance, strong relational integrity, and excellent performance for structured data. Sequelize was chosen over raw SQL or Knex for its model-based approach, built-in validations, and migration support.

3. **JWT Authentication** — Stateless tokens eliminate the need for server-side session storage, making the API horizontally scalable. The 7-day expiry balances security with user convenience.

4. **bcryptjs** — Industry-standard password hashing with salt rounds (10) provides strong protection against credential theft.

5. **Nodemailer + Gmail SMTP** — Free email delivery for verification codes without requiring a paid email service like SendGrid.

6. **Expo** — Chosen over bare React Native for simplified build/deployment, OTA updates, and built-in access to native APIs (notifications, permissions) without native module linking.

7. **React Navigation** — The standard navigation solution for React Native; stack navigator handles auth flows, bottom tabs handle the main app structure.

8. **Axios** — Cleaner API than fetch with built-in request/response interceptors for token injection and 401 handling.

9. **AsyncStorage** — Simple, persistent local storage for tokens, user data, settings, and notification state. No backend needed for these local preferences.

10. **expo-notifications** — Local notifications for task and schedule reminders without requiring a push notification server.

11. **react-native-chart-kit** — Lightweight charting with Line, Pie, and Bar charts; sufficient for basic analytics visualization.

-------------------------------------------------------

## PHASE 4 — COMPLETE ARCHITECTURE

### Architectural Pattern: Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│                   (React Native / Expo)                      │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Screens    │  Navigation  │   Context    │   Services     │
│  (10 files)  │ (Stack+Tab)  │ Auth + Theme │ api + notify   │
└──────┬───────┴──────┬───────┴──────┬───────┴───────┬────────┘
       │              │              │               │
       │    HTTP/Axios (JSON)        │   AsyncStorage│
       │              │              │   (Local)     │
       ▼              │              ▼               │
┌──────────────────────────────────────────────────────────────┐
│                     API LAYER                                 │
│                 (Node.js / Express)                           │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│   Routes     │  Middleware  │ Controllers  │    Services     │
│  (5 files)   │   auth.js    │  (5 files)   │ (Nodemailer)    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬────────┘
       │              │              │                │
       │     Sequelize ORM          │      SMTP (Gmail)
       │              │              │
       ▼              ▼              │
┌──────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                 │
│                  (PostgreSQL)                                 │
├──────────────┬──────────────┬──────────────┬─────────────────┤
│    Users     │   Subjects   │    Tasks     │    Schedule     │
│   (table)    │   (table)    │   (table)    │    (table)      │
└──────────────┴──────────────┴──────────────┴─────────────────┘
```

### Data Flow

**Authentication Flow:**
1. User enters credentials on LoginScreen/RegisterScreen
2. AuthContext calls authService (Axios) → POST to /api/auth/login or /register
3. Backend authController validates credentials, returns JWT + user data
4. AuthContext stores token and user data in AsyncStorage
5. Axios interceptor attaches Bearer token to all subsequent requests
6. Backend auth middleware verifies JWT on protected routes
7. On 401 response, interceptor triggers forced logout via callback

**Email Verification Flow:**
1. Registration creates user with isVerified=false
2. Backend generates 6-digit code, hashes it with bcrypt, stores hash + expiry
3. Nodemailer sends code via Gmail SMTP
4. User enters code on VerifyScreen
5. Backend compares bcrypt hash, sets isVerified=true, returns JWT

**Task CRUD Flow:**
1. TaskScreen loads tasks via taskService → GET /api/tasks
2. Backend taskController queries Task model with optional filters (completed, subjectId, priority, date range)
3. Sequelize includes associated Subject via JOIN
4. Frontend renders FlatList with filter tabs (All/Pending/Completed)
5. Create/Update via modal → POST/PUT to /api/tasks
6. Toggle completion via PATCH /api/tasks/:id/toggle

**Schedule Flow:**
1. ScheduleScreen loads weekly schedule via scheduleService → GET /api/schedule/weekly
2. Backend groups schedule items by dayOfWeek (0-6)
3. Frontend renders visual time slots positioned absolutely based on start/end times
4. Conflict detection happens client-side before create/update
5. Day selector allows navigation between days of the week

**Analytics Flow:**
1. AnalyticsScreen loads productivity data via analyticsService
2. Backend computes: tasks per day (GROUP BY date), completion rate, tasks by priority, tasks by subject, study hours per day
3. Frontend renders: LineChart (productivity trend), PieChart (subject distribution), BarChart (study hours), custom views for completion rate and overdue tasks
4. Time range selector (week/month/semester) filters data via query params

### State Management

The app uses **React Context API** for state management (no Redux or Zustand):

1. **AuthContext** — Manages user state, token, login/register/verify/logout functions. Consumed by all authenticated screens.
2. **ThemeContext** — Manages light/dark/system theme preference, persisted to AsyncStorage. Provides theme object to all components.

Individual screens manage their own local state using `useState` hooks. This is adequate for the current scale but could become unwieldy with more complex features.

### Navigation Architecture

```
Root Stack Navigator (App.js)
├── [Auth Screens - when token is null]
│   ├── Login (headerShown: false)
│   ├── Register
│   └── Verify
├── [Main App Screens - when token exists]
│   ├── MainTabs (headerShown: false)
│   │   ├── Dashboard (tab)
│   │   ├── Tasks (tab)
│   │   ├── Schedule (tab)
│   │   ├── Subjects (tab)
│   │   └── Analytics (tab)
│   ├── TaskDetail (stack push)
│   └── Settings (stack push)
```

The app uses a single Stack Navigator with conditional screen rendering based on authentication state. When `userToken` is null, only auth screens are available. When a token exists, the MainTabs (bottom tab navigator with 5 tabs) and additional stack screens (TaskDetail, Settings) are shown.

### Architectural Decisions & Rationale

1. **Monolithic API Server** — Single Express server handles all functionality rather than microservices. Appropriate for this scale; would only split if certain functions needed independent scaling.

2. **RESTful API Design** — Standard resource-based endpoints (/api/tasks, /api/subjects) with HTTP verbs (GET, POST, PUT, DELETE, PATCH). Consistent and predictable.

3. **Client-Side Schedule Conflict Detection** — Rather than querying the database for conflicts, the app loads all schedule items and checks overlaps in JavaScript. Simpler to implement but could be moved server-side for better reliability.

4. **Local Notification Storage** — Notifications are stored locally in AsyncStorage rather than in the database. This means they're device-specific and not synced across devices.

5. **Static API URL** — The API URL is hardcoded (`http://10.21.23.148:5000/api`) rather than configured via environment variables. This is a development convenience but a production concern.

6. **No Input Validation Library** — Validation is done manually in both frontend (Alert.alert checks) and backend (Sequelize model validations only). No Joi/Zod/yup used.

7. **No API Versioning** — All routes are under /api/ with no version prefix. Adding /api/v1/ would allow backward-compatible API evolution.

-------------------------------------------------------

## PHASE 5 — DATABASE ANALYSIS

### Database: PostgreSQL (`student_planner`)

### Tables

#### 1. `users`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| email | STRING | NOT NULL, UNIQUE | User's email address |
| passwordHash | STRING | NOT NULL | Bcrypt-hashed password |
| name | STRING | NULLABLE | User's display name |
| isVerified | BOOLEAN | NOT NULL, DEFAULT false | Email verification status |
| verificationCodeHash | STRING | NULLABLE | Bcrypt-hashed 6-digit code |
| verificationExpiresAt | DATE | NULLABLE | Code expiry timestamp |
| createdAt | DATE | DEFAULT NOW | Account creation timestamp |

**Indexes:**
- `users_email_index` (UNIQUE on email) — Fast email lookups for login/registration

#### 2. `subjects`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| userId | INTEGER | FK → users(id), CASCADE DELETE | Owning user |
| name | STRING | NOT NULL | Subject name |
| color | STRING | DEFAULT '#3498db' | Color code for UI display |
| createdAt | DATE | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `subjects_user_id_index` — Fast lookup of user's subjects

**Foreign Keys:**
- `userId` → `users(id)` ON DELETE CASCADE

#### 3. `tasks`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| userId | INTEGER | FK → users(id), CASCADE DELETE | Owning user |
| subjectId | INTEGER | FK → subjects(id), SET NULL | Associated subject |
| title | STRING | NOT NULL | Task title |
| description | TEXT | NULLABLE | Task details |
| priority | ENUM | 'low', 'medium', 'high', DEFAULT 'medium' | Priority level |
| dueDate | DATE | NULLABLE | Deadline |
| estimatedDuration | INTEGER | NULLABLE | Duration in minutes |
| completed | BOOLEAN | DEFAULT false | Completion status |
| reminderEnabled | BOOLEAN | DEFAULT true | Whether reminders are on |
| reminderMinutesBefore | INTEGER | DEFAULT 30 | Minutes before deadline |
| reminderSent | BOOLEAN | DEFAULT false | Whether reminder was sent |
| createdAt | DATE | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `tasks_user_id_index` — User's tasks lookup
- `tasks_subject_id_index` — Tasks by subject lookup
- `tasks_due_date_index` — Deadline-based queries
- `tasks_completed_index` — Completion status filtering
- `tasks_user_completed_index` — Composite index on (userId, completed)

**Foreign Keys:**
- `userId` → `users(id)` ON DELETE CASCADE
- `subjectId` → `subjects(id)` ON DELETE SET NULL

#### 4. `schedule`

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK, AUTO_INCREMENT | Unique identifier |
| userId | INTEGER | FK → users(id), CASCADE DELETE | Owning user |
| subjectId | INTEGER | FK → subjects(id), SET NULL | Associated subject |
| taskId | INTEGER | FK → tasks(id), SET NULL | Linked task |
| dayOfWeek | INTEGER | NOT NULL | 0-6 (Sunday-Saturday) |
| startTime | TIME | NOT NULL | Session start time |
| endTime | TIME | NOT NULL | Session end time |
| activityType | ENUM | 'class','study','break','other', DEFAULT 'study' | Session type |
| title | STRING | NOT NULL | Session name |
| isRecurring | BOOLEAN | DEFAULT true | Weekly recurrence |
| reminderEnabled | BOOLEAN | DEFAULT true | Reminder toggle |
| reminderMinutesBefore | INTEGER | DEFAULT 15 | Minutes before session |
| createdAt | DATE | DEFAULT NOW | Creation timestamp |

**Indexes:**
- `schedule_user_id_index` — User's schedule lookup
- `schedule_day_of_week_index` — Day-based queries

**Foreign Keys:**
- `userId` → `users(id)` ON DELETE CASCADE
- `subjectId` → `subjects(id)` ON DELETE SET NULL
- `taskId` → `tasks(id)` ON DELETE SET NULL

### Entity Relationships

```
User (1) ──────< (N) Subject
  │                    │
  │                    │
  │ (1)               │ (1)
  │                    │
  ▼                    ▼
Task (N) ────────────< Subject
  │
  │ (1)
  ▼
Schedule (N) ───────> Task (0..1)
  │
  └────────────────> Subject (0..1)
```

### Database Strengths

1. **Proper foreign keys with CASCADE/SET NULL** — Referential integrity is maintained; deleting a user cascades to all their data; deleting a subject keeps associated tasks (set to NULL)
2. **Well-chosen indexes** — Composite index on (userId, completed) optimizes the most common query pattern; individual indexes on common filter columns
3. **bcrypt for sensitive data** — Both passwords and verification codes are hashed with bcrypt, not stored in plaintext
4. **Migration system** — Umzug tracks which migrations have been run, enabling incremental schema evolution
5. **ENUM types** — Priority and activityType use PostgreSQL ENUMs, providing data integrity at the database level

### Database Weaknesses

1. **No email uniqueness at database level for verified users** — The unique constraint on email exists, but there's no way to prevent multiple unverified accounts with the same email (though this is mitigated by the application logic checking before creation)
2. **No foreign key index on schedule.taskId** — Queries finding schedules linked to a task might be slower without this index
3. **Empty migration file** (`1767981752401-undefined.js`) — A no-op migration that suggests an incomplete or abandoned migration effort
4. **`reminderSent` flag not used** — The field exists in tasks but there's no server-side cron job or job queue to actually send email reminders and mark them as sent
5. **No soft deletes** — All deletions are permanent with no `deletedAt` timestamp for recovery
6. **Sequelize `sync({ alter: true })` in production startup** — The server auto-alters tables on startup, which is risky in production (should rely on migrations exclusively)

### Authentication Flow

1. **Registration** → Creates user with `isVerified=false` + generated 6-digit code (bcrypt hashed, 15-min expiry) → Sends code via email → Returns `requiresVerification: true`
2. **Verification** → User submits email + code → Backend compares bcrypt hashes → Sets `isVerified=true` → Returns JWT
3. **Login** → Validates email + password → Checks `isVerified` (returns 403 if not verified) → Returns JWT (7-day expiry)
4. **Auth Middleware** → Extracts Bearer token from Authorization header → Verifies JWT → Fetches User by ID → Attaches to `req.user`

### User Roles

There is **no role system**. All users have equal permissions — they can only access their own data (enforced by userId filtering in all queries). There is no admin role or moderator role.

### Permissions

- All authenticated users can CRUD their own tasks, subjects, and schedule items
- No user can access another user's data (userId WHERE clause on every query)
- No shared/collaborative features exist

-------------------------------------------------------

## PHASE 6 — FEATURE INVENTORY

### Feature 1: User Authentication (Email + Password)

**Purpose:** Secure user registration, login, and session management.

**How It Works:**
- Registration with name, email, password validation
- Email verification via 6-digit code sent through Gmail SMTP
- JWT-based authentication with 7-day token expiry
- Auto-logout on 401 responses via Axios interceptor
- Persistent sessions via AsyncStorage

**Main Files:**
- Frontend: `LoginScreen.js`, `RegisterScreen.js`, `VerifyScreen.js`, `authContext.js`, `api.js`
- Backend: `authController.js`, `auth.js` (middleware), `user.js` (model)

**Database Interactions:**
- `users` table: INSERT on registration, SELECT on login, UPDATE on verification
- AsyncStorage: userToken, userData keys

**User Flow:**
1. Register → Enter email + password + name → Receive verification code email → Enter code → Auto-login
2. Login → Enter credentials → Access main app
3. Logout → Clear local storage → Return to login screen

**Implementation Quality:** Solid. Email verification is well-designed with bcrypt-hashed codes and expiry. Password visibility toggle. Input validation on both frontend and backend.

**Missing Functionality:**
- Password reset/forgot password flow is completely absent
- No OAuth/social login (Google, Apple)
- No biometric authentication
- Email cannot be changed after registration
- Change password UI exists but the API call is stubbed out (commented "Here you would call an API to change password")

---

### Feature 2: Task Management

**Purpose:** Create, view, edit, delete, and organize academic tasks with priorities and due dates.

**How It Works:**
- Full CRUD operations via REST API
- Filter tasks by status (All/Pending/Completed)
- Filter by subject and priority on the backend
- Toggle completion with a single tap
- Tasks display with color-coded subject tags and priority indicators
- Reminder badges show count of active reminders per task

**Main Files:**
- Frontend: `TaskScreen.js`, `TaskDetailScreen.js`, `api.js` (taskService)
- Backend: `taskController.js`, `task.js` (model), `taskRoutes.js`

**Database Interactions:**
- `tasks` table: SELECT (with filters and JOINs), INSERT, UPDATE, DELETE
- Includes Subject association via Sequelize `include`

**User Flow:**
1. View task list with filter tabs (All/Pending/Completed)
2. Tap "+" FAB → Opens modal → Enter title, description, due date, priority → Create
3. Tap task → Navigate to TaskDetailScreen → View full details, edit, set reminders, mark complete, delete
4. Tap checkbox on list item → Toggle completion instantly

**Implementation Quality:** Strong. The task list supports FlatList for performance on large lists, has proper empty states, and the detail screen provides comprehensive editing including subject assignment, priority changes, date/time pickers, and estimated duration.

**Missing Functionality:**
- No search/filter by text
- No bulk operations (delete multiple, mark multiple complete)
- No subtasks or task dependencies
- No file attachments
- No task recurrence (for repeating assignments)
- No drag-to-reorder
- No task categories or tags beyond subjects

---

### Feature 3: Subject Management

**Purpose:** Organize tasks under academic subjects with color coding.

**How It Works:**
- CRUD for subjects with name and color
- 12-color palette for visual distinction
- Each subject card shows total/completed/pending task counts
- Subjects can be assigned to tasks and schedule items
- Deleting a subject cascades to associated tasks

**Main Files:**
- Frontend: `SubjectsScreen.js`, `api.js` (subjectService)
- Backend: `subjectController.js`, `subject.js` (model), `subjectRoutes.js`

**Database Interactions:**
- `subjects` table: Full CRUD
- `tasks` table: Queried per subject to compute counts

**User Flow:**
1. View all subjects as cards with color indicators
2. Tap "+" → Enter name, select color → Create
3. Long-press or tap edit → Modify name/color
4. Tap delete → Confirmation dialog → Cascading delete
5. Tap subject card → Navigate to Tasks filtered by that subject

**Implementation Quality:** Good. Color picker with preview is well-designed. Task counts per subject provide useful at-a-glance information. However, loading tasks individually per subject (N+1 queries) is inefficient.

**Missing Functionality:**
- No subject description or instructor info
- No grade tracking within subjects
- No credit hours or weight
- No semester/term organization

---

### Feature 4: Weekly Schedule

**Purpose:** Plan and visualize weekly class/study schedules with time slots.

**How It Works:**
- CRUD for schedule items with day, time range, activity type, subject/task linking
- Visual time slot rendering (absolute positioning based on time)
- Day selector with session count badges
- Schedule conflict detection (overlapping time ranges)
- Recurrence toggle for weekly repeating sessions
- Per-session reminder settings

**Main Files:**
- Frontend: `ScheduleScreen.js` (1486 lines — the largest file), `api.js` (scheduleService)
- Backend: `scheduleController.js`, `schedule.js` (model), `scheduleRoutes.js`

**Database Interactions:**
- `schedule` table: Full CRUD
- Includes Subject and Task associations

**User Flow:**
1. View weekly schedule with day selector (Sun-Sat)
2. See visual time blocks positioned on a timeline (8AM-10PM)
3. Tap "+" → Enter title, select day, set start/end times, choose activity type → Create
4. Tap existing block → Edit or delete
5. Long-press → Delete with confirmation
6. Conflict warning if new item overlaps existing one

**Implementation Quality:** Impressive. The schedule screen is the most complex component with visual time slot positioning, custom toggle for recurring, reminder scheduling, and comprehensive conflict detection. The UI is polished with icons per activity type and color-coded blocks.

**Missing Functionality:**
- No drag to resize/reposition time slots
- No multi-week view
- No calendar month view
- No import/export to system calendar
- No room/location field
- Conflict detection is client-side only (could be bypassed by direct API calls)

---

### Feature 5: Analytics Dashboard

**Purpose:** Visualize productivity metrics and track academic performance over time.

**How It Works:**
- Fetches productivity data from backend aggregation queries
- Renders LineChart (daily task completion trend)
- Renders PieChart (tasks by subject distribution)
- Renders BarChart (study hours per day of week)
- Shows completion rate percentage
- Displays priority distribution
- Lists overdue tasks with warnings
- Shows upcoming workload distribution
- Time range selector (Week/Month/Semester)

**Main Files:**
- Frontend: `AnalyticsScreen.js`, `api.js` (analyticsService)
- Backend: `analyticsController.js`, `analyticsRoutes.js`

**Database Interactions:**
- Multiple aggregation queries on `tasks` table (COUNT, GROUP BY)
- Raw SQL query for tasks-by-subject with JOIN
- Schedule data processed in application code for study hours

**User Flow:**
1. Navigate to Analytics tab
2. See overview stats (total/completed/pending)
3. Select time range (Week/Month/Semester)
4. View charts and metrics
5. See overdue tasks highlighted in red
6. View upcoming workload preview

**Implementation Quality:** Good but with some rough edges. The analytics controller has fallback handling for NaN/Infinity values and empty datasets. Charts handle empty states gracefully. However, the study hours calculation is done in application code rather than SQL, and the raw SQL query for tasksBySubject bypasses Sequelize's query building.

**Missing Functionality:**
- No export (PDF/CSV) of analytics
- No goal setting or target tracking
- No streak tracking (consecutive days completing tasks)
- No comparison to previous periods
- No GPA or grade integration
- No custom date ranges (only 3 presets)

---

### Feature 6: Push Notifications & Reminders

**Purpose:** Remind users about upcoming task deadlines and scheduled sessions.

**How It Works:**
- Uses expo-notifications for local push notifications
- Task reminders: scheduled X minutes before due date
- Schedule reminders: scheduled X minutes before session start
- Stores notification metadata in AsyncStorage
- Supports cancel, cancel-all-for-task, cancel-all-for-schedule
- Notification tap deep-links to relevant screen (TaskDetail or Schedule)
- Notification settings persisted locally

**Main Files:**
- Frontend: `notificationService.js` (447 lines), `App.js` (listener setup)
- Backend: None (notifications are fully client-side)

**Database Interactions:**
- None. All notification data is in AsyncStorage.

**User Flow:**
1. App requests notification permissions on first launch
2. User creates task with due date → Optional reminder scheduling
3. User can add reminders from TaskDetailScreen with preset times (5min, 15min, 30min, 1hr, 1day)
4. User can add reminders from ScheduleScreen when creating/editing schedule items
5. When notification fires → User taps → App navigates to relevant content
6. View/manage active reminders from Settings screen

**Implementation Quality:** Comprehensive for a client-side only implementation. The notification service is well-structured as a singleton class with methods for scheduling, canceling, rescheduling, and querying reminders. The deep-linking logic is sensible.

**Missing Functionality:**
- No server-side push notifications (requires a push notification service like Expo Push or FCM)
- Notifications don't work if app is force-closed on some Android devices (known Expo limitation)
- No recurring reminder patterns
- No quiet hours / do-not-disturb settings
- No notification grouping or channels (Android)

---

### Feature 7: Dashboard Overview

**Purpose:** At-a-glance summary of the student's day.

**How It Works:**
- Parallel API calls to fetch today's tasks, upcoming tasks, today's schedule, and stats
- Stats cards: Total Tasks, Completed, Pending
- Quick action grid: Tasks, Schedule, Subjects, Analytics
- Today's tasks preview (top 3)
- Today's schedule preview (top 3)
- Pull-to-refresh and auto-refresh on focus

**Main Files:**
- Frontend: `DashboradScreen.js` (note: typo in filename "Dashborad"), `api.js`

**Database Interactions:**
- Multiple reads via different endpoints

**User Flow:**
1. App opens → Dashboard is the default tab
2. See personalized greeting with name
3. View stats and quick access to other sections
4. See today's priorities at a glance
5. Pull down to refresh

**Implementation Quality:** Functional but basic. The dashboard does what it needs to but could be more engaging. The API makes 4 parallel calls which is efficient.

**Missing Functionality:**
- No motivational elements (streaks, achievements)
- No weather or contextual information
- No upcoming events beyond today
- No customizable widgets
- No quick-add for tasks from dashboard

---

### Feature 8: Dark Mode / Theming

**Purpose:** Support light and dark visual modes with system preference detection.

**How It Works:**
- ThemeContext provides complete light and dark theme objects
- 48 color tokens covering backgrounds, text, borders, status colors, chart colors
- Three modes: Light, Dark, System (auto-detect)
- Theme preference persisted in AsyncStorage
- All screens and components use theme-aware styles

**Main Files:**
- Frontend: `ThemeContext.js`
- All screens (useTheme hook)

**Implementation Quality:** Well-implemented. The theme objects are comprehensive with named tokens for every visual element. The system auto-detection properly responds to OS-level changes.

**Missing Functionality:**
- No custom theme creation
- No font size customization
- No high-contrast accessibility theme

---

### Feature 9: Settings Screen

**Purpose:** Centralized user preferences and account management.

**How It Works:**
- Profile section with avatar (initial-based) and edit modal
- Notification toggles: Push, Task Reminders, Study Reminders, Weekly Recap
- Active reminders count badge with view/manage modal
- Appearance: Light/Dark/System theme selector
- Account: Change Password (UI exists, API stubbed), Export Data (stub), Help & Support (stub)
- Danger Zone: Clear All Data (stub), Delete Account (stub), Logout (functional)

**Main Files:**
- Frontend: `SettingsScreen.js` (860 lines)

**Implementation Quality:** The UI is well-organized with clear sections and consistent styling. However, many features are UI-only with no backend implementation.

**Missing Functionality:**
- Change Password API endpoint doesn't exist
- Export Data has no implementation
- Clear All Data has no API call
- Delete Account has no implementation
- No notification sound selection
- No language selection

---

### Feature 10: Dashboard Notification Integration

**Purpose:** Handle notification taps for deep linking.

**How It Works:**
- App.js sets up notification listeners in useEffect
- On notification tap, checks data.type ('task-reminder' or 'schedule-reminder')
- Navigates to TaskDetail or Schedule screen accordingly

**Main Files:**
- Frontend: `App.js` (lines 114-157)

**Implementation Quality:** Basic but functional. The navigation ref is properly set up for imperative navigation from notification handlers.

-------------------------------------------------------

## PHASE 7 — UI / UX REVIEW

### Navigation

**Strengths:**
- Bottom tab navigation with 5 clear, labeled sections
- Stack navigation for detail screens with back button support
- Conditional screen rendering based on auth state prevents unauthorized access
- Settings accessible from dashboard header (gear icon)

**Weaknesses:**
- No swipe-to-go-back gesture configuration
- Tab bar lacks badges for pending task counts
- No deep linking configuration in app.json
- No haptic feedback on tab switches

### Layouts & Spacing

**Strengths:**
- Consistent 20px padding on most screens
- Cards have consistent border radius (10-12px)
- Good use of white space (well, themed space) between sections
- Proper safe area handling with SafeAreaView

**Weaknesses:**
- Schedule screen's time slot rendering is complex but can feel cramped on smaller phones
- Some modals have inconsistent border radius (10px vs 15px vs 20px)
- No tablet-optimized layouts (app would stretch on iPad)

### Consistency

**Strengths:**
- Consistent color scheme: Primary blue (#4A90E2/#5A9FFF), semantic colors for status
- Consistent icon usage (MaterialIcons throughout)
- Consistent FAB button style across screens (position, size, color, shadow)
- Theme-aware styling applied consistently

**Weaknesses:**
- Mix of #4A90E2 and #5A9FFF as primary colors across different files
- Some inline styles use hardcoded colors instead of theme tokens
- "Dashborad" typo in filename
- Inconsistent use of hardcoded vs. dynamic colors in StyleSheet

### Accessibility

**Current State:** Minimal accessibility considerations.

**Missing:**
- No accessibilityLabels on interactive elements
- No accessibilityRole attributes
- No screen reader support (TalkBack/VoiceOver)
- No font scaling support
- No reduced motion preferences
- No high-contrast mode

### Loading States

**Strengths:**
- Login/Register buttons show "Logging in..." / "Creating Account..." text when loading
- Dashboard shows "Loading..." spinner during initial auth check
- TaskDetailScreen shows "Loading task details..." while fetching
- ActivityIndicator used appropriately in auth context

**Weaknesses:**
- No skeleton screens or shimmer effects
- No loading indicators on individual API calls in most screens
- FlatList doesn't show loading during initial data fetch

### Error Handling

**Strengths:**
- Alert.alert used consistently for user-facing errors
- API interceptor handles 401 globally with forced logout
- Console.error logging throughout for debugging

**Weaknesses:**
- Error messages are generic ("Failed to load tasks") — no specific guidance
- No retry buttons on error states
- No offline detection or handling
- Network errors show generic messages without distinguishing no-internet from server-error
- No error boundary components

### Empty States

**Strengths:**
- Custom illustrations with icons for empty task list, empty schedule, empty subjects
- Descriptive text guiding users on next actions
- Empty schedule shows "Tap + to add a new session"

**Weaknesses:**
- Empty states could include a direct CTA button instead of just text

### Animations

**Current State:** Minimal to none.

- Modal presentations use "slide" animation (platform default)
- No custom animated transitions between screens
- No micro-interactions (button press feedback, list item animations)
- No Animated API usage anywhere in the codebase

### Visual Hierarchy

**Strengths:**
- Clear heading hierarchy (28px titles, 24px section headers, 16-18px body)
- Card-based layouts with shadows create clear content boundaries
- FAB buttons are prominent and consistently positioned
- Priority and status indicators use distinct colors for quick scanning

**Weaknesses:**
- Analytics screen has many sections stacked vertically — could benefit from horizontal tabs or collapsible sections
- Schedule screen day selector could be more prominent

### What Feels Polished

- **Schedule Screen** — Visual time slots with proper positioning, conflict detection, activity-type icons, and comprehensive modal form
- **Theme System** — Full light/dark support with system auto-detection and properly named tokens
- **Task Detail** — Comprehensive editing with inline date/time pickers, subject selector, duration preset buttons, and reminder management
- **Notification Service** — Well-structured singleton with clear API surface and AsyncStorage persistence

### What Feels Unfinished

- **Analytics Charts** — Basic chart-kit implementation without custom styling or interactivity
- **Dashboard** — Functional but generic; feels like a wireframe rather than a polished hub
- **Settings** — Many "coming soon" stubs suggest it was deprioritized
- **Login Screen** — Simple form with minimal branding; could use app logo, illustrations
- **Error Handling** — Generic error messages throughout; no offline support
- **Animations** — Completely absent

-------------------------------------------------------

## PHASE 8 — CODE QUALITY

### Folder Structure

**Rating: 7/10**

The project follows a conventional separation of concerns:
- Backend: config/controllers/middleware/models/routes — standard Express pattern
- Frontend: context/navigation/screens/services/utils — standard React Native pattern

**Issues:**
- No shared types/interfaces between frontend and backend (TypeScript could help)
- Migration files are in root-level `migrations/` folder instead of inside `src/`
- `DashboradScreen.js` has a typo in the filename
- Backend has both `setup-database.js` and `add-indexes.js` at root — these helper scripts could be in a `scripts/` folder

### Naming

**Rating: 6/10**

**Strengths:**
- Backend follows REST conventions consistently (createTask, getTasks, updateTask, deleteTask)
- Model files are singular (user.js, task.js)
- Service objects are well-named (authService, taskService, notificationService)

**Weaknesses:**
- `DashboradScreen.js` — typo in filename and import
- `newTask` state variable reused for both create and edit forms (conceptually should be `taskFormData`)
- Backend variable names are sometimes terse (`err` instead of `error`)
- Migration `1767981752401-undefined.js` has no descriptive name

### Reusability

**Rating: 5/10**

**Strengths:**
- Theme-aware styling via ThemeContext prevents repetitive color definitions
- API service layer centralizes all HTTP calls
- Date utilities extracted to shared module
- notificationService is a well-encapsulated singleton

**Weaknesses:**
- No shared UI component library — buttons, inputs, cards, modals are re-implemented in each screen
- The "Add" FAB button style is duplicated across TaskScreen, ScheduleScreen, SubjectsScreen (exact same 60px circle with shadow)
- Priority color function (`getPriorityColor`) is duplicated in DashboardScreen, TaskScreen, and TaskDetailScreen
- Modal patterns are repeated without a shared Modal component
- Form validation logic is duplicated across screens
- No custom hooks for common patterns (e.g., `useApiCall`, `useForm`, `useDataFetching`)

### Component Organization

**Rating: 5/10**

All UI is in screen files. There is no `components/` folder. The ScheduleScreen alone is 1486 lines because it includes the visual schedule rendering, modal forms, time pickers, day selectors, and all their styles inline.

**Missing components that should be extracted:**
- `FAB` (Floating Action Button)
- `PriorityBadge`
- `SubjectTag`
- `FilterTabs`
- `ModalForm`
- `StatCard`
- `EmptyState`
- `ConfirmDialog`
- `ThemeSelector`
- `SectionHeader`

### Code Duplication

**Significant duplication found:**

1. **Priority color function** — Duplicated 3 times (Dashboard, Tasks, TaskDetail) with identical logic
2. **FAB button styles** — Duplicated 3 times with identical dimensions and shadow
3. **Modal structure** — Same modal-container-content pattern repeated in every screen
4. **Filter button pattern** — Same row-of-buttons-with-active-state pattern in Tasks and Analytics
5. **Date formatting** — `formatDateLocal` in TaskDetailScreen duplicates logic from `dateUtils.js`
6. **Error handling pattern** — `Alert.alert('Error', ...)` repeated in every catch block

### Performance

**Rating: 6/10**

**Strengths:**
- FlatList used for task and subject lists (virtualized rendering)
- Parallel API calls with Promise.all in Dashboard and Analytics
- RefreshControl for pull-to-refresh pattern
- useCallback with useFocusEffect for screen focus refresh

**Weaknesses:**
- SubjectsScreen makes N+1 API calls (one per subject to fetch tasks)
- No memoization (React.memo, useMemo) on any components
- Schedule screen re-renders entire time column and all time slots on any state change
- No pagination — all tasks loaded at once
- Charts re-render on every state change
- No image caching strategy

### Type Safety

**Rating: 3/10**

The project uses plain JavaScript (`.js` files) throughout, with no TypeScript. There are:
- No PropTypes
- No JSDoc type annotations
- No TypeScript interfaces or types
- No runtime type checking

This means all type errors will only surface at runtime. Given the complexity of data structures (nested API responses, analytics data transformations), this is a significant risk.

### Architecture Consistency

**Rating: 7/10**

**Strengths:**
- Consistent controller → service → model pattern on backend
- Consistent screen → context → service → API pattern on frontend
- All authentication flows properly use the context
- Theme is applied consistently via useTheme() hook

**Weaknesses:**
- Backend analytics controller mixes raw SQL queries with Sequelize queries
- Frontend notificationService touches AsyncStorage directly (not through a repository pattern)
- Settings screen has incomplete API integrations (stubs)
- No consistent error class/code system on backend

### Technical Debt

**Identified Technical Debt:**

1. **Hardcoded IP address** in `api.js` (line 4): `http://10.21.23.148:5000/api` — should use environment variable or config
2. **Sequelize `sync({ alter: true })` in production** — risky schema changes on startup
3. **N+1 queries in SubjectsScreen** — loops through subjects making individual API calls
4. **Duplicate priority color logic** in 3 files
5. **No component library** — all UI is in screen files
6. **Empty migration** — `1767981752401-undefined.js` is a no-op
7. **Stubbed features** — Change password, export data, clear data, delete account have UI but no backend
8. **No test files** — Zero test coverage across the entire codebase
9. **No CI/CD** — No GitHub Actions, no deployment scripts
10. **No API documentation** — No Swagger/OpenAPI spec
11. **No linting or formatting config** — No ESLint or Prettier configuration visible
12. **`.env` committed to repository** — Contains real credentials (Gmail app password, JWT secret, DB password)

-------------------------------------------------------

## PHASE 9 — PERFORMANCE REVIEW

### Rendering Performance

**Current State:** Acceptable for MVP scale but has optimization opportunities.

**Concerns:**
- ScheduleScreen re-renders the entire time column and all positioned time slots on any state change (no React.memo)
- AnalyticsScreen has heavy chart rendering with data transformation on every state update
- No `useMemo` for computed values (priority colors, formatted dates, chart data preparation)
- No `React.memo` on list items

### State Updates

**Concerns:**
- Dashboard calls `loadData()` in both `useEffect` and `useFocusEffect`, causing duplicate API calls on initial render
- SubjectsScreen calls `loadSubjects()` in both `useEffect` and `useFocusEffect` — same duplication issue
- No debouncing on filter changes in TasksScreen
- No optimistic updates — UI waits for API response before reflecting changes

### Network Requests

**Strengths:**
- Promise.all for parallel requests in Dashboard (4 calls) and Analytics (3 calls)
- Axios instance with base URL for DRY configuration
- Request/response interceptors for centralized token management

**Weaknesses:**
- SubjectsScreen makes sequential requests (N subjects = N+1 API calls)
- No request caching — same data fetched repeatedly
- No retry logic for failed requests
- No request queuing or prioritization
- No offline support or local-first architecture

### Image Loading

**Current State:** Only static assets (icons, splash). No network images. Not a concern currently but would need optimization if profile photos or file attachments are added.

### Caching

**Current State:** Essentially no caching strategy.

- AsyncStorage caches token and user data (appropriate)
- Notification data cached in AsyncStorage (appropriate)
- No API response caching
- No in-memory cache for subjects/tasks
- No SWR or React Query for stale-while-revalidate patterns

### Pagination

**Not implemented.** All tasks, subjects, and schedule items are loaded in full. This works for small datasets (a student with dozens of tasks) but would degrade with hundreds.

### Expensive Renders

**Most expensive renders:**

1. **ScheduleScreen time slot positioning** — Computes absolute positioning for every time slot with percentage-based top and height calculations
2. **AnalyticsScreen chart rendering** — react-native-chart-kit redraws charts on every state change
3. **SubjectsScreen task count computation** — N+1 API calls followed by filtering operations

### Optimization Opportunities

**High Impact:**
1. Add React Query or SWR for automatic caching, refetching, and deduplication
2. Implement pagination or infinite scroll for task lists
3. Extract the schedule time slot rendering to a dedicated component with React.memo
4. Eliminate N+1 in SubjectsScreen (backend should return task counts in the subjects list endpoint)

**Medium Impact:**
1. Add useMemo for computed data transformations
2. Batch state updates to reduce re-renders
3. Implement optimistic updates for completion toggle

**Low Impact:**
1. Debounce filter changes
2. Lazy-load chart components

### Potential Bottlenecks

1. **Backend analytics queries** — Raw SQL aggregations on the tasks table could become slow with large datasets. Adding materialized views or caching layer would help.
2. **FlatList with many items** — Currently fine but would need `getItemLayout` optimization and `windowSize` tuning for larger lists.
3. **Concurrent API calls** — Four parallel calls on dashboard could saturate the connection pool on slow networks.

-------------------------------------------------------

## PHASE 10 — SECURITY REVIEW

### Critical Findings

🔴 **HIGH SEVERITY: `.env` file with real credentials**
The `.env` file at `backend/.env` contains:
- A real Gmail address: `arditavdiu637@gmail.com`
- A real Gmail app password: `cnyx tnbu mqrb qgqh`
- A PostgreSQL password: `Rasengan1.`
- JWT secret: `your_super_secret_jwt_key_change_this_in_production`

This file should be in `.gitignore` and these credentials should be rotated immediately since they've been exposed. The JWT secret is also weak and matches the default placeholder pattern.

🔴 **HIGH SEVERITY: Hardcoded test user credentials**
The server startup code creates a test user with email `student@umib.edu` and password `password123`. This is a backdoor that should not exist in production.

🟡 **MEDIUM SEVERITY: JWT secret is weak**
"your_super_secret_jwt_key_change_this_in_production" is a placeholder, not a cryptographically strong secret.

### Authentication

**Strengths:**
- Passwords hashed with bcrypt (10 salt rounds) — industry standard
- Verification codes also hashed with bcrypt before storage
- JWT tokens with expiry (7 days)
- Token-based stateless auth
- Auth middleware applied to all protected routes

**Weaknesses:**
- No token refresh mechanism — when the 7-day token expires, user must re-login
- No rate limiting on login attempts (brute force vulnerability)
- No account lockout after failed attempts
- No password strength requirements beyond 6 characters
- No session management or token revocation capability
- JWT stored in AsyncStorage (vulnerable to extraction on rooted devices, though this is a mobile limitation)

### Authorization

**Strengths:**
- Every database query includes `userId` filter to prevent cross-user data access
- Deletion and update operations verify ownership before proceeding
- Proper 401/403 status code usage

**Weaknesses:**
- No role-based access control
- No resource-level permissions
- All authenticated users have identical access levels

### Secrets Management

**Critical Issues:**
- All secrets in `.env` file (should use a secrets manager in production)
- `.env` file appears to be accessible (not in `.gitignore` definitively — need to verify)
- Hardcoded API URL with internal IP address
- SMTP credentials stored in plaintext in `.env`

### API Protection

**Strengths:**
- CORS enabled on all routes
- Request body parsing limited to JSON and URL-encoded
- 404 handler for undefined routes
- Global error handler masks stack traces in production

**Weaknesses:**
- No request size limiting
- No rate limiting on any endpoint
- No input sanitization beyond Sequelize type validation
- No Helmet.js or other security headers
- No CSRF protection (but less relevant for token-based mobile API)

### Storage Permissions

**Frontend AsyncStorage:**
- JWT token stored unencrypted in AsyncStorage (standard for mobile but worth noting)
- User data stored as plain JSON

**Backend Database:**
- PostgreSQL connection uses plaintext password in connection string
- No SSL/TLS configured for local development database connections
- Production config includes SSL but with `rejectUnauthorized: false` (vulnerable to MITM)

### Input Validation

**Current State:** Minimal.

- Backend relies primarily on Sequelize model validations (isEmail on user model, ENUM constraints)
- Frontend does basic validation (empty checks, email regex, password length)
- No validation for: description length, estimated duration range, schedule time logic (backend)
- No protection against NoSQL injection (not applicable) or SQL injection (Sequelize parameterization helps but raw SQL in analyticsController is parameterized)

### Data Privacy

**Concerns:**
- User email addresses stored in plaintext (necessary for login, but worth noting)
- All task and schedule data accessible to anyone with a valid token
- No data encryption at rest in database
- No data anonymization for analytics
- No GDPR/privacy compliance features (data export is stubbed, no account deletion)

### Potential Vulnerabilities

1. **Brute force login** — No rate limiting means an attacker could attempt unlimited password guesses
2. **Token theft via device compromise** — JWT in AsyncStorage could be extracted on rooted/jailbroken devices
3. **Email enumeration** — Different error responses for "Invalid credentials" vs "Account not verified" vs "Email already exists" allow an attacker to enumerate valid emails
4. **Verification code brute force** — 6-digit numeric codes could be brute-forced within the 15-minute window without rate limiting
5. **Lack of certificate pinning** — Mobile app could be MITM'd on compromised networks

-------------------------------------------------------

## PHASE 11 — PORTFOLIO VALUE

### Would This Impress Recruiters?

**Corporate/FAANG Recruiters: 5/10**
- They look for scale, testing, CI/CD, and production-readiness — all missing here
- However, the full-stack nature and real database integration is better than toy projects

**Startup Recruiters: 7/10**
- Demonstrates ability to ship a complete product from scratch
- Full-stack capability with mobile focus is valuable for startups
- Practical problem-solving (student productivity) shows product thinking
- The schedule visualizer and notification system show attention to UX detail

**Junior Hiring Managers: 8/10**
- This is well above the typical "todo app" project
- Shows understanding of authentication, database design, API architecture, mobile UI
- Multiple integrated features demonstrate systems thinking

**Internship Recruiters: 9/10**
- This would stand out significantly among intern candidates
- Full mobile app with backend, database, auth, and notifications is impressive
- Demonstrates initiative and ability to complete a complex project

### What Makes It Unique

1. **Purpose-built for students** — Not a generic productivity app; tailored with subjects, schedule visualization, and academic analytics
2. **Visual schedule** — The time-slot-based schedule with color coding and conflict detection is more sophisticated than typical student projects
3. **End-to-end notification system** — Local notifications with deep linking, rescheduling, and management
4. **Dark mode** — Full theme system with system-aware auto-detection is rare in student projects
5. **Full-stack ownership** — Both the API and mobile client were built by the same developer

### What Makes It Average

1. **No tests** — This is a major gap for portfolio review
2. **No TypeScript** — Type safety is increasingly expected
3. **No CI/CD** — No evidence of professional deployment practices
4. **No component library** — All UI is monolithic in screen files
5. **Security gaps** — Credentials in .env, no rate limiting, hardcoded test user
6. **Missing polish** — Several stubbed features, no animations, basic error handling

### What Should Definitely Be Improved

1. **Add tests** — At minimum, unit tests for backend controllers and some component tests
2. **Migrate to TypeScript** — Even partial migration would demonstrate type safety awareness
3. **Remove credentials from .env** — Rotate secrets, add .env to .gitignore
4. **Extract shared components** — Show understanding of component architecture
5. **Add a README** — With setup instructions, architecture docs, screenshots
6. **Implement at least one stubbed feature** — Change password or data export
7. **Add API documentation** — Swagger/OpenAPI spec would demonstrate professional practices
8. **Set up CI/CD** — GitHub Actions for linting, testing, and maybe deployment

### Portfolio Score: 6.5/10

This is a solid full-stack mobile project that demonstrates real engineering capability beyond tutorial-level work. The score is held back primarily by the lack of testing, TypeScript, and production readiness. With the improvements listed above, this could easily be an 8.5/10 portfolio piece.

-------------------------------------------------------

## PHASE 12 — ROADMAP

### Quick Wins (1–2 Days)

| Priority | Task | Impact |
|----------|------|--------|
| 🔴 HIGH | Remove `.env` from repository; rotate all credentials | Security |
| 🔴 HIGH | Remove hardcoded test user creation from server startup | Security |
| 🔴 HIGH | Move API URL to environment variable or config file | Architecture |
| 🟡 MEDIUM | Fix "DashboradScreen" typo in filename and imports | Code Quality |
| 🟡 MEDIUM | Extract `getPriorityColor` to shared utility | DRY |
| 🟡 MEDIUM | Extract FAB button to shared component | Reusability |
| 🟡 MEDIUM | Extract Modal wrapper to shared component | Reusability |
| 🟡 MEDIUM | Add PropTypes or JSDoc to API service layer | Type Safety |
| 🟢 LOW | Add a comprehensive README.md | Portfolio |
| 🟢 LOW | Remove empty migration file | Code Quality |
| 🟢 LOW | Delete unused `victory-native` dependency | Bundle Size |

### Medium Improvements (1–2 Weeks)

| Priority | Task | Impact |
|----------|------|--------|
| 🔴 HIGH | Add backend rate limiting (express-rate-limit) | Security |
| 🔴 HIGH | Implement password change backend endpoint | Feature |
| 🔴 HIGH | Add account deletion endpoint | Feature/Privacy |
| 🟡 MEDIUM | Implement N+1 fix — return task counts in subjects list response | Performance |
| 🟡 MEDIUM | Add pagination to tasks endpoint (limit/offset) | Performance |
| 🟡 MEDIUM | Add duplicate API call prevention (useFocusEffect + useEffect clash) | Performance |
| 🟡 MEDIUM | Extract shared components (FAB, PriorityBadge, EmptyState, etc.) | Code Quality |
| 🟡 MEDIUM | Add ESLint + Prettier configuration | Code Quality |
| 🟡 MEDIUM | Write unit tests for backend controllers | Testing |
| 🟡 MEDIUM | Add forgot password / password reset flow | Feature |
| 🟡 MEDIUM | Add login attempt rate limiting | Security |
| 🟡 MEDIUM | Add verification code attempt rate limiting | Security |
| 🟢 LOW | Add skeleton loading screens | UX |
| 🟢 LOW | Add app logo to login/register screens | UX |
| 🟢 LOW | Add haptic feedback on key interactions | UX |
| 🟢 LOW | Add swipe-to-delete on task list items | UX |

### Major Features (1–2 Months)

| Priority | Task | Impact |
|----------|------|--------|
| 🔴 HIGH | Migrate project to TypeScript (frontend + backend) | Code Quality |
| 🔴 HIGH | Add comprehensive test suite (unit + integration + E2E) | Testing |
| 🟡 MEDIUM | Implement server-side push notifications (Expo Push) | Feature |
| 🟡 MEDIUM | Add offline support with local-first architecture | Feature |
| 🟡 MEDIUM | Implement recurring tasks (daily/weekly/monthly assignments) | Feature |
| 🟡 MEDIUM | Add grade/GPA tracking module | Feature |
| 🟡 MEDIUM | Add file attachments to tasks (camera, file picker, cloud storage) | Feature |
| 🟡 MEDIUM | Build shared component library with Storybook | Code Quality |
| 🟡 MEDIUM | Add API documentation (Swagger/OpenAPI) | Documentation |
| 🟡 MEDIUM | Set up CI/CD pipeline (GitHub Actions: lint, test, deploy) | DevOps |
| 🟡 MEDIUM | Add calendar sync (Google Calendar, Apple Calendar) | Feature |
| 🟡 MEDIUM | Add study timer / Pomodoro integration | Feature |
| 🟢 LOW | Add tablet-optimized layouts | UX |
| 🟢 LOW | Add widget support (iOS home screen, Android widget) | Feature |
| 🟢 LOW | Add collaborative/shared subjects for group projects | Feature |
| 🟢 LOW | Add natural language task input ("Math homework due Friday") | Feature |
| 🟢 LOW | Add AI-powered study recommendations based on analytics | Feature |

### Priority by Impact

1. **Security hardening** (rate limiting, credential management) — Non-negotiable for any production use
2. **Testing** — Critical for portfolio value and professional credibility
3. **TypeScript migration** — Highest long-term code quality improvement
4. **Component extraction** — Enables faster feature development
5. **Offline support** — Dramatically improves user experience
6. **Push notifications** — Moves from local-only to truly useful notifications

-------------------------------------------------------

## PHASE 13 — RESUME & PORTFOLIO CONTENT

### Professional Project Description

**Smart Student Planner** is a full-stack mobile application built with React Native (Expo) and Node.js/Express, backed by PostgreSQL. It helps university students manage their academic life through task management, weekly schedule planning, subject organization, and productivity analytics — all within a single, beautifully designed mobile experience. The app features secure JWT authentication with email verification, local push notifications for task and schedule reminders, a visual time-slot-based schedule view with conflict detection, interactive analytics charts (completion rates, study hours, task distribution), and a comprehensive light/dark theme system.

### Resume Bullet Points

- **Engineered a full-stack mobile application** (React Native + Expo + Node.js/Express + PostgreSQL) serving as a comprehensive academic productivity platform for university students
- **Designed and implemented a RESTful API** with JWT authentication, email verification (Nodemailer), and Sequelize ORM managing 4 relational database tables with proper foreign key constraints and performance indexes
- **Built a visual weekly schedule system** with time-slot-based rendering, overlap conflict detection, and activity type categorization (class/study/break)
- **Developed a productivity analytics dashboard** featuring Line, Pie, and Bar charts (react-native-chart-kit) with time-range filtering (week/month/semester) using SQL aggregation queries
- **Implemented a notification service** using expo-notifications with scheduled local reminders, deep-linking navigation, and full reminder lifecycle management (create/cancel/reschedule)
- **Created a dynamic theming system** supporting light, dark, and system-auto modes with 48+ semantic color tokens applied consistently across 10 screens
- **Integrated secure authentication** with bcrypt password hashing, 6-digit email verification codes, and automatic session management via Axios interceptors

### Technical Highlights

1. **Full-stack ownership** — Both the Express API and React Native client were built from scratch, including database schema design, migration system, and mobile UI
2. **Database design** — 4-table PostgreSQL schema with proper foreign keys, cascading deletes, composite indexes, and ENUM types for data integrity
3. **Visual schedule renderer** — Custom time-slot positioning algorithm using absolute layout with percentage-based top/height calculations mapped to time ranges
4. **Notification architecture** — Singleton service class with AsyncStorage persistence, supporting 3 notification types (task, schedule, custom) with full CRUD management
5. **Analytics engine** — SQL aggregation queries (GROUP BY, COUNT, JOIN) processed in Express controllers with NaN/Infinity-safe data transformations before chart rendering

### Key Engineering Accomplishments

- Built a complete, working product with 10 screens, 5 backend controllers, and 4 database models
- Implemented a migration system (Umzug) for version-controlled database schema evolution
- Designed a conflict detection algorithm for schedule time slots using interval overlap mathematics
- Created a notification system with local persistence, deep-linking navigation, and CRUD management
- Built a theming infrastructure that supports runtime theme switching across all components

### Tech Stack Summary

```
Frontend:  React Native 0.81, Expo SDK 54, React Navigation 7, Axios,
           react-native-chart-kit, expo-notifications, AsyncStorage,
           @react-native-community/datetimepicker, MaterialIcons

Backend:   Node.js, Express.js 4.18, Sequelize 6.32, PostgreSQL,
           JWT (jsonwebtoken), bcryptjs, Nodemailer, Umzug

Tools:     npm, Expo CLI, nodemon, Postman (testing)
```

### Architecture Summary

```
Mobile App (React Native/Expo)
  ├── Auth Flow (Stack Navigator)
  │   ├── Login → Register → Verify Email
  └── Main App (Bottom Tab Navigator)
      ├── Dashboard (stats, quick actions, today's view)
      ├── Tasks (list, filter, CRUD, completion toggle)
      ├── Schedule (visual weekly planner, time slots)
      ├── Subjects (color-coded subject management)
      └── Analytics (charts, completion rate, workload)
      └── Settings (profile, theme, notifications, logout)
          ↓ HTTP/Axios
REST API (Node.js/Express)
  ├── Auth Middleware (JWT verification)
  ├── Controllers (business logic, validation)
  └── Sequelize ORM
      ↓ SQL
PostgreSQL Database (4 tables, 10+ indexes)
```

### Interview Talking Points

**"Tell me about this project."**
Smart Student Planner is a full-stack mobile app I built to solve a real problem I observed — students juggling multiple tools for task management, scheduling, and tracking academic progress. I built the entire thing myself: the React Native frontend with Expo, the Node.js/Express backend, and the PostgreSQL database. It has task management with priorities, a visual weekly schedule with conflict detection, productivity analytics with charts, and push notification reminders.

**"What was the most challenging part?"**
The schedule screen was the most technically challenging. I had to build a visual timeline that renders time slots as absolutely-positioned blocks based on their start and end times, with proper scaling from 8AM to 10PM. I also implemented conflict detection that checks for overlapping time intervals and warns users before saving. The entire screen ended up being nearly 1500 lines of code — I'd refactor it into smaller components in a future iteration.

**"What would you do differently?"**
Three things: First, I'd start with TypeScript from day one — catching type errors at compile time would have saved debugging hours. Second, I'd use React Query or SWR instead of manual data fetching with useEffect — it would handle caching, deduplication, and background refetching automatically. Third, I'd build a shared component library from the start rather than duplicating UI elements across screens.

**"How does authentication work?"**
Users register with email and password. The password is hashed with bcrypt (10 rounds). A 6-digit verification code is generated, also bcrypt-hashed, stored with a 15-minute expiry, and emailed via Nodemailer through Gmail SMTP. After verification, the backend issues a JWT (7-day expiry) which the mobile app stores in AsyncStorage. An Axios interceptor automatically attaches the token to every request. If a 401 is received, the interceptor triggers a forced logout.

**"What's your database design?"**
Four tables: users, subjects, tasks, and schedule. Users have many subjects, tasks, and schedule items. Subjects have many tasks. Tasks and subjects can optionally link to schedule items. I used foreign keys with appropriate ON DELETE behaviors (CASCADE for user-owned data, SET NULL for subject/task references). I added composite indexes on commonly queried column combinations like (userId, completed) for performance.

### What I Learned From Building This

1. **Full-stack architecture design** — How to design a REST API, database schema, and mobile client that work together coherently
2. **Authentication flows** — Implementing JWT-based auth with email verification, token management, and secure password handling
3. **State management patterns** — Using React Context for auth and theme, and understanding when Context is sufficient vs. when Redux would be needed
4. **Mobile-specific concerns** — Safe area handling, keyboard avoidance, platform-specific date pickers, notification permissions
5. **Database performance** — Indexing strategies, query optimization, the importance of avoiding N+1 queries
6. **Technical debt awareness** — Recognizing when code duplication, missing tests, and hardcoded values will become problems as a project scales
7. **The importance of TypeScript** — After building a project this size in plain JavaScript, I deeply appreciate why TypeScript is valuable for catching bugs early

-------------------------------------------------------

## PHASE 14 — FINAL VERDICT

### What Level of Developer Built This Project?

**Assessment: Junior+ (Junior moving toward Mid-level)**

**Reasoning:**

This developer demonstrates skills that exceed a typical beginner:

✅ **Evidence of Junior+ capability:**
- Designed and implemented a complete full-stack application independently
- Understands relational database design with proper foreign keys, indexes, and migrations
- Implements authentication with bcrypt, JWT, and email verification — beyond basic auth tutorials
- Builds complex UI (visual schedule, analytics charts) that requires non-trivial state management
- Writes a well-structured notification service as a singleton class
- Understands HTTP interceptors for centralized auth token management
- Uses Promise.all for parallel API requests (performance awareness)
- Implements proper separation of concerns (models/controllers/routes, context/services/screens)
- Creates a comprehensive theming system with semantic tokens

❌ **Evidence of not yet Mid-level:**
- No tests whatsoever (a mid-level developer would include at least unit tests)
- No TypeScript (in 2026, mid-level developers typically use TypeScript for projects of this scale)
- Security oversights (hardcoded credentials, no rate limiting, test user in startup code)
- Significant code duplication (priority colors, FAB styles, modal patterns repeated)
- No component abstraction (all UI in screen files)
- No CI/CD or deployment automation
- N+1 query problem in SubjectsScreen suggests incomplete understanding of database performance
- No error boundary, no proper error taxonomy
- Stubbed features without clear TODO/planning

**Overall:** This is a **strong Junior+ developer** who can independently build a complete application from scratch. They understand the full stack, can make reasonable architectural decisions, and produce working, functional code. With mentorship on testing, TypeScript, component architecture, and production best practices, they would progress quickly to mid-level.

### Time Estimate for an Experienced Engineer

**An experienced (senior) full-stack mobile engineer would need approximately:**

| Component | Estimated Time |
|-----------|---------------|
| Database design + migrations | 3-4 hours |
| Backend API (auth + CRUD + analytics) | 8-12 hours |
| Frontend auth flow (3 screens) | 4-6 hours |
| Dashboard screen | 3-4 hours |
| Task list + detail screens | 8-10 hours |
| Schedule screen (visual timeline) | 12-16 hours |
| Subjects screen | 3-4 hours |
| Analytics screen (charts) | 8-10 hours |
| Settings screen | 4-6 hours |
| Notification service | 6-8 hours |
| Theme system | 3-4 hours |
| Navigation setup | 2-3 hours |
| API service layer + interceptors | 2-3 hours |
| Testing (unit + integration) | 12-16 hours |
| Documentation | 4-6 hours |
| **TOTAL** | **~82-112 hours** |

**Real-world estimate: 2.5-3.5 weeks of focused full-time work** for a senior engineer to build this from scratch with tests, TypeScript, and production polish.

For a junior developer (like the one who built this), the actual time investment was likely **4-6 weeks** including learning and iteration.

---

*Report generated: July 15, 2026*
*Project: Smart Student Planner — Full Engineering Analysis*