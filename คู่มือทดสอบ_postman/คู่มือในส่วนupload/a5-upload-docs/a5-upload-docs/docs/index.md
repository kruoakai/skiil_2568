# คู่มือระบบอัปโหลดหลักฐาน (Attachments)

> เวอร์ชัน: 2025-09-12 • บริบท: ระบบประเมินบุคลากร (A5) • รูปแบบ: MkDocs Material

!!! info "วัตถุประสงค์"
    เอกสารนี้สรุป **แนวคิด สคีมา บทบาท/สิทธิ์ จุดเข้าใช้งาน API นโยบายไฟล์ ความปลอดภัย การทดสอบ และเช็กลิสต์**  
    เพื่อให้ครู/กรรมการ/นักศึกษาสามารถใช้งานและตรวจประเมินได้อย่างถูกต้องและโปร่งใส

## ขอบเขต (Scope)
- การอัปโหลด/จัดการไฟล์หลักฐาน โดยผูก `period_id` + `evaluatee_id` + `indicator_id` + `evidence_type_id` กับตาราง `attachments`
- บทบาท: **admin / evaluator / evaluatee**
- ฟังก์ชัน: **upload / list / replace file / update metadata / delete**
- ครอบคลุมทั้ง **Postman / Swagger / Supertest**

## โครงสร้างโปรเจกต์ (ส่วนที่เกี่ยวข้อง)
```text
backend/
  app.js
  server.js
  .env
  uploads/                     # ไฟล์จริง (เสิร์ฟผ่าน /uploads/*)
  controllers/
    upload.controller.js
  middlewares/
    auth.js
    upload.js                  # Multer config + type/size filter
  repositories/
    attachments.js
    assignments.js
    indicatorEvidence.js
  routes/
    upload.routes.js
  db/
    knex.js
  openapi_full.json
```

> **หมายเหตุ**: แยก `app.js` (Express app) ออกจาก `server.js` (listen) เพื่อให้ **ทดสอบ e2e ได้โดยไม่ต้องเปิดพอร์ต** และ **ดีต่อการดีพลอย**

## นโยบายบทบาท (Policy & Rationale)
| Role        | Upload | List | Replace File | Update Meta | Delete | Read Assigned | เหตุผลสำคัญ |
|-------------|:-----:|:---:|:------------:|:-----------:|:------:|:-------------:|---|
| Evaluatee   | ✅    | ✅  | ✅           | ✅          | ✅     | –             | เจ้าของหลักฐานควบคุมไฟล์ตนเองในงวดที่เปิด |
| Evaluator   | –     | –   | –            | –           | –      | ✅            | ป้องกันการแก้ไขโดยผู้ประเมิน เพื่อคง **integrity** |
| Admin       | ✅(แทน)| ✅  | ✅           | ✅(reassign)| ✅     | ✅            | ดูแลความถูกต้อง แก้ผัง/ย้ายไฟล์ได้เมื่อจำเป็น |

!!! tip "การมอบหมาย (assignments)"
    ระบบตรวจสิทธิ์ผ่านตาราง `assignments(period_id, evaluator_id, evaluatee_id)` และ mapping `indicator_evidence(indicator_id, evidence_type_id)` เพื่อควบคุมชนิดไฟล์ตามตัวชี้วัด

## เส้นทางอ่านเอกสาร
- **API** → รายละเอียด endpoint แยกตามบทบาท + ตัวอย่าง cURL/Postman
- **ความปลอดภัย** → นโยบายไฟล์ / การตั้งค่าเซิร์ฟเวอร์ / Audit / Backup
- **การทดสอบ** → Supertest / Test Matrix / Checklist
- **ภาคผนวก** → ER/Flow (Mermaid), ตัวอย่างโค้ด Multer/Express, .env

## Quick Start (MkDocs)
```bash
python -m pip install mkdocs-material mkdocs-mermaid2-plugin mkdocs-with-pdf
mkdocs serve     # http://127.0.0.1:8000
mkdocs build     # website -> ./site และได้ PDF (with-pdf)
```