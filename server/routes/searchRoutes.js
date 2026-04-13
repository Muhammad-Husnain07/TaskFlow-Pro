const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { globalSearch, searchProjects, searchTasks } = require('../controllers/searchController');

router.use(protect);

router.get('/', globalSearch);
router.get('/projects', searchProjects);
router.get('/tasks', searchTasks);

module.exports = router;