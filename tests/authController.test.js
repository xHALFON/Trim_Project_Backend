import request from 'supertest';
import app from '../index';
import User from '../models/userModel';
import mongoose from 'mongoose';

let server;
describe('Auth API tests', () => {
  
  beforeAll(() => {
    server = app.listen(3002);
  });

  afterEach(async () => {
    await User.deleteOne({ email: 'testuser@example.com' });
  });
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });  
    describe('POST /register', () => {
      it('should register a new user successfully', async () => {
        const res = await request(server)
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
        await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });

        const res = await request(server)
          .post('/auth/register')
          .send({
            username: 'anotheruser',
            email: 'testuser@example.com',
            password: 'password123',
          });
  
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists');
      });


      it('should return 500 if there is a database error', async () => {

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Database error'));
  
        const res = await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });
  
    
        expect(res.status).toBe(500);
  

        expect(res.body.message).toBe('Database error');
      });
  
      it('should return 500 if there is an error during user save', async () => {

        jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('Save error'));
  
        const res = await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });
  

        expect(res.status).toBe(500);
  

        expect(res.body.message).toBe('Save error');
      });

      
    });

  describe('POST /login', () => {
    it('should login successfully with correct credentials', async () => {
      await request(server)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        });

      const res = await request(server)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should return 401 when the password is incorrect', async () => {
      await request(server)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
        });
    
      const res = await request(server)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });
    
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });
    
    it('should return 401 for invalid credentials', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should return 500 if there is a database error', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const res = await request(server)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.status).toBe(500);

      expect(res.body.message).toBe('Database error');
    });

    describe('POST /logout', () => {
      it('should logout successfully with a valid refresh token', async () => {
        // נרשם משתמש
        const registerRes = await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
          });

        // התחברות וקבלת refreshToken
        const loginRes = await request(server)
          .post('/auth/login')
          .send({
            email: 'testuser@example.com',
            password: 'password123',
          });

        const refreshToken = loginRes.body.refreshToken;

        // מבצע התנתקות
        const res = await request(server)
          .post('/auth/logout')
          .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('User logged out successfully');
      });

      it('should return 401 if refresh token is missing', async () => {
        const res = await request(server)
          .post('/auth/logout')
          .send();

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Refresh token is required');
      });

      it('should return 403 if refresh token is invalid', async () => {
        const res = await request(server)
          .post('/auth/logout')
          .send({ refreshToken: 'invalid-token' });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Invalid refresh token');
      });
    });
  });
  describe('POST /:refreshToken (refreshToken)', () => {

    it('should return 403 if refresh token is invalid (not found in DB)', async () => {
      const res = await request(server)
        .post('/auth/invalid-refresh-token')
        .send();

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });

    it('should return 403 if refresh token is invalid (jwt verification fails)', async () => {
      // נרשם משתמש עם refresh token
      const user = await new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        refreshToken: 'valid-refresh-token'
      }).save();

      // ביצוע POST עם refresh token שגוי
      const res = await request(server)
        .post(`/auth/${'invalid-refresh-token'}`)
        .send();

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });

    it('should return 200 and access token if refresh token is valid', async () => {
      // נרשם משתמש עם refresh token
      const registerRes = await request(server)
      .post('/auth/register')
      .send({
        username: 'testsuser',
        email: 'testusers@example.com',
        password: 'password123',
      });

    const loginRes = await request(server)
      .post('/auth/login')
      .send({
        email: 'testusers@example.com',
        password: 'password123',
      });    
      const res = await request(server)
        .post(`/auth/${loginRes.body.refreshToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });
});