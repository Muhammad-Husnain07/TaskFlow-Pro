import { useEffect, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSocket, initSocket } from '../socket/socket';
import { useAuthStore } from '../store/authStore';

export const useSocket = (projectId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [typingUsers, setTypingUsers] = useState({});

  const joinProject = useCallback(() => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('join-project', projectId);
    }
  }, [projectId]);

  const leaveProject = useCallback(() => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('leave-project', projectId);
    }
  }, [projectId]);

  const emitTaskViewing = useCallback((taskId) => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('task:viewing', { taskId, projectId });
    }
  }, [projectId]);

  const emitTaskStopViewing = useCallback((taskId) => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('task:stop-viewing', { taskId, projectId });
    }
  }, [projectId]);

  const emitTyping = useCallback((taskId) => {
    const socket = getSocket();
    if (socket && projectId) {
      socket.emit('typing', { taskId, projectId });
    }
  }, [projectId]);

  useEffect(() => {
    initSocket();
    if (projectId) {
      joinProject();
    }

    const socket = getSocket();
    if (!socket) return;

    const handleTaskCreated = ({ task }) => {
      const currentTasks = queryClient.getQueryData(['tasks', projectId]);
      if (currentTasks?.data) {
        queryClient.setQueryData(['tasks', projectId], (old) => ({
          ...old,
          data: [...(old?.data || []), task]
        }));
      }
      if (task.createdBy?._id !== user?.id) {
        toast.success(`${task.createdBy?.name || 'Someone'} created a new task: ${task.title}`);
      }
    };

    const handleTaskUpdated = ({ task }) => {
      queryClient.setQueryData(['tasks', projectId], (old) => ({
        ...old,
        data: (old?.data || []).map(t => t._id === task._id ? task : t)
      }));
      queryClient.setQueryData(['task', task._id], { data: { data: task } });
      if (task.updatedBy?.id !== user?.id) {
        toast.success(`${task.updatedBy?.name || 'Someone'} updated ${task.title}`);
      }
    };

    const handleTaskDeleted = ({ taskId }) => {
      queryClient.setQueryData(['tasks', projectId], (old) => ({
        ...old,
        data: (old?.data || []).filter(t => t._id !== taskId)
      }));
    };

    const handleTaskStatusChanged = ({ taskId, status, movedBy }) => {
      queryClient.setQueryData(['tasks', projectId], (old) => ({
        ...old,
        data: (old?.data || []).map(t => 
          t._id === taskId ? { ...t, status } : t
        )
      }));
    };

    const handleCommentAdded = ({ taskId, comment }) => {
      const taskData = queryClient.getQueryData(['task', taskId]);
      if (taskData?.data?.data) {
        queryClient.setQueryData(['task', taskId], {
          data: {
            ...taskData.data,
            data: {
              ...taskData.data.data,
              comments: [...(taskData.data.data.comments || []), comment]
            }
          }
        });
      }
      if (comment.user?._id !== user?.id) {
        toast.success(`${comment.user?.name || 'Someone'} commented on a task`);
      }
    };

    const handleMemberOnline = ({ userId, projectId: pId }) => {
      if (pId === projectId) {
        queryClient.setQueryData(['project', projectId], (old) => old);
      }
    };

    const handleMemberOffline = ({ userId, projectId: pId }) => {
      if (pId === projectId) {
        queryClient.setQueryData(['project', projectId], (old) => old);
      }
    };

    const handleTyping = ({ taskId, userId, userName }) => {
      if (userId !== user?.id) {
        setTypingUsers(prev => ({
          ...prev,
          [taskId]: { userId, userName, timestamp: Date.now() }
        }));
        setTimeout(() => {
          setTypingUsers(prev => {
            const filtered = { ...prev };
            delete filtered[taskId];
            return filtered;
          });
        }, 3000);
      }
    };

    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);
    socket.on('task:status-changed', handleTaskStatusChanged);
    socket.on('comment:added', handleCommentAdded);
    socket.on('member:online', handleMemberOnline);
    socket.on('member:offline', handleMemberOffline);
    socket.on('comment:typing', handleTyping);

    return () => {
      leaveProject();
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
      socket.off('task:status-changed', handleTaskStatusChanged);
      socket.off('comment:added', handleCommentAdded);
      socket.off('member:online', handleMemberOnline);
      socket.off('member:offline', handleMemberOffline);
      socket.off('comment:typing', handleTyping);
    };
  }, [projectId, user?.id, queryClient]);

  return {
    joinProject,
    leaveProject,
    emitTaskViewing,
    emitTaskStopViewing,
    emitTyping,
    typingUsers
  };
};