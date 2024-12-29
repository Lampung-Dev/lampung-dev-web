import 'server-only'
import { eq } from "drizzle-orm";

import db from "@/lib/database";
import { socialMediaTable } from "@/lib/database/schema";
import { SocialMediaLink } from '@/types/user';

interface UpsertSocialMediaParams {
    userId: string;
    socialMediaLinks: SocialMediaLink[];
}

export const upsertSocialMediaService = async ({
    userId,
    socialMediaLinks
}: UpsertSocialMediaParams) => {
    try {
        // First, delete existing social media links for this user
        await db
            .delete(socialMediaTable)
            .where(eq(socialMediaTable.userId, userId));

        // Then insert the new social media links
        if (socialMediaLinks.length > 0) {
            await db
                .insert(socialMediaTable)
                .values(
                    socialMediaLinks.map(link => ({
                        userId,
                        platform: link.platform,
                        link: link.url
                    }))
                );
        }

        return true;
    } catch (error) {
        console.log('ERROR upsert social media service:', error);
        throw new Error('Error updating social media links');
    }
}

export const getSocialMediaService = async (userId: string) => {
    try {
        return await db.query.socialMediaTable.findMany({
            where: (table) => eq(table.userId, userId),
        })
    } catch (error) {
        console.log('ERROR getSocialMediaService:', error);
        throw new Error('Error get social media links');
    }
}