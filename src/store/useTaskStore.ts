import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Task, StatusFilter, PriorityFilter, SortOption } from "../types/task";

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
]

interface TaskStore {
    tasks: Task[];
    searchQuery: string;
    statusFilter: StatusFilter;
    priorityFilter: PriorityFilter;
    sortBy: SortOption;
    isModalOpen: boolean;
    editingTask: Task | null;

    addTask: (data: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    toggleTaskStatus: (id: string) => void;
    deleteTask: (id: string) => void;
    setSearchQuery: (query: string) => void;
    setStatusFilter: (filter: StatusFilter) => void;
    setPriorityFilter: (filter: PriorityFilter) => void;
    setSortBy: (sort: SortOption) => void;
    resetFilters: () => void;
    openCreateModal: () => void;
    openEditModal: (task: Task) => void;
    closeModal: () => void;
}

export const useTaskStore = create<TaskStore>()(
    persist(
        (set) => ({
            // Initial State
            tasks: INITIAL_TASKS,
            searchQuery: "",
            statusFilter: "all",
            priorityFilter: "all",
            sortBy: "newest",
            isModalOpen: false,
            editingTask: null,

            // CREATE
            addTask: (data) => set((state) => ({
                tasks: [
                    {
                        ...data,
                        id: crypto.randomUUID(),
                        createdAt: new Date().toISOString(),
                    },
                    ...state.tasks,
                ],
            })),

            // UPDATE
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((task) =>
                    task.id === id ? { ...task, ...updates } : task,
                )
            })),

            // TOGGLE status cycle: todo -> in_progress -> completed -> todo
            toggleTaskStatus: (id) =>
                set((state) => {
                    const nextStatusMap: Record<Task['status'], Task['status']> = {
                        todo: "in_progress",
                        in_progress: "completed",
                        completed: "todo",
                    };

                    return {
                        tasks: state.tasks.map((task) =>
                            task.id === id
                                ? { ...task, status: nextStatusMap[task.status] }
                                : task),
                    };
                }),

            // DELETE
            deleteTask: (id) =>
                set((state) => ({
                    tasks: state.tasks.filter((task) => task.id !== id),
                })),

            // FILTERS & SEARCH
            setSearchQuery: (searchQuery) => set({ searchQuery }),
            setStatusFilter: (statusFilter) => set({ statusFilter }),
            setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
            setSortBy: (sortBy) => set({ sortBy }),
            resetFilters: () => set({
                searchQuery: "",
                statusFilter: "all",
                priorityFilter: "all",
                sortBy: "newest",
            }),

            // MODAL
            openCreateModal: () => set({ isModalOpen: true, editingTask: null }),
            openEditModal: (task) => set({ isModalOpen: true, editingTask: task }),
            closeModal: () => set({ isModalOpen: false, editingTask: null }),
        }),
        {
            name: "task-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ tasks: state.tasks } as TaskStore),
        }
    )
);

