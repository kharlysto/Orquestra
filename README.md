# Orquestra

Orquestra is a Next.js workspace for managing customers, CRM conversations, inventory, sales, analytics, and team messages. The interface includes Starter, Growth, and Enterprise plans with role-based access for workspace owners and agents.

## Current status

The application currently stores its records in `data/orquestra.json` through `lib/db.ts`. That file is created locally and is excluded from Git. A PostgreSQL schema is drafted in `prisma/schema.prisma`, but the application has **not yet been migrated** to PostgreSQL. The `db:*` scripts do not migrate existing JSON records or switch the app to Prisma.

## Run locally

1. Install Node.js and npm, then install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root. Set a unique `AUTH_SECRET` and configure SMTP if you need to create accounts, verify email addresses, sign in from a new IP address, or email agent invitations:

   ```dotenv
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

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Create an account at `/signup`, verify the code sent by email, and open `/dashboard`.

If SMTP is unavailable, signup may create an account but its verification email cannot be delivered, so the account cannot complete verification. The local JSON database is created on first use. It is not included in this repository.

## What is implemented

- Owner signup, email verification, password login, and verification for sign-ins from new IP addresses.
- Starter, Growth, and Enterprise workspace plans. Growth workspaces can add up to five role-scoped agents.
- Customer tracking from manual entries or CRM conversations.
- Product catalog with identification codes, stock levels, and reorder thresholds.
- Sales recording for tracked customers, status updates, inventory adjustment, and archived sale deletions.
- Analytics based on recorded sales.
- Team messaging with general and private threads, mentions, attachments up to 20 MB, replies, reactions, search, and file browsing.
- CRM conversation and webhook endpoints. Outgoing CRM messages are queued in the local store; external channel delivery still needs provider integrations.

## Project layout

| Path | Purpose |
| --- | --- |
| `app/` | Next.js pages and API routes |
| `components/` | Landing and dashboard UI |
| `lib/db.ts` | Current local JSON data access |
| `lib/auth.ts` and `lib/mailer.ts` | Sessions, verification, and email delivery |
| `lib/types.ts` | Shared application data types |
| `prisma/schema.prisma` | Draft PostgreSQL data model |
| `public/logo/` | Logos served by the application |

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the Next.js application |
| `npm run start` | Serve an existing production build |
| `npx tsc --noEmit` | Check TypeScript types |

The package also contains Prisma commands (`db:generate`, `db:migrate`, `db:deploy`, and `db:push`) for the planned PostgreSQL work. They are **not** a completed migration procedure. Preserve `data/orquestra.json` until its records have been imported and verified in PostgreSQL and `lib/db.ts` has been replaced.

## Before deployment

Complete and verify the PostgreSQL migration, replace the JSON data adapter, configure production secrets and email delivery, and connect the CRM providers and billing flow required for your deployment. The current JSON store is intended for local development.
