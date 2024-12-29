import 'server-only'
import { eq } from "drizzle-orm";

import db from "@/lib/database";
import { TNewUser } from "@/types/user";
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
