import React from 'react';
import type { Task } from '../types/task';
import { useTaskStore } from '../store/useTaskStore';
import { CheckCircle2, Clock, Circle, Pencil, Trash2, Tag } from 'lucide-react';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  // Grab actions directly from store
  const toggleTaskStatus = useTaskStore((state) => state.toggleTaskStatus);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const openEditModal = useTaskStore((state) => state.openEditModal);

  // Status Styling
  const statusConfig = {
    todo: {
      label: 'To Do',
      icon: Circle,
      color: 'text-amber-400',
      badge: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    },
    in_progress: {
      label: 'In Progress',
      icon: Clock,
      color: 'text-sky-400',
      badge: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      badge: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    },
  }[task.status];

  // Priority Styling
  const priorityBadge = {
    low: 'bg-slate-800 text-slate-400 border-slate-700',
    medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[task.priority];

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`group p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-sm ${task.status === 'completed' ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Toggle Button + Title */}
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={() => toggleTaskStatus(task.id)}
            title="Click to cycle status: To Do -> In Progress -> Completed"
            className={`mt-0.5 transition-transform active:scale-90 cursor-pointer ${statusConfig.color}`}
          >
            <StatusIcon className="w-5 h-5" />
          </button>

          <div className="space-y-1 flex-1">
            <h3 className={`text-base font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons (Edit & Delete) */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => openEditModal(task)}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Task"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Badges */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span className={`px-2 py-0.5 rounded-md border font-medium ${statusConfig.badge}`}>
            {statusConfig.label}
          </span>

          {/* Priority Badge */}
          <span className={`px-2 py-0.5 rounded-md border uppercase tracking-wider font-semibold text-[10px] ${priorityBadge}`}>
            {task.priority}
          </span>

          {/* Category */}
          <span className="flex items-center gap-1 text-slate-400">
            <Tag className="w-3 h-3 text-slate-500" />
            {task.category}
          </span>
        </div>

        {/* Date */}
        <span className="text-[11px] text-slate-400">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
