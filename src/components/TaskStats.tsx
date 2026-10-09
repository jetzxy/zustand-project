import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const TaskStats: React.FC = () => {
  // Subscribe to tasks to compute stats
  const tasks = useTaskStore((state) => state.tasks);

  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const completed = tasks.filter((t) => t.status === 'completed').length;

  const statCards = [
    { label: 'Total Tasks', count: total, icon: ListTodo, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    { label: 'To Do', count: todo, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'In Progress', count: inProgress, icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'Completed', count: completed, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-400">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{card.count}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg ${card.bg} ${card.border} border flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStats;
