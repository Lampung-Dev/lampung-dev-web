"use server";

import { auth } from "@/lib/next-auth";
import { SocialMediaLink } from "@/types/user";
import { createRateLimitedAction } from "@/lib/rate-limiter";
import {
    getUserByEmailService,
    updateProfileDataService,
} from "@/services/user";
import { upsertSocialMediaService } from "@/services/social-media";

// Update the base function to parse FormData
async function updateUserBase(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("harap login terlebih dahulu");
    }

    try {
        // Parse the data from FormData
        const name = formData.get("name") as string;
        const title = formData.get("title") as string;
        const email = formData.get("email") as string;
        const socialMediaLinksJson = formData.get("socialMediaLinks") as string;
        const socialMediaLinks = JSON.parse(
            socialMediaLinksJson
        ) as SocialMediaLink[];

        if (name.length > 50) {
            throw new Error("Name cannot exceed 50 characters");
        }

        if (title.length > 100) {
            throw new Error("Title cannot exceed 100 characters");
        }

        // Get user by email since that's what we have in the session
        const existingUser = await getUserByEmailService(
            session?.user?.email as string
        );

        if (!existingUser?.id) {
            throw new Error("User not found");
        }

        // update user data
        const [updateUser] = await updateProfileDataService({
            name,
            title,
            email,
        });

        if (!updateUser) throw new Error("Error update user data");

        // create or update social media links
        const upsertSocialMedia = await upsertSocialMediaService({
            userId: existingUser.id,
            socialMediaLinks,
        });

        if (!upsertSocialMedia)
            throw new Error("Error upsert social media links");

        return { success: true };
    } catch (error) {
        console.log("ERROR update user action:", error);
        throw new Error("Error update user");
    }
}

export const updateUserAction = createRateLimitedAction(updateUserBase, {
    limit: 3,
    window: 30000, // 30 seconds
});
