import request from 'supertest';
import app from '../index';

describe('Auth API tests', () => {
    describe('POST /register', () => {
      it('should register a new user successfully', async () => {
        const res = await request(app)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });
  
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.username).toBe('testuser');
      });
  
      it('should return 400 if user already exists', async () => {
        
        await request(app)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });

        const res = await request(app)
          .post('/auth/register')
          .send({
            username: 'anotheruser',
            email: 'testuser@example.com',
            password: 'password123',
          });
  
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists');
      });
    });
});

describe('POST /login', () => {
  it('should login successfully with correct credentials', async () => {
    // נרשם משתמש
    await request(app)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      });

    // מבצע התחברות
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 401 for invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  describe('POST /logout', () => {
    it('should logout successfully with a valid refresh token', async () => {
      // נרשם משתמש
      const registerRes = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        });

      // התחברות וקבלת refreshToken
      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      const refreshToken = loginRes.body.refreshToken;

      // מבצע התנתקות
      const res = await request(app)
        .post('/auth/logout')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User logged out successfully');
    });

    it('should return 401 if refresh token is missing', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .send();

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Refresh token is required');
    });

    it('should return 403 if refresh token is invalid', async () => {
      const res = await request(app)
        .post('/auth/logout')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });
  });

});