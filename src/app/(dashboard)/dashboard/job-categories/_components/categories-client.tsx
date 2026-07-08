"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, Tag, Calendar } from "lucide-react";
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
  createJobCategoryAction,
  updateJobCategoryAction,
  deleteJobCategoryAction,
} from "@/actions/categories/category-admin-actions";
import { TJobCategory } from "@/lib/database/schema";

const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface JobCategoriesClientProps {
  initialCategories: TJobCategory[];
}

export function JobCategoriesClient({ initialCategories }: JobCategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<TJobCategory[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TJobCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<TJobCategory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
      });
    } else {
      form.reset({
        name: "",
      });
    }
  }, [editingCategory, form]);

  const onSubmit = async (values: CategoryFormValues) => {
    setLoading(true);
    try {
      if (editingCategory) {
        const res = await updateJobCategoryAction(editingCategory.id, values);
        if (res.success) {
          toast.success("Kategori berhasil diperbarui");
          setIsFormOpen(false);
          setEditingCategory(null);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui kategori");
        }
      } else {
        const res = await createJobCategoryAction(values);
        if (res.success) {
          toast.success("Kategori berhasil ditambahkan");
          setIsFormOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal menambahkan kategori");
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setLoading(true);
    try {
      const res = await deleteJobCategoryAction(deletingCategory.id);
      if (res.success) {
        toast.success("Kategori berhasil dihapus");
        setDeletingCategory(null);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus kategori");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Kelola Kategori Pekerjaan
          </h1>
          <p className="text-muted-foreground text-sm">
            Daftar kategori pekerjaan untuk mempermudah pencarian lowongan kerja Lampung Dev.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setIsFormOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-black shrink-0 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Cari kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-white/20 text-white focus-visible:ring-primary pl-4"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="border border-white/10 rounded-xl p-12 text-center bg-white/5">
          <Tag className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-pulse" />
          <h3 className="font-semibold text-lg text-white">Tidak Ada Kategori</h3>
          <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery
              ? "Tidak ada kategori yang cocok dengan pencarian Anda."
              : "Belum ada kategori yang terdaftar."}
          </p>
        </div>
      ) : (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-gray-300">Nama Kategori</TableHead>
                <TableHead className="text-gray-300">Slug</TableHead>
                <TableHead className="text-gray-300">Tanggal Dibuat</TableHead>
                <TableHead className="text-gray-300 text-right w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{cat.name}</TableCell>
                  <TableCell className="text-gray-400 font-mono text-xs">{cat.slug}</TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      {new Date(cat.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(cat);
                          setIsFormOpen(true);
                        }}
                        className="text-gray-400 hover:text-white hover:bg-white/10 h-8 w-8"
                        title="Edit Kategori"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingCategory(cat)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-black/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory
                ? "Ubah nama kategori pekerjaan di bawah ini."
                : "Masukkan nama kategori pekerjaan baru yang ingin Anda daftarkan."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">Nama Kategori</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Contoh: Mobile Development"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-primary"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4 border-t border-white/10 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-black">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deletingCategory} onOpenChange={(v) => { if (!v) setDeletingCategory(null); }}>
        <AlertDialogContent className="bg-black/95 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tindakan ini tidak dapat dibatalkan. Menghapus kategori <strong>{deletingCategory?.name}</strong> akan mempengaruhi filter pencarian lowongan yang menggunakan kategori ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setDeletingCategory(null)} className="border-white/20 text-gray-300 hover:bg-white/10 bg-transparent">
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
