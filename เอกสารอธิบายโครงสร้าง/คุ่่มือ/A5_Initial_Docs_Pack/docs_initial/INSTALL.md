# INSTALL — ขั้นตอนติดตั้ง/รันระบบ

## 1) ข้อกำหนดเครื่องมือ (ขั้นต่ำ)
- OS: Windows 10/11, macOS 12+, หรือ Ubuntu 22.04+
- Git, Node.js LTS 20.x, npm
- Docker Engine / Docker Desktop + Docker Compose
- VS Code + ส่วนเสริม (ESLint, Prettier, Vue Language Features, YAML)

## 2) เตรียมฐานข้อมูล (เลือก MySQL หรือ MariaDB)
ตัวอย่าง Compose สำหรับพัฒนา:
```bash
# MySQL
docker-compose -f mysql_phpmyadmin.yaml up -d --build
# UI Frontend (หากมี): http://localhost:8080
# phpMyAdmin: http://localhost:8081  (host=db, user=root, pass=rootpassword)

# MariaDB
docker-compose -f maria_phpmyadmin.yaml up -d --build
# UI Frontend: http://localhost:8080
# phpMyAdmin: http://localhost:8081
```

นำเข้าโครงสร้างตัวอย่างจาก `02_schema.sql` (หรือปรับ/สร้างใหม่ตามออกแบบทีม)

## 3) ตั้งค่าไฟล์ .env (ตัวอย่าง)
```env
# API
PORT=3000
NODE_ENV=development
JWT_SECRET=change_me_please

# DB
DB_CLIENT=mysql2
DATABASE_URL=mysql://root:rootpassword@localhost:3306/skills_db

# Uploads
UPLOAD_DIR=./uploads
MAX_UPLOAD_MB=10
ALLOWED_MIME=application/pdf,image/png,image/jpeg,application/zip
```

## 4) ติดตั้งและรัน (โครง Express/Knex + Nuxt 3)
```bash
# Backend
cd backend
npm ci
npm run dev  # หรือ npm run start

# Frontend
cd frontend
npm ci
npm run dev
```

ตรวจสุขภาพระบบ: `GET /system/health` (ผ่าน Nginx/Reverse Proxy หากตั้งค่าแล้ว)

## 5) โครงสร้างงาน Git (แนะนำ)
- main (เสถียรพร้อมส่งมอบ), develop (รวมฟีเจอร์), feature/* (งานย่อย)
- เปิด Pull Request + Code Review ก่อน merge