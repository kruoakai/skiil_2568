# Backend Tests (Vitest + Supertest)

## เตรียมระบบ
- รันฐานข้อมูลและ seed ด้วย `02_schema.sql`
- แนะนำให้ใช้ Docker: `docker-compose up -d --build`

## รันทดสอบ
```bash
cd backend
npm install
npm run test
```

รวม 3 ชุดทดสอบ:
- `health.test.mjs` → `/health`
- `auth.test.mjs` → `/api/auth/login` (ใช้ admin@example.com / admin1234)
- `users.server.test.mjs` → `/api/users/server` (ต้องแนบ Bearer token)
