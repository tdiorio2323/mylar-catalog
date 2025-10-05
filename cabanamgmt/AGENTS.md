# Repository Guidelines

## Project Structure & Module Organization
Follow the Next.js app-router layout: route segments live in `src/app`, with colocated server actions and route-specific helpers. Shared UI primitives belong in `src/components`, and cross-cutting utilities (Supabase clients, Zustand stores, Stripe helpers) live in `src/lib`. Static media sits in `public`, while database migrations are tracked in `supabase/migrations` and must mirror every schema change committed to code.

## Build, Test, and Development Commands
- `npm install` – refresh dependencies before starting a task.
- `npm run dev` – run the Turbopack dev server at `http://localhost:3000` for iterative work.
- `npm run build` – create the production bundle; run prior to release validation.
- `npm run start` – serve the production build locally for smoke checks.
- `npm run lint` – execute ESLint with the Next.js config; this gate must pass before opening a PR.

## Coding Style & Naming Conventions
Use TypeScript with 2-space indentation and trailing commas in multiline literals. React components, hooks, and Zustand stores use PascalCase filenames (`Stepper.tsx`, `useBookingStore.ts`). Route handlers in `src/app` stay lower-case and hyphenated to match URLs. Prefer Tailwind utility classes; introduce scoped CSS only when composition demands it and keep styles near their component.

## Testing Guidelines
Automated tests are not yet wired, so document manual QA steps in every PR. When adding tests, colocate `*.test.tsx` files next to the component, mirror the filename, and target critical booking flows plus Supabase data transforms. Run `npm run lint` and any new tests locally before pushing.

## Commit & Pull Request Guidelines
Craft commit messages in the existing "Type: short summary" style, keeping each commit independently revertible. PRs must state the problem, summarize the solution, include screenshots for UI changes, call out Supabase migration impacts, and link to tracking issues. Note any new environment variables so reviewers can configure deploy previews.

## Security & Configuration Tips
Keep secrets like `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `STRIPE_SECRET_KEY` in `.env.local`. Review Supabase RLS policies and Stripe webhook handling whenever authentication or payments code changes. Clean up debug logging before merging.
