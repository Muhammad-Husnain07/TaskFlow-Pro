import { useState } from 'react';
import { useCreateTask } from '../../hooks/useTasks';
import { Button, Input } from '../ui';
import { Toaster, toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const TaskQuickAdd = ({ projectId, status, onSuccess }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await createTask.mutateAsync({
        projectId,
        data: { title: title.trim(), status }
      });
      toast.success('Task created!');
      setTitle('');
      setIsAdding(false);
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setTitle('');
      setIsAdding(false);
    }
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Add task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <Input
        autoFocus
        placeholder="Task title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        className="text-sm"
      />
      <div className="flex gap-2 mt-2">
        <Button type="submit" size="sm" isLoading={createTask.isPending}>
          Add
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setTitle(''); setIsAdding(false); }}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskQuickAdd;