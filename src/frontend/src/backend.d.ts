import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserPreferences {
    defaultView: string;
    themeMode: string;
}
export type Time = bigint;
export interface OverviewData {
    totalTasks: bigint;
    yearlyStats: TimePeriodStats;
    monthlyStats: TimePeriodStats;
    totalProjects: bigint;
    productivityInsights: ProductivityInsights;
    weeklyStats: TimePeriodStats;
    projectStats: Array<ProjectStats>;
}
export type TaskId = bigint;
export interface ProductivityInsights {
    mostActiveProject?: ProjectId;
    longestStreak: bigint;
    mostProductiveDay?: Time;
}
export interface Task {
    id: TaskId;
    title: string;
    completionDate?: Time;
    owner: Principal;
    createdAt: Time;
    completed: boolean;
    dueDate: Time;
    description?: string;
    longFormContent?: string;
    projectId?: ProjectId;
    priority: string;
}
export interface TimePeriodStats {
    totalTasks: bigint;
    completionRate: number;
    completedTasks: bigint;
    period: string;
    pendingTasks: bigint;
}
export interface ProjectStats {
    overdueTasks: bigint;
    totalTasks: bigint;
    completionRate: number;
    completedTasks: bigint;
    projectId: ProjectId;
    overdueRate: number;
}
export type ProjectId = bigint;
export interface Project {
    id: ProjectId;
    owner: Principal;
    icon: string;
    name: string;
    createdAt: Time;
    color: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProject(name: string, color: string, icon: string): Promise<ProjectId>;
    createTask(title: string, description: string | null, dueDate: Time, projectId: ProjectId | null, priority: string): Promise<TaskId>;
    deleteProject(projectId: ProjectId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    getAllProjects(): Promise<Array<Project>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTasksHistory(searchTerm: string): Promise<Array<Task>>;
    getOverviewData(): Promise<OverviewData>;
    getProject(projectId: ProjectId): Promise<Project>;
    getTask(taskId: TaskId): Promise<Task>;
    getTaskContent(taskId: TaskId): Promise<string | null>;
    getTasksByCompletionStatus(completed: boolean): Promise<Array<Task>>;
    getTasksByDateRange(startDate: Time, endDate: Time): Promise<Array<Task>>;
    getTasksByProject(projectId: ProjectId): Promise<Array<Task>>;
    getUserPreferences(): Promise<UserPreferences | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveUserPreferences(preferences: UserPreferences): Promise<void>;
    toggleTaskCompletion(taskId: TaskId): Promise<void>;
    updateTask(taskId: TaskId, title: string, description: string | null, dueDate: Time, priority: string): Promise<void>;
    updateTaskContent(taskId: TaskId, content: string): Promise<void>;
    updateTaskProject(taskId: TaskId, newProjectId: ProjectId | null): Promise<void>;
}
