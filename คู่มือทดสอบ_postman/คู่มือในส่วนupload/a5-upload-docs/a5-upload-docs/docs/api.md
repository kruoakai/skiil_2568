# API — จุดเข้าใช้งานและสัญญาข้อมูล

> ทุก endpoint ใช้ **Bearer JWT**

## 1) Evaluatee
| Method | Endpoint | Body/Query | Notes |
|---|---|---|---|
| POST | `/api/upload/evidence` | `period_id`, `indicator_id`, `evidence_type_id`, `file` (multipart) | อัปโหลดไฟล์ของตนเอง (งวดต้อง active) |
| GET | `/api/upload/mine` | `period_id` (required), `indicator_id` (optional) | รายการไฟล์ของตนเอง |
| PUT | `/api/upload/:id/file` | `file` (multipart) | แทนที่ไฟล์เดิมของตนเอง |
| PATCH | `/api/upload/:id` | `{ indicator_id?, evidence_type_id? }` | อัปเดตเมตาดาต้า |
| DELETE | `/api/upload/:id` | – | ลบไฟล์ของตนเอง |

## 2) Evaluator
| Method | Endpoint | Query | Notes |
|---|---|---|---|
| GET | `/api/upload/evaluatee/:evaluateeId` | `period_id` | ดูไฟล์ของ evaluatee ที่ถูกมอบหมาย (read-only) |

## 3) Admin
| Method | Endpoint | Body/Query | Notes |
|---|---|---|---|
| POST | `/api/upload/admin/evidence` | `evaluatee_id`, `period_id`, `indicator_id`, `evidence_type_id`, `file` | อัปโหลดแทน |
| GET | `/api/upload/admin` | `period_id`, `evaluatee_id?`, `indicator_id?` | ค้นไฟล์ |
| PUT | `/api/upload/admin/:id/file` | `file` (multipart) | แทนที่ไฟล์ใด ๆ |
| PATCH | `/api/upload/admin/:id` | `{ period_id?, evaluatee_id?, indicator_id?, evidence_type_id? }` | reassign meta |
| DELETE | `/api/upload/admin/:id` | – | ลบไฟล์ใด ๆ |

## Validation ก่อนบันทึก
1. สิทธิ์ในงวด — ตรวจจาก `assignments` ว่าถูกมอบหมายจริง
2. ชนิดไฟล์ตรงตามตัวชี้วัด — ตรวจจาก `indicator_evidence`
3. ขนาด/ประเภทไฟล์ — Multer + `UPLOAD_MAX_MB`
4. สถานะงวด — ปฏิเสธแก้ไขเมื่อ `evaluation_periods.is_active = 0`

## ตัวอย่าง cURL
```bash
# Evaluatee: upload
curl -X POST "$BASE/api/upload/evidence" \
  -H "Authorization: Bearer $TOKEN_EVALUATEE" \
  -F "period_id=1001" -F "indicator_id=23" -F "evidence_type_id=1" \
  -F "file=@lesson_plan.pdf"

# Evaluator: list assigned evaluatee
curl "$BASE/api/upload/evaluatee/55?period_id=1001" \
  -H "Authorization: Bearer $TOKEN_EVALUATOR"

# Admin: reassign metadata
curl -X PATCH "$BASE/api/upload/admin/123" \
  -H "Authorization: Bearer $TOKEN_ADMIN" -H "Content-Type: application/json" \
  -d '{"period_id":1002,"evaluatee_id":55,"indicator_id":31,"evidence_type_id":2}'
```

## Error Codes (ตัวอย่าง)
| HTTP | code | message | เงื่อนไข |
|---|---|---|---|
| 400 | `BAD_REQUEST` | Missing fields | body/query ไม่ครบ |
| 401 | `UNAUTHORIZED` | Missing token | header ไม่มี Bearer |
| 403 | `FORBIDDEN` | Forbidden | role/assignment ไม่ตรง |
| 404 | `NOT_FOUND` | Not Found | id/ไฟล์ไม่พบ |
| 413 | `PAYLOAD_TOO_LARGE` | File too large | เกิน `UPLOAD_MAX_MB` |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Unsupported file type | MIME ไม่อนุญาต |
| 500 | `INTERNAL_ERROR` | Internal Server Error | ข้อยกเว้นอื่น ๆ |