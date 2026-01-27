"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaymentChannelBadge } from "./payment-channel-badge";

export function TransactionsTable({ transactions }: { transactions: any[] }) {
  const router = useRouter();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payin ID</TableHead>
            <TableHead>Event Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead className="flex items-center justify-center">Payment Channel</TableHead>
            <TableHead>Paid At</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((transaction) => {
            const isPending = transaction.status === "PENDING";

            return (
              <TableRow
                key={transaction.id}
                onClick={() => {
                  if (isPending && transaction.paymentCode) {
                    router.push(transaction.paymentCode);
                  }
                }}
                className={
                  isPending
                    ? "cursor-pointer hover:bg-muted/50"
                    : ""
                }
              >
                <TableCell className="max-w-[80px] truncate">
                  {transaction.payinId}
                </TableCell>

                <TableCell className="max-w-[160px] truncate">
                  {transaction.eventTitle}
                </TableCell>

                <TableCell>
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                  {isPending ? (
                    <span className="text-orange-600 font-medium">
                      PENDING (Klik untuk bayar)
                    </span>
                  ) : (
                    transaction.status
                  )}
                </TableCell>

                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell className="flex items-center justify-center"><PaymentChannelBadge channel={transaction.paymentChannel} /></TableCell>

                <TableCell>
                  {transaction.paidAt
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
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
