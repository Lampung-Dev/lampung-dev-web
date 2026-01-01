import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { markAttendanceService, getRegistrationByIdService } from "@/services/event-registration";

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

// POST - Scan QR code and mark attendance
export async function POST(request: NextRequest) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Get registration details
    const registration = await getRegistrationByIdService(registrationId);
    if (!registration) {
      return NextResponse.json(
        { error: "Invalid QR code - registration not found" },
        { status: 404 }
      );
    }

    // Mark as attended
    const updated = await markAttendanceService(registrationId);

    return NextResponse.json({
      success: true,
      message: `${registration.user.name} berhasil check-in!`,
      registration: {
        id: updated.id,
        status: updated.status,
        attended: updated.attended,
        attendedAt: updated.attendedAt,
        user: {
          name: registration.user.name,
          email: registration.user.email,
          picture: registration.user.picture,
        },
      },
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    const message = error instanceof Error ? error.message : "Failed to mark attendance";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
