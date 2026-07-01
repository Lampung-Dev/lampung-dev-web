import 'server-only'
import { eq, asc, sql } from "drizzle-orm";

import db from "@/lib/database";
import { sponsorTable, type TSponsor } from "@/lib/database/schema";

export type { TSponsor };

export type TNewSponsor = {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  category: 'HIGH_PRIORITY' | 'GOLD' | 'SILVER' | 'COMMUNITY_PARTNER';
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
};

export type TUpdateSponsor = Partial<TNewSponsor>;

export const createSponsorService = async (values: TNewSponsor): Promise<TSponsor> => {
  try {
    const [sponsor] = await db
      .insert(sponsorTable)
      .values({
        name: values.name,
        logoUrl: values.logoUrl,
        websiteUrl: values.websiteUrl,
        category: values.category,
        description: values.description,
        isActive: values.isActive ?? true,
        displayOrder: values.displayOrder ?? 0,
      })
      .returning();

    return sponsor;
  } catch (error) {
    console.error('ERROR createSponsorService:', error);
    throw new Error('Error creating the sponsor.');
  }
};

export const updateSponsorService = async (
  id: string,
  values: TUpdateSponsor
): Promise<TSponsor> => {
  try {
    const [sponsor] = await db
      .update(sponsorTable)
      .set({
        ...values,
        updatedAt: new Date(),
      })
      .where(eq(sponsorTable.id, id))
      .returning();

    if (!sponsor) {
      throw new Error('Sponsor not found.');
    }

    return sponsor;
  } catch (error) {
    console.error('ERROR updateSponsorService:', error);
    throw new Error('Error updating the sponsor.');
  }
};

export const deleteSponsorService = async (id: string): Promise<void> => {
  try {
    await db
      .delete(sponsorTable)
      .where(eq(sponsorTable.id, id));
  } catch (error) {
    console.error('ERROR deleteSponsorService:', error);
    throw new Error('Error deleting the sponsor.');
  }
};

export const getSponsorByIdService = async (id: string): Promise<TSponsor | null> => {
  try {
    const sponsor = await db.query.sponsorTable.findFirst({
      where: eq(sponsorTable.id, id),
    });

    return sponsor || null;
  } catch (error) {
    console.error('ERROR getSponsorByIdService:', error);
    throw new Error('Error retrieving the sponsor.');
  }
};

export const getAllSponsorsService = async (): Promise<TSponsor[]> => {
  try {
    const sponsors = await db.query.sponsorTable.findMany({
      orderBy: (table, { asc }) => [asc(table.displayOrder), asc(table.name)],
    });

    return sponsors;
  } catch (error) {
    console.error('ERROR getAllSponsorsService:', error);
    throw new Error('Error retrieving sponsors.');
  }
};

/**
 * Get active sponsors ordered by category priority and display order.
 * Category priority: HIGH_PRIORITY > GOLD > SILVER > COMMUNITY_PARTNER
 */
export const getActiveSponsorsService = async (): Promise<TSponsor[]> => {
  try {
    const sponsors = await db
      .select()
      .from(sponsorTable)
      .where(eq(sponsorTable.isActive, true))
      .orderBy(
        sql`CASE 
          WHEN ${sponsorTable.category} = 'HIGH_PRIORITY' THEN 1
          WHEN ${sponsorTable.category} = 'GOLD' THEN 2
          WHEN ${sponsorTable.category} = 'SILVER' THEN 3
          WHEN ${sponsorTable.category} = 'COMMUNITY_PARTNER' THEN 4
          ELSE 5
        END`,
        asc(sponsorTable.displayOrder),
        asc(sponsorTable.name)
      );

    return sponsors;
  } catch (error) {
    console.error('ERROR getActiveSponsorsService:', error);
    throw new Error('Error retrieving active sponsors.');
  }
};
