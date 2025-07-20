import { NextRequest, NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';

import { auth } from '@/lib/next-auth';
import { updatePictureService } from '@/services/user';
import cloudinary from '@/lib/cloudinary';

async function uploadImageHandler(request: NextRequest) {
    try {
        // Get session
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { error: 'Please log in to perform this action.' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('image') as File | null;
        const email = formData.get('email') as string | null;

        if (!file || !email) {
            return NextResponse.json(
                { error: 'Invalid form data: Missing image or email.' },
                { status: 400 }
            );
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const cloudinaryTag = process.env.CLOUDINARY_TAG;

        if (!cloudName || !cloudinaryTag) {
            return NextResponse.json(
                { error: 'Missing required Cloudinary environment variables.' },
                { status: 500 }
            );
        }

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

        return NextResponse.json({
            public_id,
            successUpdate: Boolean(update),
            imageUrl
        });

    } catch (error) {
        console.error('Error during image upload or update:', error);
        return NextResponse.json(
            { error: 'Error during image upload or update' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return uploadImageHandler(request);
}
