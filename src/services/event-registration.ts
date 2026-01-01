import 'server-only'
import { and, eq, count, asc, inArray } from "drizzle-orm";

import db from "@/lib/database";
import { eventRegistrationTable, eventTable, userTable, TEventRegistration } from "@/lib/database/schema";
import { getEventRegisteredCountService, getEventByIdService } from "./event";
import { sendWaitingListPromotionEmail } from "./email";

export type TNewEventRegistration = {
  eventId: string;
  userId: string;
};

export type TEventRegistrationWithUser = TEventRegistration & {
  user: {
    id: string;
    name: string;
    email: string;
    picture: string;
  };
};

export type TEventRegistrationWithEvent = TEventRegistration & {
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: Date;
    location: string;
    imageUrl: string;
  };
};

export type RegistrationResult = {
  success: boolean;
  status: 'REGISTERED' | 'WAITING_LIST';
  registration: TEventRegistration;
};

/**
 * Register user to an event with capacity check
 * If event is full, user is added to waiting list
 */
export const registerToEventService = async (
  values: TNewEventRegistration
): Promise<RegistrationResult> => {
  try {
    // Check if user is already registered
    const existing = await db.query.eventRegistrationTable.findFirst({
      where: and(
        eq(eventRegistrationTable.eventId, values.eventId),
        eq(eventRegistrationTable.userId, values.userId)
      ),
    });

    if (existing) {
      if (existing.status === 'CANCELLED') {
        // Re-register cancelled user
        const registeredCount = await getEventRegisteredCountService(values.eventId);
        const event = await db.query.eventTable.findFirst({
          where: eq(eventTable.id, values.eventId),
        });

        const isFull = event?.maxCapacity && registeredCount >= event.maxCapacity;
        const newStatus = isFull ? 'WAITING_LIST' : 'REGISTERED';

        const [updated] = await db
          .update(eventRegistrationTable)
          .set({
            status: newStatus,
            registeredAt: new Date(),
            attended: false,
            attendedAt: null,
          })
          .where(eq(eventRegistrationTable.id, existing.id))
          .returning();

        return { success: true, status: newStatus, registration: updated };
      }
      throw new Error('User is already registered for this event.');
    }

    // Check event capacity
    const event = await db.query.eventTable.findFirst({
      where: eq(eventTable.id, values.eventId),
    });

    if (!event) {
      throw new Error('Event not found.');
    }

    if (event.registrationStatus === 'CLOSED') {
      throw new Error('Registration is closed for this event.');
    }

    const registeredCount = await getEventRegisteredCountService(values.eventId);
    const isFull = event.maxCapacity && registeredCount >= event.maxCapacity;
    const status = isFull ? 'WAITING_LIST' : 'REGISTERED';

    const [registration] = await db
      .insert(eventRegistrationTable)
      .values({
        eventId: values.eventId,
        userId: values.userId,
        status,
      })
      .returning();

    return { success: true, status, registration };
  } catch (error) {
    console.error('ERROR registerToEventService:', error);
    throw error;
  }
};

/**
 * Cancel user registration (set status to CANCELLED)
 * If there's a waiting list, promote the first person
 */
export const unregisterFromEventService = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    const registration = await db.query.eventRegistrationTable.findFirst({
      where: and(
        eq(eventRegistrationTable.eventId, eventId),
        eq(eventRegistrationTable.userId, userId)
      ),
    });

    if (!registration) {
      throw new Error('Registration not found.');
    }

    const wasRegistered = registration.status === 'REGISTERED';

    // Cancel the registration
    await db
      .update(eventRegistrationTable)
      .set({ status: 'CANCELLED' })
      .where(eq(eventRegistrationTable.id, registration.id));

    // If user was REGISTERED, promote first person from waiting list
    if (wasRegistered) {
      await promoteFromWaitingListService(eventId);
    }
  } catch (error) {
    console.error('ERROR unregisterFromEventService:', error);
    throw error;
  }
};

/**
 * Promote first person from waiting list to registered
 */
export const promoteFromWaitingListService = async (eventId: string): Promise<void> => {
  try {
    const firstInWaitingList = await db.query.eventRegistrationTable.findFirst({
      where: and(
        eq(eventRegistrationTable.eventId, eventId),
        eq(eventRegistrationTable.status, 'WAITING_LIST')
      ),
      orderBy: [asc(eventRegistrationTable.registeredAt)],
    });

    if (firstInWaitingList) {
      await db
        .update(eventRegistrationTable)
        .set({ status: 'REGISTERED' })
        .where(eq(eventRegistrationTable.id, firstInWaitingList.id));
    }
  } catch (error) {
    console.error('ERROR promoteFromWaitingListService:', error);
    // Don't throw, this is a background operation
  }
};

/**
 * Get all registrations for an event (for admin)
 */
export const getEventRegistrationsService = async (
  eventId: string
): Promise<TEventRegistrationWithUser[]> => {
  try {
    const registrations = await db.query.eventRegistrationTable.findMany({
      where: eq(eventRegistrationTable.eventId, eventId),
      orderBy: [asc(eventRegistrationTable.registeredAt)],
      with: {
        user: true,
      },
    });

    return registrations;
  } catch (error) {
    console.error('ERROR getEventRegistrationsService:', error);
    throw new Error('Error retrieving event registrations.');
  }
};

/**
 * Check if user is registered for an event
 */
export const checkUserRegistrationService = async (
  eventId: string,
  userId: string
): Promise<TEventRegistration | null> => {
  try {
    const registration = await db.query.eventRegistrationTable.findFirst({
      where: and(
        eq(eventRegistrationTable.eventId, eventId),
        eq(eventRegistrationTable.userId, userId)
      ),
    });

    return registration || null;
  } catch (error) {
    console.error('ERROR checkUserRegistrationService:', error);
    throw new Error('Error checking registration status.');
  }
};

/**
 * Mark user as attended (from QR scan)
 */
export const markAttendanceService = async (
  registrationId: string
): Promise<TEventRegistration> => {
  try {
    const registration = await db.query.eventRegistrationTable.findFirst({
      where: eq(eventRegistrationTable.id, registrationId),
    });

    if (!registration) {
      throw new Error('Registration not found.');
    }

    if (registration.status !== 'REGISTERED') {
      throw new Error('Only registered users can be marked as attended.');
    }

    if (registration.attended) {
      throw new Error('User has already been marked as attended.');
    }

    const [updated] = await db
      .update(eventRegistrationTable)
      .set({
        attended: true,
        attendedAt: new Date(),
      })
      .where(eq(eventRegistrationTable.id, registrationId))
      .returning();

    return updated;
  } catch (error) {
    console.error('ERROR markAttendanceService:', error);
    throw error;
  }
};

/**
 * Get attendance statistics for an event
 */
export const getAttendanceStatsService = async (eventId: string): Promise<{
  total: number;
  registered: number;
  waitingList: number;
  attended: number;
  cancelled: number;
}> => {
  try {
    const registrations = await db.query.eventRegistrationTable.findMany({
      where: eq(eventRegistrationTable.eventId, eventId),
    });

    const stats = {
      total: registrations.length,
      registered: registrations.filter(r => r.status === 'REGISTERED').length,
      waitingList: registrations.filter(r => r.status === 'WAITING_LIST').length,
      attended: registrations.filter(r => r.attended).length,
      cancelled: registrations.filter(r => r.status === 'CANCELLED').length,
    };

    return stats;
  } catch (error) {
    console.error('ERROR getAttendanceStatsService:', error);
    throw new Error('Error retrieving attendance statistics.');
  }
};

/**
 * Get user's event registrations
 */
export const getUserRegistrationsService = async (
  userId: string
): Promise<TEventRegistrationWithEvent[]> => {
  try {
    const registrations = await db.query.eventRegistrationTable.findMany({
      where: eq(eventRegistrationTable.userId, userId),
      orderBy: [asc(eventRegistrationTable.registeredAt)],
      with: {
        event: true,
      },
    });

    return registrations;
  } catch (error) {
    console.error('ERROR getUserRegistrationsService:', error);
    throw new Error('Error retrieving user registrations.');
  }
};

/**
 * Get registration by ID with user details
 */
export const getRegistrationByIdService = async (
  registrationId: string
): Promise<TEventRegistrationWithUser | null> => {
  try {
    const registration = await db.query.eventRegistrationTable.findFirst({
      where: eq(eventRegistrationTable.id, registrationId),
      with: {
        user: true,
      },
    });

    return registration || null;
  } catch (error) {
    console.error('ERROR getRegistrationByIdService:', error);
    throw new Error('Error retrieving registration.');
  }
};

/**
 * Promote multiple participants from waiting list up to new capacity
 */
export const promoteWaitingListParticipantsService = async (
  eventId: string,
  newCapacity: number
): Promise<number> => {
  try {
    const registeredCount = await getEventRegisteredCountService(eventId);
    const availableSlots = newCapacity - registeredCount;

    if (availableSlots <= 0) return 0;

    const topWaitingList = await db.query.eventRegistrationTable.findMany({
      where: and(
        eq(eventRegistrationTable.eventId, eventId),
        eq(eventRegistrationTable.status, 'WAITING_LIST')
      ),
      orderBy: [asc(eventRegistrationTable.registeredAt)],
      limit: availableSlots,
      with: {
        user: true,
      }
    });

    if (topWaitingList.length === 0) return 0;

    const event = await getEventByIdService(eventId);
    if (!event) return 0;

    const idsToPromote = topWaitingList.map(r => r.id);

    await db
      .update(eventRegistrationTable)
      .set({ status: 'REGISTERED' })
      .where(inArray(eventRegistrationTable.id, idsToPromote));

    // Send emails (async)
    topWaitingList.forEach(reg => {
      sendWaitingListPromotionEmail(
        { name: reg.user.name, email: reg.user.email },
        {
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventLocation: event.location,
          eventImageUrl: event.imageUrl,
          registrationId: reg.id,
        }
      ).catch(err => console.error('Failed to send promotion email:', err));
    });

    return idsToPromote.length;
  } catch (error) {
    console.error('ERROR promoteWaitingListParticipantsService:', error);
    return 0;
  }
};

/**
 * Update registration status manually (for admin)
 */
export const updateRegistrationStatusService = async (
  registrationId: string,
  status: 'REGISTERED' | 'WAITING_LIST' | 'CANCELLED'
): Promise<TEventRegistration> => {
  try {
    const [updated] = await db
      .update(eventRegistrationTable)
      .set({ status })
      .where(eq(eventRegistrationTable.id, registrationId))
      .returning();
    return updated;
  } catch (error) {
    console.error('ERROR updateRegistrationStatusService:', error);
    throw error;
  }
};

/**
 * Toggle attendance manually (for admin)
 */
export const toggleAttendanceService = async (
  registrationId: string
): Promise<TEventRegistration> => {
  try {
    const current = await db.query.eventRegistrationTable.findFirst({
      where: eq(eventRegistrationTable.id, registrationId),
    });

    if (!current) throw new Error('Registration not found');

    const [updated] = await db
      .update(eventRegistrationTable)
      .set({
        attended: !current.attended,
        attendedAt: !current.attended ? new Date() : null,
      })
      .where(eq(eventRegistrationTable.id, registrationId))
      .returning();
    return updated;
  } catch (error) {
    console.error('ERROR toggleAttendanceService:', error);
    throw error;
  }
};
