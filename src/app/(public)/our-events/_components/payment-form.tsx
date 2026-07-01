"use client";

import { useState } from "react";
import { getFee } from "@/lib/get-fee-utils";
import { Button } from "@/components/ui/button";
import { createPaymentEventAction } from "@/actions/events/create-payment-event-action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { TEvent } from "@/lib/database/schema";

export default function PaymentForm({
  event,
  user,
}: {
  event: TEvent;
  user: { name: string };
}) {
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentChannel, setPaymentChannel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adminFee = getFee(paymentMethod, event.entryFee);
  const total = event.entryFee + adminFee;
  const router = useRouter();

  const handleCreatePayment = async () => {
    if (!paymentMethod) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("eventId", event.id);
      formData.append("amount", total.toString());
      formData.append("paymentMethod", paymentMethod);
      formData.append("paymentChannel", paymentChannel);

      const res = await createPaymentEventAction(formData);

      if (!res?.success) {
        setIsLoading(false);
        throw new Error(res?.message || "Gagal membuat pembayaran");
      }

      if (!res.paymentUrl || !res.paymentUrl.startsWith("http")) {
        setIsLoading(false);
        throw new Error("Gagal membuat pembayaran");
      }

      toast.success(
        "Pembayaran berhasil dibuat. Mengarahkan ke halaman pembayaran...",
      );

      router.push(res.paymentUrl);
    } catch (err) {
      const error = err as Error;
      setIsLoading(false);
      toast.error(error.message || "Terjadi kesalahan");
    }
  };

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between">
        <span>Nama</span>
        <span>{user.name}</span>
      </div>

      <div className="flex justify-between">
        <span>Harga</span>
        <span>Rp {event.entryFee.toLocaleString("id-ID")}</span>
      </div>

      <div className="flex justify-between">
        <span>Biaya Admin</span>
        <span>Rp {adminFee.toLocaleString("id-ID")}</span>
      </div>

      <div className="flex justify-between font-bold border-t pt-2">
        <span>Total</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

      <select
        value={paymentMethod}
        onChange={(e) => {
          setPaymentMethod(e.target.value);
          setPaymentChannel("");
        }}
        className="w-full border p-2 rounded"
      >
        <option value="">Pilih Metode Pembayaran</option>
        <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
        <option value="QR_CODE">QRIS</option>
      </select>

      {paymentMethod === "VIRTUAL_ACCOUNT" && (
        <div>
          <select
            value={paymentChannel}
            onChange={(e) => setPaymentChannel(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Pilih Bank --</option>
            <option value="MDR.VA">Mandiri Virtual Account</option>
            <option value="BNI.VA">BNI Virtual Account</option>
            <option value="BRI.VA">BRI Virtual Account</option>
            <option value="PTB.VA">Bank Permata Virtual Account</option>
            <option value="CIMBN.VA">CIMB Niaga Virtual Account</option>
          </select>
          <Button
            disabled={!paymentMethod || isLoading || !paymentChannel}
            onClick={handleCreatePayment}
            className="w-full mt-4"
            size="lg"
          >
            Buat Virtual Account
          </Button>
        </div>
      )}

      {paymentMethod === "VIRTUAL_ACCOUNT" && !paymentChannel && (
        <div className="mt-4">
          <div>
            <p className="text-red-600 font-semibold">
              Silakan pilih bank untuk Virtual Account sebelum membuat invoice.
            </p>
          </div>
        </div>
      )}

      {paymentMethod === "QR_CODE" && (
        <Button
          disabled={!paymentMethod || isLoading}
          onClick={handleCreatePayment}
          className="w-full mt-4"
          size="lg"
        >
          Buat QRIS
        </Button>
      )}
    </div>
  );
}
