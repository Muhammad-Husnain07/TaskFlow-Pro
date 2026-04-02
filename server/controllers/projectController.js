const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

const createProject = asyncHandler(async (req, res, next) => {
  const { name, description, color, tags, dueDate } = req.body;

  const project = await Project.create({
    name,
    description,
    color,
    tags,
    dueDate,
    owner: req.user.id
  });

  await project.populate('members.user', 'name email avatar');

  res.status(201).json({
    success: true,
    project
  });
});

const getProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({
    'members.user': req.user.id
  })
  .populate('members.user', 'name email avatar')
  .populate('owner', 'name email')
  .sort({ updatedAt: -1 });

  res.json({
    success: true,
    count: projects.length,
    projects
  });
});

const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email');

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not a member of this project' });
  }

  res.json({
    success: true,
    project
  });
});

const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can update project' });
  }

  const { name, description, color, status, tags, dueDate } = req.body;

  project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, color, status, tags, dueDate },
    { new: true, runValidators: true }
  ).populate('members.user', 'name email avatar');

  res.json({
    success: true,
    project
  });
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const member = project.members.find(m => m.user.toString() === req.user.id);
  if (!member || member.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Only owner can delete project' });
  }

  await project.deleteOne();

  res.json({
    success: true,
    message: 'Project deleted'
  });
});

const addMember = asyncHandler(async (req, res, next) => {
  const { email, role } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can add members' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  if (project.isMember(user._id)) {
    return res.status(400).json({ success: false, message: 'User is already a member' });
  }

  await project.addMember(user._id, role || 'member');

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  res.json({
    success: true,
    project: updatedProject
  });
});

const removeMember = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can remove members' });
  }

  const memberToRemove = project.members.find(m => m.user.toString() === req.params.userId);
  if (!memberToRemove) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  if (memberToRemove.role === 'owner') {
    return res.status(400).json({ success: false, message: 'Cannot remove owner' });
  }

  project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  res.json({
    success: true,
    project: updatedProject
  });
});

const updateMemberRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  const currentUserMember = project.members.find(m => m.user.toString() === req.user.id);
  if (!currentUserMember || currentUserMember.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Only owner can change member roles' });
  }

  const memberToUpdate = project.members.find(m => m.user.toString() === req.params.userId);
  if (!memberToUpdate) {
    return res.status(404).json({ success: false, message: 'Member not found' });
  }

  if (memberToUpdate.role === 'owner') {
    return res.status(400).json({ success: false, message: 'Cannot change owner role' });
  }

  memberToUpdate.role = role;
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  res.json({
    success: true,
    project: updatedProject
  });
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole
};

/*
Test curl commands:

# Create Project
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"My Project","description":"Project description","color":"#ff5733"}'

# Get All Projects
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Single Project
curl -X GET http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update Project
curl -X PUT http://localhost:5000/api/projects/PROJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Updated Name","status":"completed"}'

# Delete Project
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add Member
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"email":"user@example.com","role":"member"}'

# Remove Member
curl -X DELETE http://localhost:5000/api/projects/PROJECT_ID/members/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update Member Role
curl -X PATCH http://localhost:5000/api/projects/PROJECT_ID/members/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"role":"admin"}'
*/