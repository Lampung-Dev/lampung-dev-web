import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllEventTypesService } from "@/services/event-type";
import EventTypesClient from "./_components/event-types-client";

export default async function EventTypesPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const eventTypes = await getAllEventTypesService();

  return <EventTypesClient eventTypes={eventTypes} />;
}
