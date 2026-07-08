import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getJobBySlugService, getAllJobsService } from "@/services/job";
import { getRelativeTime } from "@/lib/date";
import { auth } from "@/lib/next-auth";
import { getUserByEmailService } from "@/services/user";
import { getApplicationsByUserIdService } from "@/services/job-application";
import { ApplyButton } from "./_components/apply-button";

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
    title: `${job.title} – ${job.company} | Lampung Dev Jobs`,
    description: job.description.slice(0, 155),
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const dbJob = await getJobBySlugService(slug);

  if (!dbJob) notFound();

  const session = await auth();
  let hasApplied = false;
  if (session?.user?.email) {
    const user = await getUserByEmailService(session.user.email);
    if (user) {
      const apps = await getApplicationsByUserIdService(user.id);
      hasApplied = apps.some((app) => app.jobId === dbJob.id);
    }
  }

  const { jobs: allJobs } = await getAllJobsService({ onlyActive: true, limit: 50 });
  const relatedJobs = allJobs
    .filter((j) => j.category === dbJob.category && j.id !== dbJob.id)
    .slice(0, 3)
    .map((j) => ({
      ...j,
      postedAt: getRelativeTime(j.createdAt),
    }));

  const job = {
    ...dbJob,
    postedAt: getRelativeTime(dbJob.createdAt),
  };


  return (
    <div className="space-y-8 pb-12">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Lowongan
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                {job.companyInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                    {job.title}
                  </h1>
                  {job.isPremium && (
                    <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                {job.companyRelation?.slug ? (
                  <Link href={`/companies/${job.companyRelation.slug}`} className="inline-block text-primary hover:underline font-medium mt-1">
                    {job.companyRelation.name || job.company}
                  </Link>
                ) : (
                  <p className="text-gray-300 font-medium mt-1">{job.company}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-500" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                {job.postedAt}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-gray-500" />
                {job.type}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-gray-500" />
                {job.education}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="border-white/20 text-gray-300"
              >
                {job.type}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/20 text-gray-300"
              >
                {job.experience}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/20 text-gray-300"
              >
                {job.education}
              </Badge>
              <Badge
                variant="outline"
                className="border-white/20 text-gray-300"
              >
                {job.category || "General"}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Gaji
                </p>
                <p className="text-xl font-bold text-green-400">{job.salary}</p>
                <p className="text-xs text-gray-500">per bulan</p>
              </div>
              <ApplyButton jobSlug={job.slug} hasApplied={hasApplied} />
            </div>
          </div>

          {/* Description */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Deskripsi Pekerjaan
            </h2>
            <p className="text-gray-300 leading-relaxed">{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Tanggung Jawab
            </h2>
            <ul className="space-y-2.5">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Kualifikasi & Persyaratan
            </h2>
            <ul className="space-y-2.5">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <h2 className="text-lg font-semibold text-white">Benefit & Fasilitas</h2>
            <ul className="space-y-2.5">
              {job.benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-amber-400 shrink-0">✦</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-4">
            <h2 className="text-lg font-semibold text-white">
              Skill yang Dibutuhkan
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge
                  key={skill}
                  className="bg-primary/20 text-primary border border-primary/30 text-sm"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">Tertarik dengan posisi ini?</p>
              <p className="text-gray-400 text-sm">
                Lamar sekarang sebelum lowongan ditutup.
              </p>
            </div>
            <ApplyButton jobSlug={job.slug} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company info */}
          <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 space-y-4">
            <h3 className="font-semibold text-white">Tentang Perusahaan</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shrink-0">
                {job.companyInitial}
              </div>
              <div>
                <p className="font-medium text-white">{job.company}</p>
                <p className="text-sm text-gray-400">{job.category || "General"}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm pb-2">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-4 h-4 text-gray-500" />
                {job.location}
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Building2 className="w-4 h-4 text-gray-500" />
                {job.type}
              </div>
            </div>
            {job.companyRelation?.slug && (
              <Link href={`/companies/${job.companyRelation.slug}`} className="block">
                <Button variant="outline" size="sm" className="w-full border-white/15 text-gray-300 hover:bg-white/10">
                  Lihat Profil Perusahaan
                </Button>
              </Link>
            )}
          </div>

          {/* Job info summary */}
          <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 space-y-3">
            <h3 className="font-semibold text-white">Ringkasan Posisi</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: "Kategori", value: job.category || "General" },
                { label: "Tipe Pekerjaan", value: job.type },
                { label: "Pengalaman", value: job.experience },
                { label: "Pendidikan", value: job.education },
                { label: "Lokasi", value: job.location },
                { label: "Gaji", value: job.salary },
                { label: "Diposting", value: job.postedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">{label}</span>
                  <span className="text-gray-200 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Related jobs */}
          {relatedJobs.length > 0 && (
            <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 space-y-4">
              <h3 className="font-semibold text-white">Lowongan Serupa</h3>
              <div className="space-y-3">
                {relatedJobs.map((related) => (
                  <Link
                    key={related.id}
                    href={`/jobs/${related.slug}`}
                    className="block border border-white/10 rounded-lg p-3 hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    <p className="text-sm font-medium text-white hover:text-primary transition-colors line-clamp-1">
                      {related.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {related.company}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-green-400">
                        {related.salary}
                      </span>
                      <span className="text-xs text-gray-500">
                        {related.location}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/jobs">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Lihat Semua
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
