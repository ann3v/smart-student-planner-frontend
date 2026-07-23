import request from 'supertest';
import { app } from './app';
import { getTestToken } from './setup';

describe('Subject Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getTestToken();
  });

  describe('POST /api/subjects', () => {
    it('should create a subject successfully', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Mathematics',
          color: '#3498db',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('name', 'Mathematics');
    });

    it('should reject subject without name', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({ color: '#3498db' });

      expect(res.status).toBe(400);
    });

    it('should reject subject without auth', async () => {
      const res = await request(app)
        .post('/api/subjects')
        .send({ name: 'No Auth Subject' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/subjects', () => {
    it('should get all subjects for user', async () => {
      await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Physics' });

      const res = await request(app)
        .get('/api/subjects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('should update a subject', async () => {
      const createRes = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Chemistry', color: '#e74c3c' });

      const res = await request(app)
        .put(`/api/subjects/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Organic Chemistry' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', 'Organic Chemistry');
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('should delete a subject', async () => {
      const createRes = await request(app)
        .post('/api/subjects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Biology' });

      const res = await request(app)
        .delete(`/api/subjects/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
