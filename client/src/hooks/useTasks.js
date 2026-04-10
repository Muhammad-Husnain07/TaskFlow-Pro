import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/taskApi';

const QUERY_KEYS = {
  tasks: 'tasks',
  task: 'task',
};

export const useTasks = (projectId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, projectId, params],
    queryFn: () => taskApi.getByProject(projectId, params),
    select: (res) => res.data,
    enabled: !!projectId,
  });
};

export const useTask = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.task, id],
    queryFn: () => taskApi.getById(id),
    select: (res) => res.data,
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => taskApi.create(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks, projectId] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.task] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
    },
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => taskApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
    },
  });
};

export const useReorderTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => taskApi.reorder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
    },
  });
};

export const useAddTaskComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }) => taskApi.addComment(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.task, taskId] });
    },
  });
};

export const useDeleteTaskComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, commentId }) => taskApi.deleteComment(taskId, commentId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.task, taskId] });
    },
  });
};