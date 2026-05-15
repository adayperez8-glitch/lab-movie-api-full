const request = require('supertest')
const app = require('../../index')

describe('Rate Limiting', () => {
  it('debe devolver 429 tras superar el límite de auth', async () => {
    // El rate limiter de auth permite 5 req/15min
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: 'test123' })
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'test123' })

    expect(res.status).toBe(429)
    expect(res.body).toHaveProperty('error')
  })
})
