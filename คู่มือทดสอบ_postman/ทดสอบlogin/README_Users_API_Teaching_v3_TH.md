# ชุดสอนใช้งาน Users API (Auth & CRUD) – เวอร์ชัน 3

เอกสารนี้ใช้คู่กับไฟล์ Postman ที่แนบมา:
- `Users_API_Teaching_Pack_v3.postman_collection.json`
- `Local_Dev_Users_API_v3.postman_environment.json`

## 1) เตรียมสิ่งแวดล้อม
- เซิร์ฟเวอร์ API รันที่ `http://localhost:7000`
- `.env` ฝั่งเซิร์ฟเวอร์ควรตั้ง `JWT_SECRET`, ฐานข้อมูล และ CORS ให้เรียบร้อย
- สร้างผู้ใช้อย่างน้อย 1 รายเพื่อทดสอบล็อกอิน (หรือใช้ request `Admin Examples → Create Admin User`)

## 2) Import และตั้ง Environment
1. เปิด Postman → **Import** → เลือกไฟล์ collection + environment
2. มุมขวาบน เลือก Environment: **Local Dev (Users API) v3**
3. แก้ค่าตัวแปรใน Environment:
   - `baseUrl` (ถ้าไม่ใช่พอร์ต 7000)
   - `email`, `password` สำหรับล็อกอินเริ่มต้น

## 3) ลำดับการทดสอบที่แนะนำ
1. **Auth → Login – Get JWT**: รับ token และตั้ง `{{token}}`
2. **Auth → Me – Verify Token**: ตรวจ token ใช้งานได้
3. **Users → List Users**: ทดลองแบ่งหน้า/เรียง/ค้นหา
4. **Users → Create User (Admin Intended)**: สร้างผู้ใช้ใหม่ ระบบตั้ง `{{userId}}` อัตโนมัติ
5. **Users → Get User by ID**: อ่านผู้ใช้ที่เพิ่งสร้าง
6. **Users → Update User (PUT) – no password**: ปรับ name/role ทั่วไป
7. **Users → Update User (PUT) – with password**: อัปเดตรหัสผ่านผ่าน endpoint PUT เดิม (ถ้า backend รองรับ)
8. **Users → Update Password (Dedicated Endpoint)**: ใช้ endpoint แยก `/api/users/:id/password` (ถ้ามี)
9. **Users → Delete User**: ลบผู้ใช้ทดสอบ

> โฟลเดอร์ **Admin Examples** มีตัวอย่างสร้างผู้ใช้ admin และบังคับเปลี่ยน role

## 4) รูปแบบผลลัพธ์ที่คาดหวัง (ตัวอย่าง)
- Login: `{ success:true, token: "...", user:{ id, email, role } }`
- List: `{ success:true, items:[...], total:123, page:1, itemsPerPage:10 }`
- Create/Get/Update/Delete: ขึ้นกับการออกแบบ API; ชุดทดสอบนี้รองรับโครงสร้างที่พบบ่อย

## 5) หมายเหตุด้านความปลอดภัยและการสอน
- ใช้ **Bearer Token** เสมอเมื่อเรียก API ภายในกลุ่ม Users
- ตัวอย่าง **Update Password** 2 แบบ เพื่อให้นักศึกษาทดลอง/เปรียบเทียบการออกแบบ API
- บทเรียนที่ต่อยอด: RBAC, การจำกัด CORS, การทำ Validation, Error Middleware, และการทดสอบอัตโนมัติ

## 6) ตัวอย่าง cURL
```bash
# Login
curl -X POST "${baseUrl}/api/auth/login" -H 'Content-Type: application/json'   -d '{"email":"user@example.com","password":"yourPassword"}'

# List users (ต้องมี Bearer token)
curl -G "${baseUrl}/api/users" -H "Authorization: Bearer ${TOKEN}"   --data-urlencode "page=1" --data-urlencode "itemsPerPage=10"

# Create user
curl -X POST "${baseUrl}/api/users" -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json'   -d '{"name_th":"Student Test","email":"student@example.com","password":"Password123!","role":"evaluatee"}'

# Update password (แบบ PUT เดิม)
curl -X PUT "${baseUrl}/api/users/123" -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json'   -d '{"password":"NewPass456!"}'
```
