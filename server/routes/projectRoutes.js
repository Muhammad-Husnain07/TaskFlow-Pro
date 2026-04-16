const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { checkMember, checkAdmin } = require('../middleware/projectAccess');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
  archiveProject
} = require('../controllers/projectController');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required')
];

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(validateProject, validateRequest, createProject);

router.route('/:id')
  .get(checkMember, getProject)
  .put(checkMember, updateProject)
  .delete(checkMember, deleteProject);

router.post('/:id/members', checkAdmin, addMember);
router.delete('/:id/members/:userId', checkAdmin, removeMember);
router.patch('/:id/members/:userId', checkAdmin, updateMemberRole);
router.patch('/:id/archive', checkAdmin, archiveProject);

module.exports = router;