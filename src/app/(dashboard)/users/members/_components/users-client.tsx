"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ShieldAlert, User, ChevronDown, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { deleteUserByAdminAction } from "@/actions/users/delete-user-action";
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
  INACTIVE: { label: "Nonaktif", className: "border-gray-500 text-gray-400" },
  BANNED: { label: "Banned", className: "border-red-500 text-red-500" },
};

function UserAvatar({ user }: { user: SerializedUser }) {
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar className="w-8 h-8 shrink-0">
      {user.picture && (
        <AvatarImage src={user.picture} alt={user.name ?? ""} className="object-cover" />
      )}
      <AvatarFallback className="bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
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

function StatusDropdown({
  user,
  currentUserId,
  onChanged,
}: {
  user: SerializedUser;
  currentUserId: string;
  onChanged: (userId: string, status: StatusType) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isSelf = user.id === currentUserId;

  async function handleStatusChange(status: StatusType) {
    if (user.status === status) return;
    setLoading(true);
    try {
      await updateUserStatusAction(user.id, status);
      onChanged(user.id, status);
      toast.success(`Status ${user.name ?? user.email} diubah ke ${STATUS_CONFIG[status].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-7 px-2" disabled={loading || isSelf}>
          <Badge
            variant="outline"
            className={`text-xs ${STATUS_CONFIG[user.status as StatusType]?.className ?? ""}`}
          >
            {STATUS_CONFIG[user.status as StatusType]?.label ?? user.status}
          </Badge>
          {!isSelf && <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-xs">Ubah Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(["ACTIVE", "BANNED"] as StatusType[]).map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => handleStatusChange(s)}
            className={user.status === s ? "font-semibold" : ""}
          >
            {STATUS_CONFIG[s].label}
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
  stats,
  initialSearch = "",
  initialRole = "all",
  initialStatus = "all",
}: {
  initialUsers: SerializedUser[];
  metadata: PaginatedUsersResponse["metadata"];
  currentPage: number;
  currentUserId: string;
  stats: { total: number; active: number; banned: number; admins: number };
  initialSearch?: string;
  initialRole?: RoleType | "all";
  initialStatus?: StatusType | "all";
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  useEffect(() => {
    setQuery(initialSearch);
  }, [initialSearch]);

  const updateFilters = (updates: {
    search?: string;
    role?: RoleType | "all";
    status?: StatusType | "all";
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const s = updates.search !== undefined ? updates.search.trim() : initialSearch;
    const r = updates.role !== undefined ? updates.role : initialRole;
    const st = updates.status !== undefined ? updates.status : initialStatus;
    const p = updates.page !== undefined ? updates.page : 1;

    if (s) params.set("search", s);
    if (r && r !== "all") params.set("role", r);
    if (st && st !== "all") params.set("status", st);
    if (p > 1) params.set("page", String(p));

    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `/users/members?${qs}` : "/users/members", { scroll: false });
    });
  };

  const handleSearchSubmit = () => {
    updateFilters({ search: query, page: 1 });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setQuery("");
    updateFilters({ search: "", page: 1 });
  };

  function handleRoleChanged(userId: string, role: RoleType) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role } : u))
    );
  }

  function handleStatusChanged(userId: string, status: StatusType) {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
  }

  async function handleBanToggle(user: SerializedUser) {
    const newStatus: StatusType = user.status === "BANNED" ? "ACTIVE" : "BANNED";
    try {
      await updateUserStatusAction(user.id, newStatus);
      handleStatusChanged(user.id, newStatus);
      toast.success(
        newStatus === "BANNED"
          ? `${user.name ?? user.email} telah dibanned`
          : `${user.name ?? user.email} telah di-unban`
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  }

  async function handleDeleteUser(user: SerializedUser) {
    try {
      const res = await deleteUserByAdminAction(user.id);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus pengguna");
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success(`Akun ${user.name ?? user.email} berhasil dihapus permanen.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus pengguna");
    }
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
            placeholder="Cari nama, email, atau title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9 pr-20"
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={handleClearSearch}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={handleSearchSubmit}
            >
              Cari
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "ADMIN", "MODERATOR", "USER"] as const).map((r) => (
            <Button
              key={r}
              variant={initialRole === r ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ role: r, page: 1 })}
            >
              {r === "all" ? "Semua Role" : ROLE_CONFIG[r].label}
            </Button>
          ))}
          {(["all", "ACTIVE", "BANNED"] as const).map((s) => (
            <Button
              key={s}
              variant={initialStatus === s ? "default" : "outline"}
              size="sm"
              onClick={() => updateFilters({ status: s, page: 1 })}
            >
              {s === "all" ? "Semua Status" : STATUS_CONFIG[s].label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan <strong>{users.length}</strong> dari <strong>{metadata.totalUsers}</strong> pengguna (halaman {currentPage} dari {metadata.totalPages || 1})
      </p>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table className={isPending ? "opacity-60 transition-opacity" : "transition-opacity"}>
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Tidak ada pengguna yang sesuai filter.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
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
                    <StatusDropdown
                      user={user}
                      currentUserId={currentUserId}
                      onChanged={handleStatusChanged}
                    />
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
                      <div className="flex items-center justify-end gap-1">
                        {/* Ban / Unban Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`text-xs h-7 px-2 ${user.status === "BANNED" ? "text-green-500 hover:text-green-400" : "text-amber-500 hover:text-amber-400"}`}
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
                                  : "bg-amber-600 text-white hover:bg-amber-700"}
                              >
                                {user.status === "BANNED" ? "Unban" : "Ban"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        {/* Delete Member Dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Hapus akun permanen"
                              className="text-xs h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Pengguna Permanen?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini akan menghapus akun <strong>{user.name ?? user.email}</strong> secara permanen beserta seluruh data profil dan relasinya. Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus Permanen
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
            disabled={!metadata.hasPreviousPage || isPending}
            onClick={() => updateFilters({ page: currentPage - 1 })}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground px-2">
            {currentPage} / {metadata.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!metadata.hasNextPage || isPending}
            onClick={() => updateFilters({ page: currentPage + 1 })}
          >
            Berikutnya
          </Button>
        </div>
      )}
    </div>
  );
}
