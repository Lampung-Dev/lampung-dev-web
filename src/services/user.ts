import db from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { TNewUser } from "@/types/user";
import { eq } from "drizzle-orm";

export const createUser = async (values: TNewUser) =>
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

export const getUserByEmail = async (email: string) => {
    const result = await db.query.userTable.findFirst({
        where: (table) => eq(table.email, email),
    });

    return result
}

