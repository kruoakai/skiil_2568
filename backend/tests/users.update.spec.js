const request = require('supertest');
const app = require('../server'); // ปรับ path ถ้า server.js อยู่ที่อื่น

const GOOD_ID = 11; // ปรับเป็น id จริงที่มีใน DB

describe('PUT /api/users/:id', () => {
  it('1) should update successfully (200)', async () => {
    const res = await request(app)
      .put(`/api/users/${GOOD_ID}`)
      .send({
        name_th: 'kruoak_32568',
        email: 'kruoak_oak@ctc.com',
        password: '87654321',
        role: 'evaluatee'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(GOOD_ID);
  });

  it('2) missing id in path → 400 or 404', async () => {
    const res = await request(app)
      .put(`/api/users`)
      .send({
        name_th: 'no_id_case',
        email: 'noid@example.ac.th',
        password: '12345678',
        role: 'evaluatee'
      });

    expect([400, 404]).toContain(res.statusCode);
  });

  it('3) not found id → 404', async () => {
    const res = await request(app)
      .put(`/api/users/999999`)
      .send({
        name_th: 'not_found',
        email: 'notfound@example.ac.th',
        password: '12345678',
        role: 'evaluatee'
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('4) duplicate email → 409', async () => {
    const res = await request(app)
      .put(`/api/users/${GOOD_ID}`)
      .send({
        name_th: 'dup_email',
        email: 't.it01@example.ac.th', // อีเมลที่มีอยู่แล้ว
        password: '12345678',
        role: 'evaluatee'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/exists|duplicate|ซ้ำ/i);
  });
});
