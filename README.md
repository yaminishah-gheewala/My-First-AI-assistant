# Health Nutrition Lab — Personalized Health & Nutrition Lab Analyzer

An interactive dashboard that demystifies blood test and nutrition lab results.
Enter numbers from a lab report and see each value plotted on a color-coded
scale (red = low, green = normal, orange = high), with plain-language
explanations, dietary factors, and lifestyle goals for anything out of range.

## Features

- Email/password accounts (bcrypt-hashed passwords, signed session cookies)
- First-time visitors are sent to Create Account; returning visitors are sent to Log In
- Interactive lab analyzer covering 36 common lab metrics, grouped by category
- Submit a report to get a personalized breakdown and trackable lifestyle goals
- Saved Reports page to review or delete past submissions
- Health Trends dashboard charting metrics across report dates
- My Account page: profile info, change password, delete account, and
  per-nutrient enable/disable toggles (sorted alphabetically) for lab panels
  that don't include every metric

## Getting started

```bash
npm install
cp .env.example .env.local   # then set SESSION_SECRET and DATABASE_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Data is stored in Postgres. Point `DATABASE_URL` at any Postgres database
(local, or a free hosted one like Neon/Vercel Postgres) — tables are created
automatically on first run.

## Deploying

Deploy on [Vercel](https://vercel.com): import this repo, add a Postgres
storage integration (Storage tab → Create Database) so `POSTGRES_URL` is set
automatically, and set `SESSION_SECRET` to a long random string in the
project's environment variables.

## Tech stack

Next.js (App Router) + TypeScript, Tailwind CSS, Postgres (`pg`), jose (JWT
sessions), bcryptjs, recharts.
