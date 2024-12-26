import React from 'react';
import { auth } from '@/lib/next-auth';
import ProfilePicture from '../../__components/profile-picture';
import ProfileForm from '../../__components/profile-form';

export default async function Page() {
    const session = await auth();

    const user = { name: session?.user?.name as string, email: session?.user?.email as string, avatar: session?.user?.image as string }

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