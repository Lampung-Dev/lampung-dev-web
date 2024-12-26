'use client'

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function ProfilePicture({ user }: {
    user: {
        name: string
        email: string
        avatar: string
    }
}) {
    const [photo, setPhoto] = useState<string | undefined>(user.avatar)

    return (
        <div className="flex flex-col items-center space-y-4 h-full w-full">
            <Avatar className="w-44 h-44 border-4 border-primary">
                <AvatarImage
                    src={photo ? photo : "/images/amir-photo.jpg"}
                    className="object-cover object-top"
                />
            </Avatar>
            <Button variant="default" onClick={() => document.getElementById('photo-upload')?.click()}>
                Change Photo
            </Button>
            <Input
                id="photo-upload"
                type="file"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                        const reader = new FileReader()
                        reader.onload = (e) => setPhoto(e.target?.result as string)
                        reader.readAsDataURL(file)
                    }
                }}
            />
        </div>
    )
}