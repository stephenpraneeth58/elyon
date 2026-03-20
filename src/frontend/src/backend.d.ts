import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    userId: Principal;
    date: string;
    name: string;
    createdAt: bigint;
    completed: boolean;
    goalId: bigint;
}
export interface UserProfile {
    name: string;
}
export interface Goal {
    id: bigint;
    title: string;
    userId: Principal;
    createdAt: bigint;
    reason: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(id: bigint): Promise<void>;
    createGoal(title: string, reason: string): Promise<bigint>;
    createTask(name: string, date: string, goalId: bigint): Promise<bigint>;
    deleteGoal(id: bigint): Promise<void>;
    deleteTask(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTaskCountToday(today: string): Promise<bigint>;
    getCompletedTaskDatesForCurrentUser(): Promise<Array<string>>;
    getGoalsForCurrentUser(): Promise<Array<Goal>>;
    getTasksForCurrentUser(): Promise<Array<Task>>;
    getTasksForDate(date: string): Promise<Array<Task>>;
    getTasksForGoal(goalId: bigint): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uncompleteTask(id: bigint): Promise<void>;
    updateGoal(id: bigint, title: string, reason: string): Promise<void>;
    updateTask(id: bigint, name: string, date: string): Promise<void>;
}
