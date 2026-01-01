"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
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

import { TEventType } from "@/services/event-type";
import {
  createEventTypeAction,
  updateEventTypeAction,
  deleteEventTypeAction,
} from "@/actions/events/event-type-actions";

const formSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(100, "Maksimal 100 karakter"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Format warna tidak valid (contoh: #ff0000)").optional(),
});

type EventTypeFormValues = z.infer<typeof formSchema>;

export default function EventTypesPage({ eventTypes }: { eventTypes: TEventType[] }) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingType, setEditingType] = useState<TEventType | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<EventTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
    },
  });

  const onSubmit = async (values: EventTypeFormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      if (values.description) formData.append("description", values.description);
      if (values.color) formData.append("color", values.color);

      if (editingType) {
        formData.append("eventTypeId", editingType.id);
        await updateEventTypeAction(formData);
        toast.success("Tipe event berhasil diperbarui");
      } else {
        await createEventTypeAction(formData);
        toast.success("Tipe event berhasil dibuat");
      }

      setIsCreateOpen(false);
      setEditingType(null);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type: TEventType) => {
    setEditingType(type);
    form.reset({
      name: type.name,
      description: type.description || "",
      color: type.color || "#6366f1",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteEventTypeAction(id);
      toast.success("Tipe event berhasil dihapus");
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
          <h1 className="text-2xl font-bold">Event Types</h1>
          <p className="text-muted-foreground">Kelola kategori atau tipe event</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setEditingType(null);
            form.reset({ name: "", description: "", color: "#6366f1" });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 border-0">
              <Plus size={16} />
              Tambah Tipe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingType ? "Edit Tipe Event" : "Tambah Tipe Event"}</DialogTitle>
              <DialogDescription>
                Tipe event digunakan untuk mengelompokkan event yang kamu buat.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Workshop, Meetup..." {...field} />
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
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Penjelasan singkat tentang tipe ini..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warna Badge</FormLabel>
                      <div className="flex gap-2 items-center">
                        <FormControl>
                          <Input type="color" className="p-1 w-12 h-10" {...field} />
                        </FormControl>
                        <Input
                          placeholder="#000000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormDescription>
                        Warna ini akan digunakan pada badge kategori di halaman publik.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingType ? "Simpan Perubahan" : "Buat Tipe"}
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
              <TableHead>Nama</TableHead>
              <TableHead>Warna</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Belum ada tipe event yang dibuat.
                </TableCell>
              </TableRow>
            ) : (
              eventTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell className="font-medium">
                    <Badge
                      style={{ backgroundColor: type.color || "#6366f1" }}
                      className="text-white border-0"
                    >
                      {type.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{type.color || "#6366f1"}</code>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-muted-foreground">
                    {type.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(type)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Tipe Event?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah kamu yakin ingin menghapus tipe event <strong>"{type.name}"</strong>?
                              Aksi ini tidak dapat dibatalkan dan mungkin mempengaruhi event yang menggunakan tipe ini.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(type.id)}
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
