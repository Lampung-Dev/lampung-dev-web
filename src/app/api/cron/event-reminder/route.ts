import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import db from "@/lib/database";
import { eventTable, eventRegistrationTable, userTable } from "@/lib/database/schema";
import { sendEventReminderEmail } from "@/services/email";

const CRON_SECRET = process.env.CRON_SECRET;

// GET - Triggered by cron scheduler to send event reminders (H-1)
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if set
    if (CRON_SECRET) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get events happening tomorrow
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find events between tomorrow 00:00 and day after tomorrow 00:00
    const upcomingEvents = await db.query.eventTable.findMany({
      where: and(
        gt(eventTable.eventDate, tomorrow),
        lt(eventTable.eventDate, dayAfterTomorrow)
      ),
    });

    let emailsSent = 0;
    let errors: string[] = [];

    for (const event of upcomingEvents) {
      // Get all registered users for this event
      const registrations = await db.query.eventRegistrationTable.findMany({
        where: and(
          eq(eventRegistrationTable.eventId, event.id),
          eq(eventRegistrationTable.status, 'REGISTERED')
        ),
        with: {
          user: true,
        },
      });

      for (const registration of registrations) {
        try {
          await sendEventReminderEmail(
            {
              name: registration.user.name,
              email: registration.user.email,
            },
            {
              eventTitle: event.title,
              eventDate: event.eventDate,
              eventLocation: event.location,
              eventImageUrl: event.imageUrl,
              registrationId: registration.id,
            }
          );
          emailsSent++;
        } catch (error) {
          const errMsg = `Failed to send reminder to ${registration.user.email}`;
          errors.push(errMsg);
          console.error(errMsg, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron event reminder error:", error);
    return NextResponse.json({ error: "Failed to send reminders" }, { status: 500 });
  }
}
