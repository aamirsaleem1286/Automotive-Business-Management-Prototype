# AutoForge

Production-ready automotive restoration and workshop management dashboard built with Next.js, TypeScript, Prisma (SQLite locally, PostgreSQL in production), and a lightweight Three.js showroom scene.

> Original concept and design: **Created by Furqan Khan**.

## Features

- **Overview** with a 3D showroom hero, live KPIs, pipeline, active jobs, and BICEP coverage
- **Leads & CRM**, **Restoration Jobs**, **Workshop Planner**, **Quotes**, **Parts & Inventory**, **Online Store**, **Customer Updates**, **Reports**, and **System Setup**
- Secure cookie-based admin authentication with `admin` and `manager` roles
- Full CRUD backed by Prisma and validated with Zod
- Responsive layout: desktop sidebar, icon rail, and mobile bottom navigation
- Accessible dialogs, skeleton loading states, error boundaries, toast feedback, CSV export
- 3D scene automatically falls back to a static SVG for reduced motion, mobile, or low-power devices

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS, CSS design tokens, Framer Motion |
| 3D | Three.js, React Three Fiber |
| Data | Prisma (SQLite / PostgreSQL), SWR |
| Validation | Zod, React Hook Form |
| Auth | `jose` JWT in an HttpOnly cookie, bcryptjs |
| Icons / fonts | lucide-react, self-hosted Inter (`@fontsource/inter`) |

## Requirements

- Node.js 20 or newer (tested on Node 25)
- SQLite for local development (no server needed); PostgreSQL for production
- npm

## Quick Start

```bash
npm install
```

1. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Set `DATABASE_URL="file:./dev.db"` and a 32+ character `AUTH_SECRET`. SQLite is used locally, so no database server is required.

2. Seed the admin account and demo content:

   ```bash
   npm run seed
   ```

3. Start the app:

   ```bash
   npm run dev
   ```

4. Open <http://localhost:3000> and sign in with the seeded credentials:

   - Email: `admin@autoforge.local`
   - Password: value of `ADMIN_PASSWORD` (default in `.env.example`: `ChangeMe123!`)

**Change the admin password before deploying.**

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run seed` | Create the admin account and insert demo data only when collections are empty |
| `npm run seed:reset` | Delete demo content, reinsert it, and refresh the admin password |

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Prisma connection string (`file:./dev.db` locally, PostgreSQL URL in production). Server-only. |
| `AUTH_SECRET` | Yes | 32+ character HMAC secret used to sign session JWTs |
| `ADMIN_EMAIL` | Seed only | Email for the seeded admin account |
| `ADMIN_NAME` | Seed only | Display name for the seeded admin account |
| `ADMIN_PASSWORD` | Seed only | Initial admin password, minimum 8 characters |
| `NEXT_PUBLIC_APP_NAME` | No | Public app name used in metadata |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Authentication and Roles

- Login issues an HttpOnly, SameSite=Lax session cookie. Cookies are marked `Secure` in production, so deploy behind HTTPS.
- Sessions expire after 8 hours; JWT issuer/audience are verified on every request.
- `middleware.ts` protects `/admin/*` and every `/api/*` route except `/api/auth/*`.
- `manager` accounts can view and edit business records.
- `admin` accounts are additionally required to delete records and reset settings content.
- Login attempts are rate-limited to 10 per IP per 15 minutes.

There is no public sign-up or password-reset flow. Add admin users directly in the database (store a bcrypt hash in `passwordHash`), or use `npm run seed:reset` to refresh the seeded admin.

## Data and API

Collections: `admins`, `leads`, `projects`, `quotes`, `parts`, `orders`, `customerupdates`, `workshoptasks`, `settings`.

API responses use:

```json
{ "data": {} }
```

```json
{ "error": "Message", "details": {} }
```

Main endpoints:

- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/dashboard`, `GET /api/reports`
- `GET|POST /api/leads`, `GET|PATCH|DELETE /api/leads/:id`
- Same pattern for `projects`, `quotes`, `parts`, `orders`, `updates`, and `workshop/tasks`
- `GET|PATCH /api/settings`, `POST /api/settings/reset`

All mutations validate same-origin requests and Zod schemas.

## Project Structure

```text
app/                 App Router pages, admin views, and API routes
components/layout/   Sidebar, topbar, mobile navigation, admin shell
components/three/    3D car scene, model, fallback, and showcase wrapper
components/ui/       Shared tables, cards, modals, forms, skeletons, toasts
lib/                 Auth, Prisma client, validation, serialization, seed data
prisma/              SQLite schema (local) and PostgreSQL schema (production)
scripts/seed.ts      Admin and demo-content seeding
middleware.ts        Session-based route protection
```

## Design Notes

- Core palette: background `#0b0d10`, panel `#14181e`, line `#2a323d`, ink `#eef2f6`, accent `#f04438`, amber `#f5b942`, success `#35c98a`, info `#66a9ff`.
- Desktop sidebar is 238px wide, collapses to an icon rail below `1051px`, and switches to bottom navigation below `768px`.
- The car scene is client-only and loaded dynamically. It is disabled for reduced-motion users and uses an SVG fallback if WebGL fails.

## Security and Operations

- Never commit `.env.local` or database credentials.
- Use a different production `AUTH_SECRET` from development and rotate it if leaked.
- Restrict Postgres network access and use a least-privilege database user.
- The built-in rate limiter is in-memory and per instance. Use a shared store such as Redis when running multiple instances.
- Configure Postgres backups and test restoration before storing real customer data.
- The app stores workshop/customer records only; it does not process payments or send email/WhatsApp messages. Those integrations remain planned.

## Deployment (Vercel)

Vercel's filesystem is read-only and ephemeral, so the local SQLite database
cannot be used in production. The project ships two Prisma schemas:

- `prisma/schema.prisma` — SQLite for local development.
- `prisma/schema.postgres.prisma` — PostgreSQL for Vercel/production.

1. Create a free Postgres database (Vercel Postgres or Neon) and copy its
   pooled connection string.
2. Import this folder into Vercel (`npx vercel` after `npx vercel login`, or the
   dashboard). `vercel.json` already sets the build command to
   `npm run vercel-build`.
3. Add these environment variables in Vercel (Project → Settings → Environment
   Variables):
   - `DATABASE_URL` — Postgres connection string (`sslmode=require`, pooled).
   - `AUTH_SECRET` — 32+ character random secret.
   - `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` — used only for seeding.
   - `NEXT_PUBLIC_APP_NAME` — optional.
4. From your machine, apply the schema and seed the production database
   (use the direct, non-pooled URL for `db push` if your provider requires it):

   ```powershell
   $env:DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
   npm run db:push:postgres
   npm run seed:postgres
   npm run db:generate   # restore the local SQLite client afterwards
   ```

5. Deploy, sign in, and immediately change the seeded admin password.

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run vercel-build` | Generate the Postgres client and build for Vercel |
| `npm run db:push:postgres` | Push the Postgres schema to `DATABASE_URL` |
| `npm run seed:postgres` | Generate Postgres client and seed the production DB |
| `npm run db:generate` | Regenerate the local SQLite Prisma client |

## Verification

The project currently passes:

```bash
npm run typecheck
npm run lint
npm run build
```

Database-backed flows require a reachable Postgres instance before seeding and
end-to-end testing in production.
