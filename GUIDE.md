# 🚀 Master Zustand: Step-by-Step Hands-On CRUD Tutorial

Welcome! This guide is designed for you to **code everything manually** so you build muscle memory and understand the "why" behind every line of code.

---

## 🧠 Mental Model: Why Zustand?

Before writing code, let's understand why Zustand has become the favorite state management library in the modern React ecosystem:

| Feature | React Context API | Redux Toolkit | Zustand |
| :--- | :--- | :--- | :--- |
| **Boilerplate** | Low | High (actions, reducers, slices) | **Minimal** (just `create()`) |
| **Provider Requirement** | Needs `<Context.Provider>` wrapping your tree | Needs `<Provider store={store}>` | **None!** Store lives outside the React tree |
| **Re-render Optimization** | ❌ All consumers re-render when any context value changes | ✅ Selectors prevent re-renders | ✅ **Fine-grained atomic selectors built-in** |
| **Async Actions** | Needs custom hooks or effects | Needs `createAsyncThunk` | **Native** (just `async/await` inside actions!) |
| **TypeScript Support** | Good | Verbose | **Clean & concise** |

---

## 📋 Table of Contents
1. [Step 1: Project Setup (Vite + Tailwind CSS v4 + Zustand)](#step-1-project-setup)
2. [Step 2: Defining Data Models (TypeScript Types)](#step-2-defining-data-models)
3. [Step 3: The Heart of Zustand (The Store Architecture)](#step-3-the-heart-of-zustand)
4. [Step 4: Building the Components (Connecting Zustand to UI)](#step-4-building-the-components)
5. [Step 5: Assembling `App.tsx`](#step-5-assembling-apptsx)
6. [Step 6: Testing & Key Takeaways](#step-6-testing--key-takeaways)

---

## Step 1: Project Setup

Open your terminal in `zustand-project` and run:

### 1.1 Scaffold Vite React + TypeScript
*(Note: On Windows PowerShell, if running scripts is disabled by execution policy, prefix npm commands with `npm.cmd` or run via Command Prompt).*

```bash
npm create vite@latest . -- --template react-ts
```
When prompted to proceed or overwrite in the current directory, confirm **Yes**.

### 1.2 Install Dependencies
Install **Zustand**, **Lucide Icons** (for modern UI icons), and the latest **Tailwind CSS v4**:

```bash
npm install zustand lucide-react clsx tailwind-merge
npm install @tailwindcss/vite tailwindcss
```

> **Why Tailwind CSS v4?**
> Tailwind v4 uses a first-party Vite plugin (`@tailwindcss/vite`). You **no longer need** `postcss.config.js`, `tailwind.config.js`, or `autoprefixer`!

### 1.3 Configure Vite for Tailwind CSS v4
Open your `vite.config.ts` and update it:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Enables Tailwind CSS v4
  ],
});
```

### 1.4 Setup CSS
Replace the entire content of `src/index.css` with just one line:

```css
/* src/index.css */
@import "tailwindcss";
```

You can delete `src/App.css` as we will use Tailwind CSS utility classes directly.

---

## Step 2: Defining Data Models

In professional TypeScript projects, always define your domain models before writing stores or UI components.

Create a new file: `src/types/task.ts`:

```typescript
// src/types/task.ts

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'completed';
export type Category = 'Work' | 'Personal' | 'Study' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  createdAt: string;
}

export type StatusFilter = 'all' | Status;
export type PriorityFilter = 'all' | Priority;
export type SortOption = 'newest' | 'oldest' | 'priority';
```

### 💡 Why this code?
- Typing `Priority` and `Status` as union literal types (`'low' | 'medium' | 'high'`) gives autocomplete and prevents invalid strings.
- Defining `StatusFilter` as `'all' | Status` lets our UI easily toggle between showing everything or specific sub-lists.

---

## Step 3: The Heart of Zustand

This is the most important step. We will build `useTaskStore.ts`.

Create the file: `src/store/useTaskStore.ts`.

### 3.1 Understanding the Store Anatomy
A Zustand store is created with `create()`. We pass a callback function that receives `set` and `get`:

```typescript
const useStore = create((set, get) => ({
  // 1. State properties
  // 2. Actions (methods that call set() to modify state)
}));
```

- **`set(partialOrFn)`**: Merges changes into the current state.
- **`get()`**: Reads the current state synchronously inside actions if needed.
- **`persist(..., { name: 'storage-key' })`**: Middleware that automatically syncs your state with `localStorage`.

### 3.2 Write `src/store/useTaskStore.ts`

```typescript
// src/store/useTaskStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Task, StatusFilter, PriorityFilter, SortOption } from '../types/task';

// Initial dummy data so you can test filtering and editing immediately
const INITIAL_TASKS: Task[] = [
  {
    id: '1',
    title: 'Learn Zustand State Management',
    description: 'Understand create, set, selectors, and middleware persist.',
    category: 'Study',
    priority: 'high',
    status: 'in_progress',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: '2',
    title: 'Build CRUD with Tailwind CSS v4',
    description: 'Style modern responsive cards using latest utility classes.',
    category: 'Work',
    priority: 'medium',
    status: 'todo',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: '3',
    title: 'Master React Performance',
    description: 'Avoid unnecessary re-renders using granular Zustand selectors.',
    category: 'Study',
    priority: 'low',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

// 1. Define the complete State & Actions interface
interface TaskStore {
  // --- STATE ---
  tasks: Task[];
  searchQuery: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  sortBy: SortOption;
  isModalOpen: boolean;
  editingTask: Task | null;

  // --- ACTIONS (CRUD & UI) ---
  // Create
  addTask: (data: Omit<Task, 'id' | 'createdAt'>) => void;
  
  // Read / Filters
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: StatusFilter) => void;
  setPriorityFilter: (filter: PriorityFilter) => void;
  setSortBy: (sort: SortOption) => void;
  resetFilters: () => void;

  // Update
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  toggleTaskStatus: (id: string) => void;

  // Delete
  deleteTask: (id: string) => void;

  // Modal State
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  closeModal: () => void;
}

// 2. Create the store with TypeScript types and LocalStorage persistence
export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      // --- Initial State ---
      tasks: INITIAL_TASKS,
      searchQuery: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      sortBy: 'newest',
      isModalOpen: false,
      editingTask: null,

      // --- CREATE ---
      // We prepend the new task immutably to the tasks array
      addTask: (data) =>
        set((state) => ({
          tasks: [
            {
              ...data,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        })),

      // --- FILTERS & SEARCH ---
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
      setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
      setSortBy: (sortBy) => set({ sortBy }),
      resetFilters: () =>
        set({
          searchQuery: '',
          statusFilter: 'all',
          priorityFilter: 'all',
          sortBy: 'newest',
        }),

      // --- UPDATE ---
      // Using .map() produces a new array immutably without mutating previous state
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        })),

      // Toggle status: todo -> in_progress -> completed -> todo
      toggleTaskStatus: (id) =>
        set((state) => {
          const nextStatusMap: Record<Task['status'], Task['status']> = {
            todo: 'in_progress',
            in_progress: 'completed',
            completed: 'todo',
          };

          return {
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, status: nextStatusMap[task.status] }
                : task
            ),
          };
        }),

      // --- DELETE ---
      // Using .filter() produces a new array without the deleted item
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      // --- MODAL CONTROLS ---
      openCreateModal: () => set({ isModalOpen: true, editingTask: null }),
      openEditModal: (task) => set({ isModalOpen: true, editingTask: task }),
      closeModal: () => set({ isModalOpen: false, editingTask: null }),
    }),
    {
      name: 'taskflow-storage', // key name in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist tasks array, not transient search/modal state
      partialize: (state) => ({ tasks: state.tasks } as TaskStore),
    }
  )
);
```

### 💡 Why did we write it this way?
1. **Shallow Merge in `set`**: When you do `set({ searchQuery })`, Zustand merges `searchQuery` into the store. You do not need to do `...state` for top-level keys!
2. **Immutability for Arrays**: Notice `tasks: [newTask, ...state.tasks]` and `.map(...)`. Never do `state.tasks.push(task)` or `state.tasks[0].title = ...` because React relies on new object references to trigger re-renders.
3. **`partialize` option**: We only want the actual `tasks` stored in `localStorage`. If the user leaves a modal open or has typed a temporary search query, we don't want those persisted when they reopen the tab.

---

## Step 4: Building the Components

Create a folder: `src/components/`.

### 4.1 The Golden Rule of Selectors
In Zustand, **how you read state matters**:

❌ **Bad Practice (Causes unwanted re-renders):**
```typescript
const { tasks, searchQuery } = useTaskStore();
```
*Why it's bad:* This subscribes to the ENTIRE store. Whenever `searchQuery` changes, even components that only care about `isModalOpen` will re-render!

✅ **Best Practice (Atomic Selector):**
```typescript
const tasks = useTaskStore((state) => state.tasks);
const addTask = useTaskStore((state) => state.addTask);
```
*Why it's great:* The component will ONLY re-render when `state.tasks` changes. Actions (like `addTask`) never change reference, so they NEVER cause re-renders!

---

### 4.2 Component: `src/components/Navbar.tsx`

```tsx
// src/components/Navbar.tsx
import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { PlusCircle, CheckSquare, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  // Select ONLY what this component needs
  const openCreateModal = useTaskStore((state) => state.openCreateModal);
  const tasksCount = useTaskStore((state) => state.tasks.length);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              TaskFlow
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                Zustand CRUD
              </span>
            </h1>
            <p className="text-xs text-slate-400">Manage tasks with zero boilerplate</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/60 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{tasksCount} Total Tasks</span>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

---

### 4.3 Component: `src/components/TaskStats.tsx`
This component calculates quick metric summaries.

```tsx
// src/components/TaskStats.tsx
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
```

---

### 4.4 Component: `src/components/TaskFilters.tsx`
Handles search input, status tabs, and priority filters.

```tsx
// src/components/TaskFilters.tsx
import React from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { StatusFilter, PriorityFilter, SortOption } from '../types/task';

export const TaskFilters: React.FC = () => {
  // Read state and action setters from Zustand
  const searchQuery = useTaskStore((state) => state.searchQuery);
  const statusFilter = useTaskStore((state) => state.statusFilter);
  const priorityFilter = useTaskStore((state) => state.priorityFilter);
  const sortBy = useTaskStore((state) => state.sortBy);

  const setSearchQuery = useTaskStore((state) => state.setSearchQuery);
  const setStatusFilter = useTaskStore((state) => state.setStatusFilter);
  const setPriorityFilter = useTaskStore((state) => state.setPriorityFilter);
  const setSortBy = useTaskStore((state) => state.setSortBy);
  const resetFilters = useTaskStore((state) => state.resetFilters);

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 space-y-4">
      {/* Search Bar + Controls Row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">By Priority</option>
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            title="Reset filters"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
        <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        <span className="text-xs text-slate-400 font-medium hidden sm:block">Status:</span>
        <div className="flex gap-1.5">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

---

### 4.5 Component: `src/components/TaskCard.tsx`
Renders an individual task, handles status toggling, editing, and deleting.

```tsx
// src/components/TaskCard.tsx
import React from 'react';
import { Task } from '../types/task';
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
```

---

### 4.6 Component: `src/components/TaskList.tsx`
Applies filtering and sorting logic, then maps over `TaskCard`.

```tsx
// src/components/TaskList.tsx
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
```

---

### 4.7 Component: `src/components/TaskModal.tsx`
Handles both **Create** and **Update (Edit)** with validation.

```tsx
// src/components/TaskModal.tsx
import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Category, Priority, Status } from '../types/task';
import { X } from 'lucide-react';

export const TaskModal: React.FC = () => {
  const isModalOpen = useTaskStore((state) => state.isModalOpen);
  const editingTask = useTaskStore((state) => state.editingTask);
  const closeModal = useTaskStore((state) => state.closeModal);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  // Local form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<Status>('todo');
  const [error, setError] = useState('');

  // Pre-populate fields when editing an existing task
  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
    } else {
      // Reset defaults for Create Mode
      setTitle('');
      setDescription('');
      setCategory('Work');
      setPriority('medium');
      setStatus('todo');
    }
    setError('');
  }, [editingTask, isModalOpen]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (editingTask) {
      // UPDATE action
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
      });
    } else {
      // CREATE action
      addTask({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        status,
      });
    }

    closeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Implement Zustand store"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context or details..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Select Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Study">Study</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

---

## Step 5: Assembling `App.tsx`

Now, look at how clean `App.tsx` becomes! Notice there is **NO `<Provider>`** component wrapping the app:

```tsx
// src/App.tsx
import { Navbar } from './components/Navbar';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';

export function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* 1. Header with direct Zustand actions */}
      <Navbar />

      {/* 2. Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Real-time stats */}
        <TaskStats />

        {/* Search, Filter, Sort Controls */}
        <TaskFilters />

        {/* Task cards list */}
        <TaskList />
      </main>

      {/* 3. Global Modal */}
      <TaskModal />
    </div>
  );
}

export default App;
```

---

## Step 6: Testing & Key Takeaways

### 6.1 Start the Vite Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser!

### 6.2 Test all CRUD operations:
1. **Create**: Click **New Task**, fill out title & description, click submit. Check how it instantly shows in the list and increments "Total Tasks" and "To Do".
2. **Read & Filter**:
   - Type in the search box: see items filter in real time.
   - Click "In Progress" status button.
   - Switch priority dropdown to "High Priority".
3. **Update**:
   - Click the circle icon on any task to cycle its status (`todo` -> `in_progress` -> `completed`).
   - Click the pencil icon to open the edit modal, change title, and save.
4. **Delete**:
   - Click the trash can icon on a card. Verify it disappears immediately.
5. **Persistence**:
   - Refresh the page (F5). Notice all your tasks are still there because of the `persist` middleware!

---

## 🎓 Senior Developer Recap & Best Practices

1. **Why is `const tasks = useTaskStore(s => s.tasks)` better than destructuring?**
   - It creates an **atomic subscription**. If another component changes `searchQuery`, your `TaskCard` or `TaskStats` won't re-render unless `tasks` changed.
2. **Where do actions live?**
   - In Redux, actions and reducers are split across multiple files. In Zustand, actions sit right alongside state inside `create()`.
3. **What about Async calls (e.g. Fetching from an API)?**
   - With Zustand, async actions are just regular `async/await` functions:
   ```typescript
   fetchTasks: async () => {
     set({ isLoading: true });
     try {
       const res = await fetch('/api/tasks');
       const tasks = await res.json();
       set({ tasks, isLoading: false });
     } catch (err) {
       set({ error: (err as Error).message, isLoading: false });
     }
   }
   ```
   No `redux-thunk`, no saga, no ceremony!
