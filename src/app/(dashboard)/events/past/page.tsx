import { Metadata } from "next";
import { getPastEventsService, getEventRegisteredCountService } from "@/services/event";
import { EventCard } from "@/app/(public)/our-events/_components/event-card";

export const metadata: Metadata = {
    title: "Past Events | Dashboard",
};

export default async function Page() {
    const pastEvents = await getPastEventsService(50); // Show more history in dashboard

    // Get registration counts for all events
    const pastWithCounts = await Promise.all(
        pastEvents.map(async (event) => ({
            event,
            registeredCount: await getEventRegisteredCountService(event.id),
        }))
    );

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-bold">📚 Event Sebelumnya</h1>
                <p className="text-muted-foreground mt-1">
                    Kilas balik event-event yang telah sukses diselenggarakan.
                </p>
            </div>

            {pastEvents.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl">
                    <p className="text-muted-foreground text-lg">
                        Belum ada event sebelumnya 🙏
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-90">
                    {pastWithCounts.map(({ event, registeredCount }) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            registeredCount={registeredCount}
                            isPast={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}