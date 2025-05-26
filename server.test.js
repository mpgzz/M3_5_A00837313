const request = require('supertest');
const app = require('./server');

jest.mock('./Back/Controllers/loginCrud', () => ({

  connectToDatabase: jest.fn(() => Promise.resolve()),

 
  hashPassword: jest.fn((password) => {
  
    if (password === 'testpassword') return 'mockedtesthash';
    if (password === 'wrongpassword') return 'mockedwronghash';
    return 'defaultmockhash';
  }),

 
  loginUser: jest.fn(async (req, res) => {
  

    const { email, password } = req.body;
    const mockedHashPassword = module.exports.hashPassword; 

    if (email === 'test@example.com' && mockedHashPassword(password) === 'mockedtesthash') {

      const mockToken = 'mocked_jwt_token'; 
      const userInfo = {
        usuId: 1,
        correo: 'test@example.com',
        rol: 'user',
        primerNombre: 'Test',
        primerApellido: 'User',
        segundoApellido: 'Account',
      };
      return res.status(200).json({ userData: { token: mockToken, userInfo } });
    } else if (email === 'admin@example.com' && mockedHashPassword(password) === 'mockedadminhash') {
     
      const mockToken = 'mocked_admin_jwt_token';
      const userInfo = {
        usuId: 2,
        correo: 'admin@example.com',
        rol: 'admin',
        primerNombre: 'Admin',
        primerApellido: 'User',
        segundoApellido: 'Account',
      };
      return res.status(200).json({ userData: { token: mockToken, userInfo } });
    }
    else {
     
      return res.status(401).json({ message: 'Credenciales incorrectas2' }); 
    }
  }),
}));
const { loginUser, hashPassword } = require('./Back/Controllers/loginCrud');


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

    hashPassword.mockReturnValueOnce('mockedtesthash'); 
    const response = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com', password: 'testpassword' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('userData');
    expect(response.body.userData).toHaveProperty('token');
    expect(response.body.userData.userInfo.correo).toBe('test@example.com');
    expect(response.body.userData.userInfo.rol).toBe('user');
    expect(hashPassword).toHaveBeenCalledTimes(1); 
    expect(hashPassword).toHaveBeenCalledWith('testpassword');
    expect(loginUser).toHaveBeenCalledTimes(1); 
  });

  test('POST /api/login should return 401 for invalid credentials', async () => {
   
    hashPassword.mockReturnValueOnce('someotherhash');

    const response = await request(app)
      .post('/api/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toEqual('Credenciales incorrectas2');
    expect(hashPassword).toHaveBeenCalledTimes(1);
    expect(loginUser).toHaveBeenCalledTimes(1);
  });

 
  test('GET /api/admin/non-existent-resource should return 404 or 401', async () => {
    const response = await request(app).get('/api/admin/non-existent-resource');

    expect(response.statusCode).toBeGreaterThanOrEqual(401); 
  });

  
});
