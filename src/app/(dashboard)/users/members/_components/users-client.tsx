"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ShieldCheck, ShieldAlert, User, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { updateUserRoleAction } from "@/actions/users/update-user-role-action";
import { updateUserStatusAction } from "@/actions/users/update-user-status-action";
import { type PaginatedUsersResponse } from "@/types/user";

type SerializedUser = {
  id: string;
  name: string | null;
  email: string;
  picture: string | null;
  role: string;
  title: string | null;
  status: string;
  createdAt: string;
};

type RoleType = "ADMIN" | "MODERATOR" | "USER";
type StatusType = "ACTIVE" | "INACTIVE" | "BANNED";

const ROLE_CONFIG: Record<RoleType, { label: string; className: string }> = {
  ADMIN: { label: "Admin", className: "bg-red-500/20 text-red-400 border-red-500/30" },
  MODERATOR: { label: "Moderator", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  USER: { label: "Member", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  ACTIVE: { label: "Aktif", className: "border-green-500 text-green-500" },
  INACTIVE: { label: "Nonaktif", className: "border-gray-500 text-gray-500" },
  BANNED: { label: "Banned", className: "border-red-500 text-red-500" },
};

function UserAvatar({ user }: { user: SerializedUser }) {
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (user.picture) {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden border shrink-0">
        <Image src={user.picture} alt={user.name ?? ""} width={32} height={32} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

function RoleDropdown({
  user,
  currentUserId,
  onChanged,
}: {
  user: SerializedUser;
  currentUserId: string;
  onChanged: (userId: string, role: RoleType) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isSelf = user.id === currentUserId;

  async function handleRoleChange(role: RoleType) {
    if (user.role === role) return;
    setLoading(true);
    try {
      await updateUserRoleAction(user.id, role);
      onChanged(user.id, role);
      toast.success(`Role ${user.name ?? user.email} diubah ke ${ROLE_CONFIG[role].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-7 px-2" disabled={loading || isSelf}>
          <Badge className={`${ROLE_CONFIG[user.role as RoleType]?.className ?? ""} text-xs border`}>
            {ROLE_CONFIG[user.role as RoleType]?.label ?? user.role}
          </Badge>
          {!isSelf && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-xs">Ubah Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["ADMIN", "MODERATOR", "USER"] as RoleType[]).map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => handleRoleChange(r)}
            className={user.role === r ? "font-semibold" : ""}
          >
            {ROLE_CONFIG[r].label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersClient({
  initialUsers,
  metadata,
  currentPage,
  currentUserId,
}: {
  initialUsers: SerializedUser[];
  metadata: PaginatedUsersResponse["metadata"];
  currentPage: number;
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleType | "all">("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter((u) => {
      const matchQuery =
        !q ||
        (u.name ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  const stats = useMemo(() => ({
    total: metadata.totalUsers,
    active: users.filter((u) => u.status === "ACTIVE").length,
    banned: users.filter((u) => u.status === "BANNED").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  }), [users, metadata]);

  function handleRoleChanged(userId: string, role: RoleType) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  }

  async function handleBanToggle(user: SerializedUser) {
    const newStatus: StatusType = user.status === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      await updateUserStatusAction(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      toast.success(
        newStatus === "BANNED"
          ? `${user.name ?? user.email} telah dibanned`
          : `${user.name ?? user.email} telah di-unban`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  }

  function goToPage(page: number) {
    router.push(`/users/members?page=${page}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Member Management</h1>
        <p className="text-muted-foreground">
          Kelola semua anggota terdaftar komunitas Lampung Dev.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Pengguna", value: stats.total, icon: User },
          { label: "Aktif", value: stats.active, icon: ShieldCheck },
          { label: "Dibanned", value: stats.banned, icon: ShieldAlert },
          { label: "Admin", value: stats.admins, icon: ShieldCheck },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-lg bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "ADMIN", "MODERATOR", "USER"] as const).map((r) => (
            <Button
              key={r}
              variant={roleFilter === r ? "default" : "outline"}
              size="sm"
              onClick={() => setRoleFilter(r)}
            >
              {r === "all" ? "Semua" : ROLE_CONFIG[r].label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan <strong>{filtered.length}</strong> pengguna (halaman {currentPage} dari {metadata.totalPages})
      </p>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pengguna</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Tidak ada pengguna yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{user.name ?? "—"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.title ?? "—"}
                  </TableCell>
                  <TableCell>
                    <RoleDropdown
                      user={user}
                      currentUserId={currentUserId}
                      onChanged={handleRoleChanged}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_CONFIG[user.status as StatusType]?.className ?? ""}`}
                    >
                      {STATUS_CONFIG[user.status as StatusType]?.label ?? user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUserId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs ${user.status === "BANNED" ? "text-green-500 hover:text-green-400" : "text-destructive hover:text-destructive"}`}
                          >
                            {user.status === "BANNED" ? "Unban" : "Ban"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {user.status === "BANNED" ? "Unban Pengguna?" : "Ban Pengguna?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {user.status === "BANNED"
                                ? `Kamu akan mengaktifkan kembali akun ${user.name ?? user.email}.`
                                : `Kamu akan memblokir akses ${user.name ?? user.email} ke platform ini.`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleBanToggle(user)}
                              className={user.status === "BANNED"
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                            >
                              {user.status === "BANNED" ? "Unban" : "Ban"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {metadata.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!metadata.hasPreviousPage}
            onClick={() => goToPage(currentPage - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage} / {metadata.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!metadata.hasNextPage}
            onClick={() => goToPage(currentPage + 1)}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
