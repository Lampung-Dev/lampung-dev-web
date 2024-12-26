import db from "@/lib/database";
import { sessionTable } from "@/lib/database/schema";
import { TNewSession } from "@/types/auth";
import { eq } from "drizzle-orm";

export const creatSession = async (values: TNewSession) =>
    await db
        .insert(sessionTable)
        .values({
            userId: values.userId,
            expiresAt: values.expiresAt
        })

export const getSessionByUserId = async (id: string) =>
    await db.query.sessionTable.findFirst({
        where: eq(sessionTable.id, id),
    });

export const updateSession = async (values: { expiresAt: Date, sessionId: string }) =>
    await db
        .update(sessionTable)
        .set({
            expiresAt: values.expiresAt
        })
        .where(eq(sessionTable.id, values.sessionId))
        .returning({
            id: sessionTable.id
        })


