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

export function TransactionsTable({
  transactions,
  role,
}: {
  transactions: any[];
  role?: string;
}) {
  const router = useRouter();

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Payin ID</TableHead>
            {role === "ADMIN" && <TableHead>Nama User</TableHead>}
            <TableHead>Nama Event</TableHead>
            <TableHead>Jumlah</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Metode Pembayaran</TableHead>
            <TableHead className="flex items-center justify-center">
              Channel Pembayaran
            </TableHead>
            <TableHead>Waktu Pembayaran</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.map((transaction) => {
            const isAdmin = role === "ADMIN";
            const isPending = transaction.status === "PENDING";
            const isPayable = isPending && !isAdmin && transaction.paymentCode;

            return (
              <TableRow
                key={transaction.id}
                onClick={() => {
                  if (isPayable) {
                    router.push(transaction.paymentCode);
                  }
                }}
                className={
                  isPayable
                    ? "cursor-pointer hover:bg-muted/50"
                    : "cursor-default"
                }
              >
                <TableCell className="max-w-[80px] truncate">
                  {transaction.payinId}
                </TableCell>

                {role === "ADMIN" && (
                  <TableCell className="max-w-[140px] truncate">
                    {transaction.userName || "-"}
                  </TableCell>
                )}

                <TableCell className="max-w-[160px] truncate">
                  {transaction.eventTitle}
                </TableCell>

                <TableCell>
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </TableCell>

                <TableCell>
                  {isPending ? (
                    isAdmin ? (
                      <span className="text-orange-500 font-medium">
                        PENDING
                      </span>
                    ) : (
                      <span className="text-orange-600 font-medium">
                        PENDING (Klik untuk bayar)
                      </span>
                    )
                  ) : (
                    transaction.status
                  )}
                </TableCell>

                <TableCell>{transaction.paymentMethod}</TableCell>
                <TableCell className="flex items-center justify-center">
                  <PaymentChannelBadge channel={transaction.paymentChannel} />
                </TableCell>

                <TableCell>
                  {transaction.paidAt
                    ? new Date(transaction.paidAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
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
