const request = require('supertest');
const app = require('../server');
const Project = require('../models/Project');
const Task = require('../models/Task');

describe('Task API', () => {
  let token;
  let project;

  beforeEach(async () => {
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Task User', email: 'taskuser@example.com', password: 'password123' });
    token = userRes.body.data.token;

    const projectRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Project' });
    project = projectRes.body.data;
  });

  describe('POST /api/projects/:projectId/tasks', () => {
    it('should create a new task', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'New Task', description: 'Task description', priority: 'high' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('New Task');
      expect(res.body.data.priority).toBe('high');
    });

    it('should reject task without title', async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: '' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 1', status: 'todo' });
      await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 2', status: 'done' });
    });

    it('should get all tasks for project', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get(`/api/projects/${project._id}/tasks?status=todo`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Single Task' });
      task = res.body.data;
    });

    it('should get single task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Single Task');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Original Task' });
      task = res.body.data;
    });

    it('should update task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated Task', priority: 'urgent' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Task');
      expect(res.body.data.priority).toBe('urgent');
    });
  });

  describe('PATCH /api/tasks/:id/status', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Status Task', status: 'todo' });
      task = res.body.data;
    });

    it('should update task status', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
    });

    it('should set completedAt when status is done', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${task._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.data.completedAt).toBeDefined();
    });
  });

  describe('POST /api/tasks/:id/comments', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Comment Task' });
      task = res.body.data;
    });

    it('should add comment to task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${task._id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'This is a comment' });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].content).toBe('This is a comment');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      const res = await request(app)
        .post(`/api/projects/${project._id}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'To Delete' });
      task = res.body.data;
    });

    it('should delete task as admin', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});