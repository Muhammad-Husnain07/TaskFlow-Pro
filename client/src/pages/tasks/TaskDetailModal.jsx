import { useState, useEffect, useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import ReactDOM from 'react-dom';
import { Button, Avatar, Spinner } from '../../components/ui';
import { taskApi } from '../../api/taskApi';
import { projectApi } from '../../api/projectApi';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, STATUS_COLORS, PRIORITY_COLORS } from '../../constants';
import { 
  Calendar, 
  Flag, 
  Clock, 
  Paperclip, 
  MessageSquare,
  Trash2,
  Send,
  Check,
  X,
  Plus,
  Bold,
  Italic,
  Code,
  Link2,
  ChevronDown,
  ChevronRight,
  FileIcon,
  Image,
  Download,
  Pencil
} from 'lucide-react';

const SlidingModal = ({ isOpen, onClose, children, title }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[520px] h-full bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
};

const StatusPills = ({ current, onChange }) => {
  const statuses = [
    { id: TASK_STATUS.TODO, label: 'To Do', color: 'bg-gray-500' },
    { id: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
    { id: TASK_STATUS.IN_REVIEW, label: 'In Review', color: 'bg-yellow-500' },
    { id: TASK_STATUS.DONE, label: 'Done', color: 'bg-green-500' },
    { id: TASK_STATUS.CANCELLED, label: 'Cancelled', color: 'bg-gray-400' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {statuses.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            current === s.id
              ? `${s.color} text-white`
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

const PriorityDropdown = ({ value, onChange }) => {
  const priorities = [
    { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
    { id: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-600' },
    { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-600' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600' },
  ];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium ${PRIORITY_COLORS[value]}`}
      >
        <Flag className="w-3.5 h-3.5" />
        {TASK_PRIORITY_LABELS[value]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
          {priorities.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 first:rounded-t-lg last:rounded-b-lg ${p.color}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AssigneesSelect = ({ value, onChange, projectMembers }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleAssignee = (userId) => {
    if (value.includes(userId)) {
      onChange(value.filter((id) => id !== userId));
    } else {
      onChange([...value, userId]);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center gap-2">
        <AvatarGroup users={projectMembers?.filter((m) => value.includes(m._id))} size="sm" />
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Assign
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10 max-h-48 overflow-y-auto">
          {projectMembers?.map((m) => (
            <button
              key={m._id}
              onClick={() => toggleAssignee(m._id)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              <div className={`w-4 h-4 rounded border ${value.includes(m._id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center`}>
                {value.includes(m._id) && <Check className="w-3 h-3 text-white" />}
              </div>
              <Avatar user={m} size="xs" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{m.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AvatarGroup = ({ users, size = 'md' }) => {
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base' };
  if (!users || users.length === 0) return null;
  const display = users.slice(0, 3);
  const extra = users.length - 3;

  return (
    <div className="flex -space-x-2">
      {display.map((u, i) => (
        <Avatar key={i} user={u} size={size} className="border-2 border-white dark:border-gray-800" />
      ))}
      {extra > 0 && (
        <div className={`${sizes[size]} rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800`}>
          +{extra}
        </div>
      )}
    </div>
  );
};

const DescriptionEditor = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [preview, setPreview] = useState(false);

  const insertMarkdown = (syntax, wrap = false) => {
    const textarea = document.getElementById('desc-editor');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = value || '';
    const selected = text.substring(start, end);
    let newText;
    if (wrap && selected) {
      newText = text.substring(0, start) + syntax + selected + syntax + text.substring(end);
    } else if (wrap) {
      newText = text.substring(0, start) + syntax + syntax + text.substring(end);
    } else {
      newText = text.substring(0, start) + syntax + text.substring(end);
    }
    onChange(newText);
  };

  return (
    <div className="space-y-2">
      {(focused || value) && (
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-600 pb-2">
          <button type="button" onClick={() => insertMarkdown('**', true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Bold className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertMarkdown('*', true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Italic className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertMarkdown('`', true)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Code className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => insertMarkdown('[](url)')} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Link2 className="w-4 h-4" />
          </button>
          <div className="flex-1" />
          <button type="button" onClick={() => setPreview(!preview)} className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      )}
      {preview ? (
        <div className="prose dark:prose-invert max-w-none min-h-[100px] p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
          <ReactMarkdown>{value || '*No description*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          id="desc-editor"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Add a description... (markdown supported)"
          className="w-full min-h-[100px] p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}
    </div>
  );
};

const SubtasksSection = ({ subtasks, onChange }) => {
  const [newSubtask, setNewSubtask] = useState('');

  const addSubtask = () => {
    if (newSubtask.trim()) {
      onChange([...subtasks, { title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    onChange(updated);
  };

  const deleteSubtask = (index) => {
    onChange(subtasks.filter((_, i) => i !== index));
  };

  const completed = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtasks</h4>
        {subtasks.length > 0 && (
          <span className="text-xs text-gray-500">{completed}/{subtasks.length} done</span>
        )}
      </div>
      {subtasks.length > 0 && (
        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${subtasks.length ? (completed / subtasks.length) * 100 : 0}%` }}
          />
        </div>
      )}
      <div className="space-y-1.5">
        {subtasks.map((sub, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <button
              type="button"
              onClick={() => toggleSubtask(i)}
              className={`w-4 h-4 rounded border flex items-center justify-center ${
                sub.completed ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {sub.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <span className={`flex-1 text-sm ${sub.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {sub.title}
            </span>
            <button type="button" onClick={() => deleteSubtask(i)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
              <Trash2 className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={newSubtask}
          onChange={(e) => setNewSubtask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSubtask()}
          placeholder="Add a subtask..."
          className="flex-1 px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button size="sm" onClick={addSubtask} disabled={!newSubtask.trim()}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const CommentsSection = ({ comments, onAddComment, onDeleteComment, currentUserId }) => {
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Comments ({comments?.length || 0})
      </h4>
      <div className="space-y-3">
        {comments?.map((comment) => (
          <div key={comment._id} className="group flex gap-2.5">
            <Avatar user={comment.user} size="sm" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">{comment.user?.name}</span>
                <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
                {comment.user?._id === currentUserId && (
                  <button
                    type="button"
                    onClick={() => onDeleteComment(comment._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm mt-0.5">
                <ReactMarkdown>{comment.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && e.metaKey && addComment()}
          placeholder="Write a comment... (Cmd+Enter to post)"
          className="w-full min-h-[80px] p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
            <Send className="w-4 h-4 mr-1" /> Post
          </Button>
        </div>
      </div>
    </div>
  );
};

const AttachmentsSection = ({ attachments, onUpload, onDelete }) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length) onUpload(files);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <Image className="w-5 h-5 text-green-500" />;
    if (['pdf'].includes(ext)) return <FileIcon className="w-5 h-5 text-red-500" />;
    if (['doc', 'docx'].includes(ext)) return <FileIcon className="w-5 h-5 text-blue-500" />;
    return <Paperclip className="w-5 h-5 text-gray-500" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
        <Paperclip className="w-6 h-6 mx-auto text-gray-400" />
        <p className="text-sm text-gray-500 mt-1">Drag files here or click to upload</p>
      </div>
      <div className="space-y-2">
        {attachments?.map((file, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            {getFileIcon(file.filename)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.filename}</p>
              <p className="text-xs text-gray-500">{file.size ? formatSize(file.size) : ''}</p>
            </div>
            <a href={file.url} download className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <Download className="w-4 h-4 text-gray-500" />
            </a>
            <button type="button" onClick={() => onDelete(file.filename)} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ActivityLog = ({ activities }) => {
  const [expanded, setExpanded] = useState(true);
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Activity
      </button>
      {expanded && (
        <div className="mt-2 space-y-2">
          {activities?.slice(0, 10).map((item, i) => (
            <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{item.user?.name}</span>{' '}
              {item.action} {item.field}
              {item.oldValue && <span> from {item.oldValue} to {item.newValue}</span>}
              {' '}· {formatTimeAgo(item.createdAt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskDetailModal = ({ isOpen, onClose, task, projectId }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    assignees: [],
    labels: [],
    subtasks: [],
  });
  const [newLabel, setNewLabel] = useState('');

  const { data: taskData, isLoading } = useQuery({
    queryKey: ['task', task?._id],
    queryFn: () => taskApi.getById(task._id),
    enabled: isOpen && !!task?._id,
  });

  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectApi.getById(projectId),
    enabled: isOpen && !!projectId,
  });

  const updatedTask = taskData?.data?.data;
  const project = projectData?.data?.data;

  useEffect(() => {
    if (updatedTask) {
      setFormData({
        title: updatedTask.title || '',
        description: updatedTask.description || '',
        status: updatedTask.status || 'todo',
        priority: updatedTask.priority || 'medium',
        dueDate: updatedTask.dueDate?.split('T')[0] || '',
        assignees: updatedTask.assignees?.map((a) => a._id) || [],
        labels: updatedTask.labels || [],
        subtasks: updatedTask.subtasks || [],
      });
    }
  }, [updatedTask]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['task', task._id] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }) => taskApi.addComment(id, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', task._id] }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: ({ id, commentId }) => taskApi.deleteComment(id, commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', task._id] }),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ id, files }) => {
      const fdata = new FormData();
      Array.from(files).forEach((file) => fdata.append('file', file));
      return taskApi.uploadAttachment(id, fdata);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task', task._id] }),
  });

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && e.metaKey) handleSave();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleSave = () => {
    updateMutation.mutate({ id: task._id, data: formData });
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData({ ...formData, labels: [...formData.labels, newLabel.trim()] });
      setNewLabel('');
    }
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!task) return null;

  if (isLoading) {
    return (
      <SlidingModal isOpen={isOpen} onClose={onClose} title="Task Details">
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </SlidingModal>
    );
  }

  return (
    <SlidingModal isOpen={isOpen} onClose={onClose} title="Task Details">
      <div className="p-4 space-y-5">
        <div className="space-y-3">
          <input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onBlur={handleSave}
            className="w-full text-lg font-semibold bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Task title"
          />
          <StatusPills
            current={formData.status}
            onChange={(status) => {
              setFormData({ ...formData, status });
              updateMutation.mutate({ id: task._id, data: { ...formData, status } });
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Priority</label>
            <div className="mt-1">
              <PriorityDropdown
                value={formData.priority}
                onChange={(priority) => {
                  setFormData({ ...formData, priority });
                  updateMutation.mutate({ id: task._id, data: { ...formData, priority } });
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              onBlur={handleSave}
              className="mt-1 w-full px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
          <DescriptionEditor
            value={formData.description}
            onChange={(desc) => setFormData({ ...formData, description: desc })}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="text-xs font-medium text-gray-500 uppercase">Assignees</label>
          <div className="mt-2">
            <AssigneesSelect
              value={formData.assignees}
              onChange={(assignees) => {
                setFormData({ ...formData, assignees });
                updateMutation.mutate({ id: task._id, data: { ...formData, assignees } });
              }}
              projectMembers={project?.members}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase">Labels</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {formData.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full flex items-center gap-1"
              >
                {label}
                <button type="button" onClick={() => {
                  const labels = formData.labels.filter((l) => l !== label);
                  setFormData({ ...formData, labels });
                  updateMutation.mutate({ id: task._id, data: { ...formData, labels } });
                }}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
              placeholder="Add label..."
              className="px-2 py-0.5 text-xs border-none bg-transparent focus:outline-none w-20"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <SubtasksSection
            subtasks={formData.subtasks}
            onChange={(subtasks) => {
              setFormData({ ...formData, subtasks });
              updateMutation.mutate({ id: task._id, data: { ...formData, subtasks } });
            }}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <CommentsSection
            comments={updatedTask?.comments}
            onAddComment={(content) => addCommentMutation.mutate({ id: task._id, content })}
            onDeleteComment={(commentId) => deleteCommentMutation.mutate({ id: task._id, commentId })}
            currentUserId={user?.id}
          />
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Attachments</h4>
          <AttachmentsSection
            attachments={updatedTask?.attachments}
            onUpload={(files) => uploadMutation.mutate({ id: task._id, files })}
            onDelete={(filename) => {}}
          />
        </div>

        <ActivityLog activities={updatedTask?.activity} />

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-xs text-gray-500 space-y-1">
          <p>
            Created by {updatedTask?.createdBy?.name} · {formatDate(updatedTask?.createdAt)}
          </p>
          <p>
            Project: <span className="text-blue-600">{project?.name}</span>
          </p>
          <p className="text-gray-400">E: edit title · Cmd+Enter: save · Esc: close</p>
        </div>
      </div>
    </SlidingModal>
  );
};

export default TaskDetailModal;