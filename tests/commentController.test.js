import request from 'supertest';
import app from '../index.js'; 
import mongoose from 'mongoose';
import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

let jwtToken = null;
let server;

beforeAll(async () => {
    server = app.listen(3001);

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

    jwtToken = loginRes.body.accessToken;
});

afterEach(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
});

afterAll(async () => {
    await User.deleteOne({ email: 'testusers@example.com' });
    await mongoose.disconnect();
    server.close();
});

// בדיקה ליצירת תגובה
describe('POST /comments', () => {
    it('should create a comment successfully', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });

        const response = await request(server)
            .post('/comments')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                content: 'Test Comment',
                user: 'userId123',
                postId: post._id,
            });

        expect(response.status).toBe(201);
        expect(response.body.content).toBe('Test Comment');
        expect(response.body.postId).toBe(post._id.toString());
    });

    it('should return 404 if the post does not exist', async () => {
        const response = await request(server)
            .post('/comments')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                content: 'Test Comment',
                user: 'userId123',
                postId: '6755898b29631b6e57ecd791',
            });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post does not exists!');
    });
});

describe('GET /comments', () => {
    it('should return 401 if there is an error', async () => {
        const response = await request(server).get('/comments').set('Authorization', `Bearer ${jwtToken+'1'}`);

        expect(response.status).toBe(401);  // בודק שהסטטוס הוא 500
        expect(response.body.message).toBe('Not authorized, token failed');  
    });
});

describe('GET /comments', () => {
    it('should return 401 if there is an error', async () => {
        const response = await request(server).get('/comments');

        expect(response.status).toBe(401);  
        expect(response.body.message).toBe('Not authorized, no token'); 
    });
});

describe('POST /comments', () => {
    it('should return 500 if an error occurs', async () => {
        const mockPost = jest.spyOn(Post, 'findOne').mockRejectedValue(new Error('Database error'));

        const response = await request(server)
            .post('/comments')
            .send({ content: 'Test Comment', user: 'userId123', postId: 'invalidPostId' })
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Database error');

        mockPost.mockRestore();
    });
});


// בדיקה לקריאה של כל התגובות
describe('GET /comments', () => {
    it('should return all comments', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });

        await Comment.create({ content: 'First Comment', user: 'user1', postId: post._id });
        await Comment.create({ content: 'Second Comment', user: 'user2', postId: post._id });

        const response = await request(server)
            .get('/comments')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].content).toBe('First Comment');
    });
});


// בדיקה לקריאה של תגובות לפי פוסט
describe('GET /comments/:postId', () => {
    it('should return comments for a specific post', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });

        const comment1 = await Comment.create({ content: 'First Comment', user: 'user1', postId: post._id });
        const comment2 = await Comment.create({ content: 'Second Comment', user: 'user2', postId: post._id });

        const response = await request(server)
            .get(`/comments/${post._id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
        expect(response.body[0].content).toBe('First Comment');
    });

    it('should return 404 if post does not exist', async () => {
        const response = await request(server)
            .get('/comments/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(404);
    });
});

// בדיקה לקריאה של תגובות לפי משתמש
describe('GET /comments/user/:user', () => {
    it('should return comments for a specific user', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });

        const comment1 = await Comment.create({ content: 'User Comment 1', user: 'user1', postId: post._id });
        const comment2 = await Comment.create({ content: 'User Comment 2', user: 'user1', postId: post._id });
        const comment3 = await Comment.create({ content: 'User Comment 3', user: 'user2', postId: post._id });

        const response = await request(server)
            .get('/comments/user/user1')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });
});

// בדיקה לעדכון תגובה
describe('PUT /comments/:id', () => {
    it('should update a comment successfully', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });
        const comment = await Comment.create({ content: 'Old Comment', user: 'userId123', postId: post._id });

        const response = await request(server)
            .put(`/comments/${comment._id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(200);
        expect(response.body.content).toBe('Updated Comment');
    });

    it('should return 404 if the comment does not exist', async () => {
        const response = await request(server)
            .put('/comments/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                content: 'Updated Comment',
            });

        expect(response.status).toBe(404);
    });
});

// בדיקה למחיקת תגובה
describe('DELETE /comments/:id', () => {
    it('should delete a comment successfully', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });
        const comment = await Comment.create({ content: 'Test Comment to Delete', user: 'userId123', postId: post._id });

        const response = await request(server)
            .delete(`/comments/${comment._id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Comment deleted successfully');
    });

    it('should return 404 if the comment does not exist', async () => {
        const response = await request(server)
            .delete('/comments/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(404);
    });
});

// בדיקה למחיקת כל התגובות
describe('DELETE /comments', () => {
    it('should delete all comments successfully', async () => {
        const post = await Post.create({ title: 'Test Post', content: 'Test Content', sender: "senderId" });

        await Comment.create({ content: 'Comment 1', user: 'user1', postId: post._id });
        await Comment.create({ content: 'Comment 2', user: 'user2', postId: post._id });

        const response = await request(server)
            .delete('/comments')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('All comments deleted successfully');
    });
});
