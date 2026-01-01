import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getEventRegistrationsService, getAttendanceStatsService } from "@/services/event-registration";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

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

// GET - List all attendees for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const [registrations, stats] = await Promise.all([
      getEventRegistrationsService(id),
      getAttendanceStatsService(id),
    ]);

    return NextResponse.json({
      success: true,
      registrations,
      stats,
    });
  } catch (error) {
    console.error("Get attendees error:", error);
    return NextResponse.json({ error: "Failed to get attendees" }, { status: 500 });
  }
}
