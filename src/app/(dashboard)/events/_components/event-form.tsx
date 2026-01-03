"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RichTextEditor from "@/components/rich-text-editor";
import { TEventType } from "@/services/event-type";
import { TEvent } from "@/services/event";
import { createEventAction } from "@/actions/events/create-event-action";

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Judul minimal 3 karakter")
    .max(200, "Maksimal 200 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  eventDate: z.string().min(1, "Tanggal wajib diisi"),
  location: z.string().min(3, "Nama lokasi minimal 3 karakter"),
  locationMapUrl: z
    .string()
    .url("URL Google Maps tidak valid")
    .optional()
    .or(z.literal("")),
  maxCapacity: z.string().optional(),
  eventTypeId: z.string().min(1, "Tipe event wajib diisi"),
  registrationStatus: z.enum(["OPEN", "CLOSED"]),
  instagramUrl: z
    .string()
    .url("URL Instagram tidak valid")
    .optional()
    .or(z.literal("")),
});

type EventFormValues = z.infer<typeof formSchema>;

interface EventFormProps {
  initialData?: TEvent | null;
  eventTypes: TEventType[];
}

export function EventForm({ initialData, eventTypes }: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      eventDate: initialData?.eventDate
        ? new Date(initialData.eventDate).toISOString().slice(0, 16)
        : "",
      location: initialData?.location || "",
      locationMapUrl: initialData?.locationMapUrl || "",
      maxCapacity: initialData?.maxCapacity?.toString() || "",
      eventTypeId: initialData?.eventTypeId || "",
      registrationStatus: initialData?.registrationStatus || "OPEN",
      instagramUrl: initialData?.instagramUrl || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: EventFormValues) => {
    setLoading(true);
    try {
      let imageUrl = initialData?.imageUrl;

      // Upload image if changed
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", imageFile);

        const uploadRes = await fetch("/api/upload/event", {
          method: "POST",
          body: formDataUpload,
        });

        if (!uploadRes.ok) throw new Error("Gagal mengunggah gambar");
        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      if (!imageUrl && !initialData) {
        throw new Error("Gambar event wajib diunggah");
      }

      if (initialData) {
        const formData = new FormData();
        formData.append("eventId", initialData.id);
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("eventDate", new Date(values.eventDate).toISOString());
        formData.append("location", values.location);
        if (values.locationMapUrl)
          formData.append("locationMapUrl", values.locationMapUrl);
        if (values.maxCapacity)
          formData.append("maxCapacity", values.maxCapacity);
        formData.append("eventTypeId", values.eventTypeId);
        formData.append("registrationStatus", values.registrationStatus);
        if (values.instagramUrl)
          formData.append("instagramUrl", values.instagramUrl);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const { updateEventAction } = await import(
          "@/actions/events/update-event-action"
        );
        await updateEventAction(formData);
        toast.success("Event berhasil diperbarui");
      } else {
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("description", values.description);
        formData.append("eventDate", new Date(values.eventDate).toISOString());
        formData.append("location", values.location);
        if (values.locationMapUrl)
          formData.append("locationMapUrl", values.locationMapUrl);
        if (values.maxCapacity)
          formData.append("maxCapacity", values.maxCapacity);
        formData.append("eventTypeId", values.eventTypeId);
        formData.append("registrationStatus", values.registrationStatus);
        if (values.instagramUrl)
          formData.append("instagramUrl", values.instagramUrl);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        await createEventAction(formData);
        toast.success("Event berhasil dibuat");
      }

      router.push("/events/manage");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-4xl mx-auto pb-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Event</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Tech Talk: AI in 2024"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipe Event</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="eventDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal & Waktu</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxCapacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapasitas (Opsional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Kosongkan jika tak terbatas"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lokasi</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Gedung A, Lt. 2 atau Online"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationMapUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Google Maps (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://maps.google.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Masukkan link maps agar peserta bisa langsung menuju lokasi.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Instagram (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://instagram.com/p/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status Pendaftaran</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OPEN">Dibuka</SelectItem>
                      <SelectItem value="CLOSED">Ditutup</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormItem>
              <FormLabel>Poster Event (Square 1:1)</FormLabel>
              <div
                className="relative aspect-square rounded-xl border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/30 group hover:border-green-500/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                {imagePreview ? (
                  <>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ImagePlus className="text-white w-10 h-10" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImagePlus className="w-10 h-10" />
                    <span>Upload Poster</span>
                  </div>
                )}
              </div>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <FormDescription>
                Gambar akan otomatis di-resize menjadi WebP 800x800.
              </FormDescription>
            </FormItem>
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi Lengkap</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-yellow-500 hover:from-green-700 hover:to-yellow-600 border-0 h-12 text-lg font-semibold"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {initialData ? "Simpan Perubahan" : "Publikasikan Event"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-12 px-8"
            onClick={() => router.back()}
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
