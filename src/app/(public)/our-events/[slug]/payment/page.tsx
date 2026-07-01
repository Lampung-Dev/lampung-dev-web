import { auth } from "@/lib/next-auth";
import { Metadata } from "next";
import { getEventImageUrl } from "@/lib/image-utils";
import {
  getEventBySlugService,
  getEventRegisteredCountService,
} from "@/services/event";
import { checkUserRegistrationService } from "@/services/event-registration";
import { getUserByEmailService } from "@/services/user";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import PaymentForm from "../../_components/payment-form";
import Link from "next/link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  if (event.entryFee === 0) {
    // Handle free event case if needed
    redirect(`/our-events/${event.slug}`);
  }

  return {
    title: `${event.title} | LampungDev`,
    description: event.description.replace(/<[^>]*>/g, "").slice(0, 155),
    openGraph: {
      title: event.title,
      description: event.description.replace(/<[^>]*>/g, "").slice(0, 155),
      images: [getEventImageUrl(event.imageUrl)],
    },
  };
}

export default async function EventPaymentPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold">Event Tidak Ditemukan</h1>
        <p className="mt-4">Event yang kamu cari tidak ditemukan.</p>
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user) {
    redirect("/login");
  }

  const userRegistration = await checkUserRegistrationService(event.id, user.id);

  const isRegistered =
    userRegistration !== null && userRegistration.status !== "CANCELLED";

  const registeredCount = await getEventRegisteredCountService(event.id);
  const isFull = event.maxCapacity
    ? registeredCount >= event.maxCapacity
    : false;

  if (isFull) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-2xl font-bold">Event Penuh</h1>
        <p className="mt-4">Maaf, kapasitas untuk event ini sudah penuh.</p>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Link
            href={`/our-events/${event.slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Kembali ke Detail Event
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Sudah Terdaftar</h1>
        <p className="mt-4">
          Kamu sudah terdaftar untuk event ini. Silakan cek halaman transaksi
          untuk melihat detail pembayaran.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          href={`/our-events/${event.slug}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Detail Event
        </Link>
      </div>
      <h1 className="text-2xl font-bold">Pembayaran Event</h1>
      <p className="mt-4">Halaman pembayaran untuk event: {event.title}</p>
      {/* Tambahkan detail pembayaran di sini */}

      <div className="max-w-xl mx-auto mt-10 mb-4 p-6 border border-gray-200 rounded-lg shadow-lg transition-colors">
        <h2 className="text-xl font-semibold mb-4">Ringkasan Pembayaran</h2>
        <PaymentForm event={event} user={user} />
      </div>
    </div>
  );
}
