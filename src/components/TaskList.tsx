import React, { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { TaskCard } from './TaskCard';
import { ClipboardList, Plus } from 'lucide-react';

export const TaskList: React.FC = () => {
  // Read state from Zustand
  const tasks = useTaskStore((state) => state.tasks);
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const statusFilter = useTaskStore((state) => state.statusFilter);
  const priorityFilter = useTaskStore((state) => state.priorityFilter);
  const sortBy = useTaskStore((state) => state.sortBy);
  const openCreateModal = useTaskStore((state) => state.openCreateModal);

  // Derived state: calculate filtered & sorted list
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // 1. Status Filter
        if (statusFilter !== 'all' && task.status !== statusFilter) return false;

        // 2. Priority Filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // 3. Search Query
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(query);
          const matchDesc = task.description.toLowerCase().includes(query);
          const matchCategory = task.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'priority') {
          const weight = { high: 3, medium: 2, low: 1 };
          return weight[b.priority] - weight[a.priority];
        }
        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy]);

  if (filteredTasks.length === 0) {
    return (
      <div className="py-16 text-center bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
        <ClipboardList className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <h3 className="text-base font-medium text-slate-300">No tasks found</h3>
        <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
          {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
            ? 'Try adjusting your search query or filter settings.'
            : 'Get started by creating your very first task!'}
        </p>
        <button
          onClick={openCreateModal}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};

export default TaskList;
