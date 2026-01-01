import { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Ticket, ExternalLink } from "lucide-react";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getUserRegistrationsService } from "@/services/event-registration";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
                    src={event.imageUrl}
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
    </div>
  )
}
