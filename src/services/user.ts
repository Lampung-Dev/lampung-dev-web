import db from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { TNewUser } from "@/types/user";
import { eq } from "drizzle-orm";

export const createUserService = async (values: TNewUser) =>
    await db
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

export const getUserByEmailService = async (email: string) => {
    const result = await db.query.userTable.findFirst({
        where: (table) => eq(table.email, email),
    });

    const sanitizedResult = {
        id: result?.id,
        name: result?.name,
        email: result?.email,
        picture: result?.picture,
        role: result?.role,
        title: result?.title,
        status: result?.status,
        createdAt: result?.createdAt,
        updatedAt: result?.updatedAt
    }

    return sanitizedResult
}

export const updatePictureService = async (data: { picture: string; email: string }) => {
    const result = await db.update(userTable)
        .set({ picture: data.picture })
        .where(eq(userTable.email, data.email))

    return result
}

export const updateProfileDataService = async (data: { name: string; title: string; email: string }) => {
    try {
        await db.update(userTable)
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
        throw new Error('Error update profile data')
    }
}
