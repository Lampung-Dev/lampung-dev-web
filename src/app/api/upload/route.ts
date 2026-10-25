import { NextRequest, NextResponse } from 'next/server';
import type { UploadApiResponse } from 'cloudinary';

import { auth } from '@/lib/next-auth';
import { updatePictureService } from '@/services/user';
import cloudinary from '@/lib/cloudinary';
import sharp from 'sharp';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

async function uploadImageHandler(request: NextRequest) {
    try {
        // Get session
        const session = await auth();
        const email = session?.user?.email;
        if (!email) {
            return NextResponse.json(
                { error: 'Please log in to perform this action.' },
                { status: 401 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('image');

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: 'Invalid form data: Missing image.' },
                { status: 400 }
            );
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP.' },
                { status: 400 }
            );
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
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

        // Re-encode gambar: memastikan file benar-benar gambar & membuang metadata/payload
        const buffer = await sharp(Buffer.from(await file.arrayBuffer()))
            .rotate()
            .resize(800, 800, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 85 })
            .toBuffer();

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

        // Update picture milik user yang sedang login saja
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
