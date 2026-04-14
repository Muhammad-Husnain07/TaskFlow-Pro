const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserById, getUserProjects, getUserTasks } = require('../controllers/userController');

router.get('/:id', getUserById);
router.get('/:id/projects', protect, getUserProjects);
router.get('/:id/tasks', protect, getUserTasks);

module.exports = router;