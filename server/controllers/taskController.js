const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const queryBuilder = require('../utils/queryBuilder');
const { emitTaskCreated, emitTaskUpdated, emitTaskDeleted, emitTaskStatusChanged, emitCommentAdded } = require('../utils/socketEmit');
const { notifyTaskAssigned, notifyTaskStatusChanged } = require('../utils/notificationService');
const { notifyCommentAdded } = require('../utils/notificationService');

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignees, priority, dueDate, labels, status } = req.body;
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not a member of this project');
  }

  const maxPosition = await Task.findOne({ project: projectId, status: status || 'todo' })
    .sort({ position: -1 })
    .select('position');

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignees,
    createdBy: req.user.id,
    priority,
    dueDate,
    labels,
    status: status || 'todo',
    position: maxPosition ? maxPosition.position + 1 : 0
  });

  await task.populate('assignees', 'name email avatar');
  await task.populate('createdBy', 'name email');

  if (assignees && assignees.length > 0) {
    for (const assigneeId of assignees) {
      await notifyTaskAssigned(task, req.user.id, assigneeId);
    }
  }

  const io = req.app.get('io');
  emitTaskCreated(io, req, task);

  return ApiResponse.created(res, task, 'Task created successfully');
});

const getTasks = asyncHandler(async (req, res, next) => {
  const { status, priority, assignee } = req.query;
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) {
    return ApiResponse.notFound(res, 'Project not found');
  }

  if (!project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not a member of this project');
  }

  const qb = queryBuilder(Task, req.query, ['title', 'description']);
  qb.query.project = projectId;
  if (status) qb.query.status = status;
  if (priority) qb.query.priority = priority;
  if (assignee) qb.query.assignees = assignee;

  const result = await qb.runQuery();
  result.data = await Task.populate(result.data, [
    { path: 'assignees', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email' }
  ]);

  return ApiResponse.paginated(res, result.data, result.pagination, 'Tasks retrieved successfully');
});

const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email')
    .populate('comments.user', 'name email avatar')
    .populate('attachments.uploadedBy', 'name email');

  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized to view this task');
  }

  return ApiResponse.success(res, task, 'Task retrieved successfully');
});

const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized to update this task');
  }

  const { title, description, assignees, priority, dueDate, labels, status, position, subtasks } = req.body;

  const activity = [];
  if (status && status !== task.status) {
    activity.push({
      user: req.user.id,
      action: 'changed',
      field: 'status',
      oldValue: task.status,
      newValue: status
    });
  }
  if (priority && priority !== task.priority) {
    activity.push({
      user: req.user.id,
      action: 'changed',
      field: 'priority',
      oldValue: task.priority,
      newValue: priority
    });
  }

  task = await Task.findByIdAndUpdate(
    req.params.id,
    { 
      title, 
      description, 
      assignees, 
      priority, 
      dueDate, 
      labels, 
      status, 
      position,
      subtasks,
      $push: { activity: { $each: activity } }
    },
    { new: true, runValidators: true }
  )
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email')
    .populate('activity.user', 'name email');

  const io = req.app.get('io');
  emitTaskUpdated(io, req, task);

  return ApiResponse.success(res, task, 'Task updated successfully');
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isAdmin(req.user.id)) {
    return ApiResponse.forbidden(res, 'Only owner or admin can delete tasks');
  }

  const projectId = task.project.toString();
  const taskId = task._id;

  await Task.deleteMany({ parentTask: req.params.id });
  await task.deleteOne();

  const io = req.app.get('io');
  emitTaskDeleted(io, req, taskId, projectId);

  return ApiResponse.success(res, null, 'Task deleted successfully');
});

const updateStatus = asyncHandler(async (req, res, next) => {
  const { status, position } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized');
  }

  const previousStatus = task.status;
  task.status = status;
  if (position !== undefined) {
    task.position = position;
  }
  await task.save();

  await task.populate('assignees', 'name email avatar');
  await task.populate('createdBy', 'name email');

  if (previousStatus !== status && task.assignees?.length > 0) {
    for (const assignee of task.assignees) {
      await notifyTaskStatusChanged(task, req.user.id, previousStatus);
    }
  }

  const io = req.app.get('io');
  emitTaskStatusChanged(io, req, task, req.user.id);

  return ApiResponse.success(res, task, 'Task status updated successfully');
});

const reorderTasks = asyncHandler(async (req, res, next) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks)) {
    return ApiResponse.error(res, 'Tasks must be an array', 400);
  }

  const bulkOps = tasks.map(taskUpdate => ({
    updateOne: {
      filter: { _id: taskUpdate.id },
      update: { status: taskUpdate.status, position: taskUpdate.position }
    }
  }));

  await Task.bulkWrite(bulkOps);

  return ApiResponse.success(res, null, 'Tasks reordered successfully');
});

const addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized');
  }

  const newComment = {
    user: req.user.id,
    content,
    createdAt: new Date()
  };
  task.comments.push(newComment);
  await task.save();

  const updatedTask = await Task.findById(req.params.id)
    .populate('comments.user', 'name email avatar');

  const comment = updatedTask.comments.find(c => c.createdAt.toString() === newComment.createdAt.toString());
  const io = req.app.get('io');
  emitCommentAdded(io, req, task, comment);

  if (task.assignees?.length > 0) {
    await notifyCommentAdded(task, req.user.id, task.assignees);
  }

  return ApiResponse.success(res, updatedTask.comments, 'Comment added successfully');
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized');
  }

  const comment = task.comments.id(req.params.commentId);
  if (!comment) {
    return ApiResponse.notFound(res, 'Comment not found');
  }

  if (comment.user.toString() !== req.user.id && !project.isAdmin(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized to delete this comment');
  }

  comment.deleteOne();
  await task.save();

  return ApiResponse.success(res, null, 'Comment deleted successfully');
});

const uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return ApiResponse.error(res, 'No file uploaded', 400);
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return ApiResponse.notFound(res, 'Task not found');
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return ApiResponse.forbidden(res, 'Not authorized');
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  task.attachments.push({
    filename: req.file.originalname,
    url: fileUrl,
    uploadedBy: req.user.id,
    uploadedAt: new Date()
  });

  await task.save();

  const updatedTask = await Task.findById(req.params.id)
    .populate('attachments.uploadedBy', 'name email');

  return ApiResponse.success(res, updatedTask.attachments, 'File uploaded successfully');
});

module.exports = {
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
};