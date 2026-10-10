# Orquestra

Orquestra is an orchestrated SaaS workspace for CRM, inventory, sales, analytics, and internal agent collaboration.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, create a workspace at `/signup`, and use `/dashboard`.

The application now stores records in PostgreSQL through Prisma. The former `data/orquestra.json` file is retained locally as an ignored backup.

## Implemented foundation

- Starter, Growth, and Enterprise plan entitlements.
- Owner signup and password login using signed, HTTP-only sessions.
- Starter: manual operation, 100-product limit, no agent invitations.
- Growth/Enterprise: owner-created Sales, Inventory, Analytics, and CRM agent accounts with scoped roles and generated invite credentials.
- Inventory products with stock and reorder thresholds.
- Sales recording that decrements stock and calculates totals.
- Analytics aggregation for revenue, orders, units, and best sellers.
- Internal team room for agent coordination and mentions-ready messages.

API routes live under `app/api`. External Gmail, Teams, Zoom, and other messaging providers should be added as explicit adapters against the CRM/message model; they are not silently simulated by the local implementation.

## Next production layer

Before deployment, move high-concurrency mutations to direct row-level transactions, add audit logs and rate limiting, and connect billing/webhooks to make plan selection authoritative.


The initial PostgreSQL migration is applied locally, existing JSON records were verified after import, and runtime data access now uses Prisma.



# System Design and Interactivity
# suggestions
# critic


- Please enhance the design, animation, interactivity, and overall UX/UI of the system cuz very ai slope pa siya currently. Di namn kasi ako magaling sa design e so yeah

- Yung mga background ng button pakialis na rin kasi nagiging ai slope lang siya lalo and then yon

- Add din pala kayo ng settings each user where they can modify system appearance like darkmode or light mode etc etc.

- Ayon, UI/UX Enhancement talaga ako na bahala sa backend and database pati sa load balancer and CDN kapag na deploy na natin.

- Tas sa color scheme naman ang parang monochrome siya so I suggest na add tayo ng other color scheme like wag tayong mag stick sa dalwang color scheme natin ngayon and mediyo masakit siya sa eyes.

- Sa main landing page naman yung sa footer kayo na lang siguro gumawa ng subpages para sa mga yon then configure ng term and policy. Sa payment method naman ng plan meron akong paymongo pwede natin i-test later.

- Yung CRM naman later ko na rin i-configure pero if may free time kayo try niyo na

- Check the prisma scheme.prisma file yan yung schema ng database natin, di ko na minigrate sa mongoDB kasi naka next.js na rin tong system e so mas reliable ang prisma and postgresql sa setup natin plus fast indexing.
