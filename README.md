# Brota Tickets

🇺🇸 English | [🇧🇷 Português](./README.pt-BR.md)

Events and ticketing platform: organizers publish events, customers browse and reserve, pay, and receive a QR-coded ticket; door staff validate tickets on entry. **[Click here for the live demo.](https://brota-tickets.vercel.app/)**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://brota-tickets.vercel.app/)
[![Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://brota-tickets.onrender.com/)

Built for Verzel's Elite Dev take-home challenge. See [`AI_USAGE.md`](./AI_USAGE.md) for what AI tools were used, where, and what was done by hand.

## Live demo

- Front-end: https://brota-tickets.vercel.app/
- Back-end API: https://brota-tickets.onrender.com/

The back-end runs on Render's free tier, which spins down after inactivity. If the first request after a while takes 30-50s, that's the instance waking up, not a bug, it responds normally after that.

## Features

- Both seat-map (theater/cinema-style) and quantity (general admission) reservation flows implemented.
- QR tickets signed with HMAC-SHA256 and verified server-side with a timing-safe comparison (`server/utils/qr.js`), can't be forged by guessing or incrementing an ID.
- Ticket validation is a single atomic conditional update (`updateMany({ where: { validated: false } })`), so two near-simultaneous scans of the same ticket can't both succeed.
- Database-level concurrency guarantees: a unique constraint on `(eventId, seatCode)` stops the same seat from being sold twice, and a `SELECT ... FOR UPDATE` row lock stops a quantity event from overselling at the last ticket, both found and fixed after live testing surfaced the race, not assumed safe from the transaction wrapper alone.
- Near real-time seat/stock availability: the reservation screen polls every 5s and reconciles out anything another customer just took, so a stale selection can't be submitted.
- Cancellation with stock return: a client can cancel a confirmed reservation and the seat/stock frees up immediately, blocked once the ticket has already been validated at the door.
- Portaria validates by camera QR scan or manual code entry, with the same code also shown to clients in Meus Ingressos as a fallback if a scan fails.
- Organizer dashboard: tickets sold, gross revenue, and occupancy per event.
- Installable PWA with a proper tab icon and mobile install icon, tested on real Android/iOS hardware.

## Roles and flows

- **Organizador**: creates and manages events (from date/location/capacity/price, no external catalog required to publish), sees a dashboard with tickets sold, revenue, and occupancy.
- **Cliente**: browses and searches published events, reserves through either a seat map (theater/cinema-style) or a quantity picker (general admission), pays through a simulated confirm/decline flow, gets a QR-coded ticket, can cancel a confirmed reservation, and can share a ticket via a public link.
- **Portaria**: picks an event, then validates tickets by camera QR scan or manual code entry, with a clear result: válido, inválido, já utilizado, or evento errado.

## Tech Stack

- **Front-end**: React 19 (Vite), plain SPA with React Router.
- **Back-end**: Node.js, Express, JWT auth.
- **Database**: PostgreSQL via Prisma ORM.
- **External API**: Ticketmaster Discovery, for the organizer's event catalog.

## Brief requirements

Built for Verzel's Elite Dev take-home challenge, a fixed set of constraints shaped every decision below:

- Stack: React front-end (any build tool), Node/Python/Java back-end, any database. Chose Node/Express + PostgreSQL via Prisma.
- Auth with three distinct roles: Organizador, Cliente, Portaria.
- An external catalog API for the organizer to publish from, Ticketmaster Discovery or TMDb. Chose Ticketmaster.
- Implement at least one reservation UI, seat map or quantity picker. Built both.
- Simulated payment only, no real transaction.
- QR ticket generation that can't be forged.
- No double-booking the same seat, no double-validating the same ticket.
- Seed data: 1 organizador, 2 clientes, 1 portaria, at least 1 published event with available tickets.
- 7-day deadline from receipt of the challenge.
- Optional deploy; README with setup/known-issues; a dedicated AI-usage.

## Architecture Decisions

### Ticketmaster Discovery over TMDb
The brief allows either external catalog API. Ticketmaster's live shows fit the "organizer publishes a real event" story better than TMDb's movie listings would, and it's the API wired into `server/routes/events.js`'s `/catalog` endpoint.

### Vite (plain SPA) over Next.js
Keeps the front/back split clear. A meta-framework like Next.js can act as its own backend via API routes, which would blur the brief's ask for a separate back-end framework. Vite bundles a client-only React app, nothing more.

### Both reservation flows built, not just one
The brief asks for either a seat map or a quantity picker. Built both, `client/src/pages/Reservar.jsx` branches on `event.type`, decided server-side by capacity in `server/utils/seatMap.js`, seat map for smaller/seated venues, quantity for general admission, a deliberate scope increase over the minimum.

### One reservation, one QR ticket, per unit purchased
Even a quantity/general-admission purchase creates one `Reservation` row, and one QR, per ticket (`server/routes/reservations.js`), instead of a single row with `quantity: 3`. Lets each ticket be validated and shared independently, matching how a real group actually walks into a venue.

### HMAC-signed QR tokens, not random IDs
The ticket code is `reservationId.signature` (`server/utils/qr.js`), verified server-side with `crypto.timingSafeEqual`, so a code can't be forged by guessing or incrementing an ID.

### Database-level guarantees over trusting application logic for concurrency
Two real race conditions surfaced during testing: the same seat could be booked twice, and a quantity event could oversell at the last ticket, because a check-then-write inside a transaction still leaves a gap for two simultaneous requests to both pass the check before either commits. Fixed with a unique constraint on `(eventId, seatCode)` for seats, and a `SELECT ... FOR UPDATE` row lock for quantity stock, pushing the guarantee into the database instead of trusting the request handler to run alone.

### Polling over a websocket for near-real-time seat availability
A few seconds of lag versus standing up and verifying new backend infrastructure this close to the deadline. A deliberate tradeoff, not a default.

### Deploying as a committed goal, not a stretch
Vercel for the front-end, Render for the back-end and Postgres. Worth the setup time because seeing it live changes the whole reading of the project before anyone opens the code.

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database (a free instance from [Render](https://render.com), [Supabase](https://supabase.com), or a local Postgres install all work)
- A free Ticketmaster Discovery API key from [developer.ticketmaster.com](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)

### Backend

```bash
git clone git@github.com:yasminsuellen/brota-tickets.git
cd brota-tickets/server
npm install
```

Create `server/.env`:

```
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="any-long-random-string"
QR_SECRET="any-long-random-string"
TICKETMASTER_API_KEY="your-ticketmaster-key"
PORT=3333
```

`JWT_SECRET` signs login sessions, `QR_SECRET` signs ticket QR codes so they can't be forged. Use different long random strings for each. `PORT` is optional, defaults to 3333.

```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

`prisma db push` creates the schema on your database. The seed script creates the test accounts and events below, run it once after the first push.

### Frontend

```bash
cd ../client
npm install
```

Create `client/.env`:

```
VITE_API_BASE_URL=http://localhost:3333
```

No trailing slash, must match the backend's `PORT`.

```bash
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Test accounts

Seeded by `server/prisma/seed.js`, all use the password `senha123`:

| Role | Email |
|---|---|
| Organizador | organizador@brotatickets.com |
| Cliente | cliente1@brotatickets.com |
| Cliente | cliente2@brotatickets.com |
| Portaria | portaria@brotatickets.com |

The seed also publishes 6 events with no reservations, so there are always available tickets to buy.

## Project Structure

```
client/src/
├── pages/            # One file per route: Login, Home, Cliente, EventDetail, Reservar,
│                      # Pagamento, MeusIngressos, TicketGroup, TicketDetail, Portaria,
│                      # Organizador, Catalogo, CriarEvento, GerenciarEvento
├── components/        # Shared UI: TopNav, Layout, PageHeader, LoginModal, LogoutButton,
│                      # ProtectedRoute, ScrollToTop, SkeletonCard
├── context/           # AuthContext (JWT/user session state)
├── utils/             # formatDateTime, createReservation, shared helpers
├── styles/            # Design tokens: colors, typography, spacing
└── assets/            # Images, icons

server/
├── routes/            # auth.js, events.js, reservations.js
├── middleware/        # auth.js (JWT verification, role gating)
├── lib/                # prisma.js (Prisma client instance)
├── utils/              # auth.js (JWT sign/verify), qr.js (HMAC sign/verify), seatMap.js
├── prisma/             # schema.prisma, seed.js
└── scripts/            # check-ticketmaster.js (manual API smoke test)
```

## Known issues

- **Render cold start**: see the live demo note above, the free-tier back-end sleeps after inactivity.
- **Quantity-type reservations, race window at the very last ticket**: the seat-map path is protected by a database-level unique constraint, and the quantity path takes a row lock on the event before counting stock, so two simultaneous purchases can't both succeed past capacity. Verified live, but under real concurrent load (not just two manual test requests), this hasn't been stress-tested.

## Out of scope

Per the brief: nota fiscal, resale between users, a native app, password recovery, and emailing tickets are intentionally not implemented.

---

**Yasmin Suellen** - [GitHub](https://github.com/yasminsuellen) · [LinkedIn](https://www.linkedin.com/in/yasminsuellen/) · [Portfolio](https://yasminsuellendev.vercel.app/)
