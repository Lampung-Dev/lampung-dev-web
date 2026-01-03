import { Metadata } from "next";
import { getUpcomingEventsService, getPastEventsService, getEventRegisteredCountService } from "@/services/event";
import { EventCard } from "./_components/event-card";

export const metadata: Metadata = {
    title: "Events | LampungDev",
    description: "Temukan event dan meetup komunitas developer di Lampung",
};

export default async function EventsPage() {
    const [upcomingEvents, pastEvents] = await Promise.all([
        getUpcomingEventsService(),
        getPastEventsService(6), // Limit past events
    ]);

    // Get registration counts for all events
    const upcomingWithCounts = await Promise.all(
        upcomingEvents.map(async (event) => ({
            event,
            registeredCount: await getEventRegisteredCountService(event.id),
        }))
    );

    const pastWithCounts = await Promise.all(
        pastEvents.map(async (event) => ({
            event,
            registeredCount: await getEventRegisteredCountService(event.id),
        }))
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent mb-4">
                    Events & Meetups
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Temukan event menarik dari komunitas developer Lampung.
                    Join dan networking bersama developer lainnya!
                </p>
            </div>

            {/* Upcoming Events Section */}
            <section className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-2xl font-bold">
                        🎉 Event Mendatang
                    </h2>
                    {upcomingEvents.length > 0 && (
                        <span className="px-3 py-1 text-sm font-medium bg-green-600/10 text-green-600 rounded-full">
                            {upcomingEvents.length} event
                        </span>
                    )}
                </div>

                {upcomingEvents.length === 0 ? (
                    <div className="text-center py-16 bg-muted/30 rounded-2xl">
                        <p className="text-muted-foreground text-lg">
                            Belum ada event mendatang saat ini 🙏
                        </p>
                        <p className="text-muted-foreground text-sm mt-2">
                            Pantau terus halaman ini untuk update event terbaru
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
            </section>

            {/* Past Events Section */}
            {pastEvents.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold mb-6">
                        📚 Event Sebelumnya
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
                        {pastWithCounts.map(({ event, registeredCount }) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                registeredCount={registeredCount}
                                isPast={true}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
