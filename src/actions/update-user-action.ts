'use server';

import { auth } from '@/lib/next-auth';
// import { updateProfileDataService } from '@/services/user';

export async function updateUserAction() {
    const session = auth();
    if (!session) {
        throw new Error('harap login terlebih dahulu')
    }

    try {
        // update user data
        // const updateUser = await updateProfileDataService({ name: data.name, title: data.title, email: data.email })

        // create or update social media links

    } catch (error) {
        console.log('ERROR update user action:', error)
        throw new Error('Error update user data')
    }


}
