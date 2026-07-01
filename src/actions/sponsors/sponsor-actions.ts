"use server";

import { auth } from "@/lib/next-auth";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import {
  createSponsorService,
  updateSponsorService,
  deleteSponsorService,
  TNewSponsor,
  TUpdateSponsor,
} from "@/services/sponsor";

async function createSponsorBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat menambah sponsor");
  }

  try {
    const name = formData.get("name") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const websiteUrl = formData.get("websiteUrl") as string | undefined;
    const category = formData.get("category") as TNewSponsor["category"];
    const description = formData.get("description") as string | undefined;
    const isActive = formData.get("isActive") === "true";
    const displayOrder = parseInt(formData.get("displayOrder") as string) || 0;

    if (!name || name.length > 200) {
      throw new Error("Nama sponsor wajib diisi (max 200 karakter)");
    }

    if (!logoUrl) {
      throw new Error("Logo sponsor wajib diupload");
    }

    if (!category) {
      throw new Error("Kategori sponsor wajib dipilih");
    }

    const validCategories = ['HIGH_PRIORITY', 'GOLD', 'SILVER', 'COMMUNITY_PARTNER'];
    if (!validCategories.includes(category)) {
      throw new Error("Kategori sponsor tidak valid");
    }

    const sponsorData: TNewSponsor = {
      name,
      logoUrl,
      websiteUrl: websiteUrl || undefined,
      category,
      description: description || undefined,
      isActive,
      displayOrder,
    };

    const sponsor = await createSponsorService(sponsorData);

    return { success: true, sponsor };
  } catch (error) {
    console.error("ERROR createSponsorAction:", error);
    throw error;
  }
}

export const createSponsorAction = createRateLimitedAction(createSponsorBase, {
  limit: 10,
  window: 60000,
});

async function updateSponsorBase(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat mengupdate sponsor");
  }

  try {
    const sponsorId = formData.get("sponsorId") as string;
    const name = formData.get("name") as string | undefined;
    const logoUrl = formData.get("logoUrl") as string | undefined;
    const websiteUrl = formData.get("websiteUrl") as string | undefined;
    const category = formData.get("category") as TNewSponsor["category"] | undefined;
    const description = formData.get("description") as string | undefined;
    const isActiveStr = formData.get("isActive") as string | undefined;
    const displayOrderStr = formData.get("displayOrder") as string | undefined;

    if (!sponsorId) {
      throw new Error("Sponsor ID wajib diisi");
    }

    const updateData: TUpdateSponsor = {};
    if (name !== undefined && name !== null) {
      if (name.length > 200) {
        throw new Error("Nama sponsor max 200 karakter");
      }
      updateData.name = name;
    }
    if (logoUrl !== undefined && logoUrl !== null) updateData.logoUrl = logoUrl;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl || undefined;
    if (category !== undefined && category !== null) {
      const validCategories = ['HIGH_PRIORITY', 'GOLD', 'SILVER', 'COMMUNITY_PARTNER'];
      if (!validCategories.includes(category)) {
        throw new Error("Kategori sponsor tidak valid");
      }
      updateData.category = category;
    }
    if (description !== undefined) updateData.description = description || undefined;
    if (isActiveStr !== undefined && isActiveStr !== null) updateData.isActive = isActiveStr === "true";
    if (displayOrderStr !== undefined && displayOrderStr !== null) {
      updateData.displayOrder = parseInt(displayOrderStr) || 0;
    }

    const sponsor = await updateSponsorService(sponsorId, updateData);

    return { success: true, sponsor };
  } catch (error) {
    console.error("ERROR updateSponsorAction:", error);
    throw error;
  }
}

export const updateSponsorAction = createRateLimitedAction(updateSponsorBase, {
  limit: 10,
  window: 60000,
});

export async function deleteSponsorAction(sponsorId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Harap login terlebih dahulu");
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    throw new Error("Hanya admin yang dapat menghapus sponsor");
  }

  try {
    if (!sponsorId) {
      throw new Error("Sponsor ID wajib diisi");
    }

    await deleteSponsorService(sponsorId);

    return { success: true };
  } catch (error) {
    console.error("ERROR deleteSponsorAction:", error);
    throw error;
  }
}
