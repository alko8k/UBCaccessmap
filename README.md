# UBC Access Map

An independent, accessibility-first campus map for finding a washroom at UBC Vancouver. Community ranks (S–D) sit beside documented access facts. Popularity never implies accessibility.

This is a student portfolio project. It is **not affiliated with the University of British Columbia**.

UBC Vancouver is located on the traditional, ancestral, and unceded territory of the xʷməθkʷəy̓əm (Musqueam) people.

## What you get

- React + TypeScript map of curated buildings and washrooms
- Express API with PostgreSQL via Prisma
- One vote per verified UBC email (`@student.ubc.ca`, `@ubc.ca`)
- Bayesian ranking so a single vote cannot produce an S rank
- Accessibility attributes with source, confidence, and last-verified dates
- Reports and a small admin moderation view

## Do you need Docker?

No. Docker is only a convenient way to run PostgreSQL on your laptop.

You do need **a PostgreSQL database**. Votes, sessions, buildings, and washrooms live there.

Local options:

1. Docker Compose (if you have Docker Desktop): `docker compose up -d`
2. A hosted free Postgres instance (Neon, Supabase, Railway). Put that URL in `DATABASE_URL`. This is also what you should use in production.

The Node apps themselves do not run in Docker.

## Deploying

Suggested split:

| Piece | Typical host |
| --- | --- |
| `apps/web` static build | Vercel, Netlify, Cloudflare Pages |
| `apps/api` Node process | Railway, Render, Fly.io |
| PostgreSQL | Neon, Supabase, Railway |
| Email (later) | Resend. Dev currently logs magic links to the API console and `/api/dev/magic-link` |

Production environment on the API:

```
NODE_ENV=production
DATABASE_URL=postgresql://...
WEB_ORIGIN=https://your-frontend.example
API_ORIGIN=https://your-api.example
SESSION_SECRET=long-random-string
ADMIN_EMAILS=you@ubc.ca
COOKIE_SECURE=true
```

Frontend: set the Vite/API proxy equivalent so the browser calls your API, or host them on the same domain. After deploy:

```bash
npm run db:migrate:deploy --workspace=api
npm run db:seed --workspace=api
npm run db:import --workspace=api
```

`db:import` pulls official UBC building polygons. Seeded washrooms stay attached to the curated building codes.

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
# edit SESSION_SECRET and DATABASE_URL
npm install
npm run db:generate
npx prisma migrate deploy --schema apps/api/prisma/schema.prisma
npm run db:seed
npm run dev:api
npm run dev:web
```

Open http://localhost:5173. In development, request a magic link and use the printed URL or `/api/dev/magic-link?email=you@student.ubc.ca`.

## Ranking

Weighted average:

- overall 40%
- cleanliness 25%
- privacy 20%
- availability 15%

Bayesian shrink toward 3.0 with strength 8. Bands: S ≥ 4.4, A ≥ 3.9, B ≥ 3.3, C ≥ 2.6, otherwise D.

## Data and privacy

- Building footprints: [UBC geospatial open data](https://github.com/UBCGeodata/ubc-geospatial-opendata), PDDL 1.0
- Map tiles: OpenFreeMap / OpenMapTiles / OpenStreetMap
- Washroom interiors are described by floor and directions, not fake indoor GPS
- Magic-link tokens are hashed. No student numbers or ID images
- Email verification shows domain affiliation, not current enrolment
- Official CWL/OIDC would need UBC IAM approval later

## Scripts

```bash
npm run typecheck
npm run lint
npm test
npm run db:import
```
