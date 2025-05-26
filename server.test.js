const request = require('supertest');
const app = require('./server');

describe('Backend API Endpoints', () => {
  test('GET to a non-existent route should return 404', async () => {
    const response = await request(app).get('/this-route-does-not-exist');
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('No encontrado');
  });

  test('POST /api/login should return 200 for valid credentials (mocked)', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
  });
});
