import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, MapPin } from "lucide-react";
import { JOBS_DATA } from "../../_data/jobs";
import { ApplyForm } from "./_components/apply-form";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return JOBS_DATA.map((job) => ({ id: String(job.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const job = JOBS_DATA.find((j) => j.id === Number(id));
  if (!job) return { title: "Lowongan Tidak Ditemukan" };
  return {
    title: `Lamar – ${job.title} | Lampung Dev Career`,
  };
}

export default async function ApplyPage({ params }: Props) {
  const { id } = await params;
  const job = JOBS_DATA.find((j) => j.id === Number(id));

  if (!job) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16">
      {/* Back */}
      <Link
        href={`/career/${job.id}`}
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
      <ApplyForm job={job} />
    </div>
  );
}
