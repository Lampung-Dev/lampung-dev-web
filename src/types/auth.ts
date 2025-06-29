import { TSession, TUser } from "@/lib/database/schema";
import type { DefaultSession, User } from "next-auth";

export type TNewSession = Omit<TSession, 'id'> & {
    id?: TSession['id'];

}

// Extend NextAuth types to include 'role'
declare module "next-auth" {
    interface Session {
        user: {
            role?: TUser['role'] | null;
        } & DefaultSession["user"];
    }
    interface ExtendUser extends User {
        role?: TUser['role'] | null;
    }
}