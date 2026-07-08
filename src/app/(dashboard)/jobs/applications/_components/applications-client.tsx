"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Eye,
  ChevronDown,
  Clock,
  Mail,
  Phone,
  Globe,
  FileText,
  Linkedin,
  Building2,
  MapPin,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { updateApplicationStatusAction } from "@/actions/companies/company-actions";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LeafletMap, { calculateDistance, type MapMarker } from "@/components/leaflet-map";
import { type JobApplicationPayload } from "@/app/(public)/jobs/[slug]/apply/_components/apply-form";

// ─── Types & helpers ──────────────────────────────────────────────────────────

type AppStatus = "submitted" | "reviewing" | "accepted" | "rejected";

type StoredApplication = Omit<JobApplicationPayload, "status" | "applicant"> & {
  status: AppStatus;
  companyId?: string | null;
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
    latitude?: number | null;
    longitude?: number | null;
    locationName?: string | null;
  };
};

const STATUS_CONFIG: Record<
  AppStatus,
  { label: string; className: string }
> = {
  submitted: { label: "Submitted", className: "border-blue-500/40 text-blue-400" },
  reviewing: { label: "Reviewing", className: "border-amber-500/40 text-amber-400" },
  accepted: { label: "Accepted", className: "border-green-500/40 text-green-400" },
  rejected: { label: "Rejected", className: "border-red-500/40 text-red-400" },
};

const STATUS_OPTIONS: AppStatus[] = ["submitted", "reviewing", "accepted", "rejected"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDistance(km: number | null): string {
  if (km === null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

// ─── Map Modal ────────────────────────────────────────────────────────────────

function MapModal({
  open,
  onClose,
  applicantName,
  applicantLocation,
  companyLocation,
}: {
  open: boolean;
  onClose: () => void;
  applicantName: string;
  applicantLocation: { lat: number; lng: number; name: string } | null;
  companyLocation: { lat: number; lng: number; name: string } | null;
}) {
  const markers: MapMarker[] = [];
  let distance: number | null = null;

  if (companyLocation) {
    markers.push({
      lat: companyLocation.lat,
      lng: companyLocation.lng,
      label: `🏢 ${companyLocation.name} (Perusahaan)`,
      color: "blue",
    });
  }

  if (applicantLocation) {
    markers.push({
      lat: applicantLocation.lat,
      lng: applicantLocation.lng,
      label: `👤 ${applicantName} (Pelamar)`,
      color: "red",
    });
  }

  if (companyLocation && applicantLocation) {
    distance = calculateDistance(
      companyLocation.lat, companyLocation.lng,
      applicantLocation.lat, applicantLocation.lng
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Lokasi Pelamar & Perusahaan</DialogTitle>
          <DialogDescription>
            Peta lokasi untuk pelamar <strong>{applicantName}</strong>
          </DialogDescription>
        </DialogHeader>

        {markers.length > 0 ? (
          <div className="space-y-3">
            <LeafletMap markers={markers} showLine={markers.length >= 2} height="400px" />

            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
              {companyLocation && (
                <p>🏢 <strong>{companyLocation.name}</strong>: {companyLocation.lat.toFixed(4)}, {companyLocation.lng.toFixed(4)}</p>
              )}
              {applicantLocation && (
                <p>👤 <strong>{applicantName}</strong> ({applicantLocation.name}): {applicantLocation.lat.toFixed(4)}, {applicantLocation.lng.toFixed(4)}</p>
              )}
              {distance !== null && (
                <p className="text-sm font-semibold text-primary mt-1">
                  📏 Jarak: {formatDistance(distance)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Data lokasi belum tersedia. Pastikan perusahaan sudah mengatur lokasi dan pelamar telah mengizinkan akses GPS.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail dialog ────────────────────────────────────────────────────────────

function DetailDialog({
  app,
  onClose,
  onStatusChange,
  onShowMap,
  distance,
}: {
  app: StoredApplication | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AppStatus) => void;
  onShowMap: (app: StoredApplication) => void;
  distance: number | null;
}) {
  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-black/95 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Detail Lamaran</DialogTitle>
          <DialogDescription className="text-gray-400">
            ID: <span className="font-mono text-xs text-primary">{app.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Status + change */}
        <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Status:</span>
            <Badge variant="outline" className={STATUS_CONFIG[app.status].className}>
              {STATUS_CONFIG[app.status].label}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1 border-white/20 text-gray-300 hover:bg-white/10">
                Ubah Status <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-black/95 border-white/10 text-white">
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatusChange(app.id, s)}
                  className={`hover:bg-white/10 ${app.status === s ? "font-semibold text-primary" : ""}`}
                >
                  {STATUS_CONFIG[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          {/* Left Column: Job & Applicant Info */}
          <div className="space-y-5">
            {/* Job info */}
            <div className="space-y-2 bg-white/5 p-4 rounded-lg border border-white/5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Posisi Dilamar</p>
              <p className="font-bold text-base text-primary leading-snug">{app.jobTitle}</p>
              <p className="text-sm text-gray-300 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-muted-foreground" />{app.company}
              </p>
              <p className="text-sm text-gray-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-muted-foreground" />{app.location}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                <Clock className="w-3.5 h-3.5" />{formatDate(app.submittedAt)}
              </p>
            </div>

            {/* Applicant */}
            <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Data Pelamar</p>
              <p className="font-bold text-lg">{app.applicant.fullName}</p>
              
              {/* FIXED: Changed p to div to fix DOM nesting warning */}
              {app.applicant.locationName && (
                <div className="text-sm text-gray-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{app.applicant.locationName}</span>
                  {distance !== null && (
                    <Badge variant="outline" className="ml-2 text-[10px] py-0 px-1.5 border-primary/40 text-primary shrink-0">
                      {formatDistance(distance)}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-2 pt-1">
                {[
                  { icon: Mail, text: app.applicant.email },
                  { icon: Phone, text: app.applicant.phone },
                  ...(app.applicant.linkedin ? [{ icon: Linkedin, text: app.applicant.linkedin }] : []),
                  ...(app.applicant.portfolio ? [{ icon: Globe, text: app.applicant.portfolio }] : []),
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <a href={text.startsWith("http") ? text : `mailto:${text}`} target="_blank" rel="noopener noreferrer"
                      className="hover:text-primary transition-colors truncate max-w-full">{text}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability & Salary */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-lg border border-white/5 text-sm">
              {[
                { label: "Ekspektasi Gaji", value: app.application.expectedSalary || "—" },
                { label: "Ketersediaan", value: app.application.availability },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</p>
                  <p className="font-semibold text-gray-100">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Resume & Cover Letter */}
          <div className="space-y-5 flex flex-col h-full">
            {app.application.resumeUrl && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Resume / CV</p>
                <a href={app.application.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline bg-primary/10 border border-primary/20 rounded-lg px-4 py-2 hover:bg-primary/20 transition-colors w-full justify-center">
                  <FileText className="w-4 h-4" />
                  Lihat & Unduh CV
                </a>
              </div>
            )}

            <div className="bg-white/5 p-4 rounded-lg border border-white/5 flex-1 flex flex-col min-h-[180px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Cover Letter</p>
              <div className="text-sm leading-relaxed text-gray-300 whitespace-pre-wrap bg-white/5 border border-white/10 rounded-lg p-3 overflow-y-auto max-h-[220px] flex-1">
                {app.application.coverLetter}
              </div>
            </div>

            {/* Map button */}
            <Button
              variant="outline"
              className="w-full gap-2 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white py-5"
              onClick={() => onShowMap(app)}
            >
              <MapPin className="w-4 h-4 text-primary" />
              Lihat Rute / Lokasi di Peta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

type SortField = "date" | "distance" | "name";
type SortDir = "asc" | "desc";

export function ApplicationsClient({
  initialApplications,
  userRole = "MITRA",
  companyLocation = null,
  companyLocations = {},
}: {
  initialApplications: StoredApplication[];
  userRole?: "ADMIN" | "MITRA";
  companyLocation?: { lat: number; lng: number; name: string } | null;
  companyLocations?: Record<string, { lat: number; lng: number; name: string }>;
}) {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
  const [positionFilter, setPositionFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [viewing, setViewing] = useState<StoredApplication | null>(null);
  const [mapApp, setMapApp] = useState<StoredApplication | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setApps(initialApplications);
    setMounted(true);
  }, [initialApplications]);

  // Get company location for a specific app
  function getCompanyLocationForApp(app: StoredApplication) {
    if (userRole === "MITRA") return companyLocation;
    if (userRole === "ADMIN" && app.companyId && companyLocations[app.companyId]) {
      return companyLocations[app.companyId];
    }
    return null;
  }

  // Calculate distance for an app
  function getDistanceForApp(app: StoredApplication): number | null {
    const compLoc = getCompanyLocationForApp(app);
    if (!compLoc || !app.applicant.latitude || !app.applicant.longitude) return null;
    return calculateDistance(compLoc.lat, compLoc.lng, app.applicant.latitude, app.applicant.longitude);
  }

  // Unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = [...new Set(apps.map((a) => a.jobTitle))];
    return positions.sort();
  }, [apps]);

  // Unique companies for admin filter
  const uniqueCompanies = useMemo(() => {
    const companies = [...new Set(apps.map((a) => a.company))];
    return companies.sort();
  }, [apps]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let result = apps.filter((a) => {
      const matchQuery =
        !q ||
        a.applicant.fullName.toLowerCase().includes(q) ||
        a.applicant.email.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      const matchPosition = positionFilter === "all" || a.jobTitle === positionFilter;
      const matchCompany = companyFilter === "all" || a.company === companyFilter;
      return matchQuery && matchStatus && matchPosition && matchCompany;
    });

    // Sort
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === "date") {
        cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
      } else if (sortField === "distance") {
        const dA = getDistanceForApp(a);
        const dB = getDistanceForApp(b);
        // null distances go to the end
        if (dA === null && dB === null) cmp = 0;
        else if (dA === null) cmp = 1;
        else if (dB === null) cmp = -1;
        else cmp = dA - dB;
      } else if (sortField === "name") {
        cmp = a.applicant.fullName.localeCompare(b.applicant.fullName);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apps, query, statusFilter, positionFilter, companyFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: apps.length,
    submitted: apps.filter((a) => a.status === "submitted").length,
    reviewing: apps.filter((a) => a.status === "reviewing").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  async function handleStatusChange(id: string, status: AppStatus) {
    try {
      const dbStatusMap: Record<string, string> = {
        submitted: "PENDING",
        reviewing: "REVIEWING",
        accepted: "ACCEPTED",
        rejected: "REJECTED",
      };
      const dbStatus = dbStatusMap[status];

      const res = await updateApplicationStatusAction(id, dbStatus);
      if (!res.success) {
        toast.error(res.error || "Gagal mengubah status.");
        return;
      }

      const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
      setApps(updated);
      if (viewing?.id === id) setViewing({ ...viewing, status });
      toast.success(`Status diubah menjadi ${STATUS_CONFIG[status].label}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "distance" ? "asc" : "desc");
    }
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Job Applications</h1>
        <p className="text-muted-foreground">Kelola semua lamaran yang masuk dari halaman karir.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "" },
          { label: "Submitted", value: stats.submitted, color: "text-blue-400" },
          { label: "Reviewing", value: stats.reviewing, color: "text-amber-400" },
          { label: "Accepted", value: stats.accepted, color: "text-green-400" },
          { label: "Rejected", value: stats.rejected, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="border rounded-lg bg-card p-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau posisi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Position filter */}
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter Posisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Posisi</SelectItem>
              {uniquePositions.map((pos) => (
                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Company filter — admin only */}
          {userRole === "ADMIN" && (
            <Select value={companyFilter} onValueChange={setCompanyFilter}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filter Perusahaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Perusahaan</SelectItem>
                {uniqueCompanies.map((comp) => (
                  <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Status filter + sort */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2 flex-wrap">
            {(["all", ...STATUS_OPTIONS] as const).map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
              >
                {s === "all" ? "Semua" : STATUS_CONFIG[s].label}
              </Button>
            ))}
          </div>

          {/* Sort buttons */}
          <div className="flex gap-1.5 items-center">
            <span className="text-xs text-muted-foreground mr-1">Urutkan:</span>
            {([
              { field: "date" as SortField, label: "Tanggal" },
              { field: "distance" as SortField, label: "Jarak" },
              { field: "name" as SortField, label: "Nama" },
            ]).map(({ field, label }) => (
              <Button
                key={field}
                variant={sortField === field ? "default" : "outline"}
                size="sm"
                className="gap-1 text-xs h-7"
                onClick={() => toggleSort(field)}
              >
                {label}
                {sortField === field && (
                  <ArrowUpDown className="w-3 h-3" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan <strong>{filtered.length}</strong> dari {apps.length} lamaran
        {sortField === "distance" && (
          <span className="ml-1">
            (diurutkan berdasarkan jarak {sortDir === "asc" ? "terdekat" : "terjauh"})
          </span>
        )}
      </p>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Pelamar</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead
                className="cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleSort("distance")}
              >
                <span className="flex items-center gap-1">
                  Jarak
                  <ArrowUpDown className="w-3 h-3" />
                </span>
              </TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  {apps.length === 0
                    ? "Belum ada lamaran yang masuk."
                    : "Tidak ada lamaran yang sesuai filter."}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app) => {
                const dist = getDistanceForApp(app);
                return (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {app.id.split("-")[0].toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{app.applicant.fullName}</p>
                      <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                      {app.applicant.locationName && (
                        <p className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                          <MapPin className="w-3 h-3" />{app.applicant.locationName}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{app.jobTitle}</p>
                      <p className="text-xs text-muted-foreground">{app.company}</p>
                    </TableCell>
                    <TableCell>
                      {dist !== null ? (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            dist < 10
                              ? "border-green-500/40 text-green-400"
                              : dist < 50
                              ? "border-amber-500/40 text-amber-400"
                              : "border-red-500/40 text-red-400"
                          }`}
                        >
                          {formatDistance(dist)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(app.submittedAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[app.status].className}`}>
                        {STATUS_CONFIG[app.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewing(app)}
                          title="Lihat detail"
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMapApp(app)}
                          title="Lihat lokasi di peta"
                          className="text-primary"
                        >
                          <MapPin size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DetailDialog
        app={viewing}
        onClose={() => setViewing(null)}
        onStatusChange={handleStatusChange}
        onShowMap={(app) => {
          setViewing(null);
          setMapApp(app);
        }}
        distance={viewing ? getDistanceForApp(viewing) : null}
      />

      <MapModal
        open={!!mapApp}
        onClose={() => setMapApp(null)}
        applicantName={mapApp?.applicant.fullName || ""}
        applicantLocation={
          mapApp?.applicant.latitude && mapApp?.applicant.longitude
            ? {
                lat: mapApp.applicant.latitude,
                lng: mapApp.applicant.longitude,
                name: mapApp.applicant.locationName || "Pelamar",
              }
            : null
        }
        companyLocation={mapApp ? getCompanyLocationForApp(mapApp) : null}
      />
    </div>
  );
}
