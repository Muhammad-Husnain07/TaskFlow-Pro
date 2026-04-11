const emitToProject = (io, req, event, data) => {
  if (!io) {
    io = req.app.get('io');
  }
  if (io && req.params.projectId) {
    io.to(`project:${req.params.projectId}`).emit(event, data);
  }
};

const emitTaskCreated = (io, req, task) => {
  const projectId = task.project?.toString?.() || task.project;
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('task:created', { task });
  }
};

const emitTaskUpdated = (io, req, task) => {
  const projectId = task.project?.toString?.() || task.project;
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('task:updated', { task });
  }
};

const emitTaskDeleted = (io, req, taskId, projectId) => {
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('task:deleted', { taskId });
  }
};

const emitTaskStatusChanged = (io, req, task, userId) => {
  const projectId = task.project?.toString?.() || task.project;
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('task:status-changed', { 
      taskId: task._id,
      status: task.status,
      movedBy: userId
    });
  }
};

const emitCommentAdded = (io, req, task, comment) => {
  const projectId = task.project?.toString?.() || task.project;
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('comment:added', { taskId: task._id, comment });
  }
};

const emitUserJoined = (io, projectId, user, projectName) => {
  if (io && projectId) {
    io.to(`project:${projectId}`).emit('member:joined', { user, projectId, projectName });
  }
};

module.exports = {
  emitToProject,
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
  emitTaskStatusChanged,
  emitCommentAdded,
  emitUserJoined
};