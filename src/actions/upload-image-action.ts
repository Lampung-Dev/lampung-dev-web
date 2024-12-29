'use server';

import { auth } from '@/lib/next-auth';
import cloudinary from '@/lib/cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import { updatePictureService } from '@/services/user';

export async function uploadImageAction(
    formData: FormData
) {
    const session = auth();
    if (!session) {
        throw new Error('Please log in to perform this action.');
    }

    const file = formData.get('image') as File | null;
    const email = formData.get('email') as string | null;

    if (!file || !email) {
        throw new Error('Invalid form data: Missing image or email.');
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryTag = process.env.CLOUDINARY_TAG;

    if (!cloudName || !cloudinaryTag) {
        throw new Error('Missing required Cloudinary environment variables.');
    }

    try {
        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const result: UploadApiResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { tags: [cloudinaryTag] },
                    (error, result) => {
                        if (error || !result) {
                            reject(error || new Error('Upload failed.'));
                            return;
                        }
                        resolve(result);
                    }
                )
                .end(buffer);
        });

        const { public_id } = result;
        const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v1/${public_id}`;

        // Update picture
        const update = await updatePictureService({ picture: imageUrl, email });

        return { public_id, successUpdate: Boolean(update) };
    } catch (error) {
        console.error('Error during image upload or update:', error);
        throw new Error('Error during image upload or update')
    }
}
