import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Instagram, ArrowLeft, Clock, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { auth } from "@/lib/next-auth";
import { getEventBySlugService, getEventRegisteredCountService } from "@/services/event";
import { checkUserRegistrationService } from "@/services/event-registration";
import { getUserByEmailService } from "@/services/user";
import { JoinEventButton } from "../_components/join-event-button";
import { QrCodeTicket } from "../_components/qr-code-ticket";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    return { title: "Event Not Found" };
  }

  return {
    title: `${event.title} | LampungDev`,
    description: event.description.replace(/<[^>]*>/g, '').slice(0, 155),
    openGraph: {
      title: event.title,
      description: event.description.replace(/<[^>]*>/g, '').slice(0, 155),
      images: [event.imageUrl],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlugService(slug);

  if (!event) {
    notFound();
  }

  const session = await auth();
  const isLoggedIn = !!session?.user?.email;

  // Get registration status and count
  const registeredCount = await getEventRegisteredCountService(event.id);

  let userRegistration = null;
  let user = null;
  if (isLoggedIn && session?.user?.email) {
    user = await getUserByEmailService(session.user.email);
    if (user) {
      userRegistration = await checkUserRegistrationService(event.id, user.id);
    }
  }

  const eventDate = new Date(event.eventDate);
  const now = new Date();
  const isPast = eventDate < now;
  const isFull = event.maxCapacity ? registeredCount >= event.maxCapacity : false;

  const isRegistered = userRegistration !== null && userRegistration.status !== 'CANCELLED';

  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(eventDate);

  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(eventDate);

  const capacityText = event.maxCapacity
    ? `${registeredCount} / ${event.maxCapacity} peserta`
    : `${registeredCount} peserta terdaftar`;

  const slotsLeft = event.maxCapacity
    ? Math.max(0, event.maxCapacity - registeredCount)
    : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link href="/our-events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
          Kembali ke Events
        </Link>

        {user?.role === 'ADMIN' && (
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/10">
              <Pencil size={14} />
              Manage Event
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content - 2 Column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {/* Instagram Link - Mobile Only */}
          {event.instagramUrl && (
            <a
              href={event.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex lg:hidden items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-green-600 to-yellow-500 text-white font-medium"
            >
              <Instagram size={20} />
              Lihat di Instagram
            </a>
          )}
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {isPast ? (
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                Selesai
              </Badge>
            ) : event.registrationStatus === 'CLOSED' ? (
              <Badge variant="destructive" className="border-0">
                Pendaftaran Ditutup
              </Badge>
            ) : isFull ? (
              <Badge variant="destructive" className="border-0">
                Kuota Penuh
              </Badge>
            ) : (
              <Badge className="bg-green-600 hover:bg-green-600 text-white border-0 font-medium">
                Pendaftaran Dibuka
              </Badge>
            )}

            {event.eventType && (
              <Badge
                style={{ backgroundColor: event.eventType.color || '#6366f1' }}
                className="text-white border-0"
              >
                {event.eventType.name}
              </Badge>
            )}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {event.title}
            </h1>
            {slotsLeft !== null && !isPast && event.registrationStatus === 'OPEN' && (
              <p className={`text-sm font-medium ${slotsLeft <= 5 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {slotsLeft === 0 ? 'Kuota penuh!' : `Sisa ${slotsLeft} slot`}
              </p>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{dateFormatted}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {timeFormatted} WIB
                </p>
              </div>
            </div>

            <a
              href={event.locationMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group/location"
            >
              <div className="p-2 rounded-lg bg-primary/10 group-hover/location:bg-primary/20 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Lokasi</p>
                <p className="text-sm text-muted-foreground group-hover/location:text-primary transition-colors line-clamp-2">
                  {event.location}
                </p>
              </div>
            </a>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/50">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Peserta</p>
                <p className="text-sm text-muted-foreground">{capacityText}</p>
              </div>
            </div>

            {event.instagramUrl && (
              <a
                href={event.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-green-600/10 to-yellow-500/10 hover:from-green-600/20 hover:to-yellow-500/20 transition-colors"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-yellow-500">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Instagram</p>
                  <p className="text-sm text-muted-foreground">Lihat post event</p>
                </div>
              </a>
            )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <JoinEventButton
              eventId={event.id}
              isRegistered={isRegistered}
              registrationStatus={userRegistration?.status || null}
              eventStatus={event.registrationStatus}
              isFull={isFull}
              isPast={isPast}
              isLoggedIn={isLoggedIn}
              eventTitle={event.title}
              eventDate={event.eventDate}
              eventLocation={event.location}
              eventDescription={event.description.replace(/<[^>]*>/g, '')}
            />

            {/* QR Code Ticket - Show if registered */}
            {isRegistered && userRegistration && user && (
              <QrCodeTicket
                registrationId={userRegistration.id}
                eventTitle={event.title}
                userName={user.name}
              />
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Tentang Event</h2>
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
