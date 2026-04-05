export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
};

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPLETED: 'completed',
};

export const MEMBER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.TODO]: 'To Do',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.IN_REVIEW]: 'In Review',
  [TASK_STATUS.DONE]: 'Done',
  [TASK_STATUS.CANCELLED]: 'Cancelled',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]: 'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]: 'High',
  [TASK_PRIORITY.URGENT]: 'Urgent',
};

export const PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]: 'bg-gray-100 text-gray-600',
  [TASK_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-600',
  [TASK_PRIORITY.HIGH]: 'bg-orange-100 text-orange-600',
  [TASK_PRIORITY.URGENT]: 'bg-danger-100 text-danger-600',
};

export const STATUS_COLORS = {
  [TASK_STATUS.TODO]: 'bg-gray-100 text-gray-600',
  [TASK_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
  [TASK_STATUS.IN_REVIEW]: 'bg-yellow-100 text-yellow-600',
  [TASK_STATUS.DONE]: 'bg-green-100 text-green-600',
  [TASK_STATUS.CANCELLED]: 'bg-red-100 text-red-600',
};
