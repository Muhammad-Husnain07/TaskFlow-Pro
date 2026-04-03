const Task = require('../models/Task');
const Project = require('../models/Project');
const asyncHandler = require('../middleware/asyncHandler');

const createTask = asyncHandler(async (req, res, next) => {
  const { title, description, assignees, priority, dueDate, labels, status } = req.body;
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not a member of this project' });
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

  res.status(201).json({
    success: true,
    task
  });
});

const getTasks = asyncHandler(async (req, res, next) => {
  const { status, priority, assignee } = req.query;
  const projectId = req.params.projectId;

  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found' });
  }

  if (!project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not a member of this project' });
  }

  const query = { project: projectId };
  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (assignee) query.assignees = assignee;

  const tasks = await Task.find(query)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort({ position: 1 });

  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
});

const getTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email')
    .populate('comments.user', 'name email avatar')
    .populate('attachments.uploadedBy', 'name email');

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
  }

  res.json({
    success: true,
    task
  });
});

const updateTask = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
  }

  const { title, description, assignees, priority, dueDate, labels, status, position } = req.body;

  task = await Task.findByIdAndUpdate(
    req.params.id,
    { title, description, assignees, priority, dueDate, labels, status, position },
    { new: true, runValidators: true }
  )
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    task
  });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Only owner or admin can delete tasks' });
  }

  await Task.deleteMany({ parentTask: req.params.id });
  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task deleted'
  });
});

const updateStatus = asyncHandler(async (req, res, next) => {
  const { status, position } = req.body;

  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  task.status = status;
  if (position !== undefined) {
    task.position = position;
  }
  await task.save();

  await task.populate('assignees', 'name email avatar');
  await task.populate('createdBy', 'name email');

  res.json({
    success: true,
    task
  });
});

const reorderTasks = asyncHandler(async (req, res, next) => {
  const { tasks } = req.body;

  if (!Array.isArray(tasks)) {
    return res.status(400).json({ success: false, message: 'Tasks must be an array' });
  }

  const bulkOps = tasks.map(taskUpdate => ({
    updateOne: {
      filter: { _id: taskUpdate.id },
      update: { status: taskUpdate.status, position: taskUpdate.position }
    }
  }));

  await Task.bulkWrite(bulkOps);

  res.json({
    success: true,
    message: 'Tasks reordered successfully'
  });
});

const addComment = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  task.comments.push({
    user: req.user.id,
    content,
    createdAt: new Date()
  });

  await task.save();

  const updatedTask = await Task.findById(req.params.id)
    .populate('comments.user', 'name email avatar');

  res.json({
    success: true,
    comments: updatedTask.comments
  });
});

const deleteComment = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const comment = task.comments.id(req.params.commentId);
  if (!comment) {
    return res.status(404).json({ success: false, message: 'Comment not found' });
  }

  if (comment.user.toString() !== req.user.id && !project.isAdmin(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
  }

  comment.deleteOne();
  await task.save();

  res.json({
    success: true,
    message: 'Comment deleted'
  });
});

const uploadAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const project = await Project.findById(task.project);
  if (!project || !project.isMember(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
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

  res.json({
    success: true,
    attachments: updatedTask.attachments
  });
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

/*
Test curl commands:

# Create Task
curl -X POST http://localhost:5000/api/projects/PROJECT_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Fix bug","description":"Fix login bug","priority":"high","assignees":["USER_ID"]}'

# Get Tasks
curl -X GET http://localhost:5000/api/projects/PROJECT_ID/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get Single Task
curl -X GET http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update Task
curl -X PUT http://localhost:5000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Updated title","status":"in_progress"}'

# Delete Task
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update Status
curl -X PATCH http://localhost:5000/api/tasks/TASK_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"status":"done","position":0}'

# Reorder Tasks
curl -X PATCH http://localhost:5000/api/tasks/reorder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tasks":[{"id":"TASK_ID","status":"todo","position":0}]}'

# Add Comment
curl -X POST http://localhost:5000/api/tasks/TASK_ID/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"content":"This is a comment"}'

# Delete Comment
curl -X DELETE http://localhost:5000/api/tasks/TASK_ID/comments/COMMENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"

# Upload Attachment
curl -X POST http://localhost:5000/api/tasks/TASK_ID/attachments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.jpg"
*/