# AI usage

Every product, scope, and architecture decision in this project is mine. Two things were AI-assisted: **Claude Code** (Anthropic's CLI agent) for implementation, and an AI image generator for the hero photo asset. What each was used for, and what wasn't, below.

## Design, before any code existed

The brief warns against generic AI-generated UI. To avoid that, the design came before implementation, not the other way around: reference apps (ingresso.com's seat map, eventim.com.br's quantity flow, sympla.com.br's event creation) were reviewed and noted by hand first, then the actual screens were designed by hand in Figma, no AI design tooling involved, landing on a specific visual identity (violet/magenta/gold, a bold condensed display face) as a deliberate choice, not a default. An AI-generated concert photo was used as the login/home hero image, one image asset within a hand-built design, not the design itself. That finished Figma design is what Claude Code implemented from, screen by screen, for the rest of the build. This is the project's main defense against "AI slop": the design decisions exist independently of, and before, any generated code.

## Where Claude Code was used

- Scaffolding: Express route structure, Prisma schema, the initial React route skeleton for the three roles.
- Implementing screens against the locked Figma design, translating a finished visual spec into React components rather than generating UI from a text prompt alone.
- Backend logic with real security/correctness requirements: JWT auth, HMAC-signed QR tokens (`server/utils/qr.js`) verified with a timing-safe comparison, atomic conditional updates so a ticket can't be validated twice (`updateMany({ where: { validated: false } })`), and a database row lock (`SELECT ... FOR UPDATE`) so two simultaneous purchases can't oversell the same event.
- Debugging real bugs as they came up: a CORS bug from a missing `cors` middleware that `curl` testing had silently masked, Prisma 7 setup quirks, a synchronous throw inside the QR scanner's cleanup that `.catch()` alone didn't catch, and a bug found through manual live testing where the Portaria camera fired several validation requests per scan and the UI ended up showing the last one to resolve instead of the first, making a fresh ticket look already used.
- Mobile-specific CSS fixes found during real-device testing.

## What was done without AI

- Every product and scope decision: Ticketmaster over TMDb, Vite over Next.js, building both the seat-map and quantity reservation flows instead of just one, the Vercel/Render deploy split, which optional differentiators (cancellation with stock return, near-real-time seat availability, search/filter) were worth building against the time left.
- The visual identity and design references, decided in Figma before any implementation prompt was written.
- All manual QA: exercising every role's flow live in the browser after each phase, testing on real Android/iOS hardware, and the testing that actually caught the Portaria double-scan bug above, that bug wasn't found by reading code.
- Reviewing and deciding whether to accept every AI-suggested change. Nothing was merged unread.
- The choice, when a real-time seat map came up as a differentiator, to use polling over a websocket: less accurate by a few seconds, but no new backend infrastructure to stand up and verify working this close to the deadline. That tradeoff was a deliberate call, not a default.
