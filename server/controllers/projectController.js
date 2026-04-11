const Project = require('../models/Project');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const queryBuilder = require('../utils/queryBuilder');
const { emitUserJoined } = require('../utils/socketEmit');

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
  return ApiResponse.created(res, project, 'Project created successfully');
});

const getProjects = asyncHandler(async (req, res, next) => {
  const { page, limit, search, sortBy, order } = req.query;
  
  const qb = queryBuilder(Project, req.query, ['name', 'description']);
  qb.query['members.user'] = req.user.id;
  
  const result = await qb.runQuery();
  result.data = await Project.populate(result.data, [
    { path: 'members.user', select: 'name email avatar' },
    { path: 'owner', select: 'name email' }
  ]);
  
  return ApiResponse.paginated(res, result.data, result.pagination, 'Projects retrieved successfully');
});

const getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email');

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not a member of this project');
  }

  return ApiResponse.success(res, project, 'Project retrieved successfully');
});

const updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isAdmin(req.user.id)) {
    return ApiResponse.forbidden(res, 'Only owner or admin can update project');
  }

  const { name, description, color, status, tags, dueDate } = req.body;

  project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, color, status, tags, dueDate },
    { new: true, runValidators: true }
  ).populate('members.user', 'name email avatar');

  return ApiResponse.success(res, project, 'Project updated successfully');
});

const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  const member = project.members.find(m => m.user.toString() === req.user.id);
  if (!member || member.role !== 'owner') {
    return ApiResponse.forbidden(res, 'Only owner can delete project');
  }

  await project.deleteOne();
  return ApiResponse.success(res, null, 'Project deleted successfully');
});

const addMember = asyncHandler(async (req, res, next) => {
  const { email, role } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isAdmin(req.user.id)) {
    return ApiResponse.forbidden(res, 'Only owner or admin can add members');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  if (project.isMember(user._id)) {
    return ApiResponse.error(res, 'User is already a member', 400);
  }

  await project.addMember(user._id, role || 'member');

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  const io = req.app.get('io');
  emitUserJoined(io, req.params.id, user, project.name);

  return ApiResponse.success(res, updatedProject, 'Member added successfully');
});

const removeMember = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isAdmin(req.user.id)) {
    return ApiResponse.forbidden(res, 'Only owner or admin can remove members');
  }

  const memberToRemove = project.members.find(m => m.user.toString() === req.params.userId);
  if (!memberToRemove) {
    return ApiResponse.notFound(res, 'Member not found');
  }

  if (memberToRemove.role === 'owner') {
    return ApiResponse.error(res, 'Cannot remove owner', 400);
  }

  project.members = project.members.filter(m => m.user.toString() !== req.params.userId);
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  return ApiResponse.success(res, updatedProject, 'Member removed successfully');
});

const updateMemberRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  const project = await Project.findById(req.params.id);

  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  const currentUserMember = project.members.find(m => m.user.toString() === req.user.id);
  if (!currentUserMember || currentUserMember.role !== 'owner') {
    return ApiResponse.forbidden(res, 'Only owner can change member roles');
  }

  const memberToUpdate = project.members.find(m => m.user.toString() === req.params.userId);
  if (!memberToUpdate) {
    return ApiResponse.notFound(res, 'Member not found');
  }

  if (memberToUpdate.role === 'owner') {
    return ApiResponse.error(res, 'Cannot change owner role', 400);
  }

  memberToUpdate.role = role;
  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('members.user', 'name email avatar');

  return ApiResponse.success(res, updatedProject, 'Member role updated successfully');
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