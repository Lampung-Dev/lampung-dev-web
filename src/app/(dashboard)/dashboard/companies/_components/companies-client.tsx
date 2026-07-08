"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Globe, MapPin, Link as LinkIcon, UserX } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import LeafletMap, { parseGoogleMapsUrl, type MapMarker } from "@/components/leaflet-map";

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
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/ui/alert-dialog";

import {
  createCompanyAction,
  updateCompanyAction,
  deleteCompanyAction,
  linkUserToCompanyAction,
  getUnlinkedUsersAction,
} from "@/actions/companies/company-admin-actions";

const companyFormSchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  description: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  mapsUrl: z.string().optional().or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

import { TCompany, TUser } from "@/lib/database/schema";

export type CompanyWithUsers = TCompany & {
  users?: TUser[];
};

interface CompaniesClientProps {
  initialCompanies: CompanyWithUsers[];
}

export function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyWithUsers[]>(initialCompanies);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyWithUsers | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<CompanyWithUsers | null>(null);
  const [linkingCompany, setLinkingCompany] = useState<CompanyWithUsers | null>(null);
  const [unlinkedUsers, setUnlinkedUsers] = useState<TUser[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompanies(initialCompanies);
  }, [initialCompanies]);

  // Load unlinked users when linking modal opens
  useEffect(() => {
    if (linkingCompany) {
      setUserSearchQuery("");
      getUnlinkedUsersAction().then((res) => {
        if (res.success && res.users) {
          setUnlinkedUsers(res.users as TUser[]);
          if (res.users.length > 0) {
            setSelectedUserId(res.users[0].id);
          } else {
            setSelectedUserId("");
          }
        } else {
          toast.error(res.error || "Gagal memuat daftar user.");
        }
      });
    }
  }, [linkingCompany]);

  const filteredUnlinkedUsers = useMemo(() => {
    return unlinkedUsers.filter(u =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  }, [unlinkedUsers, userSearchQuery]);

  // Auto-select first matching user on search query change
  useEffect(() => {
    if (filteredUnlinkedUsers.length > 0) {
      const exists = filteredUnlinkedUsers.some(u => u.id === selectedUserId);
      if (!exists) {
        setSelectedUserId(filteredUnlinkedUsers[0].id);
      }
    } else {
      setSelectedUserId("");
    }
  }, [filteredUnlinkedUsers, selectedUserId]);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      website: "",
      logoUrl: "",
      mapsUrl: "",
      latitude: "",
      longitude: "",
    },
  });

  useEffect(() => {
    if (editingCompany) {
      form.reset({
        name: editingCompany.name,
        description: editingCompany.description || "",
        address: editingCompany.address || "",
        website: editingCompany.website || "",
        logoUrl: editingCompany.logoUrl || "",
        mapsUrl: editingCompany.mapsUrl || "",
        latitude: editingCompany.latitude != null ? String(editingCompany.latitude) : "",
        longitude: editingCompany.longitude != null ? String(editingCompany.longitude) : "",
      });
    } else {
      form.reset({
        name: "",
        description: "",
        address: "",
        website: "",
        logoUrl: "",
        mapsUrl: "",
        latitude: "",
        longitude: "",
      });
    }
  }, [editingCompany, form]);

  const handleMapsUrlChange = useCallback((url: string) => {
    const coords = parseGoogleMapsUrl(url);
    if (coords) {
      form.setValue("latitude", String(coords.lat));
      form.setValue("longitude", String(coords.lng));
    }
  }, [form]);

  const mapPreviewMarkers = useMemo((): MapMarker[] => {
    const lat = parseFloat(form.watch("latitude") || "");
    const lng = parseFloat(form.watch("longitude") || "");
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      return [{ lat, lng, label: form.watch("name") || "Perusahaan", color: "blue" }];
    }
    return [];
  }, [form.watch("latitude"), form.watch("longitude"), form.watch("name"), form]);

  const onSubmit = async (values: CompanyFormValues) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        mapsUrl: values.mapsUrl || null,
      };
      if (editingCompany) {
        const res = await updateCompanyAction(editingCompany.id, payload);
        if (res.success) {
          toast.success("Perusahaan berhasil diperbarui");
          setIsFormOpen(false);
          setEditingCompany(null);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui perusahaan");
        }
      } else {
        const res = await createCompanyAction(payload);
        if (res.success) {
          toast.success("Perusahaan berhasil ditambahkan");
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal menambahkan perusahaan");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCompany) return;
    setLoading(true);
    try {
      const res = await deleteCompanyAction(deletingCompany.id);
      if (res.success) {
        toast.success("Perusahaan berhasil dihapus");
        setDeletingCompany(null);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus perusahaan");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = async () => {
    if (!linkingCompany || !selectedUserId) return;
    setLoading(true);
    try {
      const res = await linkUserToCompanyAction(selectedUserId, linkingCompany.id);
      if (res.success) {
        toast.success("Member berhasil ditautkan");
        setLinkingCompany(null);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menautkan member");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await linkUserToCompanyAction(userId, null);
      if (res.success) {
        toast.success("Tautan member berhasil dilepas");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal melepas tautan member");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Perusahaan / Mitra</h1>
          <p className="text-muted-foreground">
            Daftar perusahaan pemberi kerja yang terdaftar di platform Lampung Dev.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCompany(null);
            setIsFormOpen(true);
          }}
          className="gap-2 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 border-0"
        >
          <Plus size={16} />
          Tambah Perusahaan
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Input
          placeholder="Cari perusahaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md bg-card"
        />
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Perusahaan</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Perwakilan (Mitra)</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  Belum ada perusahaan terdaftar.
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{company.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{company.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.address ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        {company.address}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.website ? (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {company.website.replace(/(^\w+:|^)\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {company.users && company.users.length > 0 ? (
                        company.users.map((rep: TUser) => (
                          <div key={rep.id} className="flex items-center justify-between gap-2 bg-secondary/30 border border-white/5 rounded px-2 py-1 text-xs">
                            <span className="truncate max-w-[150px]">{rep.name}</span>
                            <button
                              onClick={() => handleUnlinkUser(rep.id)}
                              className="text-red-400 hover:text-red-500 transition-colors"
                              title="Hapus tautan mitra"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Belum ditautkan</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLinkingCompany(company)}
                        className="h-7 text-xs text-primary hover:text-primary/80 gap-1 px-1 mt-1"
                      >
                        <LinkIcon className="w-3 h-3" />
                        Tautkan Member
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCompany(company)}
                        className="w-8 h-8"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCompany(company)}
                        className="w-8 h-8"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form Dialog (Create/Edit) */}
      <Dialog open={isFormOpen || !!editingCompany} onOpenChange={(v) => {
        if (!v) {
          setIsFormOpen(false);
          setEditingCompany(null);
        }
      }}>
        <DialogContent className="max-w-md bg-black/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>{editingCompany ? "Edit Perusahaan" : "Tambah Perusahaan"}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Isi data lengkap perusahaan untuk memposting lowongan pekerjaan.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Perusahaan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Lampung Dev Tech" className="bg-white/5 border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Perusahaan</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Keterangan singkat mengenai bidang usaha..." rows={3} className="bg-white/5 border-white/10 resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Jl. ZA. Pagar Alam No. 9" className="bg-white/5 border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website Resmi (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: lampungdev.org" className="bg-white/5 border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location fields */}
              <div className="space-y-3 border border-white/10 rounded-lg p-3">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  Lokasi Perusahaan
                </p>

                <FormField
                  control={form.control}
                  name="mapsUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Link Google Maps</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Paste link Google Maps..."
                          className="bg-white/5 border-white/10 text-xs"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleMapsUrlChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Otomatis extract koordinat dari link Google Maps</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="-5.4500" className="bg-white/5 border-white/10 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="105.2600" className="bg-white/5 border-white/10 text-xs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {mapPreviewMarkers.length > 0 && (
                  <LeafletMap markers={mapPreviewMarkers} height="180px" />
                )}
              </div>

              <DialogFooter className="pt-4 border-t border-white/10 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingCompany(null);
                  }}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Link Member Dialog */}
      <Dialog open={!!linkingCompany} onOpenChange={(v) => { if (!v) setLinkingCompany(null); }}>
        <DialogContent className="max-w-md bg-black/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Tautkan Perwakilan Perusahaan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Pilih member terdaftar untuk dikaitkan dengan perusahaan <strong>{linkingCompany?.name}</strong>. Role member otomatis diubah menjadi Mitra.
            </DialogDescription>
          </DialogHeader>

          {unlinkedUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              Tidak ada member yang siap ditautkan (seluruh user terdaftar sudah memiliki relasi mitra).
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cari Member</label>
                <Input
                  placeholder="Ketik nama atau email member..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>

              {filteredUnlinkedUsers.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground text-xs italic">
                  Tidak ada member yang cocok dengan pencarian &quot;{userSearchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pilih Member</label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Pilih user" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/95 border-white/10 text-white max-h-60 overflow-y-auto">
                      {filteredUnlinkedUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="pt-4 border-t border-white/10 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLinkingCompany(null)}
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Batal
                </Button>
                <Button onClick={handleLinkUser} disabled={loading || !selectedUserId} className="bg-primary hover:bg-primary/90">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Tautkan
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingCompany} onOpenChange={(v) => { if (!v) setDeletingCompany(null); }}>
        <AlertDialogContent className="bg-black/95 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Perusahaan?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tindakan ini tidak dapat dibatalkan. Menghapus <strong>{deletingCompany?.name}</strong> akan memutuskan semua hubungan dengan posting pekerjaan yang dimiliki.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setDeletingCompany(null)} className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
