# TEST PLAN — การทดสอบแบบบูรณาการ

## กลยุทธ์
- Functional: สมัคร/ล็อกอิน, Home ตามบทบาท, CRUD และรายการ, กฎธุรกิจ (Evidence Rule, Unique Assignment)
- Security: IDOR guard (403), auth (401/403), อัปโหลดชนิดต้องห้าม/เกินขนาด (415/413)
- Non-functional: โหลด/สเกล p95, ขนาดไฟล์, ข้อความผิดพลาดอ่านง่าย

## Entry/Exit Criteria
- Entry: ติดตั้ง/รันระบบสำเร็จ, DB พร้อม seed
- Exit: โฟลว์หลักผ่าน, ข้อผิดพลาดร้ายแรงถูกแก้, เอกสารถูกอัปเดต

## Test Cases (อย่างย่อ)
- POST /auth/register → 201/200; POST /auth/login → 200 + token
- GET /home ตามบทบาท (ตรวจด้วยตา)
- GET /task1/evaluation-results unauthorized → 403
- PATCH /task2/results/:id/submit (ไม่มีไฟล์) → 400 EVIDENCE_REQUIRED; (มีไฟล์) → submitted
- POST /task4/assignments ซ้ำ → 409
- GET /task5/reports/progress → โครงสร้าง/สูตรถูกต้อง
- อัปโหลดไฟล์ >10MB → 413; ชนิดต้องห้าม → 415
- ยิงโหลด k6/autocannon → p95 เทียบเกณฑ์

> แนบหลักฐาน: Postman/Swagger, Newman report, สกรีนช็อต UI/ตาราง, รายงานโหลด