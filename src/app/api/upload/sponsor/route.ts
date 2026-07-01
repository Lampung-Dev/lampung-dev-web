import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admin can upload sponsor logos" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, GIF, SVG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB for sponsor logos)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "sponsors");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `sponsor-${timestamp}-${randomStr}.webp`;
    const filepath = path.join(uploadsDir, filename);

    // Convert to WebP using Sharp with aspect-ratio preserving fit inside (max 600x300)
    const buffer = Buffer.from(await file.arrayBuffer());
    await sharp(buffer)
      .resize(600, 300, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toFile(filepath);

    // Return the public URL via API route
    const publicUrl = `/api/uploads/sponsors/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
