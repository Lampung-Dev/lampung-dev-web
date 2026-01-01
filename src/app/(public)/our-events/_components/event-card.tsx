"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Users, Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TEventWithType } from "@/services/event";

type EventCardProps = {
  event: TEventWithType;
  registeredCount?: number;
  isPast?: boolean;
};

export function EventCard({ event, registeredCount = 0, isPast = false }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  const dateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(eventDate);

  const timeFormatted = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(eventDate);

  const isFull = event.maxCapacity
    ? registeredCount >= event.maxCapacity
    : false;

  const capacityText = event.maxCapacity
    ? `${registeredCount}/${event.maxCapacity}`
    : `${registeredCount} peserta`;

  return (
    <Link href={`/our-events/${event.slug}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-card/50 backdrop-blur-sm">
        {/* Square Image Container - Instagram Style */}
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* Instagram Link */}
          {event.instagramUrl && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(event.instagramUrl!, '_blank', 'noopener,noreferrer');
              }}
              className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
            >
              <Instagram size={18} />
            </button>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Badge Container */}
          <div className="flex flex-wrap gap-2">
            {isPast ? (
              <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                Selesai
              </Badge>
            ) : event.registrationStatus === 'CLOSED' || isFull ? (
              <Badge variant="destructive" className="border-0">
                Pendaftaran Ditutup
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

          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {event.description.replace(/<[^>]*>?/gm, '')}
          </p>

          <div className="space-y-2 text-sm text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="shrink-0 text-primary" />
              <span>{dateFormatted} • {timeFormatted}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0 text-primary" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0 text-primary" />
              <span>{capacityText}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
