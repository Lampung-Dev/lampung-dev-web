import { Metadata } from "next";
import { getUpcomingEventsService, getEventRegisteredCountService } from "@/services/event";
import { EventCard } from "@/app/(public)/our-events/_components/event-card";

export const metadata: Metadata = {
    title: "Upcoming Events | Dashboard",
};

export default async function Page() {
    const upcomingEvents = await getUpcomingEventsService();

    // Get registration counts for all events
    const upcomingWithCounts = await Promise.all(
        upcomingEvents.map(async (event) => ({
            event,
            registeredCount: await getEventRegisteredCountService(event.id),
        }))
    );

    return (
        <div className="space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-bold">🎉 Event Mendatang</h1>
                <p className="text-muted-foreground mt-1">
                    Cek dan ikuti event-event seru dari Lampung Dev!
                </p>
            </div>

            {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl">
                    <p className="text-muted-foreground text-lg">
                        Belum ada event mendatang saat ini 🙏
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingWithCounts.map(({ event, registeredCount }) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            registeredCount={registeredCount}
                            isPast={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}