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
} from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { type JobApplicationPayload } from "@/app/(public)/career/[id]/apply/_components/apply-form";

// ─── Types & helpers ──────────────────────────────────────────────────────────

type AppStatus = "submitted" | "reviewing" | "accepted" | "rejected";

type StoredApplication = Omit<JobApplicationPayload, "status"> & {
  status: AppStatus;
};

const STORAGE_KEY = "lampung_dev_job_applications";

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

function loadApplications(): StoredApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredApplication[]) : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: StoredApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Detail dialog ────────────────────────────────────────────────────────────

function DetailDialog({
  app,
  onClose,
  onStatusChange,
}: {
  app: StoredApplication | null;
  onClose: () => void;
  onStatusChange: (id: string, status: AppStatus) => void;
}) {
  if (!app) return null;

  return (
    <Dialog open={!!app} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Lamaran</DialogTitle>
          <DialogDescription>
            ID: <span className="font-mono text-xs">{app.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Status + change */}
        <div className="flex items-center justify-between gap-3">
          <Badge variant="outline" className={STATUS_CONFIG[app.status].className}>
            {STATUS_CONFIG[app.status].label}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                Ubah Status <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => onStatusChange(app.id, s)}
                  className={app.status === s ? "font-semibold" : ""}
                >
                  {STATUS_CONFIG[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator />

        {/* Job info */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Posisi Dilamar</p>
          <p className="font-semibold">{app.jobTitle}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" />{app.company}
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />{app.location}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />{formatDate(app.submittedAt)}
          </p>
        </div>

        <Separator />

        {/* Applicant */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Data Pelamar</p>
          <p className="font-semibold">{app.applicant.fullName}</p>
          {[
            { icon: Mail, text: app.applicant.email },
            { icon: Phone, text: app.applicant.phone },
            ...(app.applicant.linkedin ? [{ icon: Linkedin, text: app.applicant.linkedin }] : []),
            ...(app.applicant.portfolio ? [{ icon: Globe, text: app.applicant.portfolio }] : []),
          ].map(({ icon: Icon, text }, i) => (
            <p key={i} className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <a href={text.startsWith("http") ? text : `mailto:${text}`} target="_blank" rel="noopener noreferrer"
                className="hover:text-foreground truncate">{text}</a>
            </p>
          ))}
        </div>

        <Separator />

        {/* Application detail */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Detail Lamaran</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: "Ekspektasi Gaji", value: app.application.expectedSalary || "—" },
              { label: "Ketersediaan", value: app.application.availability },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
          {app.application.resumeUrl && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Resume / CV</p>
              <a href={app.application.resumeUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                <FileText className="w-3.5 h-3.5" />
                Lihat CV
              </a>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cover Letter</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-lg p-3">
              {app.application.coverLetter}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function ApplicationsClient() {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "all">("all");
  const [viewing, setViewing] = useState<StoredApplication | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setApps(loadApplications());
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return apps.filter((a) => {
      const matchQuery =
        !q ||
        a.applicant.fullName.toLowerCase().includes(q) ||
        a.applicant.email.toLowerCase().includes(q) ||
        a.jobTitle.toLowerCase().includes(q) ||
        a.company.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [apps, query, statusFilter]);

  const stats = useMemo(() => ({
    total: apps.length,
    submitted: apps.filter((a) => a.status === "submitted").length,
    reviewing: apps.filter((a) => a.status === "reviewing").length,
    accepted: apps.filter((a) => a.status === "accepted").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  }), [apps]);

  function handleStatusChange(id: string, status: AppStatus) {
    const updated = apps.map((a) => (a.id === id ? { ...a, status } : a));
    saveApplications(updated);
    setApps(updated);
    if (viewing?.id === id) setViewing({ ...viewing, status });
    toast.success(`Status diubah menjadi ${STATUS_CONFIG[status].label}`);
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
      </div>

      <p className="text-sm text-muted-foreground">
        Menampilkan <strong>{filtered.length}</strong> dari {apps.length} lamaran
      </p>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Pelamar</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Ketersediaan</TableHead>
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
              filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {app.id.split("-")[0].toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{app.applicant.fullName}</p>
                    <p className="text-xs text-muted-foreground">{app.applicant.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{app.jobTitle}</p>
                    <p className="text-xs text-muted-foreground">{app.company}</p>
                  </TableCell>
                  <TableCell className="text-sm">{app.application.availability}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(app.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${STATUS_CONFIG[app.status].className}`}>
                      {STATUS_CONFIG[app.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewing(app)}
                    >
                      <Eye size={15} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DetailDialog
        app={viewing}
        onClose={() => setViewing(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
