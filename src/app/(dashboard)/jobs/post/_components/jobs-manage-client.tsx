"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Briefcase,
  Users,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { type TJob } from "@/lib/database/schema";
import { JOB_CATEGORIES } from "@/app/(public)/jobs/_data/jobs";

type SerializedTJob = Omit<TJob, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
};
import { createJobAction } from "@/actions/jobs/create-job-action";
import { updateJobAction } from "@/actions/jobs/update-job-action";
import { deleteJobAction } from "@/actions/jobs/delete-job-action";
import { getRelativeTime } from "@/lib/date";

// ─── Schema ───────────────────────────────────────────────────────────────────

const jobSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  company: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  location: z.string().min(2, "Lokasi wajib diisi"),
  category: z.string().optional().or(z.literal("")),
  type: z.enum(["Penuh Waktu", "Paruh Waktu", "Magang", "Remote"]),
  salary: z.string().min(1, "Rentang gaji wajib diisi"),
  experience: z.string().min(1, "Pengalaman wajib diisi"),
  education: z.string().min(1, "Pendidikan wajib diisi"),
  skills: z.string().min(1, "Minimal satu skill wajib diisi"),
  isPremium: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  responsibilities: z.string().min(10, "Tanggung jawab wajib diisi"),
  requirements: z.string().min(10, "Persyaratan wajib diisi"),
  benefits: z.string().min(10, "Benefit wajib diisi"),
});

type JobFormValues = z.infer<typeof jobSchema>;

const TYPE_BADGE: Record<string, string> = {
  "Penuh Waktu": "border-blue-500/40 text-blue-400",
  "Paruh Waktu": "border-amber-500/40 text-amber-400",
  Magang: "border-purple-500/40 text-purple-400",
  Remote: "border-green-500/40 text-green-400",
};

// ─── Form Dialog ──────────────────────────────────────────────────────────────

function JobFormDialog({
  open,
  onOpenChange,
  editing,
  onSubmit,
  loading,
  userCompany,
  categories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: SerializedTJob | null;
  onSubmit: (values: JobFormValues) => Promise<void>;
  loading: boolean;
  userCompany?: { id: string; name: string; initial: string } | null;
  categories: { id: string; name: string; slug: string }[];
}) {
  const form = useForm<JobFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(jobSchema) as any,
    defaultValues: {
      title: "",
      company: userCompany?.name || "",
      location: "",
      category: "none",
      type: "Penuh Waktu",
      salary: "",
      experience: "",
      education: "",
      skills: "",
      isPremium: false,
      isFeatured: false,
      isActive: true,
      description: "",
      responsibilities: "",
      requirements: "",
      benefits: "",
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        title: editing.title,
        company: editing.company,
        location: editing.location,
        category: editing.category || "none",
        type: editing.type,
        salary: editing.salary,
        experience: editing.experience,
        education: editing.education,
        skills: (editing.skills as string[]).join(", "),
        isPremium: editing.isPremium,
        isFeatured: editing.isFeatured ?? false,
        isActive: editing.isActive,
        description: editing.description,
        responsibilities: (editing.responsibilities as string[]).join("\n"),
        requirements: (editing.requirements as string[]).join("\n"),
        benefits: (editing.benefits as string[]).join("\n"),
      });
    } else {
      form.reset({
        title: "",
        company: userCompany?.name || "",
        location: "",
        category: "Web Development",
        type: "Penuh Waktu",
        salary: "",
        experience: "",
        education: "",
        skills: "",
        isPremium: false,
        isFeatured: false,
        isActive: true,
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: "",
      });
    }
  }, [editing, form, open, userCompany?.name]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Lowongan" : "Tambah Lowongan Baru"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Perbarui informasi lowongan kerja."
              : "Isi form untuk menambahkan lowongan baru ke database."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Judul Posisi</FormLabel>
                  <FormControl><Input placeholder="Frontend Developer (React)" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="company" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <FormControl><Input placeholder="PT Contoh Indonesia" disabled={!!userCompany} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl><Input placeholder="Bandar Lampung" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori (opsional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Pilih Kategori (opsional)</SelectItem>
                      {(categories.length > 0 ? categories : JOB_CATEGORIES).map((c) => (
                        <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Pekerjaan</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {["Penuh Waktu", "Paruh Waktu", "Magang", "Remote"].map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="salary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rentang Gaji</FormLabel>
                  <FormControl><Input placeholder="Rp 5jt–8jt" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="experience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pengalaman</FormLabel>
                  <FormControl><Input placeholder="1–3 tahun" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="education" render={({ field }) => (
                <FormItem>
                  <FormLabel>Pendidikan Minimal</FormLabel>
                  <FormControl><Input placeholder="D3/S1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="skills" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Skills</FormLabel>
                  <FormControl><Input placeholder="React, TypeScript, Tailwind CSS" {...field} /></FormControl>
                  <FormDescription>Pisahkan dengan koma.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-3 gap-3">
              <FormField control={form.control} name="isPremium" render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <FormLabel>Premium</FormLabel>
                    <FormDescription className="text-xs">Badge premium</FormDescription>
                  </div>
                  <FormControl>
                    <Button type="button" variant={field.value ? "default" : "outline"} size="sm"
                      className={field.value ? "bg-amber-500 hover:bg-amber-600" : ""}
                      onClick={() => field.onChange(!field.value)}>
                      {field.value ? "Ya" : "Tidak"}
                    </Button>
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="isFeatured" render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <FormLabel>Pilihan</FormLabel>
                    <FormDescription className="text-xs">Lowongan pilihan</FormDescription>
                  </div>
                  <FormControl>
                    <Button type="button" variant={field.value ? "default" : "outline"} size="sm"
                      className={field.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => field.onChange(!field.value)}>
                      {field.value ? <><Star className="w-3 h-3 mr-1" />Ya</> : "Tidak"}
                    </Button>
                  </FormControl>
                </FormItem>
              )} />

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <FormLabel>Status</FormLabel>
                    <FormDescription className="text-xs">Tampil publik</FormDescription>
                  </div>
                  <FormControl>
                    <Button type="button" variant={field.value ? "default" : "outline"} size="sm"
                      className={field.value ? "bg-green-600 hover:bg-green-700" : ""}
                      onClick={() => field.onChange(!field.value)}>
                      {field.value ? <><Eye className="w-3 h-3 mr-1" />Aktif</> : <><EyeOff className="w-3 h-3 mr-1" />Nonaktif</>}
                    </Button>
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Deskripsi Pekerjaan</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ceritakan tentang posisi ini dan perusahaan..." rows={4} className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="responsibilities" render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggung Jawab</FormLabel>
                <FormControl>
                  <Textarea placeholder={"Mengembangkan fitur baru\nMelakukan code review\nBerkolaborasi dengan tim"} rows={4} className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Satu poin per baris.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="requirements" render={({ field }) => (
              <FormItem>
                <FormLabel>Persyaratan</FormLabel>
                <FormControl>
                  <Textarea placeholder={"Pengalaman minimal 1 tahun\nMahir dalam React.js"} rows={4} className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Satu poin per baris.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="benefits" render={({ field }) => (
              <FormItem>
                <FormLabel>Benefit</FormLabel>
                <FormControl>
                  <Textarea placeholder={"Gaji kompetitif\nBPJS Kesehatan\nRemote working"} rows={3} className="resize-none" {...field} />
                </FormControl>
                <FormDescription>Satu poin per baris.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? "Simpan Perubahan" : "Tambah Lowongan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Application count (still localStorage for now) ───────────────────────────

function useAppCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem("lampung_dev_job_applications");
      if (!raw) return;
      const apps = JSON.parse(raw) as { jobId: string | number }[];
      const result: Record<string, number> = {};
      apps.forEach((a) => {
        const key = String(a.jobId);
        result[key] = (result[key] ?? 0) + 1;
      });
      setCounts(result);
    } catch { /* empty */ }
  }, []);
  return counts;
}

// ─── Main client ──────────────────────────────────────────────────────────────

export function JobsManageClient({
  initialJobs,
  totalJobs,
  userCompany,
  categories = [],
}: {
  initialJobs: SerializedTJob[];
  totalJobs: number;
  userCompany?: { id: string; name: string; initial: string } | null;
  categories?: { id: string; name: string; slug: string }[];
}) {
  const router = useRouter();
  const appCounts = useAppCounts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SerializedTJob | null>(null);
  const [loading, setLoading] = useState(false);

  const totalApplications = Object.values(appCounts).reduce((a, b) => a + b, 0);
  const activeCount = initialJobs.filter((j) => j.isActive).length;
  const featuredCount = initialJobs.filter((j) => j.isFeatured).length;

  const handleSubmit = useCallback(
    async (values: JobFormValues) => {
      setLoading(true);
      try {
        const companyInitial = userCompany
          ? userCompany.initial
          : (values.company
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 5)
              .toUpperCase() || values.company.slice(0, 2).toUpperCase());

        const payload = {
          title: values.title,
          company: userCompany ? userCompany.name : values.company,
          companyInitial,
          companyId: userCompany ? userCompany.id : undefined,
          location: values.location,
          category: (values.category === "none" || !values.category) ? null : values.category,
          type: values.type,
          salary: values.salary,
          experience: values.experience,
          education: values.education,
          skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
          isPremium: values.isPremium,
          isFeatured: values.isFeatured,
          isActive: values.isActive,
          description: values.description,
          responsibilities: values.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
          requirements: values.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
          benefits: values.benefits.split("\n").map((s) => s.trim()).filter(Boolean),
        };

        if (editing) {
          await updateJobAction(editing.id, payload);
          toast.success("Lowongan berhasil diperbarui");
        } else {
          await createJobAction(payload);
          toast.success("Lowongan berhasil ditambahkan");
        }

        setIsDialogOpen(false);
        setEditing(null);
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi.");
      } finally {
        setLoading(false);
      }
    },
    [editing, router, userCompany]
  );

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteJobAction(id);
      toast.success(`Lowongan "${title}" berhasil dihapus`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus lowongan");
    }
  };

  const handleToggleActive = async (job: SerializedTJob) => {
    try {
      await updateJobAction(job.id, { isActive: !job.isActive });
      toast.success(job.isActive ? "Lowongan dinonaktifkan" : "Lowongan diaktifkan");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manage Jobs</h1>
          <p className="text-muted-foreground">
            Kelola semua lowongan kerja yang dipublikasikan ke komunitas.
          </p>
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 border-0 shrink-0"
          onClick={() => { setEditing(null); setIsDialogOpen(true); }}
        >
          <Plus size={16} />
          Tambah Lowongan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Lowongan", value: totalJobs, icon: Briefcase },
          { label: "Aktif", value: activeCount, icon: Eye },
          { label: "Pilihan", value: featuredCount, icon: Star },
          { label: "Lamaran Masuk", value: totalApplications, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border rounded-lg bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posisi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Gaji</TableHead>
              <TableHead className="text-center">Lamaran</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Dibuat</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12">
                  <EmptyState
                    icon={Briefcase}
                    title="Belum Ada Lowongan Pekerjaan"
                    description="Kelola dan publikasikan lowongan pekerjaan pertama Anda ke komunitas Lampung Dev."
                    actionLabel="Tambah Lowongan"
                    onAction={() => { setEditing(null); setIsDialogOpen(true); }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              initialJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{job.title}</p>
                        {job.isPremium && (
                          <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs">
                            Premium
                          </Badge>
                        )}
                        {job.isFeatured && (
                          <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
                            Pilihan
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{job.category || "General"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs ${TYPE_BADGE[job.type] ?? ""}`}>
                      {job.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{job.location}</TableCell>
                  <TableCell className="text-sm font-medium text-green-600">{job.salary}</TableCell>
                  <TableCell className="text-center font-semibold">
                    {appCounts[job.id] ?? 0}
                  </TableCell>
                  <TableCell>
                    {job.isActive ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-500 text-gray-500">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {getRelativeTime(job.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(job)}
                        title={job.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {job.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setEditing(job); setIsDialogOpen(true); }}
                      >
                        <Pencil size={15} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 size={15} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Lowongan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah kamu yakin ingin menghapus{" "}
                              <strong>&ldquo;{job.title}&rdquo;</strong>?{" "}
                              Aksi ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(job.id, job.title)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <JobFormDialog
        open={isDialogOpen}
        onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setEditing(null); }}
        editing={editing}
        onSubmit={handleSubmit}
        loading={loading}
        userCompany={userCompany}
        categories={categories}
      />
    </div>
  );
}
