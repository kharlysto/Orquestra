# Orquestra

Orquestra is a Next.js workspace for managing customers, CRM conversations, inventory, sales, analytics, and team messages. The interface includes Starter, Growth, and Enterprise plans with role-based access for workspace owners and agents.

## Current status

The application stores records in PostgreSQL through Prisma. The schema and initial migration are in `prisma/`, and `lib/db.ts` now uses the PostgreSQL adapter in `lib/postgres.ts`. The former `data/orquestra.json` file is retained locally as a backup and is excluded from Git; the running app does not read it.

## Run locally

1. Start a local PostgreSQL server and create an empty database named `orquestra`. Install Node.js 24 and npm, then install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root, using `.env.example` as a guide. Set the database URL and a unique `AUTH_SECRET`. Configure SMTP to create accounts, verify email addresses, sign in from a new IP address, or email agent invitations:

   ```dotenv
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/orquestra?schema=public"
   AUTH_SECRET=replace-with-a-long-random-secret
   APP_URL=http://localhost:3000
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=your-email@example.com
   SMTP_PASS=your-app-password
   SMTP_FROM="Orquestra <your-email@example.com>"
   ```

   `EMAIL_LOGO_URL` is optional. If set, it should be a publicly accessible URL for the logo in email templates. `INTEGRATION_WEBHOOK_SECRET` is optional for the CRM webhook endpoint. Never commit `.env.local` or real credentials.

3. Apply the committed schema migration and generate the Prisma client:

   ```bash
   npm run db:deploy
   npm run db:generate
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). Create an account at `/signup`, verify the code sent by email, and open `/dashboard`.

If SMTP is unavailable, signup may create an account but its verification email cannot be delivered, so the account cannot complete verification.

### Import an existing JSON database

On an **empty** migrated PostgreSQL database, place the old file at `data/orquestra.json` and run `npm run db:import-json`. The importer refuses a nonempty target and checks every original field after import. Keep a separate backup of the JSON file until you have confirmed your own records in PostgreSQL. New installations do not need this step.

## What is implemented

- Owner signup, email verification, password login, and verification for sign-ins from new IP addresses.
- Starter, Growth, and Enterprise workspace plans. Growth workspaces can add up to five role-scoped agents.
- Customer tracking from manual entries or CRM conversations.
- Product catalog with identification codes, stock levels, and reorder thresholds.
- Sales recording for tracked customers, status updates, inventory adjustment, and archived sale deletions.
- Analytics based on recorded sales.
- Team messaging with general and private threads, mentions, attachments up to 20 MB, replies, reactions, search, and file browsing.
- CRM conversation and webhook endpoints. Outgoing CRM messages are queued in PostgreSQL; external channel delivery still needs provider integrations.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/` | Next.js pages and API routes |
| `components/` | Landing and dashboard UI |
| `lib/db.ts` and `lib/postgres.ts` | Prisma-backed PostgreSQL data access |
| `lib/auth.ts` and `lib/mailer.ts` | Sessions, verification, and email delivery |
| `lib/types.ts` | Shared application data types |
| `prisma/` | PostgreSQL schema and migration history |
| `scripts/migrate-json-to-postgres.mjs` | One-time importer for an existing JSON database |
| `public/logo/` | Logos served by the application |

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the Next.js application |
| `npm run start` | Serve an existing production build |
| `npx tsc --noEmit` | Check TypeScript types |
| `npm run db:deploy` | Apply committed PostgreSQL migrations |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:import-json` | Import and verify an existing JSON file in an empty database |
| `npm run db:verify` | Check PostgreSQL read/write/delete behavior with temporary records |

`npm run db:migrate` is for creating new migrations during development. The app requires a running PostgreSQL server and `DATABASE_URL` for all API data access.

## Before deployment

Configure production secrets and email delivery, and connect the CRM providers and billing flow required for your deployment. The current API still loads whole collections before updating changed rows; high-concurrency flows such as sales and stock changes should be moved to direct row-level transactions before production traffic.
