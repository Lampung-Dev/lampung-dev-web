import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Users } from "lucide-react";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import {
  getAllEventsService,
  getEventRegisteredCountService,
} from "@/services/event";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteEventButton } from "./_components/delete-event-button";

export default async function ManageEventsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { events } = await getAllEventsService({ limit: 50 });

  // Get registration counts
  const eventsWithCounts = await Promise.all(
    events.map(async (event) => ({
      ...event,
      registeredCount: await getEventRegisteredCountService(event.id),
    }))
  );

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground">Kelola semua event komunitas</p>
        </div>
        <Link href="/events/create">
          <Button className="gap-2">
            <Plus size={16} />
            Tambah Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <p className="text-muted-foreground text-lg">Belum ada event</p>
          <Link href="/events/create" className="mt-4 inline-block">
            <Button>Buat Event Pertama</Button>
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Peserta</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsWithCounts.map((event) => {
                const isPast = new Date(event.eventDate) < new Date();
                const isFull = event.maxCapacity
                  ? event.registeredCount >= event.maxCapacity
                  : false;

                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium max-w-[200px]">
                      <div className="truncate">{event.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {event.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.eventType ? (
                        <Badge
                          style={{
                            backgroundColor: event.eventType.color || "#6366f1",
                          }}
                          className="text-white border-0"
                        >
                          {event.eventType.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(event.eventDate)}</TableCell>
                    <TableCell>
                      {event.maxCapacity
                        ? `${event.registeredCount}/${event.maxCapacity}`
                        : event.registeredCount}
                    </TableCell>
                    <TableCell>
                      {isPast ? (
                        <Badge variant="secondary">Selesai</Badge>
                      ) : event.registrationStatus === "CLOSED" ? (
                        <Badge variant="destructive">Ditutup</Badge>
                      ) : isFull ? (
                        <Badge variant="outline">Penuh</Badge>
                      ) : (
                        <Badge className="bg-green-600">Dibuka</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/events/manage/${event.id}/participants`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Lihat Peserta"
                          >
                            <Users size={16} />
                          </Button>
                        </Link>
                        <Link href={`/events/${event.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Pencil size={16} />
                          </Button>
                        </Link>
                        <DeleteEventButton
                          eventId={event.id}
                          eventTitle={event.title}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
