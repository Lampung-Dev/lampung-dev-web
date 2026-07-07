import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllUserPagination } from "@/actions/users/get-all-users";
import { UsersClient } from "./_components/users-client";

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function MembersPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const currentUser = await getUserByEmailService(session.user.email);
  if (!currentUser || currentUser.role !== "ADMIN") redirect("/dashboard");

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1") || 1);

  const { users, metadata } = await getAllUserPagination({
    page: currentPage,
    limit: 20,
    orderBy: "createdAt",
    order: "desc",
  });

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
    />
  );
}
