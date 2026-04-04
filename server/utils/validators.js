const { body, param, query } = require('express-validator');

const createProject = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex code'),
  body('tags').optional().isArray(),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date')
];

const updateProject = [
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().isLength({ max: 500 }),
  body('color').optional().isHexColor(),
  body('status').optional().isIn(['active', 'archived', 'completed']),
  body('tags').optional().isArray(),
  body('dueDate').optional().isISO8601()
];

const projectId = [
  param('id').isMongoId().withMessage('Invalid project ID')
];

const createTask = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('assignees').optional().isArray(),
  body('assignees.*').isMongoId().withMessage('Invalid assignee ID'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  body('labels').optional().isArray(),
  body('dueDate').optional().isISO8601()
];

const updateTask = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 5000 }),
  body('assignees').optional().isArray(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  body('labels').optional().isArray(),
  body('dueDate').optional().isISO8601()
];

const taskId = [
  param('id').isMongoId().withMessage('Invalid task ID')
];

const taskStatus = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('status').isIn(['todo', 'in_progress', 'in_review', 'done', 'cancelled']).withMessage('Invalid status'),
  body('position').optional().isInt({ min: 0 })
];

const reorderTasks = [
  body('tasks').isArray().withMessage('Tasks must be an array'),
  body('tasks.*.id').isMongoId().withMessage('Invalid task ID'),
  body('tasks.*.status').isIn(['todo', 'in_progress', 'in_review', 'done', 'cancelled']),
  body('tasks.*.position').isInt({ min: 0 })
];

const addComment = [
  param('id').isMongoId().withMessage('Invalid task ID'),
  body('content').trim().notEmpty().withMessage('Comment content is required').isLength({ max: 2000 })
];

module.exports = {
  createProject,
  updateProject,
  projectId,
  createTask,
  updateTask,
  taskId,
  taskStatus,
  reorderTasks,
  addComment
};