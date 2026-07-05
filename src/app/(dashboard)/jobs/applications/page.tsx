import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { ApplicationsClient } from "./_components/applications-client";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  return <ApplicationsClient />;
}
