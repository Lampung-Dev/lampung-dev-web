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
        // Validate input parameters
        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.max(1, Math.min(25, limit));
        const offset = (validatedPage - 1) * validatedLimit;

        // Get total count for pagination
        const totalUsers = await db.select({ count: count() })
            .from(userTable)
            .then(res => Number(res[0].count));

        // Ensure orderBy is a valid column
        const validColumns = ['createdAt', 'id', 'name', 'email'];
        const validatedOrderBy = validColumns.includes(orderBy) ? orderBy : 'createdAt';

        // Get users with pagination
        const users = await db.query.userTable.findMany({
            limit: validatedLimit,
            offset: offset,
            orderBy: order === 'desc'
                ? [desc(userTable[validatedOrderBy])]
                : [userTable[validatedOrderBy]],
            with: {
                socialMedia: true,
            },
        });

        const totalPages = Math.ceil(totalUsers / validatedLimit);

        return {
            users,
            metadata: {
                currentPage: validatedPage,
                totalPages,
                totalUsers,
                hasNextPage: validatedPage < totalPages,
                hasPreviousPage: validatedPage > 1
            }
        };
    } catch (error) {
        console.error('ERROR getAllUsersService:', error);
        throw new Error('Failed to retrieve users. Please try again later.');
    }
}


