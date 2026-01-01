import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllEventTypesService } from "@/services/event-type";
import { getEventByIdService } from "@/services/event";
import { EventForm } from "../../_components/event-form";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const [event, eventTypes] = await Promise.all([
    getEventByIdService(id),
    getAllEventTypesService()
  ]);

  if (!event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground text-lg">Perbarui informasi event "{event.title}"</p>
      </div>

      <EventForm initialData={event} eventTypes={eventTypes} />
    </div>
  );
}
