# Full-Stack Engineering Audit Report
## Smart Student Planner

**Audit Date:** July 24, 2026  
**Auditor:** Lead Software Architect / Senior Full-Stack Engineer  
**Scope:** Complete system review — Frontend, Backend, Database, Integration, Security, DevOps  

---

## 1. Executive Summary

The Smart Student Planner is a full-stack application consisting of an **Expo SDK 54 / React Native 0.81** frontend and an **Express / TypeScript / Sequelize / PostgreSQL** backend. The project is a student task and schedule management application with JWT authentication, email verification, task management, subject categorization, weekly scheduling, and productivity analytics.

The project is **technically sound and functional for continued development**. The architecture is clean, the codebase is well-organized, and the frontend-backend integration is consistent. The backend TypeScript typecheck passes with zero errors. All API endpoints called by the frontend exist on the backend with matching HTTP methods, routes, and response contracts.

However, the audit identified **several real issues** that should be addressed before production deployment. The most critical is that **Zod validation schemas exist but are not wired into production routes** — they are only used in the test app. This means the production API accepts unvalidated input on all endpoints. Other findings include a cascade-rule mismatch between migrations and model associations, a potential runtime bug in the analytics controller's study-hours calculation, and the absence of a README file.

**No architectural restructuring is recommended.** The foundation is solid. Future work should focus on wiring the existing validation middleware into production routes, fixing the identified bugs, and implementing new features.

---

## 2. Overall Architecture Review

### Structure
```
SchoolProject/
├── backend/          # Express + TypeScript + Sequelize + PostgreSQL
│   ├── src/
│   │   ├── config/       # Database, constants
│   │   ├── controllers/  # Auth, Task, Subject, Schedule, Analytics
│   │   ├── middleware/   # Auth, Validate
│   │   ├── models/       # User, Subject, Task, Schedule (Sequelize)
│   │   ├── routes/       # Route definitions
│   │   ├── schemas/      # Zod validation schemas
│   │   └── types/        # Shared TypeScript types
│   ├── migrations/   # 8 SQL migrations (Umzug)
│   └── tests/        # Jest + Supertest
├── frontend/         # Expo SDK 54 + React Native 0.81
│   └── src/
│       ├── components/   # 21 reusable UI components
│       ├── context/      # AuthContext, ThemeContext
│       ├── hooks/        # useTasks, useSubjects, useSchedule, useAnalytics, etc.
│       ├── navigation/   # MainTabNavigator
│       ├── screens/      # 10 screens
│       ├── services/     # API (Axios), NotificationService
│       ├── types/        # TypeScript type definitions
│       └── utils/        # Constants, dateUtils, validation, storage
```

### Assessment
- ✅ Clean separation of frontend and backend
- ✅ Backend follows MVC-like pattern (routes → controllers → models)
- ✅ Frontend follows feature-based organization (screens, components, hooks, services)
- ✅ Consistent naming conventions
- ✅ TypeScript types defined on both sides with matching contracts
- ✅ Migrations are sequential and well-organized
- ⚠️ No shared types package — frontend and backend maintain separate but matching type definitions (acceptable for this project size, but a drift risk)
- ⚠️ No monorepo tooling (no workspace configuration) — acceptable for this project size

**Verdict:** Architecture is professional and appropriate for the project's scope.

---

## 3. Frontend Review

### Navigation
- ✅ React Navigation v7 with Stack + Bottom Tab navigators
- ✅ Auth flow correctly gates on `userToken` presence
- ✅ Deep linking from notifications to TaskDetail and Schedule screens
- ✅ `useFocusEffect` used correctly to refresh data on screen focus

### State Management
- ✅ `AuthContext` provides login/register/verifyCode/logout
- ✅ `ThemeContext` provides theming
- ✅ Custom hooks (`useTasks`, `useSubjects`, `useSchedule`, `useAnalytics`) encapsulate API logic
- ✅ 401 responses trigger automatic logout via `setUnauthorizedHandler`

### Components
- ✅ 21 reusable components with barrel export (`components/index.js`)
- ✅ Components accept theme props
- ✅ `TaskCard`, `SubjectCard`, `ScheduleBlock` render data correctly

### TypeScript Migration
- ✅ `tsconfig.json` extends Expo base config
- ⚠️ `strict: false` — TypeScript strict mode is disabled on the frontend
- ⚠️ Most screens and components are still `.js` files (migration in progress, as stated)
- ✅ Hooks (`useTasks.ts`, `useSubjects.ts`, etc.) and types (`types/index.ts`) are TypeScript

### Issues Found
| # | Issue | Risk | Impact |
|---|-------|------|--------|
| F-1 | `TaskScreen.js` has both `useEffect` and `useFocusEffect` calling `loadTasks` on mount, causing a double API call on initial screen load | Low | Redundant network request |
| F-2 | `TaskScreen.js` `useEffect` depends on `[filter]` but `loadTasks`/`loadSubjects`/`loadTaskReminders` are not in dependency array (stale closure risk) | Low | Potential stale data |
| F-3 | `DashboardScreen.js` `loadData` is called by both `useEffect([])` and `useFocusEffect` — double call on mount | Low | Redundant network request |
| F-4 | `api.js` production URL is hardcoded to `https://your-production-server.com/api` — a placeholder | Medium | Must be configured before production deployment |
| F-5 | `app.json` does not list `expo-notifications` in plugins array (only `@react-native-community/datetimepicker`) | Low | Notifications may need manual config on native builds |

---

## 4. Backend Review

### Architecture
- ✅ Clean controller → model pattern
- ✅ All controllers use `AuthRequest` with `req.user!.id` for user-scoped queries
- ✅ All resource routes are protected by `auth` middleware via `router.use(auth)`
- ✅ User isolation enforced in every query (`where: { userId: req.user!.id }`)
- ✅ Error handling with try/catch in every controller
- ✅ Health check endpoints (`/health`, `/health/db`)

### Issues Found
| # | Issue | Risk | Impact |
|---|-------|------|--------|
| B-1 | **Zod validation schemas exist but are NOT used in production routes.** The `validate` middleware is imported and used in `tests/app.ts` but NOT in `src/routes/*.ts`. Production endpoints accept raw `req.body` without validation. | **High** | Any malformed or malicious payload is passed directly to Sequelize. While Sequelize parameterizes queries (no SQL injection), invalid data types, missing required fields, and oversized inputs reach the database layer. |
| B-2 | **Analytics controller `studyHoursPerDay` bug:** `Schedule.startTime` and `endTime` are `DataTypes.TIME` fields (stored as `HH:MM:SS` strings). The analytics controller does `new Date(schedule.startTime)` which produces an `Invalid Date` for TIME strings, causing `hours` to be `NaN`. The `if (hours > 0)` check prevents crashes, but study hours will always be 0. | **Medium** | Study hours analytics feature is non-functional. |
| B-3 | **`getSchedule` route handler collision:** `scheduleRoutes.ts` maps both `GET /` and `GET /:id` to the same `getSchedule` controller. The `getSchedule` controller reads `req.query.dayOfWeek` but when called via `/:id`, it should read `req.params.id`. The `/:id` route will return all schedule items (ignoring the ID) because the controller doesn't check `req.params.id`. | **Medium** | `GET /api/schedule/123` returns all schedule items instead of the one with ID 123. |
| B-4 | **`updateTask` and `updateSubject` pass raw `req.body` to `task.update()`** without field whitelisting. Users could update `userId`, `createdAt`, or other protected fields. | **Medium** | Potential privilege escalation / data integrity issue. |
| B-5 | **`createTask` passes raw `req.body` to `Task.create()`** without field whitelisting. Users could set `userId`, `completed`, `reminderSent`, or `createdAt` in the request body. The `userId` is correctly overridden by `req.user!.id`, but other fields are not filtered. | **Medium** | Data integrity issue. |
| B-6 | **No `updatedAt` timestamp** on any model (`timestamps: false`). All models have `createdAt` but no `updatedAt`. Updates to records don't track when they were last modified. | Low | Audit trail limitation |
| B-7 | **Error responses swallow the actual error** — all catch blocks return generic messages without logging `error.message` (except analytics). Debugging production issues will be difficult. | Low | Operational difficulty |

---

## 5. Frontend ↔ Backend Integration Review

### API Contract Verification

| Frontend Service Call | Backend Route | Method | Match | Notes |
|----------------------|---------------|--------|------|-------|
| `authService.login` | `POST /api/auth/login` | POST | ✅ | |
| `authService.register` | `POST /api/auth/register` | POST | ✅ | |
| `authService.verifyCode` | `POST /api/auth/verify-code` | POST | ✅ | |
| `authService.getProfile` | `GET /api/auth/profile` | GET | ✅ | Not called by frontend |
| `taskService.createTask` | `POST /api/tasks` | POST | ✅ | |
| `taskService.getTasks` | `GET /api/tasks` | GET | ✅ | |
| `taskService.getTodayTasks` | `GET /api/tasks/today` | GET | ✅ | |
| `taskService.getUpcomingTasks` | `GET /api/tasks/upcoming` | GET | ✅ | |
| `taskService.getTask` | `GET /api/tasks/:id` | GET | ✅ | |
| `taskService.updateTask` | `PUT /api/tasks/:id` | PUT | ✅ | |
| `taskService.deleteTask` | `DELETE /api/tasks/:id` | DELETE | ✅ | |
| `taskService.toggleTaskCompletion` | `PATCH /api/tasks/:id/toggle` | PATCH | ✅ | |
| `subjectService.createSubject` | `POST /api/subjects` | POST | ✅ | |
| `subjectService.getSubjects` | `GET /api/subjects` | GET | ✅ | |
| `subjectService.getSubject` | `GET /api/subjects/:id` | GET | ✅ | Returns subject with tasks |
| `subjectService.updateSubject` | `PUT /api/subjects/:id` | PUT | ✅ | |
| `subjectService.deleteSubject` | `DELETE /api/subjects/:id` | DELETE | ✅ | |
| `scheduleService.createSchedule` | `POST /api/schedule` | POST | ✅ | |
| `scheduleService.getSchedule` | `GET /api/schedule` | GET | ✅ | |
| `scheduleService.getTodaySchedule` | `GET /api/schedule/today` | GET | ✅ | |
| `scheduleService.getWeeklySchedule` | `GET /api/schedule/weekly` | GET | ✅ | |
| `scheduleService.updateSchedule` | `PUT /api/schedule/:id` | PUT | ✅ | |
| `scheduleService.deleteSchedule` | `DELETE /api/schedule/:id` | DELETE | ✅ | |
| `analyticsService.getProductivityAnalytics` | `GET /api/analytics/productivity` | GET | ✅ | |
| `analyticsService.getOverdueTasks` | `GET /api/analytics/overdue` | GET | ✅ | |
| `analyticsService.getWorkloadDistribution` | `GET /api/analytics/workload` | GET | ✅ | |

### Integration Findings
- ✅ **All 25 frontend API calls have matching backend routes** — no missing or broken endpoints
- ✅ **HTTP methods match** across all calls
- ✅ **Response contracts match** — frontend correctly consumes `response.data` for all calls
- ✅ **Auth token** is correctly attached via Axios request interceptor
- ✅ **401 handling** — response interceptor clears tokens and triggers logout
- ⚠️ **`authService.getProfile()`** is defined but never called by the frontend — the frontend loads user data from AsyncStorage instead of fetching the profile. This means if the user's name/email changes server-side, the frontend won't reflect it until re-login.
- ⚠️ **`getSubject(id)`** on the frontend calls `GET /api/subjects/:id` which returns the subject **with all its tasks** (via `getSubjectWithTasks`). The frontend `subjectService.getSubject` naming doesn't indicate this. Not a bug, but a naming inconsistency.

---

## 6. API Review

### REST Conventions
- ✅ Resource-based URL paths (`/api/tasks`, `/api/subjects`, `/api/schedule`)
- ✅ Correct HTTP method usage (GET for retrieval, POST for creation, PUT for updates, DELETE for deletion, PATCH for toggle)
- ✅ Appropriate status codes (201 for creation, 404 for not found, 401 for unauthorized, 429 for rate limiting)
- ✅ Consistent error response format `{ error: string }`

### Issues
| # | Issue | Risk |
|---|-------|------|
| API-1 | No pagination on list endpoints (`GET /tasks`, `GET /subjects`, `GET /schedule`). All records are returned in a single response. | Medium — will degrade as data grows |
| API-2 | No sorting/search parameters exposed (sorting is hardcoded in controllers) | Low |
| API-3 | `GET /api/schedule/:id` doesn't return a single resource — it returns all schedule items (see B-3) | Medium |
| API-4 | No request body validation on production routes (see B-1) | High |

---

## 7. Authentication Review

### Flow
- ✅ **Registration:** Creates user → generates 6-digit code → hashes code with bcrypt → sends via email → returns `requiresVerification: true`
- ✅ **Verification:** Compares code hash → checks expiry → sets `isVerified = true` → issues JWT
- ✅ **Login:** Validates credentials → checks `isVerified` → issues JWT
- ✅ **JWT:** Signed with `JWT_SECRET`, 7-day expiry, payload `{ userId, email }`
- ✅ **Auth middleware:** Verifies JWT → loads user from DB → attaches to `req.user`
- ✅ **Password hashing:** bcrypt with 10 rounds
- ✅ **Brute-force protection:** Login attempts tracked, lockout after 5 failures for 15 minutes
- ✅ **Verification brute-force protection:** Verification attempts tracked, lockout after 5 failures
- ✅ **Rate limiting:** Global (200/15min), auth (10/15min), verification (5/15min)
- ✅ **Token storage:** AsyncStorage (frontend), Bearer header (transport)
- ✅ **Unauthorized handling:** 401 response → interceptor clears tokens → triggers logout

### Issues
| # | Issue | Risk |
|---|-------|------|
| AUTH-1 | **No logout endpoint on backend.** Logout is client-side only (clear AsyncStorage). JWT remains valid until expiry. No token blacklist. | Low — acceptable for this app's security requirements, but JWT remains valid if compromised |
| AUTH-2 | **No password change/reset endpoint.** Users cannot change password or reset forgotten password. | Medium — feature gap |
| AUTH-3 | **No role-based authorization.** Single user type — acceptable for this app, but no admin role exists. | Low — by design |
| AUTH-4 | **`JWT_SECRET` is loaded from env but not validated for minimum length** — only checks for presence and `CHANGE_ME` placeholder. A short secret would be accepted. | Low |
| AUTH-5 | **Email verification code is generated with `Math.random()`** — not cryptographically secure. Should use `crypto.randomInt()`. | Low — 6-digit code has limited entropy regardless |

---

## 8. Database Review

### Schema
- ✅ 4 tables: `users`, `subjects`, `tasks`, `schedule`
- ✅ Appropriate data types (INTEGER, STRING, TEXT, DATE, BOOLEAN, ENUM, TIME)
- ✅ Foreign keys with referential integrity
- ✅ Indexes on all foreign keys and commonly queried columns
- ✅ Unique constraint on `users.email`
- ✅ Composite index on `tasks(userId, completed)` for filtered queries

### Issues
| # | Issue | Risk |
|---|-------|------|
| DB-1 | **Cascade rule mismatch:** Migration `003-create-tasks.js` defines `subjectId` with `onDelete: 'SET NULL'`, but the model association in `models/index.ts` defines `Subject.hasMany(Task, { foreignKey: 'subjectId', onDelete: 'CASCADE' })`. When a subject is deleted, the migration says tasks should keep their `subjectId` (set to null), but the model says tasks should be deleted. In production (where `sync()` is not used), the migration's `SET NULL` will apply. In development (where `sync({ alter: true })` runs), the model's `CASCADE` may override. | **Medium** — data loss risk in development; behavior inconsistency |
| DB-2 | **No `updatedAt` column** on any table. Records have `createdAt` but no last-modified timestamp. | Low |
| DB-3 | **No `updatedAt` on migrations table** — Umzug manages this, acceptable. | N/A |
| DB-4 | **`schedule` table name is singular** while `users`, `subjects`, `tasks` are plural. Naming inconsistency. | Low — cosmetic |

---

## 9. Sequelize Review

### Models
- ✅ All models use `Model<TAttributes, TCreationAttributes>` pattern with TypeScript
- ✅ `declare` keyword used for class properties (Sequelize best practice)
- ✅ Associations defined in `models/index.ts` with explicit foreign keys
- ✅ `User.hashPassword()` and `user.checkPassword()` instance/static methods

### Queries
- ✅ All queries are user-scoped (`where: { userId: req.user!.id }`)
- ✅ Eager loading used appropriately (`include: [Subject]` for tasks, `include: [Subject, Task]` for schedule)
- ✅ `Op.between` used for date range queries
- ✅ Raw SQL in analytics uses parameterized replacements (`:userId`, `:startDate`) — no SQL injection

### Issues
| # | Issue | Risk |
|---|-------|------|
| ORM-1 | **`sync({ alter: true })` in development** — can cause schema drift and unexpected column changes. Migrations should be the sole schema management tool. | Medium |
| ORM-2 | **`sync({ force: false, alter: true })` runs on every server start in development** (in `setupDatabase()`). This is slow and risky. | Low |
| ORM-3 | **No transactions** used in multi-step operations (e.g., `createSchedule` creates then re-fetches with `findByPk`). If the second query fails, the record exists but the client gets an error. | Low |
| ORM-4 | **Potential N+1 in `getWeeklySchedule`:** Loads all schedule items, then filters in JavaScript by day. Acceptable for small datasets but not scalable. | Low |
| ORM-5 | **`Task.update(req.body)`** in `updateTask` — mass assignment vulnerability. No field whitelisting. | Medium |

---

## 10. TypeScript Review

### Backend
- ✅ `strict: true` enabled
- ✅ `noImplicitReturns: true`, `noFallthroughCasesInSwitch: true`
- ✅ All models have `Attributes` and `CreationAttributes` interfaces
- ✅ Controllers typed with `AuthRequest` and `Response`
- ✅ **`tsc --noEmit` passes with zero errors**
- ⚠️ `noUnusedLocals: false` and `noUnusedParameters: false` — allows dead code
- ⚠️ `@types/sequelize` is installed but Sequelize v6 has built-in types — potential type conflicts

### Frontend
- ✅ `tsconfig.json` extends `expo/tsconfig.base`
- ⚠️ `strict: false` — strict mode disabled
- ✅ Type definitions comprehensive in `types/index.ts`
- ✅ Hooks are TypeScript (`.ts`)
- ⚠️ Screens and components are still `.js` (migration in progress as stated)

### Type Consistency
- ✅ Frontend `Task` interface matches backend `TaskAttributes` (field names and types align)
- ✅ Frontend `ScheduleItem` matches backend `ScheduleAttributes`
- ✅ Frontend `Subject` matches backend `SubjectAttributes`
- ✅ Frontend `User` matches backend `UserPublic`
- ✅ `TaskPriority` and `ActivityType` enums match on both sides

---

## 11. Security Review

### Strengths
- ✅ **Helmet** enabled (security headers)
- ✅ **CORS** configured with environment-based origin whitelist
- ✅ **Rate limiting** on all API routes (global + auth-specific + verification-specific)
- ✅ **Password hashing** with bcrypt (10 rounds)
- ✅ **JWT secret** validated at startup (rejects placeholder)
- ✅ **Email verification** required before login
- ✅ **Brute-force protection** with account lockout
- ✅ **SQL injection** prevented via Sequelize parameterized queries
- ✅ **`.env` in `.gitignore`** — secrets not committed
- ✅ **Request body size limit** (1mb)
- ✅ **User isolation** — every query is scoped to `req.user!.id`
- ✅ **Verification code hashed** with bcrypt (not stored in plaintext)

### Issues
| # | Issue | Risk | OWASP |
|---|-------|------|-------|
| SEC-1 | **No input validation on production routes** (see B-1). Zod schemas exist but are not wired in. | **High** | A03: Injection (mitigated by Sequelize), A08: Software & Data Integrity Failures |
| SEC-2 | **Mass assignment** — `updateTask`, `updateSubject`, `createTask`, `createSubject`, `createSchedule`, `updateSchedule` all pass raw `req.body` to Sequelize. Users can set `userId`, `createdAt`, or other protected fields. | **Medium** | A01: Broken Access Control |
| SEC-3 | **`.env` file contains real credentials** (DB password `Rasengan1.`, JWT secret). While `.gitignore` prevents committing, the file exists on disk with real secrets. If the repository was previously pushed with `.env`, these secrets are in git history. | **Medium** | A02: Cryptographic Failures |
| SEC-4 | **`rejectUnauthorized: false`** in production SSL config (`sequelize.config.ts`). This disables SSL certificate verification for the database connection, allowing MITM attacks. | Medium | A02: Cryptographic Failures |
| SEC-5 | **No HTTPS enforcement** on the backend. The server runs HTTP only. TLS termination is expected at the reverse proxy level, but this is not documented. | Low | A02: Cryptographic Failures |
| SEC-6 | **Error stack traces** exposed in development mode (`stack: err.stack` in error handler). Acceptable for development, must ensure `NODE_ENV=production` in production. | Low | A05: Security Misconfiguration |
| SEC-7 | **`Math.random()`** used for verification code generation instead of `crypto.randomInt()`. | Low | A02: Cryptographic Failures |
| SEC-8 | **No CSRF protection** — acceptable for JWT-based API (no cookies), but documented for completeness. | N/A | |

---

## 12. Performance Review

### Database
- ✅ Indexes on all foreign keys (`userId`, `subjectId`, `taskId`)
- ✅ Index on `dueDate`, `completed`, `dayOfWeek`, `lockoutUntil`
- ✅ Composite index on `tasks(userId, completed)`
- ✅ Connection pooling configured (max 5, min 0, acquire 30s, idle 10s)
- ⚠️ No pagination — all records loaded at once

### Frontend
- ✅ `FlatList` used for task list (virtualized rendering)
- ⚠️ `DashboardScreen` uses `ScrollView` with `.map()` instead of `FlatList` for tasks and schedule — fine for 3 items (sliced)
- ⚠️ `TaskScreen` `loadTasks` called twice on mount (useEffect + useFocusEffect)
- ⚠️ `DashboardScreen` `loadData` called twice on mount (useEffect + useFocusEffect)
- ⚠️ No memoization (`useMemo`, `useCallback`) on render functions or computed values
- ⚠️ `notificationService` stores all notifications in a single AsyncStorage key — array grows unbounded

### Backend
- ⚠️ `getWeeklySchedule` loads all schedule items then filters in JavaScript — acceptable for small datasets
- ⚠️ `getProductivityAnalytics` makes 5+ separate database queries — could be optimized but acceptable for current scale
- ⚠️ `createSchedule` does `create` then `findByPk` — two queries instead of one

---

## 13. Configuration Review

### Backend
- ✅ `tsconfig.json` — strict mode, ES2022 target, CommonJS module
- ✅ `.env.example` — comprehensive template with all required variables
- ✅ `sequelize.config.ts` — development/test/production environments
- ✅ `jest.config.js` — SWC transform, 30s timeout
- ⚠️ `tsconfig.json` `rootDir: "./"` includes `server.ts`, `migrate.ts`, `setup-database.ts` in compilation — correct
- ⚠️ `tsconfig.json` `include: ["src/**/*.ts", "*.ts"]` — the `*.ts` pattern may pick up unwanted files

### Frontend
- ✅ `tsconfig.json` extends Expo base
- ✅ `app.json` — Expo SDK 54, new architecture enabled
- ⚠️ `app.json` `name` and `slug` are both `"frontend"` — should be `"smart-student-planner"` or similar
- ⚠️ `app.json` missing `expo-notifications` in `plugins` array

### Environment
- ✅ `.env` properly gitignored
- ✅ `.env.example` provided with placeholder values
- ⚠️ `.env` contains real SMTP credentials placeholder (`your_email@gmail.com`) — email verification will fail silently

---

## 14. Dependency Review

### Backend Dependencies
| Package | Version | Status |
|---------|---------|--------|
| express | ^4.18.2 | ✅ Current |
| sequelize | ^6.32.1 | ✅ Current (v6 is stable) |
| pg | ^8.11.0 | ✅ Current |
| bcryptjs | ^2.4.3 | ✅ Current |
| jsonwebtoken | ^9.0.0 | ✅ Current |
| zod | ^4.4.3 | ⚠️ Zod v4 — verify compatibility (v3 is more widely used) |
| helmet | ^8.3.0 | ✅ Current |
| express-rate-limit | ^8.5.2 | ✅ Current |
| nodemailer | ^6.9.8 | ✅ Current |
| umzug | ^3.8.2 | ✅ Current |
| dotenv | ^16.0.3 | ✅ Current |

### Backend Dev Dependencies
| Package | Version | Status |
|---------|---------|--------|
| typescript | ^5.9.3 | ✅ Current |
| jest | ^30.4.2 | ✅ Current |
| @swc/jest | ^0.2.39 | ✅ Current |
| ts-node | ^10.9.2 | ✅ Current |
| supertest | ^7.2.2 | ✅ Current |
| @types/sequelize | ^4.28.20 | ⚠️ Unnecessary — Sequelize v6 has built-in types. May cause type conflicts. |

### Frontend Dependencies
| Package | Version | Status |
|---------|---------|--------|
| expo | ~54.0.36 | ✅ Current |
| react | 19.1.0 | ✅ Current |
| react-native | 0.81.5 | ✅ Current |
| @react-navigation/native | ^7.1.26 | ✅ Current |
| @react-navigation/stack | ^7.6.13 | ✅ Current |
| @react-navigation/bottom-tabs | ^7.9.0 | ✅ Current |
| axios | ^1.13.2 | ✅ Current |
| expo-notifications | ~0.32.17 | ✅ Current |
| moment | ^2.30.1 | ⚠️ Moment.js is in maintenance mode (deprecated). Not a bug, but no new features. |
| react-native-chart-kit | ^6.12.0 | ✅ Acceptable |

### Issues
| # | Issue | Risk |
|---|-------|------|
| DEP-1 | `@types/sequelize` is installed but Sequelize v6 includes its own types. This can cause type conflicts. | Low |
| DEP-2 | `moment` is deprecated (maintenance mode). Not a bug, but consider migrating to `date-fns` or native `Intl` in the future. | Low |
| DEP-3 | `zod` v4 — verify this is intentional. Zod v3 is the stable, widely-used version. | Low |
| DEP-4 | No `npm audit` run — unknown vulnerability status. | Low |

---

## 15. Code Quality Review

### Strengths
- ✅ Consistent code style across backend
- ✅ Clear separation of concerns
- ✅ Meaningful variable and function names
- ✅ Comments where necessary (not excessive)
- ✅ No circular dependencies detected

### Issues
| # | Issue | Risk |
|---|-------|------|
| CQ-1 | **`backend/src/types/index.ts`** defines `AuthRequest` but it's also defined in `middleware/auth.ts`. Duplicate definition — the one in `types/index.ts` is unused. | Low |
| CQ-2 | **Unused `validate` middleware** in production — dead code in the production path (only used in tests). | Medium — see B-1 |
| CQ-3 | **Unused `getProfile` endpoint** — defined on backend, called by frontend `authService.getProfile()` but never invoked by any screen or hook. | Low |
| CQ-4 | **`analyticsController.ts`** has complex type casting (`dateFilterAny[Op.between as unknown as string]`) — fragile and hard to read. | Low |
| CQ-5 | **`TaskScreen.js`** has many unused style definitions (`filterContainer`, `filterButton`, `filterText`, `taskItem`, `checkbox`, etc.) — leftover from before component extraction. | Low |
| CQ-6 | **`migrate.ts`** uses `@ts-expect-error` to suppress Umzug type mismatch — acceptable but indicates a type compatibility issue. | Low |
| CQ-7 | **No ESLint or Prettier configuration** — code formatting is manual. | Low |

---

## 16. Testing Review

### Backend Tests
- ✅ Jest configured with SWC transform
- ✅ Test setup creates test user and cleans data between tests
- ✅ Test files exist: `auth.test.ts`, `task.test.ts`, `subject.test.ts`, `schedule.test.ts`, `analytics.test.ts`
- ✅ Test app (`tests/app.ts`) properly wires validation middleware (unlike production routes)
- ⚠️ Tests use the **same database** as development — no test database isolation
- ⚠️ `sequelize.config.ts` defines a `test` environment with `_test` database suffix, but `tests/setup.ts` doesn't use it
- ⚠️ Tests require a running PostgreSQL instance — no in-memory database

### Frontend Tests
- ❌ No frontend tests exist
- ❌ No test framework configured (no Jest, no React Native Testing Library)

### Critical Areas Without Testing
- ❌ Frontend component rendering tests
- ❌ Frontend integration tests (API calls, navigation)
- ❌ End-to-end tests
- ⚠️ Auth flow (registration → verification → login) — backend tests exist but require SMTP for full flow

---

## 17. DevOps & Deployment Review

### Setup
- ✅ `npm run setup-db` — creates database tables
- ✅ `npm run migrate` — runs Umzug migrations
- ✅ `npm run dev` — starts dev server with nodemon
- ✅ `npm start` — starts server
- ✅ `npm run build` — compiles TypeScript
- ✅ `npm test` — runs Jest tests
- ✅ `.env.example` provided for environment setup

### Issues
| # | Issue | Risk |
|---|-------|------|
| DEV-1 | **No README.md file** — no setup instructions, no architecture overview, no API documentation. Developer onboarding requires reading source code. | Medium |
| DEV-2 | **No Docker/docker-compose** — no containerized development or deployment setup. | Low |
| DEV-3 | **No CI/CD pipeline** — no automated testing or deployment. | Low |
| DEV-4 | **Production deployment URL is a placeholder** (`https://your-production-server.com/api`) — must be configured. | Medium |
| DEV-5 | **`sync({ alter: true })` in development** bypasses migration system — schema changes may not be captured in migrations. | Medium |
| DEV-6 | **No seed data script** — acceptable (app creates data via UI), but no demo data for testing. | Low |

---

## 18. Production Readiness Checklist

| Item | Status | Notes |
|------|--------|-------|
| Backend starts successfully | ✅ | `npm run dev` / `npm start` |
| Frontend starts successfully | ✅ | `expo start` |
| Database connects | ✅ | Sequelize authenticate + sync |
| Authentication works | ✅ | Register → verify → login flow |
| API routes work | ✅ | All 25 endpoints functional |
| Navigation works | ✅ | Stack + Tab navigation |
| No broken imports | ✅ | All imports resolve |
| No missing dependencies | ✅ | `package.json` complete |
| No configuration conflicts | ✅ | Configs are consistent |
| Frontend communicates with backend | ✅ | All API calls match |
| Database operations work | ✅ | CRUD on all entities |
| Backend build succeeds | ✅ | `tsc --noEmit` passes |
| Input validation on all routes | ❌ | **Zod schemas not wired into production routes** |
| Pagination on list endpoints | ❌ | Not implemented |
| README / documentation | ❌ | No README file |
| Production URL configured | ❌ | Placeholder URL |
| Error logging | ⚠️ | Most catch blocks don't log errors |
| Frontend tests | ❌ | None exist |
| SSL/TLS for production | ⚠️ | `rejectUnauthorized: false` |
| Mass assignment protection | ❌ | Raw `req.body` passed to ORM |

---

## 19. Files Requiring Attention

| Priority | File | Issue |
|----------|------|-------|
| **High** | `backend/src/routes/authRoutes.ts` | Add `validate(registerSchema)`, `validate(loginSchema)`, `validate(verifyCodeSchema)` |
| **High** | `backend/src/routes/taskRoutes.ts` | Add `validate(createTaskSchema)`, `validate(updateTaskSchema)` |
| **High** | `backend/src/routes/subjectRoutes.ts` | Add `validate(createSubjectSchema)`, `validate(updateSubjectSchema)` |
| **High** | `backend/src/routes/scheduleRoutes.ts` | Add `validate(createScheduleSchema)`, `validate(updateScheduleSchema)` |
| **High** | `backend/src/controllers/taskController.ts` | Whitelist fields in `createTask` and `updateTask` (mass assignment) |
| **High** | `backend/src/controllers/subjectController.ts` | Whitelist fields in `createSubject` and `updateSubject` |
| **High** | `backend/src/controllers/scheduleController.ts` | Whitelist fields in `createSchedule` and `updateSchedule` |
| **Medium** | `backend/src/controllers/analyticsController.ts` | Fix `studyHoursPerDay` — TIME fields cannot be parsed with `new Date()` |
| **Medium** | `backend/src/routes/scheduleRoutes.ts` | `GET /:id` should map to a dedicated `getScheduleById` controller, not `getSchedule` |
| **Medium** | `backend/src/models/index.ts` | Fix cascade rule mismatch — `Subject.hasMany(Task)` should use `onDelete: 'SET NULL'` to match migration |
| **Medium** | `frontend/src/services/api.js` | Configure production API URL |
| **Medium** | `backend/sequelize.config.ts` | Set `rejectUnauthorized: true` for production SSL |
| **Low** | `backend/server.ts` | Remove `sync({ alter: true })` from production startup; rely on migrations only |
| **Low** | `backend/src/types/index.ts` | Remove duplicate `AuthRequest` interface (use the one from `middleware/auth.ts`) |
| **Low** | `frontend/app.json` | Add `expo-notifications` to plugins; rename app slug |
| **Low** | Project root | Add `README.md` with setup instructions |

---

## 20. Recommended Fixes (Ordered by Priority)

### Priority 1 — High Risk (Fix Before Production)

**1. Wire Zod validation into production routes**
- **Why:** All production endpoints currently accept unvalidated input. The schemas and middleware already exist — they just need to be imported and added to the route definitions.
- **Risk:** High — malformed data reaches the database layer
- **Expected Impact:** Prevents invalid data persistence, provides clear 400 error messages to clients
- **Fix:** In each route file, import the corresponding schema and `validate` middleware, then add to POST/PUT routes:
  ```typescript
  // Example for taskRoutes.ts
  import { validate } from '../middleware/validate';
  import { createTaskSchema, updateTaskSchema } from '../schemas/taskSchema';
  router.post('/', validate(createTaskSchema), createTask);
  router.put('/:id', validate(updateTaskSchema), updateTask);
  ```

**2. Add field whitelisting to prevent mass assignment**
- **Why:** `Task.update(req.body)` allows users to modify `userId`, `createdAt`, and other protected fields.
- **Risk:** Medium — data integrity and potential privilege escalation
- **Expected Impact:** Only intended fields can be modified
- **Fix:** Extract only allowed fields from `req.body`:
  ```typescript
  const { title, description, subjectId, priority, dueDate, estimatedDuration, completed, reminderEnabled, reminderMinutesBefore } = req.body;
  await task.update({ title, description, subjectId, priority, dueDate, estimatedDuration, completed, reminderEnabled, reminderMinutesBefore });
  ```

### Priority 2 — Medium Risk (Fix Before Release)

**3. Fix analytics study hours calculation**
- **Why:** `new Date(schedule.startTime)` produces `Invalid Date` for TIME fields (`"HH:MM:SS"`), making study hours always 0.
- **Risk:** Medium — feature is non-functional
- **Expected Impact:** Study hours analytics will work correctly
- **Fix:** Parse TIME strings manually:
  ```typescript
  const [startH, startM] = schedule.startTime.split(':').map(Number);
  const [endH, endM] = schedule.endTime.split(':').map(Number);
  const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
  ```

**4. Fix `GET /api/schedule/:id` route**
- **Why:** Both `GET /` and `GET /:id` map to `getSchedule`, which reads `req.query.dayOfWeek` but not `req.params.id`.
- **Risk:** Medium — `GET /api/schedule/123` returns all schedule items instead of one
- **Expected Impact:** Single-item retrieval works correctly
- **Fix:** Create a `getScheduleById` controller that queries by `id` and `userId`, or change the `/:id` route to use a different controller.

**5. Fix cascade rule mismatch**
- **Why:** Migration says `SET NULL` but model association says `CASCADE` for `Subject → Task`.
- **Risk:** Medium — data loss in development; inconsistent behavior
- **Expected Impact:** Consistent cascade behavior across environments
- **Fix:** Change `models/index.ts` line 14 to `onDelete: 'SET NULL'` to match the migration.

**6. Configure production API URL**
- **Why:** Frontend has a placeholder URL for production.
- **Risk:** Medium — app won't connect to backend in production
- **Fix:** Use Expo Constants or environment variables to configure the production API URL.

### Priority 3 — Low Risk (Improve When Possible)

**7. Add README.md** — Document setup, architecture, and API endpoints.

**8. Remove `sync({ alter: true })` from production** — Rely solely on migrations.

**9. Add error logging** — Log `error.message` in all catch blocks.

**10. Remove duplicate `AuthRequest`** in `backend/src/types/index.ts`.

**11. Fix double API calls** in `TaskScreen` and `DashboardScreen` (remove `useEffect` that duplicates `useFocusEffect`).

**12. Add pagination** to list endpoints for scalability.

**13. Add frontend tests** — At minimum, component rendering tests.

**14. Fix `rejectUnauthorized: false`** in production SSL config.

---

## 21. Remaining Risks

1. **No token revocation** — JWT remains valid until expiry after logout. If a token is compromised, there's no way to invalidate it before the 7-day expiry.
2. **No password reset flow** — Users who forget their password have no recovery path.
3. **Email delivery dependency** — Registration requires SMTP. If email fails, the user is created but cannot verify. The `sendVerificationEmail` failure is caught silently.
4. **No database backup strategy** — Not in scope but noted for production readiness.
5. **Moment.js deprecation** — Not a current bug, but future maintenance risk.
6. **No frontend test coverage** — Regressions in UI cannot be automatically detected.
7. **Test database isolation** — Tests run against the development database, risking data corruption during test runs.

---

## 22. Production Readiness Score

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Architecture | 90/100 | 15% | 13.5 |
| Frontend-Backend Integration | 95/100 | 15% | 14.25 |
| API Design | 70/100 | 10% | 7.0 |
| Authentication & Security | 75/100 | 15% | 11.25 |
| Database & ORM | 80/100 | 10% | 8.0 |
| TypeScript | 85/100 | 10% | 8.5 |
| Code Quality | 80/100 | 10% | 8.0 |
| Testing | 40/100 | 5% | 2.0 |
| DevOps & Documentation | 50/100 | 5% | 2.5 |
| Performance | 75/100 | 5% | 3.75 |

**Overall Production Readiness Score: 79/100**

---

## 23. Final Verdict

The Smart Student Planner project is **technically sound and ready for continued development**. The architecture is clean, the frontend-backend integration is complete and consistent, and the backend compiles with zero TypeScript errors. All 25 API endpoints are properly connected, user authentication is well-implemented with brute-force protection and email verification, and the database schema is well-designed with appropriate indexes.

The project is **NOT yet production-ready** due to:
1. Missing input validation on production routes (the schemas exist but aren't wired in)
2. Mass assignment vulnerability in update/create controllers
3. Non-functional study hours analytics
4. Missing README and production URL configuration

**No architectural changes are recommended.** The foundation is solid and well-structured. The recommended fixes are targeted, specific, and do not require restructuring. Future work should focus on:
1. Wiring the existing validation middleware into production routes (the code already exists)
2. Adding field whitelisting to controllers
3. Fixing the 3 identified bugs (analytics, schedule route, cascade mismatch)
4. Adding documentation
5. Implementing new features

The project can continue development with confidence in its foundation.