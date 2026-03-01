import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Course {
    id: string;
    startTime: string;
    title: string;
    endTime: string;
    date: string;
    room: string;
    isMandatory: boolean;
    category: string;
    capacity: bigint;
    enrolledCount: bigint;
}
export interface AdminStats {
    courseStats: Array<[string, string, bigint, bigint]>;
    totalRegistrations: bigint;
}
export interface UserProfile {
    name: string;
    email: string;
    employeeId: string;
}
export interface Registration {
    id: string;
    submittedAt: bigint;
    email: string;
    courseIds: Array<string>;
    employeeId: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourses(): Promise<Array<Course>>;
    getRegistrations(): Promise<Array<Registration>>;
    getRegistrationsCsv(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    grantAdminBypass(): Promise<void>;
    initializeCourses(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    register(employeeId: string, email: string, courseIds: Array<string>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "error";
        error: string;
    }>;
    resetAndGrantAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    selfGrantAdmin(secret: string): Promise<boolean>;
}
