# Test Guide (Backend + Frontend)

## Backend (Vitest + Supertest)
- เตรียมระบบฐานข้อมูล (แนะนำ Docker: `docker-compose up -d --build`)
- รัน: 
  ```bash
  cd backend
  npm install
  npm run test
  ```

## Frontend (Vitest + Vue Test Utils + jsdom)
- รัน:
  ```bash
  cd frontend
  npm install
  npm run test
  ```

## หมายเหตุ
- ชุดทดสอบ backend บางส่วนต้องการ DB พร้อม seed (`02_schema.sql`) และสามารถข้ามได้หาก DB ไม่พร้อม (จะมีคำเตือน)
- สามารถขยายชุดทดสอบเพิ่มเติม เช่น Upload และ Role-based UI
