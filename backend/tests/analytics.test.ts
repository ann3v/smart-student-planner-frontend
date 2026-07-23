import request from 'supertest';
import { app } from './app';
import { getTestToken } from './setup';

describe('Analytics Endpoints', () => {
  let token: string;

  beforeAll(async () => {
    token = await getTestToken();
  });

  describe('GET /api/analytics/productivity', () => {
    it('should get productivity analytics', async () => {
      const res = await request(app)
        .get('/api/analytics/productivity')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stats');
      expect(res.body).toHaveProperty('completionRate');
      expect(res.body).toHaveProperty('tasksPerDay');
      expect(res.body).toHaveProperty('tasksByPriority');
      expect(res.body).toHaveProperty('tasksBySubject');
      expect(res.body).toHaveProperty('studyHoursPerDay');
    });

    it('should accept date range params', async () => {
      const startDate = new Date(Date.now() - 7 * 86400000).toISOString();
      const endDate = new Date().toISOString();

      const res = await request(app)
        .get(`/api/analytics/productivity?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should reject without auth', async () => {
      const res = await request(app).get('/api/analytics/productivity');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/analytics/overdue', () => {
    it('should get overdue tasks', async () => {
      const res = await request(app)
        .get('/api/analytics/overdue')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/analytics/workload', () => {
    it('should get workload distribution', async () => {
      const res = await request(app)
        .get('/api/analytics/workload')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(typeof res.body).toBe('object');
    });
  });
});
