'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface AvatarClientProps {
    imageUrl: string | null;
    name?: string;
}

export default function AvatarClient({ imageUrl, name }: AvatarClientProps) {
    const initials = name
        ? name
            .split(" ")
            .map((w) => w[0])
            .filter(Boolean)
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : null;

    return (
        <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-4 border-primary">
            <AvatarImage
                src={imageUrl || "/images/placeholder-image.jpeg"}
                alt={name || "Member"}
                className="object-cover object-top"
            />
            <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg md:text-xl flex items-center justify-center">
                {initials || (
                    <Image
                        src="/images/placeholder-image.jpeg"
                        alt="Placeholder Avatar"
                        width={112}
                        height={112}
                        className="object-cover object-top w-full h-full"
                    />
                )}
            </AvatarFallback>
        </Avatar>
    );
}