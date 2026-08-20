import 'server-only'
import { and, count, desc, eq, ilike, or } from "drizzle-orm";

import db from "@/lib/database";
import { GetAllUsersParams, PaginatedUsersResponse, TNewUser } from "@/types/user";
import {
    userTable,
    sessionTable,
    socialMediaTable,
    eventTable,
    eventRegistrationTable,
    eventTransactionTable,
    jobTable,
    jobApplicationTable,
} from "@/lib/database/schema";
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
            .onConflictDoUpdate({
                target: userTable.email,
                set: {
                    name: values.name,
                    picture: values.picture,
                    updatedAt: new Date()
                }
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
            companyId: user?.companyId,
            latitude: user?.latitude,
            longitude: user?.longitude,
            locationName: user?.locationName,
            employmentStatus: user?.employmentStatus,
            title: user?.title,
            status: user?.status,
            hasPassword: !!user?.passwordHash,
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

export const updateUserPasswordService = async (email: string, passwordHash: string) => {
    try {
        return await db.update(userTable)
            .set({ passwordHash })
            .where(eq(userTable.email, email))
            .returning({
                id: userTable.id,
                email: userTable.email,
            });
    } catch (error) {
        console.log('ERROR update user password service:', error)
        throw new Error('Error updating user password.');
    }
}

export const updateUserRoleService = async (
    userId: string,
    role: 'ADMIN' | 'MODERATOR' | 'USER' | 'MITRA'
) => {
    try {
        return await db.update(userTable)
            .set({ role, updatedAt: new Date() })
            .where(eq(userTable.id, userId))
            .returning({ id: userTable.id, email: userTable.email, role: userTable.role });
    } catch (error) {
        console.error('ERROR updateUserRoleService:', error);
        throw new Error('Error updating user role.');
    }
}

export const linkUserToCompanyService = async (
    userId: string,
    companyId: string | null
) => {
    try {
        const updateData: Record<string, unknown> = {
            companyId,
            updatedAt: new Date()
        };
        if (companyId) {
            updateData.role = 'MITRA';
        } else {
            updateData.role = 'USER';
        }
        return await db.update(userTable)
            .set(updateData)
            .where(eq(userTable.id, userId))
            .returning();
    } catch (error) {
        console.error('ERROR linkUserToCompanyService:', error);
        throw new Error('Error linking user to company.');
    }
}

export const updateUserLocationAndStatusService = async (
    userId: string,
    data: {
        latitude: string;
        longitude: string;
        locationName: string;
        employmentStatus: string;
    }
) => {
    try {
        return await db.update(userTable)
            .set({
                latitude: data.latitude,
                longitude: data.longitude,
                locationName: data.locationName,
                employmentStatus: data.employmentStatus,
                updatedAt: new Date()
            })
            .where(eq(userTable.id, userId))
            .returning();
    } catch (error) {
        console.error('ERROR updateUserLocationAndStatusService:', error);
        throw new Error('Error updating user location and status.');
    }
}

export const updateUserStatusService = async (
    userId: string,
    status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
) => {
    try {
        return await db.update(userTable)
            .set({ status, updatedAt: new Date() })
            .where(eq(userTable.id, userId))
            .returning({ id: userTable.id, email: userTable.email, status: userTable.status });
    } catch (error) {
        console.error('ERROR updateUserStatusService:', error);
        throw new Error('Error updating user status.');
    }
}

export const deleteUserService = async (userId: string): Promise<boolean> => {
    try {
        return await db.transaction(async (tx) => {
            // 1. Delete user sessions
            await tx.delete(sessionTable).where(eq(sessionTable.userId, userId));

            // 2. Delete user social media links
            await tx.delete(socialMediaTable).where(eq(socialMediaTable.userId, userId));

            // 3. Delete event registrations & transactions
            await tx.delete(eventRegistrationTable).where(eq(eventRegistrationTable.userId, userId));
            await tx.delete(eventTransactionTable).where(eq(eventTransactionTable.userId, userId));

            // 4. Delete job applications
            await tx.delete(jobApplicationTable).where(eq(jobApplicationTable.userId, userId));

            // 5. Unlink user from created events and jobs
            await tx.update(eventTable).set({ createdBy: null }).where(eq(eventTable.createdBy, userId));
            await tx.update(jobTable).set({ createdBy: null }).where(eq(jobTable.createdBy, userId));

            // 6. Delete user record
            const deleted = await tx.delete(userTable).where(eq(userTable.id, userId)).returning({ id: userTable.id });

            return deleted.length > 0;
        });
    } catch (error) {
        console.error("ERROR deleteUserService:", error);
        throw new Error("Gagal menghapus pengguna.");
    }
};

export const getAllUsersService = async ({
    page = 1,
    limit = 10,
    orderBy = 'createdAt',
    order = 'desc',
    search,
    status,
    onlyActive = false,
}: GetAllUsersParams = {}): Promise<PaginatedUsersResponse> => {
    try {
        // Validate input parameters
        const validatedPage = Math.max(1, page);
        const validatedLimit = Math.max(1, Math.min(50, limit));
        const offset = (validatedPage - 1) * validatedLimit;

        const conditions = [];

        if (onlyActive) {
            conditions.push(eq(userTable.status, 'ACTIVE'));
        } else if (status) {
            conditions.push(eq(userTable.status, status));
        }

        if (search && search.trim()) {
            const pattern = `%${search.trim()}%`;
            conditions.push(
                or(
                    ilike(userTable.name, pattern),
                    ilike(userTable.email, pattern),
                    ilike(userTable.title, pattern)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Get total count for pagination
        const totalUsers = await db.select({ count: count() })
            .from(userTable)
            .where(whereClause)
            .then(res => Number(res[0].count));

        // Ensure orderBy is a valid column
        const validColumns = ['createdAt', 'id', 'name', 'email'];
        const validatedOrderBy = validColumns.includes(orderBy) ? orderBy : 'createdAt';

        // Get users with pagination
        const users = await db.query.userTable.findMany({
            where: whereClause,
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


