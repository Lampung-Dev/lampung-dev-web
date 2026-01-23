import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions | Lampung Dev",
  description: "List of community event transactions at Lampung Dev",
};

import { auth } from "@/lib/next-auth";
import { getTransactionsByUserService } from "@/services/transaction";
import { getUserByEmailService } from "@/services/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TransactionsPage() {
  // const session = await auth();
  // if (!session?.user?.email) {
  //   throw new Error("Unauthorized");
  // }
  const user = await getUserByEmailService("Marisa33@yahoo.com");
  if (!user) {
    throw new Error("User not found");
  }
  const transactions = await getTransactionsByUserService(user.id);
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payin ID</TableHead>
                <TableHead>Event ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Channel</TableHead>
                <TableHead>Paid At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="max-w-[160px] truncate">
                    {transaction.payinId}
                  </TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {transaction.eventId}
                  </TableCell>
                  <TableCell>
                    Rp {transaction.amount.toLocaleString("id-ID")}
                  </TableCell>

                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>{transaction.paymentChannel}</TableCell>
                  <TableCell>
                    {transaction?.paidAt
                      ? new Date(transaction.paidAt).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "UNPAID"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
