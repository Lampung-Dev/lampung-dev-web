"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";


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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

import { TSponsor } from "@/services/sponsor";
import {
  createSponsorAction,
  updateSponsorAction,
  deleteSponsorAction,
} from "@/actions/sponsors/sponsor-actions";

const CATEGORY_LABELS: Record<string, string> = {
  HIGH_PRIORITY: "High Priority",
  GOLD: "Gold",
  SILVER: "Silver",
  COMMUNITY_PARTNER: "Community Partner",
};

const CATEGORY_COLORS: Record<string, string> = {
  HIGH_PRIORITY: "bg-gradient-to-r from-amber-500 to-orange-500",
  GOLD: "bg-yellow-500",
  SILVER: "bg-gray-400",
  COMMUNITY_PARTNER: "bg-blue-500",
};

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(200, "Maksimal 200 karakter"),
  logoUrl: z.string().min(1, "Logo wajib diupload"),
  websiteUrl: z.string().url("URL tidak valid").optional().or(z.literal("")),
  category: z.enum(["HIGH_PRIORITY", "GOLD", "SILVER", "COMMUNITY_PARTNER"]),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().int().min(0).default(0),
});

type SponsorFormValues = {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  category: "HIGH_PRIORITY" | "GOLD" | "SILVER" | "COMMUNITY_PARTNER";
  description?: string;
  isActive: boolean;
  displayOrder: number;
};

export default function SponsorsClient({
  sponsors,
}: {
  sponsors: TSponsor[];
}) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<TSponsor | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        form.setValue("logoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<SponsorFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      logoUrl: "",
      websiteUrl: "",
      category: "GOLD",
      description: "",
      isActive: true,
      displayOrder: 0,
    },
  });

  const onSubmit = async (values: SponsorFormValues) => {
    setLoading(true);
    try {
      let finalLogoUrl = values.logoUrl;

      // Upload logo if changed/selected
      if (logoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", logoFile);

        const uploadRes = await fetch("/api/upload/sponsor", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadRes.ok) throw new Error("Gagal mengunggah logo");
        const uploadData = await uploadRes.json();
        finalLogoUrl = uploadData.url;
      }

      if (!finalLogoUrl) {
        throw new Error("Logo sponsor wajib diunggah");
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("logoUrl", finalLogoUrl);
      if (values.websiteUrl) formData.append("websiteUrl", values.websiteUrl);
      formData.append("category", values.category);
      if (values.description) formData.append("description", values.description);
      formData.append("isActive", values.isActive.toString());
      formData.append("displayOrder", values.displayOrder.toString());

      if (editingSponsor) {
        formData.append("sponsorId", editingSponsor.id);
        await updateSponsorAction(formData);
        toast.success("Sponsor berhasil diperbarui");
      } else {
        await createSponsorAction(formData);
        toast.success("Sponsor berhasil ditambahkan");
      }

      setIsCreateOpen(false);
      setEditingSponsor(null);
      setLogoFile(null);
      setLogoPreview(null);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sponsor: TSponsor) => {
    setEditingSponsor(sponsor);
    setLogoPreview(sponsor.logoUrl);
    setLogoFile(null);
    form.reset({
      name: sponsor.name,
      logoUrl: sponsor.logoUrl,
      websiteUrl: sponsor.websiteUrl || "",
      category: sponsor.category as SponsorFormValues["category"],
      description: sponsor.description || "",
      isActive: sponsor.isActive,
      displayOrder: sponsor.displayOrder,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteSponsorAction(id);
      toast.success("Sponsor berhasil dihapus");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sponsor Management</h1>
          <p className="text-muted-foreground">
            Kelola sponsor dan partner komunitas LampungDev
          </p>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setEditingSponsor(null);
              setLogoFile(null);
              setLogoPreview(null);
              form.reset({
                name: "",
                logoUrl: "",
                websiteUrl: "",
                category: "GOLD",
                description: "",
                isActive: true,
                displayOrder: 0,
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 border-0">
              <Plus size={16} />
              Tambah Sponsor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSponsor ? "Edit Sponsor" : "Tambah Sponsor Baru"}
              </DialogTitle>
              <DialogDescription>
                {editingSponsor
                  ? "Perbarui informasi sponsor."
                  : "Tambahkan sponsor baru ke website LampungDev."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                {/* Name */}
                <FormField
                  control={form.control as any}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sponsor</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Contoh: Jetorbit"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Logo Upload */}
                <FormField
                  control={form.control as any}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo Sponsor</FormLabel>
                      <div className="space-y-3">
                        {logoPreview && (
                          <div className="relative w-full h-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              width={200}
                              height={80}
                              className="object-contain max-h-20"
                            />
                          </div>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById("logo-upload")?.click()}
                        >
                          {logoPreview ? "Ganti Logo" : "Upload Logo"}
                        </Button>
                        <FormControl>
                          <Input
                            placeholder="Atau masukkan URL logo langsung..."
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              setLogoPreview(e.target.value || null);
                            }}
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Upload logo atau masukkan URL gambar. Ukuran yang disarankan: 400x200px.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control as any}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori sponsor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HIGH_PRIORITY">⭐ High Priority</SelectItem>
                          <SelectItem value="GOLD">🥇 Gold</SelectItem>
                          <SelectItem value="SILVER">🥈 Silver</SelectItem>
                          <SelectItem value="COMMUNITY_PARTNER">🤝 Community Partner</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Kategori menentukan ukuran dan posisi logo di halaman publik.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Website URL */}
                <FormField
                  control={form.control as any}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (opsional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://jetorbit.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Logo akan dapat diklik menuju website sponsor.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control as any}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi (opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Contoh: Penyedia layanan VPS dan hosting terpercaya"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Display Order */}
                <FormField
                  control={form.control as any}
                  name="displayOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urutan Tampil</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Angka lebih kecil tampil lebih dulu dalam kategori yang sama.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Active */}
                <FormField
                  control={form.control as any}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Status Aktif</FormLabel>
                        <FormDescription>
                          Sponsor aktif akan tampil di halaman publik.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Button
                          type="button"
                          variant={field.value ? "default" : "outline"}
                          size="sm"
                          className={field.value ? "bg-green-600 hover:bg-green-700" : ""}
                          onClick={() => field.onChange(!field.value)}
                        >
                          {field.value ? (
                            <><Eye size={14} className="mr-1" /> Aktif</>
                          ) : (
                            <><EyeOff size={14} className="mr-1" /> Nonaktif</>
                          )}
                        </Button>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingSponsor ? "Simpan Perubahan" : "Tambah Sponsor"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Urutan</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sponsors.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada sponsor yang ditambahkan.
                </TableCell>
              </TableRow>
            ) : (
              sponsors.map((sponsor) => (
                <TableRow key={sponsor.id}>
                  <TableCell>
                    <div className="relative w-12 h-12 rounded-md border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                      <Image
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{sponsor.name}</span>
                      {sponsor.websiteUrl && (
                        <a
                          href={sponsor.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink size={10} />
                          {sponsor.websiteUrl}
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`text-white border-0 ${CATEGORY_COLORS[sponsor.category] || "bg-gray-500"}`}
                    >
                      {CATEGORY_LABELS[sponsor.category] || sponsor.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sponsor.isActive ? (
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-500 text-gray-500">
                        Nonaktif
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {sponsor.displayOrder}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(sponsor)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Hapus Sponsor?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah kamu yakin ingin menghapus sponsor{" "}
                              <strong>&ldquo;{sponsor.name}&rdquo;</strong>? Aksi ini tidak
                              dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(sponsor.id)}
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
    </div>
  );
}
