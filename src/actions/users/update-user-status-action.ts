"use server";

import { auth } from "@/lib/next-auth";
import { updateUserStatusService } from "@/services/user";

export async function updateUserStatusAction(userId: string, status: 'ACTIVE' | 'INACTIVE' | 'BANNED') {
    const session = await auth();
    if (!session?.user?.email) {
        throw new Error("Harap login terlebih dahulu");
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== 'ADMIN') {
        throw new Error("Hanya admin yang dapat mengubah status pengguna");
    }

    if (!userId) throw new Error("User ID wajib diisi");

    const validStatuses = ['ACTIVE', 'INACTIVE', 'BANNED'];
    if (!validStatuses.includes(status)) throw new Error("Status tidak valid");

    return await updateUserStatusService(userId, status);
}
