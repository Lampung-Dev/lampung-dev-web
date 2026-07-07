"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  Briefcase,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type TJob } from "@/lib/database/schema";
import { getRelativeTime } from "@/services/job";
import { CATEGORY_TABS, LOCATIONS } from "@/app/(public)/career/_data/jobs";

type SerializedTJob = Omit<TJob, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const TYPE_COLORS: Record<string, string> = {
  "Penuh Waktu": "border-blue-500/40 text-blue-400",
  "Paruh Waktu": "border-amber-500/40 text-amber-400",
  Magang: "border-purple-500/40 text-purple-400",
  Remote: "border-green-500/40 text-green-400",
};

function JobCard({ job }: { job: SerializedTJob }) {
  return (
    <div className="border rounded-lg bg-card p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {job.companyInitial}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{job.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />
              {job.company}
            </p>
          </div>
        </div>
        {job.isPremium && (
          <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs shrink-0">
            Premium
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className={`text-xs ${TYPE_COLORS[job.type] ?? ""}`}>
          {job.type}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {job.experience}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {job.category}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1 mt-1">
        {(job.skills as string[]).slice(0, 3).map((s) => (
          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
        ))}
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t">
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-green-500">{job.salary}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {job.location}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {getRelativeTime(job.createdAt)}
      </p>
    </div>
  );
}

export function JobsBrowseClient({
  jobs,
  totalJobs,
}: {
  jobs: SerializedTJob[];
  totalJobs: number;
}) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("Semua Kota");
  const [category, setCategory] = useState("Semua");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return jobs.filter((job) => {
      const matchQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.skills as string[]).some((s) => s.toLowerCase().includes(q));
      const matchLocation =
        location === "Semua Kota" || job.location.includes(location);
      const matchCategory =
        category === "Semua" || job.category === category;
      return matchQuery && matchLocation && matchCategory;
    });
  }, [jobs, query, location, category]);

  const stats = useMemo(() => ({
    total: totalJobs,
    fullTime: jobs.filter((j) => j.type === "Penuh Waktu").length,
    remote: jobs.filter((j) => j.location === "Remote").length,
    premium: jobs.filter((j) => j.isPremium).length,
  }), [jobs, totalJobs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Available Jobs</h1>
        <p className="text-muted-foreground">
          Jelajahi lowongan kerja di ekosistem teknologi Lampung.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Lowongan", value: stats.total },
          { label: "Penuh Waktu", value: stats.fullTime },
          { label: "Remote", value: stats.remote },
          { label: "Premium", value: stats.premium },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-lg bg-card p-3 text-center">
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari posisi, skill, atau perusahaan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full sm:w-44">
            <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCATIONS.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52">
            <Briefcase className="w-4 h-4 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_TABS.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan <strong>{filtered.length}</strong> dari {jobs.length} lowongan aktif
      </p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg bg-card py-16 flex flex-col items-center gap-3 text-center">
          <span className="text-4xl">🔍</span>
          <p className="font-medium">Tidak ada lowongan yang sesuai</p>
          <p className="text-sm text-muted-foreground">
            Coba ubah kata kunci atau filter yang kamu gunakan.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setQuery(""); setLocation("Semua Kota"); setCategory("Semua"); }}
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
