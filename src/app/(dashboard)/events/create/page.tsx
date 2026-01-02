import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllEventTypesService } from "@/services/event-type";
import { EventForm } from "../_components/event-form";

export default async function CreateEventPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const eventTypes = await getAllEventTypesService();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Buat Event Baru</h1>
        <p className="text-muted-foreground text-lg">
          Bagikan kegiatan komunitas Lampung Dev berikutnya
        </p>
      </div>

      <EventForm eventTypes={eventTypes} />
    </div>
  );
}
