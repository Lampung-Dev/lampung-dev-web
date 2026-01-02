import "server-only";
import { count, desc, eq, gt, lt, sql } from "drizzle-orm";

import db from "@/lib/database";
import { eventTable, type TEvent } from "@/lib/database/schema";

export type { TEvent };

export type TNewEvent = {
  title: string;
  slug: string;
  description: string;
  eventTypeId?: string;
  location: string;
  locationMapUrl?: string;
  imageUrl: string;
  instagramUrl?: string;
  eventDate: Date;
  maxCapacity?: number;
  registrationStatus?: "OPEN" | "CLOSED";
  createdBy?: string;
};

export type TUpdateEvent = Partial<Omit<TNewEvent, "slug" | "createdBy">>;

export type TEventWithType = TEvent & {
  eventType: { id: string; name: string; color: string | null } | null;
};

export type GetAllEventsParams = {
  page?: number;
  limit?: number;
};

export type PaginatedEventsResponse = {
  events: TEventWithType[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalEvents: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const createEventService = async (
  values: TNewEvent
): Promise<TEvent> => {
  try {
    const [event] = await db
      .insert(eventTable)
      .values({
        title: values.title,
        slug: values.slug,
        description: values.description,
        eventTypeId: values.eventTypeId,
        location: values.location,
        locationMapUrl: values.locationMapUrl,
        imageUrl: values.imageUrl,
        instagramUrl: values.instagramUrl,
        eventDate: values.eventDate,
        maxCapacity: values.maxCapacity,
        registrationStatus: values.registrationStatus || "OPEN",
        createdBy: values.createdBy,
      })
      .returning();

    return event;
  } catch (error) {
    console.error("ERROR createEventService:", error);
    throw new Error("Error creating the event.");
  }
};

export const updateEventService = async (
  id: string,
  values: TUpdateEvent
): Promise<TEvent> => {
  try {
    const [event] = await db
      .update(eventTable)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(eventTable.id, id))
      .returning();

    if (!event) {
      throw new Error("Event not found.");
    }

    return event;
  } catch (error) {
    console.error("ERROR updateEventService:", error);
    throw new Error("Error updating the event.");
  }
};

export const deleteEventService = async (id: string): Promise<void> => {
  try {
    await db.delete(eventTable).where(eq(eventTable.id, id));
  } catch (error) {
    console.error("ERROR deleteEventService:", error);
    throw new Error("Error deleting the event.");
  }
};

export const getEventByIdService = async (
  id: string
): Promise<TEventWithType | null> => {
  try {
    const event = await db.query.eventTable.findFirst({
      where: eq(eventTable.id, id),
      with: {
        eventType: true,
      },
    });

    return event || null;
  } catch (error) {
    console.error("ERROR getEventByIdService:", error);
    throw new Error("Error retrieving the event.");
  }
};

export const getEventBySlugService = async (
  slug: string
): Promise<TEventWithType | null> => {
  try {
    const event = await db.query.eventTable.findFirst({
      where: eq(eventTable.slug, slug),
      with: {
        eventType: true,
      },
    });

    return event || null;
  } catch (error) {
    console.error("ERROR getEventBySlugService:", error);
    throw new Error("Error retrieving the event.");
  }
};

export const getAllEventsService = async ({
  page = 1,
  limit = 10,
}: GetAllEventsParams = {}): Promise<PaginatedEventsResponse> => {
  try {
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.max(1, Math.min(50, limit));
    const offset = (validatedPage - 1) * validatedLimit;

    const totalEvents = await db
      .select({ count: count() })
      .from(eventTable)
      .then((res) => Number(res[0].count));

    const events = await db.query.eventTable.findMany({
      limit: validatedLimit,
      offset: offset,
      orderBy: [desc(eventTable.eventDate)],
      with: {
        eventType: true,
      },
    });

    const totalPages = Math.ceil(totalEvents / validatedLimit);

    return {
      events,
      metadata: {
        currentPage: validatedPage,
        totalPages,
        totalEvents,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    };
  } catch (error) {
    console.error("ERROR getAllEventsService:", error);
    throw new Error("Error retrieving events.");
  }
};

export const getUpcomingEventsService = async (
  limit?: number
): Promise<TEventWithType[]> => {
  try {
    const now = new Date();

    const events = await db.query.eventTable.findMany({
      where: gt(eventTable.eventDate, now),
      orderBy: [eventTable.eventDate],
      limit: limit,
      with: {
        eventType: true,
      },
    });

    return events;
  } catch (error) {
    console.error("ERROR getUpcomingEventsService:", error);
    throw new Error("Error retrieving upcoming events.");
  }
};

export const getPastEventsService = async (
  limit?: number
): Promise<TEventWithType[]> => {
  try {
    const now = new Date();

    const events = await db.query.eventTable.findMany({
      where: lt(eventTable.eventDate, now),
      orderBy: [desc(eventTable.eventDate)],
      limit: limit,
      with: {
        eventType: true,
      },
    });

    return events;
  } catch (error) {
    console.error("ERROR getPastEventsService:", error);
    throw new Error("Error retrieving past events.");
  }
};

// Get count of registered users for capacity check
export const getEventRegisteredCountService = async (
  eventId: string
): Promise<number> => {
  try {
    const result = await db.execute(
      sql`SELECT COUNT(*) as count FROM event_registration 
                WHERE event_id = ${eventId} AND status = 'REGISTERED'`
    );

    return Number(result.rows[0]?.count || 0);
  } catch (error) {
    console.error("ERROR getEventRegisteredCountService:", error);
    throw new Error("Error getting registration count.");
  }
};
