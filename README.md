# Sufi Infotech — Institute Management App

Full-stack web app for a computer institute: public site with enquiry/admission,
online exams, fee tracking with automatic email reminders, study materials,
assignments, certificates, and separate portals for admins, trainers, and students.

## Stack

- **Backend**: Node.js, Express, MySQL (mysql2), JWT auth, Nodemailer, node-cron, Razorpay, PDFKit
- **Frontend**: React (Vite), React Router, Tailwind CSS, Framer Motion, Axios, Recharts

## Local Setup

### Prerequisites

- Node.js 18+
- A MySQL database (local, or a free one from [Aiven](https://aiven.io/mysql))
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for sending emails (or swap in another SMTP provider)

### 1. Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` with your MySQL credentials and SMTP details, then create the database schema:

```bash
npm run migrate
```

Create your first admin login:

```bash
npm run seed:admin -- "Your Name" admin@example.com "yourStrongPassword"
```

Start the API server (runs on port 5000 by default):

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:5173`. In dev, API calls to `/api/*` and `/uploads/*` are proxied to the backend automatically (see `vite.config.js`) — you don't need to set `VITE_API_URL` locally.

## Features

- **Public site** — course listing, animated hero, enquiry form
- **Admin panel** — dashboard analytics, enquiries, admissions, students, trainers, courses & batches, attendance, study materials, assignments, exams (create/publish/question bank), fees, certificates, notices
- **Trainer portal** — own batches, attendance marking, study material uploads, assignment creation & grading
- **Student portal** — fees (+ Razorpay online payment), exams (timed MCQ, auto-graded), attendance, study materials, assignments, certificates, notices
- **Automation** — daily cron job emails fee reminders before/after due dates; admission and trainer creation flows auto-email login credentials

## Deploying for free (Render + Vercel + Aiven)

This project is set up to deploy entirely on free tiers, on its own domain (`sufiinfotech.in`), completely separate from any other project.

### 1. Push to GitHub

Create a new **empty** repository on GitHub (no README/license), then:

```bash
git remote add origin https://github.com/<your-username>/sufiinfotech.git
git branch -M main
git push -u origin main
```

### 2. Database — Aiven MySQL (free)

1. Sign up at [aiven.io](https://aiven.io) (no card required for the free plan) and create a new **MySQL** service.
2. Once it's running, copy the host, port, user, password, and database name from the service overview.
3. Download the CA certificate Aiven gives you — the backend needs it for SSL. Save it as `backend/aiven-ca.pem` (this repo's `.gitignore` should keep it out of git — verify before committing).
4. You'll paste these values into Render's environment variables in the next step (not into a local `.env` — this service is meant to run in the cloud).

### 3. Backend — Render (free)

1. On [render.com](https://render.com), create a new **Blueprint** and point it at your GitHub repo — it will read `render.yaml` at the repo root and set up the service automatically (root dir `backend`, build `npm install`, start `npm start`).
2. Fill in the environment variables Render prompts for (marked `sync: false` in `render.yaml`): `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and (if using online payments) `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
3. Once deployed, run the schema migration once against the Aiven database — either temporarily set your local `.env` to point at Aiven and run `npm run migrate` + `npm run seed:admin` from your machine, or use Render's shell.
4. In Render, add a **Custom Domain**: `api.sufiinfotech.in`. Render will show you a CNAME target — add that at your DNS provider.

### 4. Frontend — Vercel (free)

1. On [vercel.com](https://vercel.com), import the same GitHub repo, set the **root directory** to `frontend` (framework preset: Vite).
2. Add an environment variable: `VITE_API_URL = https://api.sufiinfotech.in/api`.
3. Deploy. Then add your **Custom Domain**: `sufiinfotech.in` (and `www.sufiinfotech.in`) — Vercel will show the DNS records to add.

### 5. DNS (at your domain registrar for sufiinfotech.in)

| Record | Host | Points to |
|---|---|---|
| A / CNAME | `@` (root) | Vercel's provided value |
| CNAME | `www` | Vercel's provided value |
| CNAME | `api` | Render's provided value |

### 6. Wire CORS

Once both are live, double-check `FRONTEND_URL` in Render's env vars is set to `https://sufiinfotech.in` (already set in `render.yaml`) — the backend only allows requests from this origin.

## Database Schema

See [`backend/src/config/schema.sql`](backend/src/config/schema.sql) for the full table structure.
