# Sufi Infotech — Institute Management App

Full-stack web app for a computer institute: public enquiry/admission form,
student portal with online exams, fee tracking with automatic email reminders,
and an admin dashboard for courses, batches, enquiries, and fees.

## Stack

- **Backend**: Node.js, Express, MySQL (mysql2), JWT auth, Nodemailer, node-cron
- **Frontend**: React (Vite), React Router, Tailwind CSS, Axios

## Prerequisites

- Node.js 18+
- MySQL server running locally (or a connection string to a hosted one)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for sending emails (or swap in another SMTP provider)

## Setup

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

Opens on `http://localhost:5173`. API calls to `/api/*` are proxied to the backend automatically (see `vite.config.js`).

## What's built so far (Phase 1 foundation)

- Public site with course listing + enquiry form
- Admin login, dashboard (stats), enquiry management, course & batch management, fee tracking
- Student login, dashboard (fees / exams / results)
- Online exam engine: timed MCQ exams with auto-submit and auto-grading
- Fee installment plans with a daily cron job that emails reminders before/after due dates
- Admission flow that converts an enquiry into a student account + fee plan and emails login credentials

## Not yet built (next phases)

- Attendance UI, study materials, assignments (backend routes exist, no admin/student UI yet)
- Certificate generation (PDF)
- Online payment gateway (Razorpay) — fee marking is currently manual/cash in the admin panel
- WhatsApp/SMS notifications
- Notice board UI (backend routes exist)
- Analytics charts (revenue-by-month / enquiries-by-course endpoints exist, no chart UI yet)

## Database Schema

See [`backend/src/config/schema.sql`](backend/src/config/schema.sql) for the full table structure.
