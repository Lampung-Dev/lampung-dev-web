import 'server-only'
import { eq } from "drizzle-orm";

import db from "@/lib/database";
import { eventTypeTable, type TEventType } from "@/lib/database/schema";

export type { TEventType };

export type TNewEventType = {
  name: string;
  description?: string;
  color?: string;
};

export type TUpdateEventType = Partial<TNewEventType>;

export const createEventTypeService = async (values: TNewEventType): Promise<TEventType> => {
  try {
    const [eventType] = await db
      .insert(eventTypeTable)
      .values({
        name: values.name,
        description: values.description,
        color: values.color,
      })
      .returning();

    return eventType;
  } catch (error) {
    console.error('ERROR createEventTypeService:', error);
    throw new Error('Error creating the event type.');
  }
};

export const updateEventTypeService = async (
  id: string,
  values: TUpdateEventType
): Promise<TEventType> => {
  try {
    const [eventType] = await db
      .update(eventTypeTable)
      .set(values)
      .where(eq(eventTypeTable.id, id))
      .returning();

    if (!eventType) {
      throw new Error('Event type not found.');
    }

    return eventType;
  } catch (error) {
    console.error('ERROR updateEventTypeService:', error);
    throw new Error('Error updating the event type.');
  }
};

export const deleteEventTypeService = async (id: string): Promise<void> => {
  try {
    await db
      .delete(eventTypeTable)
      .where(eq(eventTypeTable.id, id));
  } catch (error) {
    console.error('ERROR deleteEventTypeService:', error);
    throw new Error('Error deleting the event type.');
  }
};

export const getEventTypeByIdService = async (id: string): Promise<TEventType | null> => {
  try {
    const eventType = await db.query.eventTypeTable.findFirst({
      where: eq(eventTypeTable.id, id),
    });

    return eventType || null;
  } catch (error) {
    console.error('ERROR getEventTypeByIdService:', error);
    throw new Error('Error retrieving the event type.');
  }
};

export const getAllEventTypesService = async (): Promise<TEventType[]> => {
  try {
    const eventTypes = await db.query.eventTypeTable.findMany({
      orderBy: (table, { asc }) => [asc(table.name)],
    });

    return eventTypes;
  } catch (error) {
    console.error('ERROR getAllEventTypesService:', error);
    throw new Error('Error retrieving event types.');
  }
};
