"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteMyAccountAction } from "@/actions/users/delete-user-action";

export function DeleteAccountSection() {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteMyAccountAction();
            if (!res.success) {
                toast.error(res.error || "Gagal menghapus akun.");
                setIsDeleting(false);
                return;
            }

            toast.success("Akun berhasil dihapus.");
            await signOut({ redirect: false });
            window.location.href = "/";
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan saat menghapus akun.");
            setIsDeleting(false);
        }
    };

    return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-destructive font-semibold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>Zona Bahaya (Danger Zone)</span>
            </div>
            <p className="text-sm text-muted-foreground">
                Menghapus akun Anda bersifat permanen. Semua data profil, riwayat pendaftaran event, dan tautan sosial media Anda akan dihapus dari platform.
            </p>

            <div className="pt-2">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-4 h-4" />
                            {isDeleting ? "Menghapus Akun..." : "Hapus Akun Saya"}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Apakah Anda yakin ingin menghapus akun?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Akun Anda beserta seluruh data terkait akan dihapus secara permanen dari sistem Lampung Dev.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAccount();
                                }}
                                disabled={isDeleting}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                {isDeleting ? "Memproses..." : "Ya, Hapus Akun Saya"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
