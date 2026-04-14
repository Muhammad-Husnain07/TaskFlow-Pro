const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('name email avatar bio createdAt');
  
  if (!user) {
    return ApiResponse.notFound(res, 'User not found');
  }

  return ApiResponse.success(res, user, 'User retrieved successfully');
});

const getUserProjects = asyncHandler(async (req, res, next) => {
  const projects = await Project.find({ 'members.user': req.params.id })
    .limit(10)
    .populate('members.user', 'name email avatar');

  return ApiResponse.success(res, projects, 'User projects retrieved successfully');
});

const getUserTasks = asyncHandler(async (req, res, next) => {
  const { status } = req.query;
  const query = { assignees: req.params.id };
  
  if (status) {
    query.status = { $in: status.split(',') };
  }

  const tasks = await Task.find(query)
    .limit(10)
    .populate('project', 'name color')
    .populate('assignees', 'name email avatar');

  return ApiResponse.success(res, tasks, 'User tasks retrieved successfully');
});

module.exports = {
  getUserById,
  getUserProjects,
  getUserTasks
};