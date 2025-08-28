import request from 'supertest'
import app from '../app'

describe('Health Endpoint', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.service).toBe('ok')
    expect(typeof res.body.time).toBe('string')
  })
})
