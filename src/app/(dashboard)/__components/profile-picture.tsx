/* eslint-disable @next/next/no-img-element */
'use client';

import { toast } from 'sonner';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import { useState, useCallback } from 'react';

import { UserProfile } from '@/types/user';
import 'react-image-crop/dist/ReactCrop.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { uploadImageAction } from '@/actions/upload-image-action';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { errorHandler } from '@/lib/utils';

type Props = {
    user: UserProfile;
};

export default function ProfilePicture({ user }: Props) {
    const [photo, setPhoto] = useState<string>(user.avatar);
    const [tempImageUrl, setTempImageUrl] = useState<string>('');
    const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: 'px',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onImageLoad = useCallback((img: HTMLImageElement) => {
        const cropSize = Math.min(350, Math.min(img.width, img.height));
        const x = Math.max(0, (img.width - cropSize) / 2);
        const y = Math.max(0, (img.height - cropSize) / 2);
        setCrop({
            unit: 'px',
            width: cropSize,
            height: cropSize,
            x,
            y,
        });
        setImageRef(img);
    }, []);

    const getCroppedImg = useCallback((image: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No 2d context');

        ctx.drawImage(
            image,
            pixelCrop.x * scaleX,
            pixelCrop.y * scaleY,
            pixelCrop.width * scaleX,
            pixelCrop.height * scaleY,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas is empty'));
                },
                'image/jpeg',
                0.95
            );
        });
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            toast.error('Invalid image. Please use a valid one.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setTempImageUrl(e.target?.result as string);
            setIsOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = useCallback(async () => {
        if (!imageRef) return;

        try {
            const croppedBlob = await getCroppedImg(imageRef, crop as PixelCrop);
            const formData = new FormData();
            formData.append('image', croppedBlob, 'cropped-image.jpg');
            formData.append('email', user.email);

            const oldPhoto = photo;
            setPhoto(URL.createObjectURL(croppedBlob));
            setIsOpen(false);
            setIsLoading(true);

            uploadImageAction(formData)
                .then(() => {
                    setIsLoading(false);
                    toast.success('Profile photo updated successfully.');
                })
                .catch((error) => {
                    console.error('Upload error:', error);
                    setPhoto(oldPhoto);
                    errorHandler({ error: error as Error, secondErrorMessage: 'Failed to update profile photo.' })
                    setIsLoading(false);
                });
        } catch (error) {
            console.error('Cropping error:', error);
            toast.error('Error cropping the image.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageRef, crop, getCroppedImg, photo]);

    return (
        <>
            <div className="flex flex-col items-center space-y-4 h-full w-full">
                <Avatar className="w-44 h-44 border-4 border-primary">
                    <AvatarImage
                        src={photo || '/images/amir-photo.jpg'}
                        alt={user.name}
                        className="object-cover object-center"
                    />
                </Avatar>
                <div>
                    <Button
                        type="button"
                        variant="default"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Uploading...' : 'Change Photo'}
                    </Button>
                    <Input
                        id="photo-upload"
                        name="image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isLoading}
                    />
                </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Crop your new profile picture</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[80vh] flex flex-col gap-4 w-full h-full">
                        <div className="h-full overflow-y-auto overflow-x-hidden w-full flex justify-center items-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(newCrop) => setCrop(newCrop)}
                                aspect={1}
                                circularCrop
                                className='h-full'
                            >
                                <img
                                    src={tempImageUrl}
                                    alt="Crop preview"
                                    onLoad={(e) => onImageLoad(e.currentTarget)}
                                    className="max-w-full h-auto"
                                />
                            </ReactCrop>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCropComplete}
                                disabled={isLoading}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                            >
                                {isLoading ? 'Uploading...' : 'Set new profile picture'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
