import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllSponsorsService } from "@/services/sponsor";
import SponsorsClient from "./_components/sponsors-client";

export default async function SponsorsPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect('/login');
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const sponsors = await getAllSponsorsService();

  return <SponsorsClient sponsors={sponsors} />;
}
