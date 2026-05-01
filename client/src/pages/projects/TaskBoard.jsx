import { useState, useMemo, useRef, useEffect } from 'react';
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
import CreateTaskModal from '../tasks/CreateTaskModal';
import { Skeleton, TaskBoardSkeleton, Avatar } from '../../components/ui';
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY } from '../../constants';
import { Plus, Search, Filter, X, User, ChevronDown, Flag, Layers } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const COLUMN_CONFIG = [
  { id: TASK_STATUS.TODO, label: 'To Do', color: 'bg-gray-500' },
  { id: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: 'bg-blue-500' },
  { id: TASK_STATUS.IN_REVIEW, label: 'In Review', color: 'bg-yellow-500' },
  { id: TASK_STATUS.DONE, label: 'Done', color: 'bg-green-500' },
  { id: TASK_STATUS.CANCELLED, label: 'Cancelled', color: 'bg-gray-300' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: TASK_PRIORITY.URGENT, label: 'Urgent' },
  { value: TASK_PRIORITY.HIGH, label: 'High' },
  { value: TASK_PRIORITY.MEDIUM, label: 'Medium' },
  { value: TASK_PRIORITY.LOW, label: 'Low' },
];

const Dropdown = ({ label, value, onChange, options, icon: Icon, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all min-w-[140px] ${
          value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-400'
        }`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        <span className="truncate">{selected?.label || placeholder || label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 ${
                value === opt.value ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ActiveFilterBadge = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 text-xs rounded-lg">
    {label}
    <button onClick={onRemove} className="hover:text-primary-800">
      <X className="w-3 h-3" />
    </button>
  </span>
);

const FilterBar = ({ projectMembers, onFilterChange, filters }) => {
  const { user } = useAuthStore();

  const memberOptions = useMemo(() => {
    return projectMembers?.map(m => ({
      value: m.user?._id || m._id,
      label: m.user?.name || m.name || 'Unknown'
    })) || [];
  }, [projectMembers]);

  const assigneeOptions = useMemo(() => [
    { value: '', label: 'All Assignees' },
    { value: 'my_tasks', label: 'My Tasks' },
    { value: 'created_by_me', label: 'Created by Me' },
    ...memberOptions
  ], [memberOptions]);

  const reporterOptions = useMemo(() => [
    { value: '', label: 'All Reporters' },
    ...memberOptions
  ], [memberOptions]);

  const activeFilters = [];
  if (filters.search) activeFilters.push({ label: `Search: "${filters.search}"`, key: 'search' });
  if (filters.assignee) {
    const member = memberOptions.find(m => m.value === filters.assignee);
    activeFilters.push({ label: `Assignee: ${member?.label || 'Selected'}`, key: 'assignee' });
  }
  if (filters.reporter) {
    const member = memberOptions.find(m => m.value === filters.reporter);
    activeFilters.push({ label: `Reporter: ${member?.label || 'Selected'}`, key: 'reporter' });
  }
  if (filters.priority) {
    const p = PRIORITY_OPTIONS.find(p => p.value === filters.priority);
    activeFilters.push({ label: p?.label || filters.priority, key: 'priority' });
  }
  if (filters.myTasks === 'assigned') activeFilters.push({ label: 'My Tasks', key: 'myTasks_assigned' });
  if (filters.myTasks === 'created') activeFilters.push({ label: 'Created by Me', key: 'myTasks_created' });

  const clearFilter = (key) => {
    if (key === 'myTasks_assigned' || key === 'myTasks_created') {
      onFilterChange({ ...filters, myTasks: '' });
    } else {
      onFilterChange({ ...filters, [key]: '' });
    }
  };

  return (
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1 min-w-[180px] max-w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks by title or description..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Dropdown
            placeholder="Assignee"
            value={filters.assignee}
            onChange={(v) => onFilterChange({ ...filters, assignee: v })}
            options={assigneeOptions}
            icon={User}
          />

          <Dropdown
            placeholder="Reporter"
            value={filters.reporter}
            onChange={(v) => onFilterChange({ ...filters, reporter: v })}
            options={reporterOptions}
            icon={Layers}
          />

          <Dropdown
            placeholder="Priority"
            value={filters.priority}
            onChange={(v) => onFilterChange({ ...filters, priority: v })}
            options={PRIORITY_OPTIONS}
            icon={Flag}
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500">Active filters:</span>
          {activeFilters.map((f, i) => (
            <ActiveFilterBadge key={i} label={f.label} onRemove={() => clearFilter(f.key)} />
          ))}
          <button
            onClick={() => onFilterChange({ search: '', assignee: '', reporter: '', priority: '', myTasks: '' })}
            className="text-sm text-danger-500 hover:text-danger-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

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

const TaskBoard = ({ projectId, onTaskClick, projectMembers }) => {
  const { data, isLoading } = useTasks(projectId);
  const updateStatus = useUpdateTaskStatus();
  const reorderTasks = useReorderTasks();
  const { user } = useAuthStore();

  const [activeId, setActiveId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    assignee: '',
    reporter: '',
    priority: '',
    myTasks: '',
  });

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!task.title?.toLowerCase().includes(searchLower) &&
            !task.description?.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }

      if (filters.assignee === 'my_tasks' || filters.myTasks === 'assigned') {
        const assigneeId = task.assignees?._id || task.assignees;
        if (assigneeId !== user?.id) {
          return false;
        }
      }

      if (filters.assignee === 'created_by_me' || filters.myTasks === 'created') {
        const creatorId = task.createdBy?._id || task.createdBy;
        if (creatorId !== user?.id) {
          return false;
        }
      }

      if (filters.assignee && filters.assignee !== 'my_tasks' && filters.assignee !== 'created_by_me') {
        const assigneeId = task.assignees?._id || task.assignees;
        if (assigneeId !== filters.assignee) {
          return false;
        }
      }

      if (filters.reporter) {
        const reporterId = task.reporter?._id || task.reporter;
        if (reporterId !== filters.reporter) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters, user]);

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    COLUMN_CONFIG.forEach(col => {
      grouped[col.id] = filteredTasks.filter(t => t.status === col.id);
    });
    return grouped;
  }, [filteredTasks]);

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
    onTaskClick?.(task);
  };

  if (isLoading) {
    return <TaskBoardSkeleton />;
  }

  return (
    <div>
      <FilterBar
        projectMembers={projectMembers}
        filters={filters}
        onFilterChange={setFilters}
      />

      <div className="flex justify-end mb-4 px-2">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">Create Task</span>
        </button>
      </div>

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

        <CreateTaskModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          projectId={projectId}
        />
      </div>
    </div>
  );
};

export default TaskBoard;