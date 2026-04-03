const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { checkMember } = require('../middleware/projectAccess');
const upload = require('../utils/upload');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateStatus,
  reorderTasks,
  addComment,
  deleteComment,
  uploadAttachment
} = require('../controllers/taskController');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required')
];

router.use(protect);

router.get('/projects/:projectId/tasks', checkMember, getTasks);
router.post('/projects/:projectId/tasks', checkMember, validateTask, validateRequest, createTask);

router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

router.patch('/tasks/:id/status', updateStatus);
router.patch('/tasks/reorder', reorderTasks);

router.post('/tasks/:id/comments', addComment);
router.delete('/tasks/:id/comments/:commentId', deleteComment);

router.post('/tasks/:id/attachments', upload.single('file'), uploadAttachment);

module.exports = router;