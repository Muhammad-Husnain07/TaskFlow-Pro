import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Avatar, AvatarGroup, Badge } from '../ui';
import { MessageSquare, Paperclip, Calendar } from 'lucide-react';
import { TASK_STATUS, TASK_PRIORITY } from '../constants';

const PRIORITY_COLORS = {
  [TASK_PRIORITY.URGENT]: 'bg-danger-500',
  [TASK_PRIORITY.HIGH]: 'bg-orange-500',
  [TASK_PRIORITY.MEDIUM]: 'bg-blue-500',
  [TASK_PRIORITY.LOW]: 'bg-gray-400',
};

const TaskCard = ({ task, onClick, isDragging }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:shadow-md transition-shadow ${
        isSortableDragging || isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex gap-2">
        <div className={`w-1 rounded-full self-stretch ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[TASK_PRIORITY.MEDIUM]}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{task.title}</h4>
          
          {task.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.slice(0, 3).map((label, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {task.assignees?.length > 0 && (
                <AvatarGroup max={3} size="xs">
                  {task.assignees.map((a, i) => (
                    <Avatar key={i} alt={a.name} />
                  ))}
                </AvatarGroup>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              {task.comments?.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <MessageSquare className="w-3 h-3" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              {task.attachments?.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <Paperclip className="w-3 h-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
              {task.dueDate && (
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-danger-500' : ''}`}>
                  <Calendar className="w-3 h-3" />
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

export default forwardRef((props, ref) => <TaskCard {...props} ref={ref} />);