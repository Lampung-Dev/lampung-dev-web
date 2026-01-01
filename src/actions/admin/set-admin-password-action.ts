"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import { getUserByEmailService } from "@/services/user";
import db from "@/lib/database";
import { userTable } from "@/lib/database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function setAdminPasswordBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  try {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validation
    if (!password || password.length < 8) {
      throw new Error("Password minimal 8 karakter");
    }

    if (password !== confirmPassword) {
      throw new Error("Password tidak cocok");
    }

    // Get user from database
    const user = await getUserByEmailService(session.user.email);
    if (!user) {
      throw new Error("User tidak ditemukan");
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      throw new Error("Hanya admin yang dapat mengatur password mobile app");
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password
    await db
      .update(userTable)
      .set({ passwordHash })
      .where(eq(userTable.id, user.id));

    return { success: true };
  } catch (error) {
    console.error("ERROR setAdminPasswordAction:", error);
    throw error;
  }
}

export const setAdminPasswordAction = createRateLimitedAction(setAdminPasswordBase, {
  limit: 3,
  window: 60000,
});
