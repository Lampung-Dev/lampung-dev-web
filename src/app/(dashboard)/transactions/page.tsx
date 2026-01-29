import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Transactions | Lampung Dev",
  description: "List of community event transactions at Lampung Dev",
};

import { auth } from "@/lib/next-auth";
import { getTransactionsByUserService } from "@/services/transaction";
import { getUserByEmailService } from "@/services/user";
import { getEventByIdService } from "@/services/event";
import { TransactionsTable } from "./_components/transactions-table";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user) {
    redirect("/login");
  }

  const transactions = await getTransactionsByUserService(user.id);

  const transactionsWithEvent = await Promise.all(
    transactions.map(async (tx) => {
      const event = await getEventByIdService(tx.eventId || "");
      return {
        ...tx,
        eventTitle: event?.title ?? tx.eventId,
      };
    }),
  );

  return (
    <div className="container mx-auto py-2 px-4">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">My Transactions</h1>
        <p className="text-muted-foreground">
          Lihat riwayat transaksi event komunitas di Lampung Dev
        </p>
      </div>
      {transactions.length === 0 ? (
        <p className="text-muted-foreground">No transactions found.</p>
      ) : (
        <TransactionsTable transactions={transactionsWithEvent} />
      )}
    </div>
  );
}
