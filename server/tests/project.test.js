const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const Project = require('../models/Project');

describe('Project API', () => {
  let token;
  let user;

  beforeEach(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'projecttest@example.com', password: 'password123' });
    token = res.body.data.token;
    user = res.body.data.user;
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'My Project', description: 'Test description' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('My Project');
      expect(res.body.data.members).toHaveLength(1);
    });

    it('should reject empty project name', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Project 1' });
    });

    it('should get all projects for user', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Project' });
      project = res.body.data;
    });

    it('should get single project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Project');
    });

    it('should reject unauthorized access', async () => {
      const user2 = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email: 'user2@example.com', password: 'password123' });
      
      const res = await request(app)
        .get(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${user2.body.data.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Original Name' });
      project = res.body.data;
    });

    it('should update project as owner', async () => {
      const res = await request(app)
        .put(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
    });
  });

  describe('DELETE /api/projects/:id', () => {
    let project;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'To Delete' });
      project = res.body.data;
    });

    it('should delete project as owner', async () => {
      const res = await request(app)
        .delete(`/api/projects/${project._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Member management', () => {
    let project;
    let memberToken;
    let memberUser;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Team Project' });
      project = res.body.data;

      const memberRes = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Member', email: 'member@example.com', password: 'password123' });
      memberToken = memberRes.body.data.token;
      memberUser = memberRes.body.data;
    });

    it('should add member to project', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com', role: 'member' });

      expect(res.status).toBe(200);
      expect(res.body.data.members).toHaveLength(2);
    });

    it('should remove member from project', async () => {
      await request(app)
        .post(`/api/projects/${project._id}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'member@example.com', role: 'member' });

      const res = await request(app)
        .delete(`/api/projects/${project._id}/members/${memberUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});