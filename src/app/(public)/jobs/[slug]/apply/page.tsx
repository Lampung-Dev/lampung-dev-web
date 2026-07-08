import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, MapPin } from "lucide-react";
import { getJobBySlugService, getAllJobsService } from "@/services/job";
import { getRelativeTime } from "@/lib/date";
import { redirect } from "next/navigation";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { ApplyForm } from "./_components/apply-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { jobs } = await getAllJobsService({ onlyActive: true, limit: 50 });
    return jobs.map((job) => ({ slug: job.slug }));
  } catch (error) {
    console.warn("WARNING: generateStaticParams failed to fetch jobs from DB. Returning empty array for build.", error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJobBySlugService(slug);
  if (!job) return { title: "Lowongan Tidak Ditemukan" };
  return {
    title: `Lamar – ${job.title} | Lampung Dev Jobs`,
  };
}

export default async function ApplyPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.email) {
    redirect(`/login?callbackUrl=/jobs/${slug}/apply`);
  }

  const user = await getUserByEmailService(session.user.email);
  if (!user) redirect("/login");

  const dbJob = await getJobBySlugService(slug);
  if (!dbJob) notFound();

  const job = {
    ...dbJob,
    id: dbJob.id as unknown as number,
    type: dbJob.type as "Penuh Waktu" | "Paruh Waktu" | "Magang" | "Remote",
    category: dbJob.category || "",
    postedAt: getRelativeTime(dbJob.createdAt),
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Back */}
      <Link
        href={`/jobs/${job.slug}`}
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Lowongan
      </Link>

      {/* Job snapshot */}
      <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0">
          {job.companyInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{job.title}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {job.company}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" />
              {job.type}
            </span>
          </div>
        </div>
        <p className="text-green-400 font-semibold text-sm whitespace-nowrap shrink-0 hidden sm:block">
          {job.salary}
        </p>
      </div>

      {/* Form */}
      <ApplyForm job={job} initialUser={user} />
    </div>
  );
}
