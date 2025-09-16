# การทดสอบและเช็กลิสต์

## ทำไมต้องแยก `app.js` กับ `server.js`
ช่วยให้รันทดสอบ e2e ด้วย Supertest โดย **ไม่ต้องเปิดพอร์ตจริง**

## ตัวอย่าง Supertest (ย่อ)
```js
const request = require('supertest');
const app = require('../app');

describe('Upload module', () => {
  it('GET /health -> 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  it('rejects unsupported MIME -> 415', async () => {
    const res = await request(app)
      .post('/api/upload/evidence')
      .set('Authorization', 'Bearer DUMMY_EVALUATEE')
      .field('period_id','1001').field('indicator_id','23').field('evidence_type_id','1')
      .attach('file', Buffer.from('dummy'), { filename: 'x.exe', contentType: 'application/octet-stream' });
    expect([400,415]).toContain(res.status);
  });
});
```

## Test Matrix (ตัวอย่าง)
- Evaluatee: upload ✓ / list ✓ / replace ✓ / patch ✓ / delete ✓
- Evaluator: list assigned ✓ (อื่น ๆ ✗)
- Admin: upload on-behalf ✓ / list ✓ / replace ✓ / patch(reassign) ✓ / delete ✓
- ขอบเขตผิดพลาด: no token → 401, role mismatch → 403, invalid MIME → 415, oversize → 413, inactive period → 400/403

## Postman & Swagger
- **Postman**: สร้าง Environment (`BASE`, `TOKEN_*`) + Collection แยกบทบาท
- **Swagger**: เสิร์ฟ `openapi_full.json` ที่ `/openapi.json` และ UI `/docs`