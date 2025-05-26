const request = require('supertest');
const app = require('./server');

jest.mock('./Back/Controllers/loginCrud', () => ({
  connectToDatabase: jest.fn(() => Promise.resolve()),
  verifyUserCredentials: jest.fn((email, password) => {
    if (email === 'test@example.com' && password === 'testpassword') {
      return { id: 1, email: 'test@example.com', role: 'user' };
    }
    return null;
  }),
}));

const { verifyUserCredentials } = require('./Back/Controllers/loginCrud');

describe('Backend API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET to a non-existent route should return 404', async () => {
    const response = await request(app).get('/this-route-does-not-exist');
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toEqual('No encontrado');
  });

  test('POST /api/login should return 200 for valid credentials', async () => {
    verifyUserCredentials.mockResolvedValueOnce({ id: 1, email: 'test@example.com', role: 'user' });

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(verifyUserCredentials).toHaveBeenCalledTimes(1);
    expect(verifyUserCredentials).toHaveBeenCalledWith('test@example.com', 'testpassword');
  });

  test('POST /api/login should return 401 for invalid credentials', async () => {
    verifyUserCredentials.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toEqual('Credenciales inválidas');
    expect(verifyUserCredentials).toHaveBeenCalledTimes(1);
  });

  test('GET /api/admin/some-resource should return 401 if unauthorized', async () => {
    const response = await request(app).get('/api/admin/some-resource');
    expect(response.statusCode).toBe(401);
  });
});
