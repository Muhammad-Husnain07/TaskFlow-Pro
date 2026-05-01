import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactDOM from 'react-dom';
import { Button, Input, Avatar, MentionInput } from '../../components/ui';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { useAuthStore } from '../../store/authStore';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from '../../constants';
import { 
  Calendar, 
  Flag, 
  Clock, 
  Users,
  Tag,
  X,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const CreateTaskModal = ({ isOpen, onClose, projectId, initialStatus }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus || 'todo',
    priority: 'medium',
    assignees: [],
    dueDate: '',
    labels: []
  });
  const [labelInput, setLabelInput] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getOne(projectId),
    enabled: !!projectId
  });

  const createTask = useMutation({
    mutationFn: (data) => taskApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      toast.success('Task created successfully');
      onClose();
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignees: [],
        dueDate: '',
        labels: []
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  if (!isOpen) return null;

  const project = projectData?.data?.data;
  const members = project?.members || [];
  const availableAssignees = members.filter(m => m.user?._id !== user?.id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    createTask.mutate(formData);
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !formData.labels.includes(labelInput.trim())) {
      setFormData(prev => ({ ...prev, labels: [...prev.labels, labelInput.trim()] }));
      setLabelInput('');
      setShowLabelInput(false);
    }
  };

  const handleRemoveLabel = (label) => {
    setFormData(prev => ({ ...prev, labels: prev.labels.filter(l => l !== label) }));
  };

  const toggleAssignee = (userId) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Create New Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <Input
              placeholder="Task title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-medium"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(TASK_STATUS).map(([key, value]) => (
                  <option key={value} value={value}>{TASK_STATUS_LABELS[value]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(TASK_PRIORITY).map(([key, value]) => (
                  <option key={value} value={value}>{TASK_PRIORITY_LABELS[value]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <MentionInput
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Add a description... (@mention to notify)"
              rows={4}
              suggestions={project?.members?.map(m => ({ id: m.user?._id || m.user, name: m.user?.name })) || []}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Assignees
              </label>
              <button
                type="button"
                onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-left flex items-center justify-between"
              >
                <span>{formData.assignees.length > 0 ? `${formData.assignees.length} selected` : 'Select team members'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showAssigneeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {availableAssignees.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-gray-500">No other members</p>
                  ) : (
                    availableAssignees.map(member => (
                      <label
                        key={member.user?._id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assignees.includes(member.user?._id)}
                          onChange={() => toggleAssignee(member.user?._id)}
                          className="rounded text-primary-500"
                        />
                        <Avatar user={member.user} size="sm" />
                        <span className="text-sm text-gray-900 dark:text-white">{member.user?.name}</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Labels
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.labels.map(label => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-md text-sm"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => handleRemoveLabel(label)}
                    className="hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {showLabelInput ? (
                <input
                  type="text"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                  onBlur={handleAddLabel}
                  placeholder="Add label..."
                  className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLabelInput(true)}
                  className="px-2.5 py-1 text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:border-gray-400"
                >
                  + Add label
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={createTask.isPending}>
            {createTask.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Create Task
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateTaskModal;