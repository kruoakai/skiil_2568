# Fullstack Minimal (Transformed from backend_v3 → teaching template)

## Stack
- Backend: Node.js + Express (MVC-lite: Controller/Repository/Middleware)
- DB: MariaDB + phpMyAdmin
- Frontend: Nuxt3 (Vue3)

## Run with Docker (recommended)
- `docker-compose up -d --build`
- Backend API: http://localhost:7000/health
- Frontend: http://localhost:3000
- phpMyAdmin: http://localhost:8080  (host=db, root/rootpassword)

## Manual (no Docker)
- Start DB and import 02_schema.sql
- Backend: `cd backend && cp .env.example .env && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`

## Default user
- admin@example.com / admin1234
