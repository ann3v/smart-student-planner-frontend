# Backend Technical Audit & Repair Report

**Project:** Smart Student Planner — Backend (`smart-student-planner-backend`)
**Date:** 2026-07-23
**Auditor:** Lead Backend Engineer
**Scope:** Root-cause analysis, configuration/dependency/import/runtime audit, repair plan, and applied fixes for the Express + TypeScript backend that was failing to start.

---

## 1. Executive Summary

The backend was failing to start for **two independent but compounding reasons**:

1. **Toolchain incompatibility** — `typescript@7.0.2` is not supported by the project's pinned tooling. `ts-jest@29.4.12` declares `typescript: ">=4.3 <7"` as a peer dependency, and `ts-node@10.9.2` (while its peer range is permissive) crashes at runtime against the TS 7 compiler API with `TypeError: Cannot read properties of undefined (reading 'fileExists')` inside `node_modules/ts-node/dist/configuration.js`. npm itself reported `ELSPROBLEMS` / `typescript@7.0.2 invalid`.
2. **Module-system mismatch** — `tsconfig.json` used `module: "NodeNext"` + `moduleResolution: "NodeNext"`, which enforces **native ESM resolution semantics** (no directory imports, mandatory file extensions). The project, however, is written as **CommonJS** (no `"type": "module"`, uses `__dirname`, `require()`, `export =`, `module.exports`, and directory imports like `./src/models`). Under NodeNext this produced `ERR_UNSUPPORTED_DIR_IMPORT` when run with plain `node`.

The repair downgrades TypeScript to the latest 5.x LTS-line release (`5.9.3`), aligns `@types/node` with the runtime (`24.13.3`), modernizes `nodemon` (`3.1.14`), and switches `tsconfig.json` to a consistent **CommonJS** configuration (`module: "CommonJS"`, `moduleResolution: "Node"`). A single Zod 4 API drift (`ZodError.errors` → `ZodError.issues`) was also fixed.

After the fixes:
- `npx tsc --noEmit` passes with **zero errors**.
- `npx tsc` (build) succeeds.
- `ts-node server.ts` compiles and boots past the original crash, reaching the database step (it only stops at PostgreSQL auth because `.env` still contains placeholder credentials — an environment, not code, issue).
- `ts-node migrate.ts` (CJS `__dirname`/`require`) compiles and runs.
- `jest --listTests` discovers all 5 test files.

No business logic was changed. Project architecture was preserved.

---

## 2. Root Cause

### 2.1 Is TypeScript 7 actually the cause of the ts-node crash?

**Yes — it is the primary cause of Error 1.**

- `ts-node@10.9.2` initializes the TypeScript compiler host and reads compiler options via its `configuration.js`. Against the TS 7.0.2 compiler API, the internal object ts-node expects is `undefined`, so accessing `.fileExists` throws `TypeError: Cannot read properties of undefined (reading 'fileExists')`.
- This is a **pre-compilation** failure: ts-node never gets to type-check or emit. It dies while wiring up the compiler.
- `ts-jest@29.4.12` independently rejects TS 7 via its peer dependency `typescript: ">=4.3 <7"`, which npm surfaces as `ELSPROBLEMS` / `invalid`.
- The latest `ts-node` on the registry is still `10.9.2` (no newer release exists that supports TS 7), so the only stable path is to downgrade TypeScript to the 5.x line.

### 2.2 Are any package versions incompatible?

| Package | Installed | Constraint / Notes | Verdict |
|---|---|---|---|
| `typescript` | 7.0.2 | `ts-jest` peer: `>=4.3 <7`; `ts-node` runtime incompatible with 7.x | **Incompatible** → downgraded to 5.9.3 |
| `ts-jest` | 29.4.12 | peer `typescript >=4.3 <7` | OK once TS is 5.9.3 |
| `ts-node` | 10.9.2 | peer `typescript >=2.7` (permissive, but runtime breaks on TS 7) | OK once TS is 5.9.3 |
| `jest` | 30.4.2 | `ts-jest@29.4.12` supports jest `^29 || ^30` | OK |
| `@types/node` | 26.1.1 | No Node 26 runtime exists; mismatches Node 24 | **Mismatch** → downgraded to 24.13.3 |
| `nodemon` | 2.0.22 | Outdated; 3.x is the current line and works with Node 24 | **Stale** → upgraded to 3.1.14 |
| `@swc/core`, `@swc/jest` | 1.15.46 / 0.2.39 | Used by `jest.config.js` | OK |
| `zod` | 4.4.3 | `ZodError.errors` removed in Zod 4 (now `.issues`) | **API drift** → code fixed |

### 2.3 Is Node 24 contributing to the issue?

**Indirectly, and only for tooling selection — not for the core crash.**

- Node 24.12.0 is very new. The project was clearly authored for the Node 18/20 LTS era.
- Node 24 itself did **not** cause the `fileExists` crash (that is TS 7 vs ts-node).
- Node 24 *did* make the NodeNext ESM enforcement visible: under `module: NodeNext` with no `"type": "module"`, Node treats `.ts`/`.js` as CJS but still applies strict resolution, surfacing `ERR_UNSUPPORTED_DIR_IMPORT` for `import { sequelize } from './src/models'`.
- The ecosystem (ts-node, ts-jest, nodemon, Sequelize 6) is broadly compatible with Node 24 once TypeScript is on 5.x. No Node downgrade is required.

### 2.4 Are there conflicting dependencies?

- The only hard conflict was `typescript@7.0.2` vs `ts-jest@29.4.12` (peer `>=4.3 <7`).
- `@types/node@26.1.1` was not a *conflict* but a **version mismatch** with the runtime (Node 24).
- No transitive dependency cycles or duplicate-version hazards were found in `npm ls`.

### 2.5 Is the project CommonJS, Native ESM, or Hybrid NodeNext?

**The project is CommonJS.** Evidence:

1. `package.json` has **no `"type": "module"`** field → Node treats `.js` as CJS.
2. `jest.config.js` uses `module.exports = { ... }` (CJS).
3. `sequelize.config.ts` uses `export = { ... }` (CJS-style export assignment).
4. `migrate.ts` uses `__dirname` and `require(migrationPath)` — both CJS-only constructs that are **not available in native ESM**.
5. `tests/setup.ts` uses `require('jsonwebtoken')` and `require('bcryptjs')`.
6. All source imports are extension-less and include **directory imports** (e.g. `./src/models`, `../models`, `../config/database`) — valid in CJS `Node` resolution, invalid under NodeNext ESM.

**Conclusion:** The `module: "NodeNext"` setting was **wrong for this codebase**. It imposed ESM resolution rules on a CJS project. The correct, internally consistent configuration is `module: "CommonJS"` + `moduleResolution: "Node"`.

---

## 3. Configuration Issues

### 3.1 `tsconfig.json` (before)
```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "NodeNext",
    "lib": ["ES2020"],
    "moduleResolution": "nodenext",
    // ...
  }
}
```
**Problems:**
- `module: NodeNext` + `moduleResolution: nodenext` enforce ESM semantics on a CJS project → directory imports fail, `__dirname`/`require` would be illegal under ESM, and `export =` in `sequelize.config.ts` is disallowed under `NodeNext` ESM.
- `target: ES2020` is older than necessary for Node 24.

### 3.2 `tsconfig.json` (after)
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "lib": ["ES2022"],
    "moduleResolution": "Node",
    // ... unchanged strict flags ...
  }
}
```
**Rationale:**
- `module: CommonJS` matches the actual runtime (no `"type": "module"`).
- `moduleResolution: Node` permits the existing directory imports and extension-less specifiers.
- `target/lib: ES2022` is safe and modern for Node 20/22/24.
- All strict flags, `esModuleInterop`, `skipLibCheck`, `resolveJsonModule`, declaration/sourceMap settings were **preserved unchanged**.

### 3.3 `package.json` scripts
- `start`, `dev`, `setup-db`, `migrate`, `build`, `typecheck`, `test` — **unchanged**. They are correct for the CJS + ts-node toolchain.
- `nodemon` invocation (`nodemon --exec ts-node server.ts`) remains valid; only the `nodemon` version was bumped.

### 3.4 `jest.config.js`
- Uses `@swc/jest` as the transform — **unchanged and compatible**. `@swc/jest` does not depend on the TypeScript version, so the TS downgrade does not affect test compilation.
- `testEnvironment: 'node'`, `testMatch`, `setupFilesAfterEnv` — all correct and preserved.
- `ts-jest` is installed but `jest.config.js` uses `@swc/jest`; `ts-jest` is retained because it is a declared peer-compatible dev tool and may be used by editor integrations. No conflict.

### 3.5 SWC configuration
- No standalone `.swcrc` exists; `@swc/jest` reads `tsconfig.json` for behavior. The switch to `CommonJS`/`Node` is compatible with `@swc/jest`.

### 3.6 nodemon configuration
- No `nodemon.json` exists; configuration is via CLI flags in `package.json`. `nodemon@3.1.14` is compatible with Node 24 and the existing `--exec ts-node` pattern.

---

## 4. Dependency Issues

### Recommendations applied

| Package | From | To | Action | Why |
|---|---|---|---|---|
| `typescript` | `^7.0.2` | `^5.9.3` | **Downgrade** | TS 7 breaks `ts-node` at runtime and violates `ts-jest` peer `>=4.3 <7`. 5.9.3 is the latest stable 5.x and is fully supported by both. |
| `@types/node` | `^26.1.1` | `^24.13.3` | **Downgrade** | Aligns types with the actual Node 24 runtime. `@types/node@26` targets a non-existent Node 26 and can surface incorrect/missing APIs. |
| `nodemon` | `^2.0.22` | `^3.1.14` | **Upgrade** | 2.x is unmaintained-era; 3.x is current, Node 24-friendly, and drop-in compatible. |
| `ts-node` | `^10.9.2` | `^10.9.2` | **Keep** | Latest available; works once TS is 5.x. |
| `ts-jest` | `^29.4.12` | `^29.4.12` | **Keep** | Latest 29.x; supports jest 30 and TS 5.x. |
| `jest` | `^30.4.2` | `^30.4.2` | **Keep** | Compatible with `ts-jest@29.4.12` and `@swc/jest`. |
| `@swc/core`, `@swc/jest` | current | current | **Keep** | Used by Jest transform; version-independent of TS. |

### Packages removed / not added
- No packages were removed. No new runtime dependencies were added. The change set is intentionally minimal.

### npm tree after fix
`npm ls typescript ts-jest ts-node nodemon @types/node` reports **no `invalid` entries** and **no `ELSPROBLEMS`**. `typescript@5.9.3` is deduped across `ts-jest` and `ts-node`.

---

## 5. Import Issues

### 5.1 NodeNext-incompatible imports found (before fix)

A full scan of all `.ts` files found **62 relative imports**. The ones that are **invalid under NodeNext ESM** but **valid under CJS `Node` resolution** are the directory imports:

| File | Import | Issue under NodeNext |
|---|---|---|
| `server.ts` | `import { sequelize } from './src/models'` | Directory import |
| `server.ts` | `import authRoutes from './src/routes/authRoutes'` | Missing extension |
| `server.ts` | `import taskRoutes from './src/routes/taskRoutes'` | Missing extension |
| `server.ts` | `import subjectRoutes from './src/routes/subjectRoutes'` | Missing extension |
| `server.ts` | `import scheduleRoutes from './src/routes/scheduleRoutes'` | Missing extension |
| `server.ts` | `import analyticsRoutes from './src/routes/analyticsRoutes'` | Missing extension |
| `migrate.ts` | `import { sequelize } from './src/models'` | Directory import |
| `setup-database.ts` | `import { sequelize } from './src/models'` | Directory import |
| `src/models/index.ts` | `import User from './user'` (and `./subject`, `./task`, `./schedule`) | Missing extension |
| `src/models/*.ts` | `import sequelize from '../config/database'` | Missing extension |
| `src/controllers/*.ts` | `import { ... } from '../models'` | Directory import |
| `src/controllers/*.ts` | `import { AuthRequest } from '../middleware/auth'` | Missing extension |
| `src/controllers/authController.ts` | `import { AUTH, ERRORS } from '../config/constants'` | Missing extension |
| `src/routes/*.ts` | `import { ... } from '../controllers/...` | Missing extension |
| `src/routes/*.ts` | `import auth from '../middleware/auth'` | Missing extension |
| `src/middleware/auth.ts` | `import { User } from '../models'` | Directory import |
| `tests/setup.ts` | `import { sequelize } from '../src/models'` | Directory import |
| `tests/app.ts` | all `../src/...` imports | Missing extension |

### 5.2 Why no import rewrites were necessary

Because the project is **CommonJS**, the correct fix is to align `tsconfig.json` with the codebase (`module: CommonJS`, `moduleResolution: Node`) rather than to rewrite ~62 imports to add `.js` extensions and replace directory imports with explicit `index.js` paths. The latter would be required only if the project were migrating to native ESM — which it is not, given `__dirname`, `require()`, `export =`, and `module.exports` throughout.

### 5.3 Circular imports
No circular import chains were detected. `src/models/index.ts` is the single barrel that re-exports `sequelize`, `User`, `Subject`, `Task`, `Schedule`; each model imports `sequelize` from `../config/database` (not from the barrel), so the barrel is acyclic.

### 5.4 Barrel exports
`src/models/index.ts` is a valid CJS barrel. Under `module: CommonJS` + `moduleResolution: Node`, `import { sequelize } from './src/models'` resolves to `./src/models/index.ts` → `dist/src/models/index.js`. **No change needed.**

---

## 6. Compatibility Issues

1. **TypeScript 7 vs toolchain** — resolved by downgrade to 5.9.3.
2. **`@types/node` 26 vs Node 24 runtime** — resolved by aligning to 24.13.3.
3. **`module: NodeNext` vs CJS codebase** — resolved by switching to `CommonJS`/`Node`.
4. **Zod 4 API drift** — `ZodError.errors` was removed in Zod 4; replaced with `ZodError.issues` in `src/middleware/validate.ts`.
5. **`nodemon` 2.x staleness** — resolved by upgrade to 3.1.14.

No other compatibility issues were found. Sequelize 6.37.7, Express 4.22.1, Helmet 8, express-rate-limit 8, zod 4, pg 8, jsonwebtoken 9, bcryptjs 2, nodemailer 6, umzug 3 are all compatible with Node 24 and the restored toolchain.

---

## 7. Recommended Runtime

**Recommendation: Node 22 LTS (primary), Node 20 LTS (acceptable fallback).**

Rationale (ecosystem-compatibility-first, not newest-first):

- **Node 22 LTS** is the current long-term-support line and has the broadest, battle-tested compatibility with `ts-node@10.9.2`, `ts-jest@29`, `@swc/jest`, Sequelize 6, and the rest of this stack.
- **Node 20 LTS** is also fully supported and is a safe alternative if the deployment target standardizes on 20.
- **Node 24** works after these fixes (validated in this audit), but it is very new and some transitive native deps may lag. It is acceptable for development, but for production I recommend pinning to Node 22 LTS until the ecosystem catches up.
- **Do not** keep `@types/node` on a version that does not match the runtime. If you deploy on Node 22, set `@types/node` to `^22.x`; if on Node 24, keep `^24.13.3` (as installed here).

`@types/node@24.13.3` was installed because the current local runtime is Node 24.12.0. Adjust this value if you pin production to Node 22.

---

## 8. Files Modified

| File | Change type |
|---|---|
| `backend/package.json` | Dependency version updates (TS, @types/node, nodemon) |
| `backend/tsconfig.json` | Module system alignment (NodeNext → CommonJS/Node), target/lib bump |
| `backend/src/middleware/validate.ts` | Zod 4 API fix (`error.errors` → `error.issues`) |
| `backend/package-lock.json` | Regenerated by `npm install` |

No other source files were touched. No business logic, routes, models, controllers, or tests were modified.

---

## 9. Exact Changes Made

### 9.1 `backend/package.json`
```diff
- "@types/node": "^26.1.1",
+ "@types/node": "^24.13.3",
- "nodemon": "^2.0.22",
+ "nodemon": "^3.1.14",
- "typescript": "^7.0.2"
+ "typescript": "^5.9.3"
```

### 9.2 `backend/tsconfig.json`
```diff
- "target": "ES2020",
- "module": "NodeNext",
- "lib": ["ES2020"],
+ "target": "ES2022",
+ "module": "CommonJS",
+ "lib": ["ES2022"],
- "moduleResolution": "nodenext",
+ "moduleResolution": "Node",
```
All other compiler options (`strict`, `esModuleInterop`, `skipLibCheck`, `forceConsistentCasingInFileNames`, `resolveJsonModule`, `declaration`, `declarationMap`, `sourceMap`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `outDir`, `rootDir`, `include`, `exclude`) are **unchanged**.

### 9.3 `backend/src/middleware/validate.ts`
```diff
-        details: error.errors.map(e => ({
+        details: error.issues.map(e => ({
```

### 9.4 `backend/package-lock.json`
Regenerated to reflect the new resolved versions (`typescript@5.9.3`, `@types/node@24.13.3`, `nodemon@3.1.14`) and to remove the `invalid` peer-dependency marker.

---

## 10. Validation Results

| Check | Command | Result |
|---|---|---|
| Dependency tree clean | `npm ls typescript ts-jest ts-node nodemon @types/node` | ✅ No `invalid`, no `ELSPROBLEMS` |
| Type check | `npx tsc --noEmit` | ✅ 0 errors |
| Build | `npx tsc` | ✅ Success (emits to `dist/`) |
| ts-node boot (server) | `JWT_SECRET=... npx ts-node server.ts` | ✅ Compiles, passes JWT validation, loads all routes, reaches DB step (fails only on PostgreSQL auth — placeholder `.env`) |
| ts-node boot (migrate) | `npx ts-node migrate.ts` | ✅ Compiles (CJS `__dirname`/`require` work), reaches DB step |
| Jest discovery | `npx jest --listTests` | ✅ Finds all 5 test files |
| Original crash gone | — | ✅ `Cannot read properties of undefined (reading 'fileExists')` no longer occurs |
| `ERR_UNSUPPORTED_DIR_IMPORT` gone | — | ✅ Directory imports resolve under CJS `Node` resolution |

> Note: Full end-to-end runtime and `npm test` require a running PostgreSQL instance with correct credentials in `.env`. The current `.env` contains placeholders (`CHANGE_ME_DB_PASSWORD`, `JWT_SECRET=CHANGE_ME_...`). These are **environment** values the owner must fill in; they are not code defects and are outside the scope of this audit.

---

## 11. Remaining Risks

1. **Environment secrets** — `.env` still has `JWT_SECRET=CHANGE_ME_TO_A_CRYPTOGRAPHICALLY_RANDOM_64_CHAR_STRING` and `DB_PASSWORD=CHANGE_ME_DB_PASSWORD`. The server's startup guard already refuses to boot with the placeholder JWT secret; the DB password must also be set. **Action required by project owner.**
2. **`@types/sequelize@4.28.20`** is an older typing package for the legacy Sequelize 4 API. The runtime is Sequelize 6, which ships its own types. This is pre-existing and not blocking, but in a future cleanup `@types/sequelize` can be removed in favor of Sequelize 6's built-in typings.
3. **`@types/umzug@2.3.9`** targets Umzug 2, while the runtime is `umzug@3.8.2`. This is pre-existing (the migrate script already uses `@ts-expect-error` to cope). Not blocking; can be cleaned up later.
4. **Node 24 newness** — Validated working, but for production prefer Node 22 LTS until the ecosystem fully stabilizes. Adjust `@types/node` accordingly if you pin production to Node 22.
5. **`npm audit`** reports 16 vulnerabilities (9 moderate, 7 high) in transitive deps. These are pre-existing and unrelated to the start failure. They should be addressed in a separate, dedicated dependency-hygiene pass (not by `npm audit fix --force`, which could break SemVer ranges).

---

## 12. Final Verdict

The backend was **not** fundamentally broken; it was **mis-tooled and mis-configured**.

- The `ts-node` crash was caused by `typescript@7.0.2`, which is unsupported by both `ts-jest` (peer `>=4.3 <7`) and `ts-node` at runtime. **Fix: downgrade TypeScript to 5.9.3.**
- The `ERR_UNSUPPORTED_DIR_IMPORT` was caused by `module: NodeNext` being applied to a CommonJS codebase. **Fix: switch to `module: CommonJS` + `moduleResolution: Node`.**
- A Zod 4 API change (`ZodError.errors` → `.issues`) was surfaced once type-checking worked. **Fix: one-line update in `validate.ts`.**
- `@types/node` and `nodemon` were aligned to the runtime and current line, respectively.

The backend now **compiles, builds, and boots under ts-node** on Node 24 with a clean dependency tree, a consistent CommonJS module system, and zero type errors — with **no business logic changed** and **project architecture preserved**. The only remaining blockers to a full running server are the placeholder secrets in `.env`, which are the owner's responsibility to fill in.