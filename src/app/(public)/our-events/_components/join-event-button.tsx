"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { CalendarPlus, Loader2, Clock } from "lucide-react";
import { joinEventAction } from "@/actions/events/join-event-action";

type JoinEventButtonProps = {
  eventId: string;
  isRegistered: boolean;
  registrationStatus: 'REGISTERED' | 'WAITING_LIST' | 'CANCELLED' | null;
  eventStatus: 'OPEN' | 'CLOSED';
  isFull: boolean;
  isPast: boolean;
  isLoggedIn: boolean;
  // For calendar integration
  eventTitle: string;
  eventDate: Date;
  eventLocation: string;
  eventDescription?: string;
};

export function JoinEventButton({
  eventId,
  isRegistered,
  registrationStatus,
  eventStatus,
  isFull,
  isPast,
  isLoggedIn,
  eventTitle,
  eventDate,
  eventLocation,
  eventDescription,
}: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async (action: 'join' | 'leave') => {
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("eventId", eventId);
      formData.append("action", action);

      const result = await joinEventAction(formData);

      if (result.success) {
        if (action === 'join') {
          if (result.status === 'WAITING_LIST') {
            toast.info("Kamu masuk ke waiting list! Kamu akan otomatis menjadi peserta jika ada slot.");
          } else {
            toast.success("Berhasil join event! Cek email untuk QR code ticket.");
          }
        } else {
          toast.success("Berhasil keluar dari event");
        }
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal join event";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar links
  const generateGoogleCalendarUrl = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000); // +3 hours

    const formatDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d{3}/g, '');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventTitle,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      location: eventLocation,
      details: eventDescription || `Event: ${eventTitle}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const generateIcsContent = () => {
    const startDate = new Date(eventDate);
    const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);

    const formatDate = (date: Date) =>
      date.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//LampungDev//Events//EN
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${eventTitle}
LOCATION:${eventLocation}
DESCRIPTION:${eventDescription || eventTitle}
END:VEVENT
END:VCALENDAR`;
  };

  const downloadIcs = () => {
    const content = generateIcsContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle.replace(/[^a-z0-9]/gi, '-')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Past event - no actions
  if (isPast) {
    return (
      <Button disabled variant="secondary" size="lg" className="w-full">
        Event Telah Selesai
      </Button>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Button
        onClick={() => router.push('/login')}
        size="lg"
        className="w-full"
      >
        Login untuk Join Event
      </Button>
    );
  }

  // Already registered
  if (isRegistered && registrationStatus !== 'CANCELLED') {
    return (
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => handleJoin('leave')}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {registrationStatus === 'WAITING_LIST' ? 'Keluar Waiting List' : 'Cancel Pendaftaran'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg">
                <CalendarPlus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a
                  href={generateGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Calendar
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadIcs}>
                Apple Calendar / Outlook (.ics)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {registrationStatus === 'WAITING_LIST' && (
          <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg flex items-center gap-2 border border-yellow-200">
            <Clock size={14} />
            Kamu di waiting list. Kamu akan otomatis menjadi peserta jika ada slot.
          </p>
        )}
      </div>
    );
  }

  // Registration closed
  if (eventStatus === 'CLOSED') {
    return (
      <Button disabled variant="secondary" size="lg" className="w-full">
        Pendaftaran Ditutup
      </Button>
    );
  }

  // Event is full - join waiting list
  if (isFull) {
    return (
      <Button
        onClick={() => handleJoin('join')}
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join Waiting List
      </Button>
    );
  }

  // Can join
  return (
    <Button
      onClick={() => handleJoin('join')}
      size="lg"
      className="w-full"
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Join Event
    </Button>
  );
}
