# Healthcare Management System (CareHub)

Fullstack healthcare management system: appointment scheduling, patient records,
prescriptions, and role-based access control. Built to mirror real clinic
workflows in the data model and API design.

## Stack

| Layer    | Tech                                                            |
| -------- | --------------------------------------------------------------- |
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui         |
| Backend  | Node.js + Express + TypeScript                                  |
| Database | PostgreSQL (JSONB history, `tstzrange` conflict exclusion)      |
| Auth     | JWT + RBAC (Admin / Doctor / Patient)                           |
| Reports  | Server-side PDF generation via PDFKit + rate limiting           |

## Features

- **Patients** — registration with medical history stored as JSONB
- **Appointments** — scheduling with DB-level overlap checking
  (`EXCLUDE USING gist (doctor_id WITH =, tstzrange(...) WITH &&)`)
- **Prescriptions** — linked to appointments, RBAC-scoped
- **Auth & roles** — JWT; patients see only their own data, doctors their own
  appointments, admins everything
- **Reports** — `/api/reports/patients` PDF export, rate-limited to 5 req/min/user

## Project structure

```
server/               Express + PostgreSQL API
  migrations/         SQL migrations (schema_migrations tracked)
  src/db/             pool, migrate runner, seed script
  src/middleware/     JWT auth, RBAC, error handling
  src/routes/         auth, patients, appointments, prescriptions, reports
src/                  React frontend
  lib/api.ts          typed API client (uses VITE_API_URL)
```

## Local development

Prerequisite: PostgreSQL 13+ (Docker Compose or local install).

```bash
# 1. Start Postgres (option A: Docker)
docker compose up -d db

# 2. Configure the server
cd server
cp .env.example .env        # then edit DATABASE_URL if needed

# 3. Run migrations + seed demo data
npm run migrate
npm run seed

# 4. Start the API (http://localhost:4000)
npm run dev
```

In a second terminal, start the frontend (Vite proxies `/api` to the server):

```bash
npm install
npm run dev                 # http://localhost:8080
```

### Demo accounts (seeded)

| Role    | Email                  | Password        |
| ------- | ---------------------- | --------------- |
| Admin   | admin@carehub.demo     | Password123!    |
| Doctor  | doctor@carehub.demo    | Password123!    |
| Patient | patient@carehub.demo   | Password123!    |

### API overview

```
POST /api/auth/register         create a patient account
POST /api/auth/login            returns JWT
GET  /api/auth/me               current user
POST /api/auth/users            create staff accounts (admin only)

GET    /api/patients            admin/doctor — list all patients
GET    /api/patients/:id        owner/admin/doctor
POST   /api/patients            admin
PATCH  /api/patients/:id        admin

GET    /api/appointments        scoped by role; ?doctorId&patientId&from&to
GET    /api/appointments/:id
POST   /api/appointments        admin/doctor — 409 on overlap
PATCH  /api/appointments/:id/status

GET    /api/prescriptions       scoped by role; ?appointmentId
POST   /api/prescriptions       admin/doctor
PATCH  /api/prescriptions/:id

GET    /api/reports/patients    PDF export (admin/doctor, 5 req/min)
```

## Deploying

### Backend + database → Render

1. Push this repo to GitHub.
2. In Render, create a **New → Blueprint**, point it at the repo. `render.yaml`
   defines the free PostgreSQL database and the `carehub-api` web service
   (migrations run automatically on boot).
3. Set `CORS_ORIGIN` in the Render dashboard to your deployed frontend URL
   (e.g. `https://carehub.vercel.app`).
4. Optionally seed demo data: open the Render shell and run
   `npm run seed` in `/opt/render/project/src/server`.

### Frontend → Vercel

1. In Vercel, import the repo (it auto-detects Vite via `vercel.json`).
2. Add environment variable `VITE_API_URL=https://<your-api>.onrender.com`.
3. Deploy. Update the "Live Demo" links on the homepage with the real URLs.

## Tests

```bash
npm test          # frontend (vitest)
cd server && npm run typecheck
```

## License

Private project — not licensed for reuse.