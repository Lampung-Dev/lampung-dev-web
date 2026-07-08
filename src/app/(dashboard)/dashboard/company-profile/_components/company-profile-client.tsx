"use client";

import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Building2, Globe, MapPin, FileText, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { updateCompanyProfileAction } from "@/actions/companies/company-actions";
import { type TCompany } from "@/lib/database/schema";
import LeafletMap, { parseGoogleMapsUrl, type MapMarker } from "@/components/leaflet-map";

const companySchema = z.object({
  name: z.string().min(2, "Nama perusahaan minimal 2 karakter"),
  description: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  mapsUrl: z.string().optional().or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyProfileClient({ company }: { company: TCompany }) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company.name || "",
      description: company.description || "",
      address: company.address || "",
      website: company.website || "",
      logoUrl: company.logoUrl || "",
      mapsUrl: company.mapsUrl || "",
      latitude: company.latitude != null ? String(company.latitude) : "",
      longitude: company.longitude != null ? String(company.longitude) : "",
    },
  });

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("latitude"), form.watch("longitude"), form.watch("name")]);

  async function onSubmit(values: CompanyFormValues) {
    setLoading(true);
    try {
      const res = await updateCompanyProfileAction(company.id, {
        ...values,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
        mapsUrl: values.mapsUrl || null,
      });
      if (!res.success) {
        toast.error(res.error || "Gagal memperbarui profil perusahaan.");
        return;
      }
      toast.success("Profil perusahaan berhasil diperbarui!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Perusahaan</h1>
        <p className="text-muted-foreground text-sm">
          Kelola informasi profil perusahaan Anda yang akan ditampilkan pada lowongan pekerjaan.
        </p>
      </div>

      <div className="border bg-card text-card-foreground rounded-xl p-6 shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Nama Perusahaan <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="PT Contoh Digital Nusantara" {...field} />
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
                  <FormLabel className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Website Resmi
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://contoh.com" {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Link website resmi atau laman sosial media perusahaan Anda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    URL Logo Perusahaan
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://images.cloudinary.com/..." {...field} />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Tautkan URL gambar logo perusahaan Anda.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Deskripsi Perusahaan
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tulis informasi singkat mengenai profil, misi, atau budaya perusahaan Anda..."
                      rows={5}
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    Alamat Perusahaan
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alamat kantor pusat atau operasional..."
                      rows={3}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Section */}
            <div className="space-y-4 border rounded-lg p-4">
              <p className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                Lokasi di Peta
              </p>

              <FormField
                control={form.control}
                name="mapsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Link Google Maps</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Paste link Google Maps lokasi perusahaan..."
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handleMapsUrlChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Koordinat lat/long otomatis terisi dari link Google Maps.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="latitude"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Latitude</FormLabel>
                      <FormControl>
                        <Input placeholder="-5.4500" {...field} />
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
                        <Input placeholder="105.2600" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {mapPreviewMarkers.length > 0 && (
                <LeafletMap markers={mapPreviewMarkers} height="220px" />
              )}
            </div>

            <div className="pt-2 border-t flex justify-end">
              <Button type="submit" disabled={loading} className="px-6">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
