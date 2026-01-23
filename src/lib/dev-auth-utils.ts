import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import type { AppUser } from "./dev-app-user";

export async function getCurrentUser(): Promise<AppUser | null> {
  // ✅ DEV ADMIN
  if (process.env.DEV_ADMIN === "true") {
    return {
      id: "dev-admin",
      email: "dev@local.test",
      role: "ADMIN",
    };
  }

  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await getUserByEmailService(session.user.email);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
