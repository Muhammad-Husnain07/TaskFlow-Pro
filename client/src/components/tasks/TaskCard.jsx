import { forwardRef, memo, useCallback, useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarGroup } from '../ui';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { TASK_STATUS, TASK_PRIORITY } from '../../constants';
import { getSocket } from '../../socket/socket';

const PRIORITY_COLORS = {
  [TASK_PRIORITY.URGENT]: 'bg-danger-500',
  [TASK_PRIORITY.HIGH]: 'bg-orange-500',
  [TASK_PRIORITY.MEDIUM]: 'bg-blue-500',
  [TASK_PRIORITY.LOW]: 'bg-gray-400',
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
      className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 hover:-translate-y-1 transition-all duration-200 group ${
        isSortableDragging || isDragging
          ? 'opacity-90 scale-105 shadow-2xl ring-2 ring-primary-500 rotate-2 z-50'
          : ''
      }`}
    >
      <div className="flex gap-2.5">
        <div className={`w-1.5 rounded-full self-stretch ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[TASK_PRIORITY.MEDIUM]}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100 truncate">{task.title}</h4>
            {hasViewers && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
          
          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {task.labels.slice(0, 3).map((label, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 rounded-md text-xs font-medium">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3.5">
            <div className="flex items-center gap-2">
              {task.assignees?.length > 0 && (
                <AvatarGroup max={3} size="xs">
                  {task.assignees.map((a, i) => (
                    <Avatar key={i} alt={a.name} />
                  ))}
                </AvatarGroup>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-gray-400">
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger-500' : 'text-gray-500'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
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