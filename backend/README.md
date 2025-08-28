# Backend Minimal (Derived from backend_v3)

## Quick Start (without Docker)
1) Install: `npm install`
2) Copy `.env.example` to `.env` and adjust if needed.
3) Start MariaDB and import `02_schema.sql` (or run docker-compose at root)
4) Run: `npm run dev`
- Health: GET http://localhost:7000/health
- Login: POST http://localhost:7000/api/auth/login { email, password }
  - Default admin: admin@example.com / admin1234
- Users: CRUD under /api/users (Bearer token required)

## With Docker (recommended for class)
- From project root: `docker-compose up -d --build`
- phpMyAdmin: http://localhost:8080  (host: db, user: root, pass: rootpassword)
