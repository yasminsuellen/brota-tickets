# Brota Tickets

Events and ticketing platform: organizers publish events, customers browse and reserve, pay, and receive a QR-coded ticket; door staff validate tickets on entry.

Built for Verzel's Elite Dev take-home challenge. See [`AI_USAGE.md`](./AI_USAGE.md) for what AI tools were used, where, and what was done by hand.

## Live demo

- Front-end: https://brota-tickets.vercel.app/
- Back-end API: https://brota-tickets.onrender.com/

The back-end runs on Render's free tier, which spins down after inactivity. If the first request after a while takes 30-50s, that's the instance waking up, not a bug, it responds normally after that.

## Roles and flows

- **Organizador**: creates and manages events (from date/location/capacity/price, no external catalog required to publish), sees a dashboard with tickets sold, revenue, and occupancy.
- **Cliente**: browses and searches published events, reserves through either a seat map (theater/cinema-style) or a quantity picker (general admission), pays through a simulated confirm/decline flow, gets a QR-coded ticket, can cancel a confirmed reservation, and can share a ticket via a public link.
- **Portaria**: picks an event, then validates tickets by camera QR scan or manual code entry, with a clear result: válido, inválido, já utilizado, or evento errado.

## Tech stack

- **Front-end**: React 19 (Vite), plain SPA with React Router.
- **Back-end**: Node.js, Express, JWT auth.
- **Database**: PostgreSQL via Prisma ORM.
- **External API**: Ticketmaster Discovery, for the organizer's event catalog.

## Decisions

- **Ticketmaster Discovery over TMDb**: the brief allows either external catalog API. Ticketmaster's live shows fit the "organizer publishes a real event" story better than TMDb's movie listings would.
- **Vite (plain SPA) over Next.js**: keeps the front/back split unambiguous, matching the brief's ask for a separate back-end framework instead of one that could double as its own backend.
- **Both reservation flows built, not just one**: the brief asks for either a seat map or a quantity picker. Built both, seat map for smaller/seated venues, quantity for general admission, a deliberate scope increase over the minimum.
- **One reservation, and one QR ticket, per unit purchased**, even for quantity/general-admission buys: a customer buying 3 tickets gets 3 separate reservations and 3 separate QR codes, not one reservation with `quantity: 3`. Lets each ticket be validated and shared independently, matching how a real group would actually walk into the venue.
- **HMAC-signed QR tokens, not random IDs**: the ticket code is `reservationId.signature`, verified server-side with a timing-safe comparison, so a QR can't be forged by guessing or incrementing an ID.
- **Database-level constraints over trusting application logic for concurrency**: found two real race conditions during testing (double-booking the same seat, overselling a quantity event at the last ticket) where a check-then-write inside a transaction wasn't enough, two simultaneous requests could both pass the check before either committed. Fixed with a unique constraint on `(eventId, seatCode)` for seats, and a `SELECT ... FOR UPDATE` row lock for quantity stock, pushing the guarantee into the database instead of trusting the request handler to run alone.
- **Polling over a websocket for near-real-time seat availability**: a few seconds of lag versus standing up and verifying new backend infrastructure this close to the deadline. A deliberate tradeoff, not a default.
- **Deploying is a committed goal, not a stretch**: Vercel for the front-end, Render for the back-end and Postgres. Worth the setup time because seeing it live adds the whole reading of the project before anyone opens the code.

## Setup

### Prerequisites

- Node.js 18+
- A PostgreSQL database (a free instance from [Render](https://render.com), [Supabase](https://supabase.com), or a local Postgres install all work)
- A free Ticketmaster Discovery API key from [developer.ticketmaster.com](https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/)

### Backend

```
cd server
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

```
npx prisma generate
npx prisma db push
node prisma/seed.js
npm run dev
```

`prisma db push` creates the schema on your database. The seed script creates the test accounts and events below, run it once after the first push.

### Frontend

```
cd client
npm install
```

Create `client/.env`:

```
VITE_API_BASE_URL=http://localhost:3333
```

No trailing slash, must match the backend's `PORT`.

```
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

## Known issues

- **Render cold start**: see the live demo note above, the free-tier back-end sleeps after inactivity.
- **Quantity-type reservations, race window at the very last ticket**: the seat-map path is protected by a database-level unique constraint, and the quantity path takes a row lock on the event before counting stock, so two simultaneous purchases can't both succeed past capacity. Verified live, but under real concurrent load (not just two manual test requests), this hasn't been stress-tested.

## Out of scope

Per the brief: nota fiscal, resale between users, a native app, password recovery, and emailing tickets are intentionally not implemented.
