import 'server-only'
import db from "@/lib/database";
import { eq } from "drizzle-orm";

import { TNewSession } from "@/types/auth";
import { sessionTable } from "@/lib/database/schema";

export const creatSessionService = async (values: TNewSession) => {
    try {
        return await db
            .insert(sessionTable)
            .values({
                userId: values.userId,
                expiresAt: values.expiresAt
            })
            .returning({
                id: sessionTable.id
            })
    } catch (error) {
        console.log('ERROR creatSessionService:', error)
        throw new Error('Error creating the session.');
    }

}

export const getSessionByUserIdService = async (id: string) => {
    try {
        return await db.query.sessionTable.findFirst({
            where: eq(sessionTable.id, id),
        });
    } catch (error) {
        console.log('ERROR getSessionByUserIdService:', error)
        throw new Error('Error retrieving the session.');
    }
}

export const updateSessionService = async (values: { expiresAt: Date, sessionId: string }) => {
    try {
        return await db
            .update(sessionTable)
            .set({
                expiresAt: values.expiresAt
            })
            .where(eq(sessionTable.id, values.sessionId))
            .returning({
                id: sessionTable.id
            })
    } catch (error) {
        console.log('ERROR updateSessionService:', error)
        throw new Error('Error updating the session.');
    }
}



