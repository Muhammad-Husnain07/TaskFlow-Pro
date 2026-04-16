import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi, taskApi } from '../api/projectApi';
import api from '../api/axios';

const QUERY_KEYS = {
  projects: 'projects',
  project: 'project',
  tasks: 'tasks',
  task: 'task',
};

export const useProjects = (params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.projects, params],
    queryFn: () => projectApi.getAll(params),
    select: (res) => res?.data,
    placeholderData: (prev) => prev,
  });
};

export const useProject = (id) => {
  return useQuery({
    queryKey: [QUERY_KEYS.project, id],
    queryFn: () => projectApi.getById(id),
    select: (res) => res?.data?.data,
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.projects] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => projectApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.projects] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.project, id] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.projects] });
    },
  });
};

export const useArchiveProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.projects] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.project, id] });
    },
  });
};

export const useAddProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => projectApi.addMember(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.project, projectId] });
    },
  });
};

export const useRemoveProjectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }) => projectApi.removeMember(projectId, userId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.project, projectId] });
    },
  });
};

export const useTasks = (projectId, params = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, projectId, params],
    queryFn: () => taskApi.getByProject(projectId, params),
    select: (res) => res?.data,
    enabled: !!projectId,
    placeholderData: (prev) => prev,
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

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => taskApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.tasks] });
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

export const useAddTaskComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, data }) => taskApi.addComment(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.task, taskId] });
    },
  });
};

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.get('/tasks/my-tasks', { params: { assignee: 'me', sortBy: 'dueDate', order: 'asc' } }),
    select: (res) => res?.data,
  });
};