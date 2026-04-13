const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

const globalSearch = asyncHandler(async (req, res, next) => {
  const { q, type, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return ApiResponse.error(res, 'Search query must be at least 2 characters', 400);
  }

  const userId = req.user.id;
  const searchLimit = parseInt(limit) || 10;
  const results = { projects: [], tasks: [] };

  const shouldSearchProjects = type === 'all' || type === 'project';
  const shouldSearchTasks = type === 'all' || type === 'task';

  if (shouldSearchProjects) {
    const projectQuery = {
      $text: { $search: q },
      'members.user': userId
    };

    const projects = await Project.find(projectQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(searchLimit)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email');

    results.projects = projects.map(p => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      color: p.color,
      status: p.status,
      memberCount: p.members.length,
      score: p.score
    }));
  }

  if (shouldSearchTasks) {
    const userProjects = await Project.find({ 'members.user': userId }).select('_id');
    const projectIds = userProjects.map(p => p._id);

    const taskQuery = {
      $text: { $search: q },
      project: { $in: projectIds }
    };

    const tasks = await Task.find(taskQuery, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(searchLimit)
      .populate('project', 'name color')
      .populate('assignees', 'name email avatar');

    results.tasks = tasks.map(t => ({
      _id: t._id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.project,
      projectId: t.project?._id,
      projectName: t.project?.name,
      projectColor: t.project?.color,
      assignees: t.assignees,
      score: t.score
    }));
  }

  return ApiResponse.success(res, results, 'Search results retrieved successfully');
});

const searchProjects = asyncHandler(async (req, res, next) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return ApiResponse.error(res, 'Search query must be at least 2 characters', 400);
  }

  const userId = req.user.id;
  const searchLimit = parseInt(limit) || 10;

  const projects = await Project.find({
    $text: { $search: q },
    'members.user': userId
  }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(searchLimit)
    .populate('members.user', 'name email avatar')
    .populate('owner', 'name email');

  return ApiResponse.success(res, projects, 'Projects retrieved successfully');
});

const searchTasks = asyncHandler(async (req, res, next) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return ApiResponse.error(res, 'Search query must be at least 2 characters', 400);
  }

  const userId = req.user.id;
  const searchLimit = parseInt(limit) || 10;

  const userProjects = await Project.find({ 'members.user': userId }).select('_id');
  const projectIds = userProjects.map(p => p._id);

  const tasks = await Task.find({
    $text: { $search: q },
    project: { $in: projectIds }
  }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(searchLimit)
    .populate('project', 'name color')
    .populate('assignees', 'name email avatar');

  return ApiResponse.success(res, tasks, 'Tasks retrieved successfully');
});

module.exports = {
  globalSearch,
  searchProjects,
  searchTasks
};