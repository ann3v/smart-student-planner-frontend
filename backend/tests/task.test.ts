import request from 'supertest';
import { app } from './app';
import { getTestToken } from './setup';

describe('Task Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getTestToken();
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Test Task',
          description: 'Test description',
          priority: 'high',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Task');
      expect(res.body).toHaveProperty('priority', 'high');
    });

    it('should reject task without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'No title' });

      expect(res.status).toBe(400);
    });

    it('should reject task without auth token', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'No Auth Task' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for user', async () => {
      // Create a task first
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task for listing' });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should filter tasks by completed status', async () => {
      const res = await request(app)
        .get('/api/tasks?completed=false')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a single task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Single Task' });

      const res = await request(app)
        .get(`/api/tasks/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', 'Single Task');
    });

    it('should return 404 for non-existent task', async () => {
      const res = await request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/tasks/:id/toggle', () => {
    it('should toggle task completion', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Toggle Task' });

      const res = await request(app)
        .patch(`/api/tasks/${createRes.body.id}/toggle`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('completed', true);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const createRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Delete Task' });

      const res = await request(app)
        .delete(`/api/tasks/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Task deleted successfully');
    });
  });
});
