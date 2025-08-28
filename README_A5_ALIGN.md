# A5 Alignment: Database & App (Nuxt3 + Express)

## 1) นำเข้าโครงสร้างฐานข้อมูล (จาก 02_schema.sql)
```bash
cd backend
npm install
# ถ้าใช้ Docker: ให้บริการ db พร้อมแล้ว (host=db, root/rootpassword)
npm run db:import
# แพตช์รหัสผ่านผู้ใช้ตัวอย่างให้ล็อกอินได้
npm run db:patch-passwords
```

- Database: `skills_db`
- ตารางหลัก: users, evaluation_periods, evaluation_topics, indicators, assignments, evaluation_results, attachments, ฯลฯ

## 2) การล็อกอิน (ตัวอย่าง)
- Admin: `admin@example.ac.th` / `admin1234` (หลัง patch)
- Evaluator: `eva.it@example.ac.th` / `pass1234`
- Evaluatee: `t.it01@example.ac.th` / `pass1234`

## 3) Frontend ปรับฟอร์มและตาราง
- ใช้ `name_th` แทน `name`
- ตัวเลือก role: `evaluatee / evaluator / admin`

## 4) OpenAPI
- เพิ่ม `POST /api/auth/register`
- ปรับ enum ของ role เป็น `admin/evaluator/evaluatee`
