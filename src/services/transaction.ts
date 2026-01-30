import db from "@/lib/database";
import {
  eventTransactionTable,
  userTable,
  eventTable,
} from "@/lib/database/schema";
import { desc, eq } from "drizzle-orm";

export async function createTransactionService({
  referenceCode,
  userId,
  eventId,
  amount,
  paymentMethod,
  paymentChannel,
}: {
  referenceCode?: string;
  userId: string;
  eventId: string;
  amount: number;
  paymentMethod?: string;
  paymentChannel?: string;
}) {
  const [trx] = await db
    .insert(eventTransactionTable)
    .values({
      userId,
      eventId,
      amount,
      status: "PENDING",
      paymentMethod,
      paymentChannel,
      referenceCode,
    })
    .returning();

  return trx;
}

export async function updateTransactionStatusService(
  referenceCode: string,
  payload: {
    payinId: string;
    paymentMethod: string;
    paymentChannel?: string;
    paymentCode?: string;
  },
) {
  const [trx] = await db
    .update(eventTransactionTable)
    .set({
      payinId: payload.payinId,
      paymentMethod: payload.paymentMethod,
      paymentChannel: payload.paymentChannel,
      paymentCode: payload.paymentCode,
      updatedAt: new Date(),
    })
    .where(eq(eventTransactionTable.referenceCode, referenceCode))
    .returning();

  return trx;
}

export async function getAllTransactionsService(params: {
  limit?: number;
  offset?: number;
}) {
  const transactions = await db
    .select({
      id: eventTransactionTable.id,
      payinId: eventTransactionTable.payinId,
      amount: eventTransactionTable.amount,
      status: eventTransactionTable.status,
      paymentMethod: eventTransactionTable.paymentMethod,
      paymentChannel: eventTransactionTable.paymentChannel,
      paidAt: eventTransactionTable.paidAt,
      eventTitle: eventTable.title,
      eventId: eventTransactionTable.eventId,
      paymentCode: eventTransactionTable.paymentCode,

      userName: userTable.name,
    })
    .from(eventTransactionTable)
    .leftJoin(userTable, eq(userTable.id, eventTransactionTable.userId))
    .leftJoin(eventTable, eq(eventTable.id, eventTransactionTable.eventId))
    .orderBy(desc(eventTransactionTable.createdAt))
    .limit(params.limit || 20)
    .offset(params.offset || 0);
  return transactions;
}

export async function getTransactionsByUserService(userId: string) {
  const transactions = await db
    .select()
    .from(eventTransactionTable)
    .where(eq(eventTransactionTable.userId, userId))
    .orderBy(desc(eventTransactionTable.createdAt))
    .limit(10);
  return transactions;
}

export async function getTransactionByReferenceCodeService(
  referenceCode: string,
) {
  const trx = await db
    .select()
    .from(eventTransactionTable)
    .where(eq(eventTransactionTable.referenceCode, referenceCode))
    .limit(1)
    .then((res) => res[0]);
  return trx;
}
