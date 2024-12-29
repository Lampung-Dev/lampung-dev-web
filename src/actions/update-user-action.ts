'use server';

import { auth } from '@/lib/next-auth';
import { SocialMediaLink } from '@/types/user';
import { getUserByEmailService, updateProfileDataService } from '@/services/user';
import { upsertSocialMediaService } from '@/services/social-media';

export async function updateUserAction(data: {
    name: string;
    title: string;
    email: string;
    socialMediaLinks: SocialMediaLink[]
}) {
    const session = await auth();
    if (!session) {
        throw new Error('harap login terlebih dahulu')
    }

    try {
        // Get user by email since that's what we have in the session
        const existingUser = await getUserByEmailService(session?.user?.email as string);

        if (!existingUser?.id) {
            throw new Error('User not found');
        }

        // update user data
        const [updateUser] = await updateProfileDataService({ name: data.name, title: data.title, email: data.email })

        if (!updateUser) throw new Error('Error update user data')

        // create or update social media links
        const upsertSocialMedia = await upsertSocialMediaService({
            userId: existingUser.id,
            socialMediaLinks: data.socialMediaLinks
        })

        if (!upsertSocialMedia) throw new Error('Error upsert social media links')

    } catch (error) {
        console.log('ERROR update user action:', error)
        throw new Error('Error update user')
    }


}
