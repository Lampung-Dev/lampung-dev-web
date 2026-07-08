import { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Ticket, ExternalLink, Briefcase } from "lucide-react";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getUserRegistrationsService } from "@/services/event-registration";
import { getApplicationsByUserIdService } from "@/services/job-application";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getEventImageUrl } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function Page() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await getUserByEmailService(session.user.email);
  if (!user) return null;

  const registrations = await getUserRegistrationsService(user.id);
  const applications = await getApplicationsByUserIdService(user.id);

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Halo, {user.name}! 👋</h1>
        <p className="text-muted-foreground mt-1">Selamat datang kembali di dashboard Lampung Dev.</p>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Ticket className="text-primary" size={24} />
            Event yang Diikuti
          </h2>
          <Link href="/our-events">
            <Button variant="outline" size="sm">Cari Event Lain</Button>
          </Link>
        </div>

        {registrations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Calendar className="text-muted-foreground" size={32} />
              </div>
              <CardTitle className="text-lg">Belum ada event diikuti</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Kamu belum mendaftar di event apapun. Yuk cek event menarik mendatang!
              </CardDescription>
              <Link href="/our-events" className="mt-6">
                <Button>Eksplor Event</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map(({ event, status, id }) => (
              <Card key={id} className="overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={getEventImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="object-cover object-top w-full h-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={status === 'REGISTERED' ? 'default' : 'secondary'} className="bg-primary">
                      {status === 'REGISTERED' ? 'Terdaftar' : 'Waiting List'}
                    </Badge>
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-1">{event.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(event.eventDate))}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <Link href={`/our-events/${event.slug}`} className="block">
                    <Button variant="outline" className="w-full gap-2">
                      Lihat Detail <ExternalLink size={14} />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Status Lamaran Pekerjaan */}
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Briefcase className="text-primary" size={24} />
            Status Lamaran Pekerjaan
          </h2>
          <Link href="/jobs/available">
            <Button variant="outline" size="sm">Cari Lowongan Lain</Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Briefcase className="text-muted-foreground" size={32} />
              </div>
              <CardTitle className="text-lg">Belum ada lamaran dikirim</CardTitle>
              <CardDescription className="max-w-xs mt-2">
                Kamu belum melamar lowongan pekerjaan apapun. Yuk temukan peluang karir terbaikmu!
              </CardDescription>
              <Link href="/jobs/available" className="mt-6">
                <Button>Eksplor Lowongan</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applications.map((app) => {
              const statusColors: Record<string, string> = {
                PENDING: "bg-amber-500/20 text-amber-500 border-amber-500/30",
                REVIEWING: "bg-blue-500/20 text-blue-500 border-blue-500/30",
                ACCEPTED: "bg-green-500/20 text-green-500 border-green-500/30",
                REJECTED: "bg-red-500/20 text-red-500 border-red-500/30",
              };
              const statusLabels: Record<string, string> = {
                PENDING: "Menunggu Review",
                REVIEWING: "Sedang Direview",
                ACCEPTED: "Diterima",
                REJECTED: "Ditolak",
              };
              return (
                <Card key={app.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg line-clamp-1">{app.job.title}</CardTitle>
                        <CardDescription className="font-medium text-sm mt-1">{app.job.company}</CardDescription>
                      </div>
                      <Badge variant="outline" className={`shrink-0 capitalize ${statusColors[app.status] || ""}`}>
                        {statusLabels[app.status] || app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3">
                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="shrink-0" />
                        <span>{app.job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="shrink-0" />
                        <span>Melamar pada: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(app.createdAt))}</span>
                      </div>
                    </div>
                    {app.status === "ACCEPTED" && (
                      <div className="mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400">
                        Selamat! Lamaran Anda telah diterima. Pihak perusahaan akan segera menghubungi Anda untuk tahap selanjutnya.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
