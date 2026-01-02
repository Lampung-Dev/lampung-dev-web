import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getEventByIdService } from "@/services/event";
import {
  getEventRegistrationsService,
  getAttendanceStatsService,
} from "@/services/event-registration";
import { ParticipantActions } from "./_components/participant-actions";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ParticipantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ParticipantsPage({
  params,
}: ParticipantsPageProps) {
  const { id: eventId } = await params;
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const event = await getEventByIdService(eventId);
  if (!event) {
    notFound();
  }

  const registrations = await getEventRegistrationsService(eventId);
  const stats = await getAttendanceStatsService(eventId);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link
          href="/events/manage"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 w-fit"
        >
          <ChevronLeft size={16} className="mr-1" />
          Kembali ke Manage Events
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Daftar Peserta</h1>
            <p className="text-muted-foreground">{event.title}</p>
          </div>
          <Badge className="bg-primary hover:bg-primary/90 text-white border-0">
            {event.eventType?.name || "Event"}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Terdaftar
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.registered}</div>
            <p className="text-xs text-muted-foreground">
              Termasuk yang belum hadir
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Check-in (Hadir)
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.attended}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.registered > 0
                ? `${Math.round(
                    (stats.attended / stats.registered) * 100
                  )}% kehadiran`
                : "0% kehadiran"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting List</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitingList}</div>
            <p className="text-xs text-muted-foreground">
              Menunggu kuota kosong
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dibatalkan</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.cancelled}
            </div>
            <p className="text-xs text-muted-foreground">
              Oleh sistem atau user
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Participants Table */}
      <Card>
        <CardHeader>
          <CardTitle>List Peserta</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Belum ada peserta yang mendaftar.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Peserta</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tanggal Daftar</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Kehadiran</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <img
                            src={reg.user.picture}
                            alt={reg.user.name}
                            className="w-8 h-8 rounded-full bg-muted"
                          />
                          <span>{reg.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{reg.user.email}</TableCell>
                      <TableCell className="text-xs">
                        {formatDate(reg.registeredAt)}
                      </TableCell>
                      <TableCell>
                        {reg.status === "REGISTERED" ? (
                          <Badge
                            variant="outline"
                            className="border-green-600/30 text-green-700 bg-green-50/50"
                          >
                            Registered
                          </Badge>
                        ) : reg.status === "WAITING_LIST" ? (
                          <Badge
                            variant="outline"
                            className="border-amber-600/30 text-amber-700 bg-amber-50/50"
                          >
                            Waiting List
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="opacity-50">
                            Cancelled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {reg.attended ? (
                          <div className="flex flex-col gap-1">
                            <Badge className="bg-green-600 text-white border-0 w-fit">
                              Hadir
                            </Badge>
                            {reg.attendedAt && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Intl.DateTimeFormat("id-ID", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }).format(new Date(reg.attendedAt))}{" "}
                                WIB
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            Belum Check-in
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <ParticipantActions
                          registrationId={reg.id}
                          eventId={eventId}
                          currentStatus={reg.status}
                          isAttended={reg.attended}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
