import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getApplicationsForAdminService, getApplicationsForCompanyService } from "@/services/job-application";
import { getCompanyByIdService } from "@/services/company";
import { ApplicationsClient } from "./_components/applications-client";

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await getUserByEmailService(session.user.email);
  if (!user || (user.role !== "ADMIN" && user.role !== "MITRA")) redirect("/dashboard");

  if (user.role === "MITRA" && !user.companyId) redirect("/dashboard");

  const dbApps = user.role === "ADMIN"
    ? await getApplicationsForAdminService()
    : await getApplicationsForCompanyService(user.companyId!);

  // Get company location data
  let companyLocation: { lat: number; lng: number; name: string } | null = null;
  if (user.role === "MITRA" && user.companyId) {
    const company = await getCompanyByIdService(user.companyId);
    if (company?.latitude && company?.longitude) {
      companyLocation = {
        lat: company.latitude,
        lng: company.longitude,
        name: company.name,
      };
    }
  }

  // For admin: collect all company locations from applications
  const companyLocations: Record<string, { lat: number; lng: number; name: string }> = {};
  if (user.role === "ADMIN") {
    for (const app of dbApps) {
      const companyRelation = (app.job as { companyRelation?: { id: string; name: string; latitude: number | null; longitude: number | null } }).companyRelation;
      if (companyRelation?.latitude && companyRelation?.longitude && !companyLocations[companyRelation.id]) {
        companyLocations[companyRelation.id] = {
          lat: companyRelation.latitude,
          lng: companyRelation.longitude,
          name: companyRelation.name,
        };
      }
    }
  }

  const statusMap: Record<string, string> = {
    PENDING: "submitted",
    REVIEWING: "reviewing",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
  };

  const serializedApps = dbApps.map((app) => {
    const companyRelation = (app.job as { companyRelation?: { id: string; name: string; latitude: number | null; longitude: number | null } }).companyRelation;
    const userInfo = app.user as { latitude?: string | null; longitude?: string | null; locationName?: string | null } | undefined;

    return {
      id: app.id,
      jobId: app.jobId as unknown as number,
      jobTitle: app.job.title,
      company: app.job.company,
      companyId: companyRelation?.id || null,
      category: app.job.category || "General",
      location: app.job.location,
      submittedAt: app.createdAt.toISOString(),
      status: (statusMap[app.status] || "submitted") as "submitted" | "reviewing" | "accepted" | "rejected",
      applicant: {
        fullName: app.fullName,
        email: app.email,
        phone: app.phone,
        linkedin: app.linkedin || "",
        portfolio: app.portfolio || "",
        latitude: userInfo?.latitude ? parseFloat(userInfo.latitude) : null,
        longitude: userInfo?.longitude ? parseFloat(userInfo.longitude) : null,
        locationName: userInfo?.locationName || null,
      },
      application: {
        resumeUrl: app.resumeUrl,
        expectedSalary: app.expectedSalary || "",
        availability: app.availability,
        coverLetter: app.coverLetter,
      },
    };
  });

  return (
    <ApplicationsClient
      initialApplications={serializedApps}
      userRole={user.role as "ADMIN" | "MITRA"}
      companyLocation={companyLocation}
      companyLocations={companyLocations}
    />
  );
}
