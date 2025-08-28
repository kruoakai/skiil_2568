# API GUIDE — โครงสร้างและตัวอย่าง API

## 1) ภาพรวม
- REST + JSON, เอกสาร OpenAPI ให้บริการที่ `GET /openapi.json` และ/หรือ Swagger UI
- Authentication: JWT (Authorization: Bearer <token>)
- พารามิเตอร์สำหรับ List:
  - `q` (ค้นหา), `sort=field:asc|desc`, `page`, `pageSize`

ทรัพยากรหลัก: Users, Topics, Indicators, Periods, Assignments, Results, Evidence

## 2) Authentication
```http
POST /api/auth/login
POST /api/auth/register   # (กรณีเปิดลงทะเบียน) role เริ่มต้น evaluatee
```

## 3) ตัวอย่างงาน (Task Endpoints)
> ใช้สำหรับทดสอบตามข้อกำหนดและการให้คะแนน

### 3.1 IDOR Guard
```http
GET /task1/evaluation-results?user_id={uid}&assignment_id={aid}
# admin: เห็นได้ทุก assignment
# evaluator: เห็นเฉพาะ assignment ของตน
# evaluatee: เห็นเฉพาะของตนเอง
# เกินสิทธิ์ → 403 { "error":"forbidden" }
```

### 3.2 Evidence Submit Rule
```http
PATCH /task2/results/:id/submit
# ถ้า indicator.type = 'yes_no' และ yes_no = 1 แต่ไม่มีไฟล์แนบ -> 400 { "error":"EVIDENCE_REQUIRED" }
# กรณีผ่าน -> อัปเดตเป็น submitted พร้อม submitted_at
```

### 3.3 Normalized /60
```http
GET /task3/reports/normalized?period_id=1
# score_1_4: r = (score - 1)/3
# yes_no: 0 หรือ 1
```

### 3.4 Unique Assignment
```http
POST /task4/assignments
# body: { evaluator_id, evaluatee_id, period_id, dept_id }
# ซ้ำชุด (evaluator_id, evaluatee_id, period_id) -> 409 { "error":"DUPLICATE_ASSIGNMENT" }
```

### 3.5 Progress by Department
```http
GET /task5/reports/progress?period_id=1
# คืนอาร์เรย์ { department, submitted, total, percent }
# percent = submitted/total*100 (ปัด 2 ตำแหน่ง; total=0 → 0)
```

## 4) ตัวอย่างการเรียก List
```http
GET /api/indicators?q=MEDIA&sort=created_at:desc&page=1&pageSize=10
```

## 5) โครงสร้างโฟลเดอร์ (แนะนำ Backend)
```
backend/
  src/
    routes/
    controllers/
    services/
    middlewares/
    db/ (knex, migrations, seeds)
  .env.example
```

> หมายเหตุ: เพิ่มตัวอย่าง Request/Response จริงหลังเริ่มพัฒนาและมี Postman/Swagger