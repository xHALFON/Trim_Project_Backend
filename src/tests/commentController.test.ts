import request from 'supertest';
import app from '../index.js'; 
import mongoose from 'mongoose';
import Comment from '../models/commentModel.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';

let jwtToken: string;
let testUser: any;
let testPost: any;
let server: any;

beforeAll(async () => {
    server = app.listen(3001);

    // Create test user
    const registerRes = await request(server)
        .post('/auth/register')
        .send({
            username: 'testuser2',
            email: 'testuser2@example.com',
            password: 'password123',
            gender: 'male',
            profileImage: 'none',
            profileImageTop: 'none',
        });
    
    if (!registerRes.body || !registerRes.body.id) {  // שינוי מ-_id ל-id
        throw new Error(`Registration failed: ${JSON.stringify(registerRes.body)}`);
    }
    
    testUser = {
        ...registerRes.body,
        _id: registerRes.body.id  // הוספת _id כדי לשמור על תאימות
    };

    // Login and get token
    const loginRes = await request(server)
        .post('/auth/login')
        .send({
            email: 'testuser2@example.com',
            password: 'password123',
        });
    jwtToken = loginRes.body.accessToken;

    // Create a test post
    testPost = await Post.create({ 
        title: 'Test Post', 
        content: 'Test Content', 
        sender: testUser.id,  // שימוש ב-id במקום _id
        image: 'none'
    });
});

beforeEach(async () => {
    await Comment.deleteMany({});
});

afterAll(async () => {
    await User.deleteOne({ email: 'testuser2@example.com' });
    await Post.deleteMany({});
    await mongoose.disconnect();
    await server.close();
});

describe('Comment Controller Tests', () => {
    describe('POST /comments', () => {
        it('should create a comment successfully', async () => {
            const response = await request(server)
                .post('/comments')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    content: 'Test Comment',
                    sender: testUser.id,  // Changed: Don't convert to string
                    postId: testPost._id,
                });

            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                content: 'Test Comment',
                sender: testUser.id,  // Changed: Expect string in response
                senderName: testUser.username,
            });
            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('senderImg');
        });

        it('should return 404 if user does not exist', async () => {
            const nonExistentUserId = new mongoose.Types.ObjectId();
            const response = await request(server)
                .post('/comments')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    content: 'Test Comment',
                    sender: nonExistentUserId,  // Changed: Don't convert to string
                    postId: testPost._id,
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('User does not exist!');
        });

        it('should return 404 if post does not exist', async () => {
            const response = await request(server)
                .post('/comments')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    content: 'Test Comment',
                    sender: testUser.id,  // Changed: Don't convert to string
                    postId: new mongoose.Types.ObjectId(),
                });

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Post does not exist!');
        });
    });

    describe('GET /comments', () => {
        it('should return all comments with user details', async () => {
            // Create test comments
            await Comment.create([
                { 
                    content: 'Comment', 
                    sender: testUser.id, 
                    postId: testPost._id 
                },
                { 
                    content: 'Comment', 
                    sender: testUser.id, 
                    postId: testPost._id 
                }
            ]);

            const response = await request(server)
                .get('/comments')
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toMatchObject({
                content: 'Comment',
                sender: testUser.id.toString(),  // Changed: Expect string in response
                senderName: testUser.username,
            });
        });

        it('should handle empty comments list', async () => {
            const response = await request(server)
                .get('/comments')
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(0);
        });
    });

    describe('GET /comments/:postId', () => {
        it('should return all comments for a specific post', async () => {
            await Comment.create([
                { 
                    content: 'Post Comment', 
                    sender: testUser.id,  // Changed: Don't convert to string
                    postId: testPost._id 
                },
                { 
                    content: 'Post Comment', 
                    sender: testUser.id,  // Changed: Don't convert to string
                    postId: testPost._id 
                }
            ]);

            const response = await request(server)
                .get(`/comments/${testPost._id}`)
                .set('Authorization', `Bearer ${jwtToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].content).toBe('Post Comment');
        });
    });

    describe('PUT /comments/:id', () => {
        it('should update comment content successfully', async () => {
            const comment = await Comment.create({
                content: 'Original Content',
                sender: testUser.id,  // Changed: Don't convert to string
                postId: testPost._id
            });

            const response = await request(server)
                .put(`/comments/${comment._id}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ content: 'Updated Content' });

            expect(response.status).toBe(200);
            expect(response.body.content).toBe('Updated Content');
        });
    });

    describe('Authentication Tests', () => {
        it('should return 401 when no token is provided', async () => {
            const response = await request(server).get('/comments');
            
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, no token');
        });

        it('should return 401 when invalid token is provided', async () => {
            const response = await request(server)
                .get('/comments')
                .set('Authorization', 'Bearer invalid_token');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Not authorized, token failed');
        });

        it('should return 404 when trying to update a non-existent comment', async () => {
            const response = await request(server)
                .put(`/comments/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({ content: 'Updated Content' });
        
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Comment not found');
        });

        it('should delete a comment successfully', async () => {
            const comment = await Comment.create({
                content: 'Delete Me',
                sender: testUser.id,
                postId: testPost._id
            });
        
            const response = await request(server)
                .delete(`/comments/${comment._id}`)
                .set('Authorization', `Bearer ${jwtToken}`);
        
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Comment deleted successfully');
        
            const deletedComment = await Comment.findById(comment._id);
            expect(deletedComment).toBeNull();
        });

        it('should return 404 when trying to delete a non-existent comment', async () => {
            const response = await request(server)
                .delete(`/comments/${new mongoose.Types.ObjectId()}`)
                .set('Authorization', `Bearer ${jwtToken}`);
        
            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Comment not found');
        });

        it('should return 404 when required fields are missing', async () => {
            const response = await request(server)
                .post('/comments')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send({
                    sender: testUser.id,
                });
        
            expect(response.status).toBe(404);
            expect(response.body.error).toContain('Post does not exist!');
        });

        it('should return all comments for a specific user', async () => {
            await Comment.create([
                { content: 'User Comment 1', sender: testUser.id, postId: testPost._id },
                { content: 'User Comment 2', sender: testUser.id, postId: testPost._id }
            ]);
        
            const response = await request(server)
                .get(`/comments/user/${testUser.id}`)
                .set('Authorization', `Bearer ${jwtToken}`);
        
            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].sender).toBe(testUser.id.toString());
        });        
    });
    
    describe('DELETE /comments', () => {
        it('should delete all comments successfully', async () => {
            // Create test comments
            await Comment.create([
                { content: 'Test Comment 1', sender: testUser.id, postId: testPost._id },
                { content: 'Test Comment 2', sender: testUser.id, postId: testPost._id }
            ]);
    
            // Verify comments exist
            let comments = await Comment.find({});
            expect(comments).toHaveLength(2);
    
            // Send request to delete all comments
            const response = await request(server)
                .delete('/comments')
                .set('Authorization', `Bearer ${jwtToken}`);
    
            // Verify response
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                message: 'All comments deleted successfully',
                deletedCount: 2
            });
    
            // Verify all comments are deleted
            comments = await Comment.find({});
            expect(comments).toHaveLength(0);
        });
    
        it('should return 500 if an error occurs', async () => {
            // Mock Comment.deleteMany to throw an error
            jest.spyOn(Comment, 'deleteMany').mockImplementationOnce(() => {
                throw new Error('Database error');
            });
    
            // Send request to delete all comments
            const response = await request(server)
                .delete('/comments')
                .set('Authorization', `Bearer ${jwtToken}`);
    
            // Verify response
            expect(response.status).toBe(500);
            expect(response.body).toMatchObject({
                error: 'Database error'
            });
    
            // Restore the original implementation
            jest.restoreAllMocks();
        });
    });
});