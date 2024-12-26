import { TUser } from "@/lib/database/schema";

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type UserRole = 'ADMIN' | 'MODERATOR' | 'USER';

export type TNewUser = Omit<TUser, 'id' | 'role' | 'status' | 'createdAt' | 'updatedAt'> & {
    id?: TUser['id'];
    role?: TUser['role'];
    status?: TUser['status'];
    createdAt?: TUser['createdAt'];
    updatedAt?: TUser['updatedAt'];
}