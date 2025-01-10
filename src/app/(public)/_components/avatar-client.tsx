'use client'

import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function AvatarClient({ imageUrl }: { imageUrl: string | null }) {
    return (
        <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-4 border-primary">
            <AvatarImage
                src={imageUrl || "/images/placeholder-image.jpeg"}
                className="object-cover object-top"
            />
        </Avatar>
    )
}