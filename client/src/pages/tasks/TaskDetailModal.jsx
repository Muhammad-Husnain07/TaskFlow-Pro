import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Textarea, Badge, Avatar, Spinner } from '../ui';
import { taskApi } from '../../api/taskApi';
import { useAuthStore } from '../../store/authStore';
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { 
  Calendar, 
  Flag, 
  User, 
  Clock, 
  Paperclip, 
  MessageSquare,
  Trash2,
  X,
  Send
} from 'lucide-react';

const TaskDetailModal = ({ isOpen, onClose, task, projectId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['task', task?._id],
    queryFn: () => taskApi.getById(task._id),
    enabled: isOpen && !!task?._id,
  });

  const updatedTask = taskData?.data?.data;

  useEffect(() => {
    if (updatedTask) {
      setEditData({
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate?.split('T')[0] || '',
      });
    }
  }, [updatedTask]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
      setIsEditing(false);
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }) => taskApi.addComment(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
      setNewComment('');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ id, commentId }) => taskApi.deleteComment(id, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ id: task._id, data: editData });
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate({ id: task._id, content: newComment });
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!task) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                placeholder="Task title"
              />
              <Textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Description"
                rows={4}
              />
              <div className="flex gap-2">
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <Input
                  type="date"
                  value={editData.dueDate}
                  onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} loading={updateMutation.isPending}>
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {updatedTask?.title}
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={STATUS_COLORS[updatedTask?.status]}>
                  {TASK_STATUS_LABELS[updatedTask?.status]}
                </Badge>
                <Badge className={PRIORITY_COLORS[updatedTask?.priority]}>
                  <Flag className="w-3 h-3 mr-1" />
                  {TASK_PRIORITY_LABELS[updatedTask?.priority]}
                </Badge>
              </div>

              {updatedTask?.description && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {updatedTask.description}
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments ({updatedTask?.attachments?.length || 0})
                </h3>
                {updatedTask?.attachments?.length > 0 ? (
                  <div className="space-y-2">
                    {updatedTask.attachments.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {file.filename}
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No attachments</p>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Comments ({updatedTask?.comments?.length || 0})
                </h3>
                
                <div className="space-y-4 mb-4">
                  {updatedTask?.comments?.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar user={comment.user} size="sm" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.user?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                          {(comment.user?._id === user?.id || updatedTask?.createdBy?._id === user?.id) && (
                            <button
                              onClick={() => deleteCommentMutation.mutate({ 
                                id: task._id, 
                                commentId: comment._id 
                              })}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                              <Trash2 className="w-3 h-3 text-gray-400" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button
                    onClick={handleAddComment}
                    loading={addCommentMutation.isPending}
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full lg:w-64 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </label>
              <div className="mt-1">
                <Badge className={STATUS_COLORS[updatedTask?.status]}>
                  {TASK_STATUS_LABELS[updatedTask?.status]}
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </label>
              <div className="mt-1 flex items-center gap-1">
                <Flag className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {TASK_PRIORITY_LABELS[updatedTask?.priority]}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </label>
              <div className="mt-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {updatedTask?.dueDate ? formatDate(updatedTask.dueDate) : 'No due date'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Assignees
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {updatedTask?.assignees?.length > 0 ? (
                  updatedTask.assignees.map((assignee) => (
                    <div key={assignee._id} className="flex items-center gap-2">
                      <Avatar user={assignee} size="sm" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {assignee.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created By
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Avatar user={updatedTask?.createdBy} size="sm" />
                <span className="text-sm text-gray-900 dark:text-white">
                  {updatedTask?.createdBy?.name}
                </span>
              </div>
            </div>

            {updatedTask?.completedAt && (
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completed
                </label>
                <div className="mt-1 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {formatDate(updatedTask.completedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;