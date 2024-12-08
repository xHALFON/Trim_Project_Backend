import request from 'supertest';
import app from '../index';
import Post from '../models/postModel.js';
import Comment from '../models/commentModel.js';

const Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDc2YTUyZTEwNzRjNjY1ZmE1YzJiYiIsImVtYWlsIjoic3RyaW5nIiwiaWF0IjoxNzMyNzMzNTI3LCJleHAiOjE3MzMzMzgzMjd9.UwKaF9S5ZJ_NX_W7uA2yzfGo_RAxAtolZ-UXIwm337U";

describe('Comment API Tests', () => {
    // דוגמת בדיקה ליצירת תגובה חדשה
    it('should create a new comment', async () => {
        const res = await request(app)
            .post('/comments')
            .send({
                content: 'This is a comment',
                user: 'testuser',
                postId: '1234567890abcdef'
            })
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('content', 'This is a comment');
    });

    // דוגמת בדיקה להחזיר את כל התגובות
    it('should get all comments', async () => {
        const res = await request(app)
            .get('/comments')
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // דוגמת בדיקה לקבל תגובות לפי postId
    it('should get comments by postId', async () => {
        const res = await request(app)
            .get('/comments/1234567890abcdef')
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // דוגמת בדיקה לקבל תגובות לפי שם משתמש
    it('should get comments by user name', async () => {
        const res = await request(app)
            .get('/comments/user/testuser')
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    // דוגמת בדיקה לקבל תגובה לפי ID
    it('should get comment by ID', async () => {
        const res = await request(app)
            .get('/comments/getComment/60d5f4a1b1b3b8f4ccdb3f6c') // עדכן את ה-ID לדוגמה
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id');
    });

    // דוגמת בדיקה לעדכון תגובה
    it('should update a comment', async () => {
        const res = await request(app)
            .put('/comments/60d5f4a1b1b3b8f4ccdb3f6c') // עדכן את ה-ID לדוגמה
            .send({ content: 'Updated comment content' })
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('content', 'Updated comment content');
    });

    // דוגמת בדיקה למחוק תגובה
    it('should delete a comment', async () => {
        const res = await request(app)
            .delete('/comments/60d5f4a1b1b3b8f4ccdb3f6c') // עדכן את ה-ID לדוגמה
            .set('Authorization', Token); // הוסף את ה-token כאן
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'Comment deleted successfully');
    });

    // דוגמת בדיקה למחוק את כל התגובות
    it('should delete all comments', async () => {
        const res = await request(app)
            .delete('/comments')
            .set('Authorization', Token);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message', 'All comments deleted successfully');
    });
});