export type Priority = "low" | "medium" | "high"
export type Status = "todo" | "in_progress" | "completed"
export type Category = "Work" | "Personal" | "Study" | "Urgent"

export interface Task {
    id: string
    title: string
    description: string
    category: Category
    priority: Priority
    status: Status
    createdAt: string
}

export type StatusFilter = "all" | Status
export type PriorityFilter = "all" | Priority
export type SortOption = "newest" | "oldest" | "priority"
