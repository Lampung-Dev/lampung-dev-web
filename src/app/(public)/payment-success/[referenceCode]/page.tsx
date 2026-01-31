import db from "@/lib/database";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  eventTransactionTable,
  eventTable,
  userTable,
  eventRegistrationTable,
} from "@/lib/database/schema";
import { eq, and } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { QrCodeTicket } from "../../our-events/_components/qr-code-ticket";

type PageProps = {
  params: Promise<{ referenceCode: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { referenceCode } = await params;
  const [transaction] = await db

    .select({
      id: eventTransactionTable.id,
      eventId: eventTransactionTable.eventId,
      referenceCode: eventTransactionTable.referenceCode,
      status: eventTransactionTable.status,
      paymentAmount: eventTransactionTable.paymentAmount,
      paidAt: eventTransactionTable.paidAt,
      eventTitle: eventTable.title,
    })
    .from(eventTransactionTable)
    .leftJoin(eventTable, eq(eventTransactionTable.eventId, eventTable.id))
    .where(eq(eventTransactionTable.referenceCode, referenceCode))
    .limit(1);
  if (!transaction) {
    return { title: "Transaction Not Found" };
  }
  return {
    title: `Payment ${transaction.status} | LampungDev`,
    description: `Payment for event ${transaction.eventTitle} is ${transaction.status}.`,
  };
}

export default async function PaymentSuccessPage({ params }: PageProps) {
  const { referenceCode } = await params;

  const [transaction] = await db
    .select({
      id: eventTransactionTable.id,
      userId: eventTransactionTable.userId,
      eventId: eventTransactionTable.eventId,
      referenceCode: eventTransactionTable.referenceCode,
      status: eventTransactionTable.status,
      paymentAmount: eventTransactionTable.paymentAmount,
      feeAmount: eventTransactionTable.feeAmount,
      paymentMethod: eventTransactionTable.paymentMethod,
      paymentChannel: eventTransactionTable.paymentChannel,
      paidAt: eventTransactionTable.paidAt,
      eventTitle: eventTable.title,
    })
    .from(eventTransactionTable)
    .leftJoin(eventTable, eq(eventTransactionTable.eventId, eventTable.id))
    .where(eq(eventTransactionTable.referenceCode, referenceCode))
    .limit(1);

  if (!transaction) {
    notFound();
  }

  const [user] = await db
    .select({ name: userTable.name })
    .from(userTable)
    .where(eq(userTable.id, transaction.userId))
    .limit(1);

  const [event] = await db
    .select({ title: eventTable.title, slug: eventTable.slug })
    .from(eventTable)
    .where(eq(eventTable.id, transaction.eventId))
    .limit(1);

  const [registration] = await db
    .select()
    .from(eventRegistrationTable)
    .where(
      and(
        eq(eventRegistrationTable.userId, transaction.userId),
        eq(eventRegistrationTable.eventId, transaction.eventId),
      ),
    )
    .limit(1);

  if (transaction.status !== "SUCCESS") {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-6 border rounded-xl p-6">
        <h1 className="text-xl font-semibold">Pembayaran Belum Selesai ⏳</h1>

        <p className="text-muted-foreground text-sm">
          Status pembayaran saat ini:{" "}
          <b className="text-foreground">{transaction.status}</b>
        </p>

        <p className="text-sm text-muted-foreground">
          Jika kamu sudah melakukan pembayaran, silakan tunggu beberapa saat.
          Status akan diperbarui otomatis setelah sistem menerima konfirmasi.
          <br />
          Kamu juga dapat mencoba me-refresh halaman ini.
        </p>

        <Link
          href=""
          className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition"
        >
          🔄 Refresh Status
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-16 space-y-6 border rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href={`/our-events/${event.slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Events
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-green-600">
        Pembayaran Berhasil 🎉
      </h1>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Event</span>
          <span className="font-medium">{transaction.eventTitle}</span>
        </div>

        <div className="flex justify-between">
          <span>Reference Code</span>
          <span className="font-mono">{transaction.referenceCode}</span>
        </div>

        <div className="flex justify-between">
          <span>Metode</span>
          <span>{transaction.paymentMethod}</span>
        </div>

        <div className="flex justify-between">
          <span>Channel</span>
          <span>{transaction.paymentChannel}</span>
        </div>

        <div className="flex justify-between">
          <span>Total Dibayar</span>
          <span className="font-semibold">
            Rp {(transaction.paymentAmount ?? 0).toLocaleString("id-ID")}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Waktu Pembayaran</span>
          <span>
            {transaction.paidAt
              ? new Date(transaction.paidAt).toLocaleString("id-ID")
              : "-"}
          </span>
        </div>
      </div>

      <QrCodeTicket
        registrationId={registration.id}
        eventTitle={event.title}
        userName={user.name}
      />
    </div>
  );
}
