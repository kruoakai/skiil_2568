# USER GUIDE — การใช้งานสำหรับผู้ใช้ตามบทบาท

## บทบาท (Roles)
- Admin: บริหาร Users/Topics/Indicators/Periods/Assignments/Reports
- Evaluator: รับมอบหมายงาน → กรอกผล/อัปโหลดหลักฐาน → ยืนยันส่ง
- Evaluatee: แนบหลักฐาน/ติดตามสถานะ/ดูรายงานส่วนบุคคล

## โครงร่างหน้าใช้งาน (IA)
- `/home` (หรือ `/`) แดชบอร์ดตามบทบาท + ช็อตคัตไป `/reports/normalized` และ `/system/health`
- Admin: `/admin/users`, `/admin/topics`, `/admin/indicators`, `/admin/periods`, `/admin/assignments`, `/admin/results`
- Evaluator: `/evaluator/assignments`, `/evaluator/history`
- Evaluatee: `/me/evaluation`, `/me/evidence`, `/me/report`
- Reports: `/reports/normalized`, `/reports/progress`

## ตัวอย่างขั้นตอน (Evaluatee)
1) Login
2) เปิด `/me/evidence` → อัปโหลดไฟล์ตามชนิดที่กำหนด
3) ตรวจสถานะใน `/me/evaluation` (draft/submitted/locked)
4) พิมพ์รายงานใน `/me/report`

## แนวปฏิบัติการใช้งาน
- ฟอร์มทุกหน้าควรมี validation พร้อมข้อความชัดเจน
- ตาราง (v-data-table) รองรับค้นหา/เรียง/แบ่งหน้า
- แสดง badge สถานะตามค่าจริงจาก API