import request from 'supertest';
import app from '../index';
import User from '../models/userModel';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
let server: any;
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
          });

        const res = await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
          });
  
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Email already exists');
      });


      it('should return 500 if there is a database error', async () => {

        jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Database error'));
  
        const res = await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
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
  describe('POST /auth/refreshToken (refreshToken)', () => {
    it('should return 403 if refresh token is invalid (not found in DB)', async () => {
      const invalidId = new mongoose.Types.ObjectId(); // יצירת ID תקני שלא קיים
      const res = await request(server)
        .post('/auth/refreshToken')
        .send({
          id: invalidId,
          accessToken: 'invalid-access-token',
        });
    
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid user id in refresh token');
    });
  
    it('should return 403 if refresh token is invalid (jwt verification fails)', async () => {
      const user = await new User({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        gender: 'male',
        profileImage: 'none',
        profileImageTop: 'none',
        refreshToken:"register-token", // refreshToken תקין
      }).save();
    
      // שליחת בקשה עם refreshToken לא תקין
      const res = await request(server)
        .post('/auth/refreshToken')
        .send({
          id: user._id,
          accessToken: "check-token", // accessToken לא תקין
        });
    
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });
  
    it('should return 201 and access token if refresh token is valid', async () => {
      const registerRes = await request(server)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@example.com',
          password: 'password123',
          gender: 'male',
          profileImage: 'none',
          profileImageTop: 'none',
        });
    
      const loginRes = await request(server)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });
    
      const res = await request(server)
        .post('/auth/refreshToken')
        .send({
          id: loginRes.body.userId,
          accessToken: loginRes.body.accessToken, // accessToken שפג תוקפו
        });
    
      expect(res.status).toBe(201); // עדכון לסטטוס המצופה
      expect(res.body).toHaveProperty('accessToken');
    });
  });
  
  async function createTestUserAndGetToken() {
    const registerRes = await request(server)
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
        gender: 'male',
        profileImage: 'none',
        profileImageTop: 'none',
      });
    
    return {
      userId: registerRes.body.id,
      token: registerRes.body.token
    };
  }
  
  describe('Protected Routes', () => {
    // Helper function to create a test user and get auth token

    describe('GET /auth/:id', () => {
      it('should return user data when valid ID and token provided', async () => {
        const { userId, token } = await createTestUserAndGetToken();

        const res = await request(server)
          .get(`/auth/${userId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('username', 'testuser');
        expect(res.body).toHaveProperty('email', 'testuser@example.com');
      });

      it('should return 401 when no token provided', async () => {
        const { userId } = await createTestUserAndGetToken();

        const res = await request(server)
          .get(`/auth/${userId}`);

        expect(res.status).toBe(401);
      });

      it('should return 404 when user not found', async () => {
        const { token } = await createTestUserAndGetToken();
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(server)
          .get(`/auth/${nonExistentId}`)
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
      });
    });

    describe('GET /auth/getUserByName/:username', () => {
      it('should return user data when valid username and token provided', async () => {
        const { token } = await createTestUserAndGetToken();

        const res = await request(server)
          .get('/auth/getUserByName/testuser')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.username).toBe('testuser');
        expect(res.body.email).toBe('testuser@example.com');
      });

      it('should return 401 when no token provided', async () => {
        const res = await request(server)
          .get('/auth/getUserByName/testuser');

        expect(res.status).toBe(401);
      });

      it('should return 404 when username not found', async () => {
        const { token } = await createTestUserAndGetToken();

        const res = await request(server)
          .get('/auth/getUserByName/nonexistentuser')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('User not found');
      });
    });

    describe('GET /auth/users', () => {
      it('should return all users when valid token provided', async () => {
        // Create two test users
        await request(server)
          .post('/auth/register')
          .send({
            username: 'testuser1',
            email: 'testuser1@example.com',
            password: 'password123',
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
          });

        const { token } = await createTestUserAndGetToken();

        const res = await request(server)
          .get('/auth/users')
          .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThanOrEqual(2);
      });

      it('should return 401 when no token provided', async () => {
        const res = await request(server)
          .get('/auth/users');

        expect(res.status).toBe(401);
      });
    });

    describe('POST /auth/updateProfileImage', () => {
      it('should update profile image when valid token provided', async () => {
        const { userId, token } = await createTestUserAndGetToken();

        const res = await request(server)
          .post('/auth/updateProfileImage')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId,
            filename: 'new-image.jpg',
            top: false
          });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Profile image updated successfully');
        expect(res.body.profileImage).toBe('new-image.jpg');
      });

      it('should update profile top image when valid token provided', async () => {
        const { userId, token } = await createTestUserAndGetToken();

        const res = await request(server)
          .post('/auth/updateProfileImage')
          .set('Authorization', `Bearer ${token}`)
          .send({
            userId: userId,
            filename: 'new-top-image.jpg',
            top: true
          });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Profile top image updated successfully');
        expect(res.body.profileImageTop).toBe('new-top-image.jpg');
      });

      it('should return 401 when no token provided', async () => {
        const { userId } = await createTestUserAndGetToken();

        const res = await request(server)
          .post('/auth/updateProfileImage')
          .send({
            userId: userId,
            filename: 'new-image.jpg'
          });

        expect(res.status).toBe(401);
      });
    });
  });

  describe('POST /auth/payload/:token', () => {
    it('should verify and return token payload', async () => {
      const { token } = await createTestUserAndGetToken();

      const res = await request(server)
        .post(`/auth/payload/${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Token is valid');
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 403 for invalid token', async () => {
      const invalidToken = 'invalid-token';
      
      const res = await request(server)
        .post(`/auth/payload/${invalidToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Invalid refresh token');
    });
  });

  describe('PUT /auth/update/:id', () => {
    it('should update user details successfully', async () => {
      const { userId } = await createTestUserAndGetToken();

      const res = await request(server)
        .put(`/auth/update/${userId}`)
        .send({
          username: 'updateduser',
          gender: 'female',
          status: 'active'
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User updated successfully');

      // Verify the update
      const updatedUser = await User.findById(userId);
      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.gender).toBe('female');
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(server)
        .put(`/auth/update/${nonExistentId}`)
        .send({
          username: 'updateduser',
          gender: 'female'
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('DELETE /auth/delete/:id', () => {
    it('should delete user successfully', async () => {
      const { userId } = await createTestUserAndGetToken();

      const res = await request(server)
        .delete(`/auth/delete/${userId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const deletedUser = await User.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const res = await request(server)
        .delete(`/auth/delete/${nonExistentId}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('User not found');
    });
  });
});