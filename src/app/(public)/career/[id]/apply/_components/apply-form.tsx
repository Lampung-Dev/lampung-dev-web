"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Send,
  User,
  Mail,
  Phone,
  Linkedin,
  Globe,
  FileText,
  DollarSign,
  CalendarClock,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { type Job } from "../../../_data/jobs";

// ─── Schema ──────────────────────────────────────────────────────────────────

const applySchema = z.object({
  fullName: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z
    .string()
    .min(9, "Nomor telepon minimal 9 digit")
    .max(15, "Nomor telepon terlalu panjang")
    .regex(/^[0-9+\-\s()]+$/, "Format nomor telepon tidak valid"),
  linkedin: z
    .string()
    .url("URL LinkedIn tidak valid")
    .optional()
    .or(z.literal("")),
  portfolio: z
    .string()
    .url("URL Portfolio tidak valid")
    .optional()
    .or(z.literal("")),
  resumeUrl: z
    .string()
    .min(1, "Link resume wajib diisi")
    .url("URL resume tidak valid"),
  expectedSalary: z.string().optional(),
  availability: z.enum(
    ["Segera", "1 minggu", "2 minggu", "1 bulan", "Lebih dari 1 bulan"],
    { message: "Pilih ketersediaan mulai kerja" }
  ),
  coverLetter: z
    .string()
    .min(50, "Cover letter minimal 50 karakter")
    .max(2000, "Cover letter maksimal 2000 karakter"),
});

type ApplyFormValues = z.infer<typeof applySchema>;

// ─── JSON payload type (mirrors future API contract) ─────────────────────────

export interface JobApplicationPayload {
  id: string;
  jobId: number;
  jobTitle: string;
  company: string;
  category: string;
  location: string;
  submittedAt: string;
  status: "submitted";
  applicant: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    portfolio: string;
  };
  application: {
    resumeUrl: string;
    expectedSalary: string;
    availability: string;
    coverLetter: string;
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "lampung_dev_job_applications";

function saveApplication(payload: JobApplicationPayload) {
  try {
    const existing: JobApplicationPayload[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    existing.push(payload);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing, null, 2));
  } catch {
    // silent — storage may be blocked
  }
}

function buildPayload(
  values: ApplyFormValues,
  job: Job
): JobApplicationPayload {
  return {
    id: crypto.randomUUID(),
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    category: job.category,
    location: job.location,
    submittedAt: new Date().toISOString(),
    status: "submitted",
    applicant: {
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      linkedin: values.linkedin ?? "",
      portfolio: values.portfolio ?? "",
    },
    application: {
      resumeUrl: values.resumeUrl,
      expectedSalary: values.expectedSalary ?? "",
      availability: values.availability,
      coverLetter: values.coverLetter,
    },
  };
}

// ─── Success Dialog ───────────────────────────────────────────────────────────

function SuccessDialog({
  open,
  payload,
}: {
  open: boolean;
  payload: JobApplicationPayload | null;
}) {
  const [copied, setCopied] = useState(false);

  function copyId() {
    if (!payload) return;
    navigator.clipboard.writeText(payload.id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-black/95 border-white/10 text-white max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Lamaran Berhasil Dikirim</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              Lamaran Berhasil Dikirim! 🎉
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Lamaranmu untuk posisi{" "}
              <span className="text-white font-medium">{payload?.jobTitle}</span>{" "}
              di{" "}
              <span className="text-white font-medium">{payload?.company}</span>{" "}
              telah kami terima.
            </p>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-lg p-4 space-y-3 text-left">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
              Detail Lamaran
            </p>
            {[
              { label: "ID Lamaran", value: payload?.id.split("-")[0].toUpperCase() },
              { label: "Posisi", value: payload?.jobTitle },
              { label: "Perusahaan", value: payload?.company },
              { label: "Tanggal", value: payload ? new Date(payload.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "" },
              { label: "Status", value: "✅ Submitted" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4 text-sm">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="text-gray-200 text-right break-all">{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={copyId}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "ID Disalin!" : "Salin ID Lamaran Lengkap"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Tim HR akan menghubungimu via email{" "}
            <span className="text-gray-300">{payload?.applicant.email}</span>{" "}
            dalam 3–5 hari kerja.
          </p>
        </div>

        <Separator className="bg-white/10" />

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link href="/career" className="flex-1">
            <Button
              variant="outline"
              className="w-full border-white/20 text-gray-300 hover:bg-white/10"
            >
              Lihat Lowongan Lain
            </Button>
          </Link>
          <Link href={`/career/${payload?.jobId}`} className="flex-1">
            <Button className="w-full bg-primary hover:bg-primary/90">
              Kembali ke Detail
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-white/10 rounded-xl p-6 backdrop-blur-sm bg-white/5 space-y-5">
      <h3 className="font-semibold text-white border-b border-white/10 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function ApplyForm({ job }: { job: Job }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successPayload, setSuccessPayload] =
    useState<JobApplicationPayload | null>(null);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      portfolio: "",
      resumeUrl: "",
      expectedSalary: "",
      availability: undefined,
      coverLetter: "",
    },
  });

  const coverLetterValue = form.watch("coverLetter");

  async function onSubmit(values: ApplyFormValues) {
    setIsSubmitting(true);
    try {
      // Simulate network delay (remove when wiring real API)
      await new Promise((r) => setTimeout(r, 1200));

      const payload = buildPayload(values, job);
      saveApplication(payload);

      // TODO: replace with real API call
      // await fetch("/api/job-applications", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      setSuccessPayload(payload);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <FormSection title="1. Informasi Pribadi">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-gray-200">
                      Nama Lengkap <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Masukkan nama lengkap"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Email <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type="email"
                          placeholder="nama@email.com"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Nomor Telepon <span className="text-red-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          type="tel"
                          placeholder="+62812xxxxxxxx"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      LinkedIn{" "}
                      <span className="text-gray-500 font-normal">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="https://linkedin.com/in/username"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Portfolio / Website{" "}
                      <span className="text-gray-500 font-normal">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="https://portofolio.dev"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Application Details */}
          <FormSection title="2. Detail Lamaran">
            <FormField
              control={form.control}
              name="resumeUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">
                    Link Resume / CV <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        placeholder="https://drive.google.com/file/..."
                        className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-gray-500 text-xs">
                    Upload CV ke Google Drive / Notion / Dropbox lalu tempel linknya di sini.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expectedSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Ekspektasi Gaji{" "}
                      <span className="text-gray-500 font-normal">(opsional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          placeholder="Rp 5.000.000"
                          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      Ketersediaan Mulai Kerja{" "}
                      <span className="text-red-400">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <CalendarClock className="w-4 h-4 mr-2 text-gray-500 shrink-0" />
                          <SelectValue placeholder="Pilih ketersediaan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black/90 border-white/20 text-white">
                        {[
                          "Segera",
                          "1 minggu",
                          "2 minggu",
                          "1 bulan",
                          "Lebih dari 1 bulan",
                        ].map((opt) => (
                          <SelectItem
                            key={opt}
                            value={opt}
                            className="focus:bg-white/10 focus:text-white"
                          >
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </FormSection>

          {/* Cover Letter */}
          <FormSection title="3. Cover Letter">
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">
                    Cover Letter <span className="text-red-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={`Ceritakan mengapa kamu tertarik dengan posisi ${job.title} di ${job.company}. Jelaskan pengalaman relevan dan apa yang bisa kamu kontribusikan untuk tim...`}
                      rows={7}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-between">
                    <FormMessage />
                    <span
                      className={`text-xs ml-auto ${
                        (coverLetterValue?.length ?? 0) > 2000
                          ? "text-red-400"
                          : (coverLetterValue?.length ?? 0) >= 50
                          ? "text-green-400"
                          : "text-gray-500"
                      }`}
                    >
                      {coverLetterValue?.length ?? 0} / 2000
                    </span>
                  </div>
                </FormItem>
              )}
            />
          </FormSection>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href={`/career/${job.id}`} className="sm:w-auto">
              <Button
                type="button"
                variant="outline"
                className="w-full border-white/20 text-gray-300 hover:bg-white/10"
              >
                Batal
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim Lamaran...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Lamaran Sekarang
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <SuccessDialog open={!!successPayload} payload={successPayload} />
    </>
  );
}
