import { forwardRef, memo, useCallback, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar } from '../ui';
import { MessageSquare, Paperclip, Calendar, UserPlus } from 'lucide-react';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants';
import { getSocket } from '../../socket/socket';

const PRIORITY_CONFIG = {
  [TASK_PRIORITY.URGENT]: { color: '#ef4444', label: '!' },
  [TASK_PRIORITY.HIGH]: { color: '#f97316', label: '↑' },
  [TASK_PRIORITY.MEDIUM]: { color: '#3b82f6', label: '-' },
  [TASK_PRIORITY.LOW]: { color: '#9ca3af', label: '↓' },
};

const LABEL_COLORS = [
  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  { bg: '#fefce8', text: '#d97706', border: '#fef3c7' },
  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  { bg: '#f0fdfa', text: '#0d9488', border: '#99f6e4' },
  { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
  { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
  { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' },
];

const getLabelColor = (index) => LABEL_COLORS[index % LABEL_COLORS.length];

const formatDueDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const taskDate = new Date(d);
  taskDate.setHours(0, 0, 0, 0);

  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tmrrw';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TaskCardComponent = ({ task, onClick, isDragging, viewers = [] }) => {
  const [viewingUsers, setViewingUsers] = useState([]);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== TASK_STATUS.DONE;
  const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();
  const priorityConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG[TASK_PRIORITY.MEDIUM];

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleUserViewing = ({ taskId, userId, userName }) => {
      if (taskId === task._id) {
        setViewingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, userName }]);
      }
    };

    const handleUserStopViewing = ({ taskId, userId }) => {
      if (taskId === task._id) {
        setViewingUsers(prev => prev.filter(u => u.userId !== userId));
      }
    };

    socket.on('task:user-viewing', handleUserViewing);
    socket.on('task:user-stop-viewing', handleUserStopViewing);

    return () => {
      socket.off('task:user-viewing', handleUserViewing);
      socket.off('task:user-stop-viewing', handleUserStopViewing);
    };
  }, [task._id]);

  const handleClick = useCallback(() => {
    onClick?.(task);
  }, [onClick, task]);

  const hasViewers = viewingUsers.length > 0 || viewers.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`group bg-white dark:bg-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300/50 dark:hover:border-blue-600/30 hover:-translate-y-0.5 transition-all duration-150 ${
        isSortableDragging || isDragging
          ? 'opacity-90 scale-105 shadow-xl ring-2 ring-blue-500 rotate-1 z-50'
          : ''
      } ${isOverdue ? 'border-l-2 border-l-red-500' : ''}`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span 
            className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
            style={{ 
              backgroundColor: `${priorityConfig.color}20`, 
              color: priorityConfig.color 
            }}
          >
            {priorityConfig.label}
          </span>
          <h4 className="font-medium text-[14px] text-gray-800 dark:text-gray-100 leading-tight line-clamp-2 flex-1">
            {task.title}
          </h4>
          {hasViewers && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
          )}
        </div>

        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.labels.slice(0, 3).map((label, i) => {
              const color = getLabelColor(i);
              return (
                <span 
                  key={i} 
                  className="px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ 
                    backgroundColor: color.bg, 
                    color: color.text,
                  }}
                >
                  {label}
                </span>
              );
            })}
            {task.labels.length > 3 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-slate-700 text-gray-500">
                +{task.labels.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {task.assignees && (
            <div className="flex items-center gap-1.5">
              <Avatar user={task.assignees} size="xs" />
              <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
                {task.assignees.name?.split(' ')[0]}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {task.comments?.length > 0 && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </span>
            )}
            {task.attachments?.length > 0 && (
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5" />
                {task.attachments.length}
              </span>
            )}
            {task.dueDate && (
              <span 
                className="text-[11px] font-medium px-2 py-1 rounded flex items-center gap-1"
                style={{
                  backgroundColor: isOverdue ? '#fef2f2' : isDueToday ? '#fffbeb' : '#f3f4f6',
                  color: isOverdue ? '#dc2626' : isDueToday ? '#d97706' : '#6b7280'
                }}
              >
                <Calendar className="w-3.5 h-3.5" />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = memo(forwardRef((props, ref) => (
  <TaskCardComponent {...props} ref={ref} />
)));

TaskCard.displayName = 'TaskCard';

export { TaskCard };
export default TaskCard;