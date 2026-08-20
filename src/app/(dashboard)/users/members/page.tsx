import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService, getUserStatsService } from "@/services/user";
import { getAllUserPagination } from "@/actions/users/get-all-users";
import { UsersClient } from "./_components/users-client";
import { UserRole, UserStatus } from "@/types/user";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
    status?: string;
  }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentUser = await getUserByEmailService(session.user.email);
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page ?? "1") || 1);
  const search = resolvedParams.search?.trim() || undefined;
  const role = (["ADMIN", "MODERATOR", "USER"].includes(resolvedParams.role ?? "")
    ? resolvedParams.role
    : undefined) as UserRole | undefined;
  const status = (["ACTIVE", "INACTIVE", "BANNED"].includes(resolvedParams.status ?? "")
    ? resolvedParams.status
    : undefined) as UserStatus | undefined;

  const [{ users, metadata }, stats] = await Promise.all([
    getAllUserPagination({
      page: currentPage,
      limit: 20,
      orderBy: "createdAt",
      order: "desc",
      search,
      role,
      status,
    }),
    getUserStatsService(),
  ]);

  // Serialize Date fields before passing to client component
  const serializedUsers = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    picture: u.picture,
    role: u.role,
    title: u.title,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <UsersClient
      initialUsers={serializedUsers}
      metadata={metadata}
      currentPage={currentPage}
      currentUserId={currentUser.id}
      stats={stats}
      initialSearch={search ?? ""}
      initialRole={role ?? "all"}
      initialStatus={status ?? "all"}
    />
  );
}
