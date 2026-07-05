"use server";

import { auth } from "@/lib/next-auth";
import { updateUserRoleService } from "@/services/user";

export async function updateUserRoleAction(userId: string, role: 'ADMIN' | 'MODERATOR' | 'USER') {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Harap login terlebih dahulu");
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'ADMIN') {
        throw new Error("Hanya admin yang dapat mengubah role pengguna");
    }

    if (!userId) throw new Error("User ID wajib diisi");

    const validRoles = ['ADMIN', 'MODERATOR', 'USER'];
    if (!validRoles.includes(role)) throw new Error("Role tidak valid");

    return await updateUserRoleService(userId, role);
}
