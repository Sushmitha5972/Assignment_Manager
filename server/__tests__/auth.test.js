const request = require('supertest');
const app = require('../server'); // or path to your express app export

describe('Auth routes', () => {
  it('should return 400 for missing credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });

  // more tests...
});
    