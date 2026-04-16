import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTasks, useUpdateTaskStatus, useReorderTasks } from '../../hooks/useTasks';
import { TaskCard } from '../../components/tasks/TaskCard';
import TaskQuickAdd from '../../components/tasks/TaskQuickAdd';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { Skeleton, TaskBoardSkeleton } from '../../components/ui';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../constants';

const COLUMN_CONFIG = [
  { id: TASK_STATUS.TODO, label: 'To Do', color: 'bg-gray-500' },
  { id: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
  { id: TASK_STATUS.IN_REVIEW, label: 'In Review', color: 'bg-yellow-500' },
  { id: TASK_STATUS.DONE, label: 'Done', color: 'bg-green-500' },
  { id: TASK_STATUS.CANCELLED, label: 'Cancelled', color: 'bg-gray-300' },
];

const TaskColumn = ({ column, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{column.label}</span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-100/80 dark:bg-gray-800/60 rounded-xl p-3 space-y-3 min-h-80 transition-all duration-300 ${
          isOver
            ? 'ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-inner scale-[1.02]'
            : 'hover:bg-gray-200/50 dark:hover:bg-gray-800/80'
        }`}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        <TaskQuickAdd projectId={tasks[0]?.project || ''} status={column.id} />
      </div>
    </div>
  );
};

const TaskBoard = ({ projectId, onTaskClick }) => {
  const { data, isLoading } = useTasks(projectId);
  const updateStatus = useUpdateTaskStatus();
  const reorderTasks = useReorderTasks();
  
  const [activeId, setActiveId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasks = Array.isArray(data?.data) ? data.data : [];
  
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    COLUMN_CONFIG.forEach(col => {
      grouped[col.id] = tasks.filter(t => t.status === col.id);
    });
    return grouped;
  }, [tasks]);

  const activeTask = activeId ? tasks.find(t => t._id === activeId) : null;

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(t => t._id === active.id);
    if (!activeTask) return;

    let newStatus = null;

    const overColumn = COLUMN_CONFIG.find(c => c.id === over.id);
    if (overColumn) {
      newStatus = overColumn.id;
    } else {
      const overTask = tasks.find(t => t._id === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (newStatus && activeTask.status !== newStatus) {
      try {
        await updateStatus.mutateAsync({
          id: activeTask._id,
          data: { status: newStatus }
        });
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    onTaskClick?.(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  if (isLoading) {
    return <TaskBoardSkeleton />;
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-2 custom-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {COLUMN_CONFIG.map(column => (
<TaskColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              onTaskClick={handleTaskClick}
            />
        ))}
        
        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 scale-105 rotate-2 shadow-2xl z-50">
              <TaskCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        task={selectedTask}
        projectId={projectId}
      />
    </div>
  );
};

export default TaskBoard;