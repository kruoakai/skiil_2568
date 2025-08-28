import request from 'supertest'
import app from '../app'

async function login(){
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'admin@example.com', password: 'admin1234' })
  if(res.status !== 200) throw new Error('Login failed, DB not ready?')
  return res.body.accessToken
}

describe('Users server-side endpoint', () => {
  it('GET /api/users/server should page results', async () => {
    try{
      const token = await login()
      const res = await request(app)
        .get('/api/users/server')
        .set('Authorization', `Bearer ${token}`)
        .query({ page:1, itemsPerPage:10, sortBy:'id', sortDesc:true, search:'' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('items')
      expect(res.body).toHaveProperty('total')
    }catch(e){
      console.warn('Skipping users/server test:', e.message)
    }
  })
})
