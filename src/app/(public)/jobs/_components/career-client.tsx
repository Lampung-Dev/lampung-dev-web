"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  Briefcase,
  Search,
  ChevronRight,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Building2,
  Star,
  FileX2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  type Job,
  type JobCategory,
  POPULAR_TAGS,
  LOCATIONS,
  CATEGORY_TABS,
  JOB_CATEGORIES,
} from "../_data/jobs";

const JOBS_PER_PAGE = 9;

function JobCard({ job, hasApplied }: { job: Job & { idString?: string }; hasApplied: boolean }) {
  return (
    <Link href={`/jobs/${job.slug || job.id}`} className="block group">
      <div className="border border-white/10 rounded-xl p-5 backdrop-blur-sm bg-white/5 group-hover:bg-white/10 group-hover:border-white/25 transition-all flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-base leading-snug group-hover:text-primary transition-colors">
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
          {job.isFeatured && (
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
              <Star className="w-3 h-3 mr-1" />
              Pilihan
            </Badge>
          )}
          {hasApplied && (
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-semibold">
              Sudah Melamar
            </Badge>
          )}
          <Badge
            variant="outline"
            className="border-white/20 text-gray-300 text-xs"
          >
            {job.type}
          </Badge>
          <Badge
            variant="outline"
            className="border-white/20 text-gray-300 text-xs"
          >
            {job.experience}
          </Badge>
          <Badge
            variant="outline"
            className="border-white/20 text-gray-300 text-xs"
          >
            {job.education}
          </Badge>
        </div>

        <div className="space-y-1 mt-auto">
          <p className="text-sm font-medium text-gray-200 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
            {job.company}
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            {job.location}
          </p>
        </div>

        <p className="text-xs text-gray-500 flex items-center gap-1 border-t border-white/5 pt-3">
          <Clock className="w-3 h-3" />
          {job.postedAt}
        </p>
      </div>
    </Link>
  );
}

function ClientPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages.push("ellipsis");
    }
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="border-white/20 text-gray-300 hover:bg-white/10 disabled:opacity-30"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((page, idx) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${idx}`} className="text-gray-500 px-1">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            className={
              page === currentPage
                ? "bg-primary text-black"
                : "border-white/20 text-gray-300 hover:bg-white/10"
            }
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="border-white/20 text-gray-300 hover:bg-white/10 disabled:opacity-30"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRightIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function CareerClient({
  initialJobs,
  categories = [],
  appliedJobIds = [],
}: {
  initialJobs: (Job & { idString?: string })[];
  categories?: { id: string; name: string; slug: string }[];
  appliedJobIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [location, setLocation] = useState("Semua Kota");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  const renderedCategories = useMemo(() => {
    return categories.length > 0
      ? categories.map((cat) => ({ name: cat.name, sub: "Peluang karir terbaik" }))
      : JOB_CATEGORIES;
  }, [categories]);

  // Dynamic category tabs based on database categories
  const categoryTabs = useMemo(() => {
    if (categories.length > 0) {
      return ["Semua", ...categories.map((c) => c.name)];
    }
    return CATEGORY_TABS;
  }, [categories]);

  // Featured jobs: only jobs marked isFeatured by admin
  const featuredJobs = useMemo(() => {
    return initialJobs.filter((job) => job.isFeatured);
  }, [initialJobs]);

  const filteredJobs = useMemo(() => {
    return initialJobs.filter((job) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        job.skills.some((s) => s.toLowerCase().includes(q)) ||
        (job.category || "").toLowerCase().includes(q);

      const matchesLocation =
        location === "Semua Kota" || job.location.includes(location);

      const matchesCategory =
        activeCategory === "Semua" || (job.category || "") === activeCategory;

      return matchesQuery && matchesLocation && matchesCategory;
    });
  }, [query, location, activeCategory, initialJobs]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  const paginatedJobs = useMemo(
    () =>
      filteredJobs.slice(
        (currentPage - 1) * JOBS_PER_PAGE,
        currentPage * JOBS_PER_PAGE
      ),
    [filteredJobs, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [query, location, activeCategory]);

  function handleSearch() {
    setQuery(inputValue.trim());
  }

  function handleTagClick(tag: string) {
    setInputValue(tag);
    setQuery(tag);
    setActiveCategory("Semua");
  }

  function handleCategoryClick(category: JobCategory) {
    setActiveCategory(category);
    setInputValue("");
    setQuery("");
  }

  function clearFilters() {
    setQuery("");
    setInputValue("");
    setLocation("Semua Kota");
    setActiveCategory("Semua");
  }

  const hasActiveFilters =
    query !== "" || location !== "Semua Kota" || activeCategory !== "Semua";

  // If there are absolutely no jobs at all
  if (initialJobs.length === 0) {
    return (
      <div className="space-y-10">
        {/* Hero / Search */}
        <section className="text-center space-y-6 pt-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Temukan Karir Impianmu di{" "}
            <span className="text-primary">Ekosistem Teknologi</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Ribuan lowongan kerja di bidang teknologi menunggumu. Bergabung dan
            wujudkan karirmu bersama komunitas Lampung Dev.
          </p>
        </section>

        <section className="py-8">
          <EmptyState
            icon={FileX2}
            title="Belum Ada Lowongan Dibuka"
            description="Saat ini belum ada perusahaan yang membuka lowongan pekerjaan. Cek kembali nanti untuk peluang baru!"
          />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Hero / Search */}
      <section className="text-center space-y-6 pt-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Temukan Karir Impianmu di{" "}
          <span className="text-primary">Ekosistem Teknologi</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Ribuan lowongan kerja di bidang teknologi menunggumu. Bergabung dan
          wujudkan karirmu bersama komunitas Lampung Dev.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="w-full sm:w-44 bg-white/10 border-white/20 text-white shrink-0">
              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20 text-white">
              {LOCATIONS.map((loc) => (
                <SelectItem
                  key={loc}
                  value={loc}
                  className="focus:bg-white/10 focus:text-white"
                >
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari posisi, skill, atau perusahaan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
            />
          </div>

          <Button
            className="bg-primary hover:bg-primary/90 text-black px-6 shrink-0"
            onClick={handleSearch}
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Cari Loker
          </Button>
        </div>

        {/* Popular tags */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          <span className="text-gray-400 text-sm">Populer:</span>
          {POPULAR_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`text-sm underline-offset-2 hover:underline transition-colors ${
                query === tag ? "text-white font-medium" : "text-primary hover:text-primary/80"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Categories + Banners */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/10 rounded-xl backdrop-blur-sm bg-white/5 overflow-hidden">
          <div className="divide-y divide-white/10">
            {renderedCategories.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`w-full flex items-center justify-between px-5 py-4 transition-colors text-left group ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "hover:bg-white/10 text-white"
                  }`}
                >
                  <div>
                    <span className="font-semibold">{cat.name}</span>
                    <span className="ml-2 text-sm text-gray-400">{cat.sub}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-primary" : "text-gray-500 group-hover:text-primary"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => { handleTagClick("Fresh Graduate"); setActiveCategory("Semua"); }}
            className="flex-1 rounded-xl border border-white/10 backdrop-blur-sm bg-gradient-to-br from-blue-900/40 to-blue-600/20 p-6 flex items-center justify-between hover:border-blue-500/40 transition-colors text-left"
          >
            <div>
              <p className="text-gray-300 text-sm">Cari loker untuk</p>
              <p className="text-2xl font-bold text-primary mt-1">Fresh Graduate</p>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">
                Kesempatan terbaik untuk memulai karir di dunia teknologi Lampung.
              </p>
            </div>
            <div className="text-6xl opacity-60">🎓</div>
          </button>

          <button
            onClick={() => { setActiveCategory("Semua"); setLocation("Semua Kota"); setInputValue("Paruh Waktu"); setQuery("Paruh Waktu"); }}
            className="flex-1 rounded-xl border border-white/10 backdrop-blur-sm bg-gradient-to-br from-amber-900/40 to-orange-600/20 p-6 flex items-center justify-between hover:border-amber-500/40 transition-colors text-left"
          >
            <div>
              <p className="text-gray-300 text-sm">Cari loker untuk</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">Paruh Waktu</p>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">
                Fleksibel bekerja sambil mengembangkan skill teknologimu.
              </p>
            </div>
            <div className="text-6xl opacity-60">💼</div>
          </button>
        </div>
      </section>

      {/* Featured Jobs — Lowongan Kerja Pilihan */}
      {featuredJobs.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Lowongan Kerja Pilihan</h2>
            </div>
            <span className="text-gray-400 text-sm">
              {featuredJobs.length} lowongan pilihan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} hasApplied={appliedJobIds.includes(job.idString || "")} />
            ))}
          </div>
        </section>
      )}

      {/* All Job Listings */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-white">Semua Lowongan</h2>
          <span className="text-gray-400 text-sm">
            {filteredJobs.length} lowongan ditemukan
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveCategory(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors shrink-0 ${
                activeCategory === tab
                  ? "bg-primary/90 text-black shadow-lg shadow-primary/20"
                  : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-gray-400 text-sm">Filter aktif:</span>
            {query && (
              <Badge
                variant="outline"
                className="border-primary/50 text-primary gap-1.5 cursor-pointer hover:bg-primary/10"
                onClick={() => { setQuery(""); setInputValue(""); }}
              >
                Pencarian: &quot;{query}&quot;
                <X className="w-3 h-3" />
              </Badge>
            )}
            {location !== "Semua Kota" && (
              <Badge
                variant="outline"
                className="border-primary/50 text-primary gap-1.5 cursor-pointer hover:bg-primary/10"
                onClick={() => setLocation("Semua Kota")}
              >
                {location}
                <X className="w-3 h-3" />
              </Badge>
            )}
            {activeCategory !== "Semua" && (
              <Badge
                variant="outline"
                className="border-primary/50 text-primary gap-1.5 cursor-pointer hover:bg-primary/10"
                onClick={() => setActiveCategory("Semua")}
              >
                {activeCategory}
                <X className="w-3 h-3" />
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-primary/80 hover:text-primary font-medium underline underline-offset-2 transition-colors"
            >
              Hapus semua
            </button>
          </div>
        )}

        {/* Jobs grid */}
        {paginatedJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedJobs.map((job) => (
              <JobCard key={job.id} job={job} hasApplied={appliedJobIds.includes(job.idString || "")} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Tidak ada lowongan yang sesuai"
            description="Coba ubah kata kunci pencarian, lokasi, atau kategori yang kamu pilih."
            actionLabel="Hapus Filter"
            onAction={clearFilters}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <ClientPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </div>
  );
}
