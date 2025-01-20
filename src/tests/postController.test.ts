import request from 'supertest';
import app from '../index.js';
import mongoose from 'mongoose';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

let jwtToken = null;
let server: any;
let user: any;

beforeAll(async () => {
    server = app.listen(3003);

    // Register a user to obtain a JWT token
    await request(server).post('/auth/register').send({
        username: 'testsuser',
        email: 'testusers@example.com',
        password: 'password123',
        gender: 'male',
        profileImage: 'none',
        profileImageTop: 'none',
    });

    // Log in with the registered user
    const loginRes = await request(server)
        .post('/auth/login')
        .send({ email: 'testusers@example.com', password: 'password123' });

    user = loginRes.body
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

// Test suite for POST /post
describe('POST /post', () => {
    it('should create a post successfully', async () => {
        const response = await request(server)
            .post('/post')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                sender: user.id,
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
                sender: user.id,
            });

        expect(response.status).toBe(500);
        expect(response.body.error).toMatch(/validation failed/i);
    });
});

// Test suite for GET /post
describe('GET /post', () => {
    it('should return all posts', async () => {
        await Post.create({ sender: user.id, title: 'Post 1', content: 'Content 1' });
        await Post.create({ sender: user.id, title: 'Post 2', content: 'Content 2' });

        const response = await request(server)
            .get('/post')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2);
    });

    it('should filter posts by sender', async () => {
        await Post.create({ sender: user.id, title: 'Post 1', content: 'Content 1' });
        await Post.create({ sender: 'senderId456', title: 'Post 2', content: 'Content 2' });

        const response = await request(server)
            .get(`/post?sender=${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].sender).toBe(user.id);
    });
});

// Test suite for GET /post/:id
describe('GET /post/:id', () => {
    it('should return a post by ID', async () => {
        const post = await Post.create({
            sender: user.id,
            title: 'Test Post',
            content: 'Content',
        });

        const response = await request(server)
            .get(`/post/${post._id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Test Post');
    });

    it('should return 404 if post is not found', async () => {
        const response = await request(server)
            .get('/post/6755898b29631b6e51ecd791')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Post not found');
    });
});

// Test suite for DELETE /post/:id
describe('DELETE /post/:id', () => {
    it('should delete a post successfully', async () => {
        const post = await Post.create({
            sender: user.id,
            title: 'Post to delete',
            content: 'Content to delete',
        });

        const response = await request(server)
            .delete(`/post/${post._id}`)
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Post deleted successfully');
    });

    it('should return 404 if post does not exist', async () => {
        const response = await request(server)
            .delete('/post/6755898b29631b6e57ecd791')
            .set('Authorization', `Bearer ${jwtToken}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });
});

// Test suite for POST /post/like
describe('POST /post/handleLikes', () => {
    it('should like a post successfully', async () => {
        const post = await Post.create({
            sender: user.id,
            title: 'Post to like',
            content: 'Content to like',
        });

        const response = await request(server)
            .post('/post/handleLikes')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ postId: post._id, userId: user.id });

        expect(response.status).toBe(200);
    });

    it('should return 404 if post does not exist', async () => {
        const response = await request(server)
            .post('/post/handleLikes')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({ postId: '6755898b29631b6e57ecd711', userId: user.id });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Post not found');
    });
    // Test suite for PUT /post/:id
    describe('PUT /post/:id', () => {
        it('should update a post successfully', async () => {
            const post = await Post.create({
                sender: user.id,
                title: 'Original Title',
                content: 'Original Content',
            });

            const response = await request(server)
                .put(`/post/${post._id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    sender: user.id,
                    title: 'Updated Title',
                    content: 'Updated Content',
                });

            expect(response.status).toBe(200);
            expect(response.body.title).toBe('Updated Title');
            expect(response.body.content).toBe('Updated Content');
        });

        it('should return 404 if post is not found', async () => {
            const response = await request(server)
                .put('/post/6755898b29631b6e57ecd791')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    sender: user.id,
                    title: 'Updated Title',
                    content: 'Updated Content',
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Post not found');
        });

        it('should return 400 if user is not found', async () => {
            const response = await request(server)
                .put('/post/6755898b29631b6e57ecd791')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    sender: '6755898b29631b6e57aaa112',
                    title: 'Updated Title',
                    content: 'Updated Content',
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('No user found');
        });

        it('should return 500 for server errors', async () => {
            jest.spyOn(Post, 'findOneAndUpdate').mockRejectedValueOnce(new Error('Server error'));

            const post = await Post.create({
                sender: user.id,
                title: 'Original Title',
                content: 'Original Content',
            });

            const response = await request(server)
                .put(`/post/${post._id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    sender: user.id,
                    title: 'Updated Title',
                    content: 'Updated Content',
                });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Server error');
        });
    });
});
