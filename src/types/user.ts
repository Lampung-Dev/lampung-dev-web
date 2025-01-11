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
export type UserProfile = {
    name: string;
    email: string;
    avatar: string;
    title: string;
    socialMediaLinks: SocialMediaLink[]
}

export type SocialPlatform =
    | "x"
    | "linkedin"
    | "github"
    | "instagram"
    | "facebook"
    | "youtube"
    | "tiktok"
    | "personal website";

export type SocialMediaLink = {
    platform: string;
    url: string;
}

export type GetAllUsersParams = {
    page?: number;
    limit?: number;
    orderBy?: 'createdAt' | 'name';
    order?: 'asc' | 'desc';
}

export type PaginatedUsersResponse = {
    users: {
        id: string;
        name: string | null;
        email: string;
        picture: string | null;
        role: string;
        title: string | null;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        socialMedia: {
            platform: string;
            link: string;
        }[];
    }[];
    metadata: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}