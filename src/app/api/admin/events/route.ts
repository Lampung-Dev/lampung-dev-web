import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getAllEventsService, createEventService, generateSlug, TNewEvent } from "@/services/event";
import { createEventTypeService } from "@/services/event-type";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Middleware to verify JWT token
function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    if (decoded.role !== 'ADMIN') {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

// GET - List all events (for admin mobile app)
export async function GET(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getAllEventsService({ page, limit });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Get events error:", error);
    return NextResponse.json({ error: "Failed to get events" }, { status: 500 });
  }
}

// POST - Create new event (from mobile app)
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      eventTypeId,
      newEventTypeName,
      newEventTypeColor,
      location,
      imageUrl,
      instagramUrl,
      eventDate,
      maxCapacity,
      registrationStatus,
    } = body;

    // Validation
    if (!title || !description || !location || !imageUrl || !eventDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new event type if provided
    let typeId = eventTypeId;
    if (newEventTypeName && !eventTypeId) {
      const newEventType = await createEventTypeService({
        name: newEventTypeName,
        color: newEventTypeColor,
      });
      typeId = newEventType.id;
    }

    // Generate unique slug
    let slug = generateSlug(title);
    const timestamp = Date.now().toString(36);
    slug = `${slug}-${timestamp}`;

    const eventData: TNewEvent = {
      title,
      slug,
      description,
      eventTypeId: typeId || undefined,
      location,
      imageUrl,
      instagramUrl: instagramUrl || undefined,
      eventDate: new Date(eventDate),
      maxCapacity: maxCapacity || undefined,
      registrationStatus: registrationStatus || 'OPEN',
      createdBy: admin.userId,
    };

    const event = await createEventService(eventData);

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
