const Project = require('../models/Project');
const asyncHandler = require('./asyncHandler');

const checkMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not a member of this project' });
  }

  req.project = project;
  next();
});

const checkAdmin = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await Project.findById(projectId);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can perform this action' });
  }

  req.project = project;
  next();
});

module.exports = { checkMember, checkAdmin };