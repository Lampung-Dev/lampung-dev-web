"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import { updateUserPasswordService } from "@/services/user";
import { revalidatePath } from "next/cache";

async function setupMobilePasswordBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  // Check if user is admin
  const userRole = (session.user as any)?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat mengatur password mobile");
  }

  try {
    const password = formData.get("password") as string;

    if (!password || password.length < 6) {
      throw new Error("Password minimal 6 karakter");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update the password
    await updateUserPasswordService(session.user.email, passwordHash);

    revalidatePath('/users/my-profile');

    return { success: true };
  } catch (error) {
    console.error("ERROR setupMobilePasswordAction:", error);
    throw error;
  }
}

export const setupMobilePasswordAction = createRateLimitedAction(setupMobilePasswordBase, {
  limit: 5,
  window: 60000, // 1 minute
});
