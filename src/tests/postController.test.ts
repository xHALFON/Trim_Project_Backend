import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

let jwtToken = null;
let server;

beforeAll(async () => {
    server = app.listen(3003);

    // נרשם משתמש לצורך קבלת JWT token
    const registerRes = await request(server)
        .post('/auth/register')
        .send({
            username: 'testsuser',
            email: 'testusers@example.com',
            password: 'password123',
        });

    // מתחבר עם המייל והסיסמה שהוזנו
    const loginRes = await request(server)
        .post('/auth/login')
        .send({
            email: 'testusers@example.com',
            password: 'password123',
        });

    jwtToken = loginRes.body.accessToken;
});

afterEach(async () => {
    await Post.deleteMany({});
});

afterAll(async () => {
    await User.deleteOne({ email: 'testusers@example.com' });
    await mongoose.disconnect();
    server.close();
});

// בדיקה ליצירת פוסט
describe('POST /post', () => {
    it('should create a post successfully', async () => {
        const response = await request(server)
            .post('/post')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                sender: 'senderId123',
                title: 'Test Post',
                content: 'This is a test post content',
            });

        expect(response.status).toBe(201);
        expect(response.body.title).toBe('Test Post');
        expect(response.body.content).toBe('This is a test post content');
    });

    it('should return 400 if post data is invalid', async () => {
        const response = await request(server)
            .post('/post')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                sender: 'senderId123',
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Post validation failed: content: Path `content` is required., title: Path `title` is required.');
    });
});

// בדיקה לקריאה של כל הפוסטים
describe('GET /post', () => {
    it('should return all posts', async () => {
        await Post.create({
            sender: 'senderId123',
            title: 'Test Post 1',
            content: 'Content for post 1',
        });
        await Post.create({
            sender: 'senderId123',
            title: 'Test Post 2',
            content: 'Content for post 2',
        });

        const response = await request(server).get('/post').set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(201);
        expect(response.body.length).toBe(2);
    });

    it('should filter posts by sender', async () => {
        const post1 = await Post.create({
            sender: 'senderId123',
            title: 'Test Post 1',
            content: 'Content for post 1',
        });
        const post2 = await Post.create({
            sender: 'senderId456',
            title: 'Test Post 2',
            content: 'Content for post 2',
        });

        const response = await request(server)
            .get('/post?sender=senderId123')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].sender).toBe('senderId123');
    });
});

// בדיקה לקריאה של פוסט לפי ID
describe('GET /post/:id', () => {
    it('should return a post by ID', async () => {
        const post = await Post.create({
            sender: 'senderId123',
            title: 'Test Post',
            content: 'This is a test post content',
        });

        const response = await request(server).get(`/post/${post._id}`).set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body[0].title).toBe('Test Post');
    });

    it('should return 404 if post is not found', async () => {
        const response = await request(server)
            .get('/post/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post not found');
    });
});

// בדיקה לעדכון פוסט
describe('PUT /post/:id', () => {
    it('should update a post successfully', async () => {
        const post = await Post.create({
            sender: 'senderId123',
            title: 'Test Post',
            content: 'This is a test post content',
        });

        const response = await request(server)
            .put(`/post/${post._id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                sender: 'senderId123',
                title: 'Updated Test Post',
                content: 'Updated content for the test post',
            });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Test Post');
        expect(response.body.content).toBe('Updated content for the test post');
    });

    it('should return 404 if post is not found', async () => {
        const response = await request(server)
            .put('/post/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                title: 'Updated Test Post',
                content: 'Updated content for the test post',
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post not found');
    });
});
