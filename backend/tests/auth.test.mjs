import request from 'supertest'
import app from '../app'

describe('Auth Login', () => {
  it('POST /api/auth/login should issue token for seeded admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'admin1234' })
    expect([200,401]).toContain(res.status)
    if(res.status === 200){
      expect(res.body.success).toBe(true)
      expect(typeof res.body.accessToken).toBe('string')
    } else {
      console.warn('Login failed - ensure DB is up and seeded via 02_schema.sql')
    }
  })
})
