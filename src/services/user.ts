import 'server-only'
import { count, desc, eq } from "drizzle-orm";

import db from "@/lib/database";
import { GetAllUsersParams, PaginatedUsersResponse, TNewUser } from "@/types/user";
import { userTable } from "@/lib/database/schema";
import { getSocialMediaService } from './social-media';

export const createUserService = async (values: TNewUser) => {
    try {
        return await db
            .insert(userTable)
            .values({
                name: values.name,
                email: values.email,
                picture: values.picture
            })
            .returning({
                id: userTable.id,
                email: userTable.email,
            });
    } catch (error) {
        console.log('ERROR create user service:', error)
        throw new Error('Error creating the user.');
    }
}

export const getUserByEmailService = async (email: string) => {
    try {
        const user = await db.query.userTable.findFirst({
            where: (table) => eq(table.email, email),
        });

        if (!user) {
            return null
        }

        const socialMediaLinks = await getSocialMediaService(user.id)

        const sanitizedResult = {
            id: user?.id,
            name: user?.name,
            email: user?.email,
            picture: user?.picture,
            role: user?.role,
            title: user?.title,
            status: user?.status,
            createdAt: user?.createdAt,
            updatedAt: user?.updatedAt,
            socialMediaLinks: socialMediaLinks.map((l) => ({ platform: l.platform, url: l.link }))
        }

        return sanitizedResult
    } catch (error) {
        console.log('ERROR getUserByEmailService:', error)
        throw new Error('Error retrieving the user.');
    }
}

export const updatePictureService = async (data: { picture: string; email: string }) => {
    try {
        return await db.update(userTable)
            .set({ picture: data.picture })
            .where(eq(userTable.email, data.email))
            .returning({
                id: userTable.id,
                email: userTable.email,
            });
    } catch (error) {
        console.log('ERROR update picture service:', error)
        throw new Error('Error updating the profile photo.');
    }
}

export const updateProfileDataService = async (data: { name: string; title: string; email: string }) => {
    try {
        return await db.update(userTable)
            .set({
                name: data.name,
                title: data.title
            })
            .where(eq(userTable.email, data.email))
            .returning({
                id: userTable.id,
                email: userTable.email,
            });
    } catch (error) {
        console.log('ERROR update profile data:', error)
        throw new Error('Error updating profile information.');
    }
}

export const getAllUsersService = async ({
    page = 1,
    limit = 10,
    orderBy = 'createdAt',
    order = 'desc'
}: GetAllUsersParams = {}): Promise<PaginatedUsersResponse> => {
    try {
        // Calculate offset
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const totalUsers = await db.select({ count: count() })
            .from(userTable)
            .then(res => Number(res[0].count));

        // Get users with pagination
        const users = await db.query.userTable.findMany({
            limit: limit,
            offset: offset,
            orderBy: order === 'desc'
                ? [desc(userTable[orderBy])]
                : [userTable[orderBy]],
        });

        // Get social media links for all users
        const usersWithSocialMedia = await Promise.all(
            users.map(async (user) => {
                const socialMediaLinks = await getSocialMediaService(user.id);
                return {
                    ...user,
                    socialMediaLinks: socialMediaLinks.map((l) => ({
                        platform: l.platform,
                        url: l.link
                    }))
                };
            })
        );

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / limit);

        return {
            users: usersWithSocialMedia,
            metadata: {
                currentPage: page,
                totalPages,
                totalUsers,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        };
    } catch (error) {
        console.log('ERROR getAllUsersService:', error);
        throw new Error('Error retrieving users.');
    }
}


