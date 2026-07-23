import request from 'supertest';
import { app } from './app';
import { getTestToken } from './setup';

describe('Schedule Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getTestToken();
  });

  describe('POST /api/schedule', () => {
    it('should create a schedule item successfully', async () => {
      const res = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '10:00',
          title: 'Math Class',
          activityType: 'class',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('title', 'Math Class');
    });

    it('should reject schedule without required fields', async () => {
      const res = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({ dayOfWeek: 1 });

      expect(res.status).toBe(400);
    });

    it('should reject schedule without auth', async () => {
      const res = await request(app)
        .post('/api/schedule')
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '10:00',
          title: 'No Auth',
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/schedule/weekly', () => {
    it('should get weekly schedule', async () => {
      await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          dayOfWeek: 2,
          startTime: '14:00',
          endTime: '15:00',
          title: 'Study Session',
        });

      const res = await request(app)
        .get('/api/schedule/weekly')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('0');
      expect(res.body).toHaveProperty('1');
    });
  });

  describe('DELETE /api/schedule/:id', () => {
    it('should delete a schedule item', async () => {
      const createRes = await request(app)
        .post('/api/schedule')
        .set('Authorization', `Bearer ${token}`)
        .send({
          dayOfWeek: 3,
          startTime: '10:00',
          endTime: '11:00',
          title: 'Delete Me',
        });

      const res = await request(app)
        .delete(`/api/schedule/${createRes.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});
