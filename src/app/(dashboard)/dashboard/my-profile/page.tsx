import React from 'react';
import { toast } from 'sonner';
import { auth } from '@/lib/next-auth';
import { UserProfile } from '@/types/user';
import { getUserByEmailService } from '@/services/user';
import ProfileForm from '../../__components/profile-form';
import ProfilePicture from '../../__components/profile-picture';

export default async function Page() {
    const session = await auth();

    if (!session) return

    const user: UserProfile = {
        avatar: session.user?.image as string,
        email: session.user?.email as string,
        name: session.user?.name as string,
        title: '',
        socialMediaLinks: []
    }

    try {
        const userData = await getUserByEmailService(session?.user?.email as string)

        if (userData) {
            user.avatar = userData?.picture as string
            user.name = userData.name as string
            user.title = userData?.title as string
            user.socialMediaLinks = userData?.socialMediaLinks
        }
    } catch (error) {
        console.log('ERROR get user data in my profile page:', error)
        toast("error get user")
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <div className="grid auto-rows-min gap-4 md:grid-cols-5">
                <div className="col-span-1 rounded-xl border p-4 bg-muted/50 h-fit">
                    <ProfilePicture user={user} />
                </div>
                <div className="rounded-xl bg-muted/50 p-4 col-span-4 space-y-4">
                    <p className="text-xl text-primary">Profile</p>
                    <ProfileForm user={user} />
                </div>
            </div>
        </div>
    );
}