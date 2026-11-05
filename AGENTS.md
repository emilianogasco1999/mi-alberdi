# Code Review Rules - Mi Alberdi

## Clean Architecture & Monorepo
- Apps: `apps/api` (Express backend) and `apps/web` (Next.js 16 frontend).
- Shared contracts: all DTOs and Zod schemas must live in `packages/shared`.
- In `apps/api`, maintain layer separation: domain -> application -> infrastructure -> presentation.
- Response messages and HTTP status codes in `apps/api` must be centralized in `domain/constants/{feature}.messages.ts`.
- Never use direct database models in public responses; always map to DTOs and omit sensitive fields (e.g. `passwordHash`, `propietarioId`).

## TypeScript & Code Quality
- Strict TypeScript: no `any` types unless strictly necessary for dynamic database drivers.
- Use `const` and `let`, never `var`.
- Prefer named exports.

## Git & Commits
- Follow Conventional Commits: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `build`.
- No direct commits to `main`, `qa`, or `dev`.
- Branches must follow `feature/*`, `bugfix/*`, or `hotfix/*`.
