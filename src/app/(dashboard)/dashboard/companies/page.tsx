import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getAllCompaniesService } from "@/services/company";
import { CompaniesClient } from "./_components/companies-client";

export default async function CompaniesAdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const companies = await getAllCompaniesService();

  return (
    <div className="container mx-auto py-6">
      <CompaniesClient initialCompanies={companies} />
    </div>
  );
}
