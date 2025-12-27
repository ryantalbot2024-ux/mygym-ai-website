# MyGym.AI Website (Marketing + Waitlist + Coach Cohort)

This is a lightweight, deployable website with:
- Static pages (Home, Coaches, Pricing, About, Privacy, Terms)
- Working forms:
  - /api/waitlist
  - /api/coach-apply
- SQLite database stored at `server/db/mygym.sqlite`
- Basic honeypot spam protection and server-side validation

## Run locally
```bash
npm install
npm run dev
# open http://localhost:3000
```

## Deploy (easy options)
### Option A: Render.com (recommended for simplicity)
- New Web Service from this repo
- Build command: `npm install`
- Start command: `npm start`

### Option B: Fly.io or Railway
- Use Dockerfile provided

## Notes
- Replace Privacy/Terms placeholders before production launch.
- Hook `/api/event` to your analytics provider later.