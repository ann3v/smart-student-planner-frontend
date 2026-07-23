import request from 'supertest';
import { app } from './app';
import { User } from '../src/models';

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@test.com',
          password: 'TestPassword123!',
          name: 'New Test User',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('requiresVerification', true);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'short@test.com',
          password: 'short',
        });

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'TestPassword123!',
          name: 'First User',
        });

      // Second registration with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@test.com',
          password: 'TestPassword123!',
          name: 'Second User',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Registration failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '' });

      expect(res.status).toBe(400);
    });

    it('should reject login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@test.com', password: 'SomePassword123!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid email or password');
    });
  });

  describe('POST /api/auth/verify-code', () => {
    it('should reject verification with invalid code format', async () => {
      const res = await request(app)
        .post('/api/auth/verify-code')
        .send({ email: 'test@example.com', code: 'abc' });

      expect(res.status).toBe(400);
    });

    it('should reject verification with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/verify-code')
        .send({ email: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should reject profile access without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });
});
