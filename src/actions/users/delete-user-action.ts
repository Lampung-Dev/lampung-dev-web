"use server";

import { auth } from "@/lib/next-auth";
import { getUserByEmailService, deleteUserService } from "@/services/user";
import { revalidatePath } from "next/cache";

export async function deleteMyAccountAction(): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Harap login terlebih dahulu." };
        }

        const user = await getUserByEmailService(session.user.email);
        if (!user?.id) {
            return { success: false, error: "Akun tidak ditemukan." };
        }

        await deleteUserService(user.id);

        revalidatePath("/members", "page");
        revalidatePath("/users/members", "page");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("ERROR deleteMyAccountAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Gagal menghapus akun.",
        };
    }
}

export async function deleteUserByAdminAction(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Harap login terlebih dahulu." };
        }

        const currentUser = await getUserByEmailService(session.user.email);
        if (!currentUser || currentUser.role !== "ADMIN") {
            return { success: false, error: "Hanya admin yang memiliki izin untuk menghapus anggota." };
        }

        if (currentUser.id === userId) {
            return { success: false, error: "Admin tidak dapat menghapus akunnya sendiri dari daftar anggota." };
        }

        if (!userId) {
            return { success: false, error: "ID pengguna tidak valid." };
        }

        await deleteUserService(userId);

        revalidatePath("/members", "page");
        revalidatePath("/users/members", "page");
        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error("ERROR deleteUserByAdminAction:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Gagal menghapus anggota.",
        };
    }
}
