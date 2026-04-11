const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

const userSockets = new Map();
const userRooms = new Map();

const authSocket = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
};

const handleConnection = async (socket, io) => {
  console.log(`User ${socket.user.id} connected with socket ${socket.id}`);
  
  userSockets.set(socket.user.id, socket.id);
  userRooms.set(socket.user.id, new Set());

  socket.emit('connected', { userId: socket.user.id });

  socket.on('join-project', async (projectId) => {
    const projectRoom = `project:${projectId}`;
    await socket.join(projectRoom);
    
    const userRoomsSet = userRooms.get(socket.user.id);
    userRoomsSet.add(projectId);
    
    socket.to(projectRoom).emit('member:online', { 
      userId: socket.user.id, 
      projectId 
    });
    
    const usersInRoom = await io.in(projectRoom).fetchSockets();
    const onlineUsers = [...usersInRoom].map(s => s.user.id);
    socket.emit('project:online-members', { projectId, onlineUsers });
    
    console.log(`User ${socket.user.id} joined project ${projectId}`);
  });

  socket.on('leave-project', async (projectId) => {
    const projectRoom = `project:${projectId}`;
    await socket.leave(projectRoom);
    
    const userRoomsSet = userRooms.get(socket.user.id);
    userRoomsSet?.delete(projectId);
    
    socket.to(projectRoom).emit('member:offline', { 
      userId: socket.user.id, 
      projectId 
    });
    
    console.log(`User ${socket.user.id} left project ${projectId}`);
  });

  socket.on('task:viewing', async ({ taskId, projectId }) => {
    const projectRoom = `project:${projectId}`;
    socket.to(projectRoom).emit('task:user-viewing', { 
      taskId, 
      userId: socket.user.id,
      userName: socket.user.name
    });
  });

  socket.on('task:stop-viewing', async ({ taskId, projectId }) => {
    const projectRoom = `project:${projectId}`;
    socket.to(projectRoom).emit('task:user-stop-viewing', { 
      taskId, 
      userId: socket.user.id
    });
  });

  socket.on('typing', async ({ taskId, projectId }) => {
    const projectRoom = `project:${projectId}`;
    socket.to(projectRoom).emit('comment:typing', { 
      taskId, 
      userId: socket.user.id,
      userName: socket.user.name
    });
  });

  socket.on('disconnect', async () => {
    console.log(`User ${socket.user.id} disconnected`);
    
    const userRoomsSet = userRooms.get(socket.user.id);
    if (userRoomsSet) {
      for (const projectId of userRoomsSet) {
        const projectRoom = `project:${projectId}`;
        socket.to(projectRoom).emit('member:offline', { 
          userId: socket.user.id, 
          projectId 
        });
      }
    }
    
    userSockets.delete(socket.user.id);
    userRooms.delete(socket.user.id);
  });
};

const emitToProject = (io, projectId, event, data) => {
  const projectRoom = `project:${projectId}`;
  io.to(projectRoom).emit(event, data);
};

const emitToUser = (io, userId, event, data) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = {
  authSocket,
  handleConnection,
  emitToProject,
  emitToUser,
  userSockets,
  userRooms
};