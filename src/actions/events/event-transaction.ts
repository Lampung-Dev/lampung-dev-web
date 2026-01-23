import db from "@/lib/database";
import { eventTransactionTable } from "@/lib/database/schema";
import { and, eq } from "drizzle-orm";

export async function hasSuccessfulPayment(eventId: string, userId: string) {
  const trx = await db.query.eventTransactionTable.findFirst({
    where: and(
      eq(eventTransactionTable.eventId, eventId),
      eq(eventTransactionTable.userId, userId),
      eq(eventTransactionTable.status, "SUCCESS")
    ),
  });

  return !!trx;
}
