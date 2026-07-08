import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getCompanyByIdService } from "@/services/company";
import { CompanyProfileClient } from "./_components/company-profile-client";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || (user.role !== "ADMIN" && user.role !== "MITRA")) {
    redirect("/dashboard");
  }

  if (!user.companyId) {
    redirect("/dashboard");
  }

  const company = await getCompanyByIdService(user.companyId);
  if (!company) {
    redirect("/dashboard");
  }

  return <CompanyProfileClient company={company} />;
}
