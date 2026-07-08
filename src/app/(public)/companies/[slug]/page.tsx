import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Globe, MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCompanyBySlugService } from "@/services/company";
import { getAllJobsService } from "@/services/job";
import { getRelativeTime } from "@/lib/date";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlugService(slug);
  if (!company) return { title: "Perusahaan Tidak Ditemukan" };
  return {
    title: `${company.name} | Lampung Dev`,
    description: company.description || `Lihat profil perusahaan ${company.name} dan lowongan kerja aktif mereka di Lampung Dev.`,
  };
}

export default async function CompanyDetailPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyBySlugService(slug);

  if (!company) notFound();

  // Fetch only active jobs for this specific company
  const { jobs } = await getAllJobsService({
    onlyActive: true,
    companyId: company.id,
    limit: 50,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Back to list */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
      >
         <ArrowLeft className="w-4 h-4" />
         Kembali ke Daftar Lowongan
      </Link>

      {/* Hero Header Card */}
      <div className="relative border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm bg-white/5 p-6 md:p-8 space-y-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
            {company.name.charAt(0)}
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight truncate">
              {company.name}
            </h1>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-400">
              {company.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  {company.address}
                </span>
              )}
              {company.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {company.website.replace(/(^\w+:|^)\/\//, "")}
                  </a>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-500" />
                Terdaftar {new Date(company.createdAt).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
              </span>
            </div>
          </div>
        </div>

        {company.description && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tentang Perusahaan</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{company.description}</p>
          </div>
        )}
      </div>

      {/* Active Jobs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Lowongan Kerja Aktif ({jobs.length})
          </h2>
        </div>

        {jobs.length === 0 ? (
          <div className="border border-white/10 rounded-xl p-12 text-center backdrop-blur-sm bg-white/5">
            <Building2 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="font-semibold text-white text-lg">Belum Ada Lowongan Aktif</h3>
            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
              Perusahaan ini sedang tidak membuka lowongan pekerjaan baru untuk saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.slug}`} className="block group">
                <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 group-hover:bg-white/10 group-hover:border-white/25 transition-all flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-white text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <span className="text-green-400 font-medium text-sm whitespace-nowrap shrink-0">
                      {job.salary}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {job.isPremium && (
                      <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">
                        Premium
                      </Badge>
                    )}
                    <Badge className="bg-white/10 text-gray-300 border-none text-xs">
                      {job.type}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-none text-xs">
                      {job.category || "General"}
                    </Badge>
                  </div>

                  <div className="text-gray-400 text-sm flex items-center gap-1 mt-auto pt-2 border-t border-white/5">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{job.location}</span>
                    <span className="text-gray-600 mx-1">•</span>
                    <span className="text-xs shrink-0">{getRelativeTime(job.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
