import { type DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user?: {
            id?: string;
            role?: string;
            companyId?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        role?: string;
        companyId?: string | null;
    }
}
