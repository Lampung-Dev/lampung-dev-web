import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { auth } from "@/lib/next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Members",
};

interface Member {
    image: string;
    name: string;
    title: string;
    social_media: {
        icon: string;
        link: string;
    }[]
}

const members: Member[] = [
    {
        image: "/images/amir-photo.jpg",
        name: "Amir Faisal Zamzami",
        title: "Fullstack Developer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/amrfslz/"
            },
            {
                icon: "/icons/linkedin.svg",
                link: "https://www.linkedin.com/in/amirfaisalz/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/amirfaisalz/"
            },
        ]
    },
    {
        image: "/images/arief-pradipta.jpeg",
        name: "Arief Pradipta",
        title: "Fullstack Developer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/isas.sigerit/"
            },
            {
                icon: "/icons/linkedin.svg",
                link: "https://www.linkedin.com/in/arief-pradipta-s-t-557455192/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/AriefPradipta"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
    {
        image: "/images/arif-apriandi.jpeg",
        name: "Arief Apriandi",
        title: "Programmer",
        social_media: [
            {
                icon: "/icons/instagram.svg",
                link: "https://www.instagram.com/ariefapr/"
            },
            {
                icon: "/icons/github.svg",
                link: "https://github.com/ariefapriandi/"
            },
        ]
    },
];

export default async function Members() {
    const session = await auth();
    if (session) {
        redirect('/dashboard');
    }

    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold">Our Members</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {members.map((member, i) => (
                    <MemberCard key={i} member={member} index={i} />
                ))}

                {members.length < 4 && (
                    <div className="w-full border border-white hidden sm:flex flex-col justify-center items-center p-6 rounded-lg backdrop-blur-sm bg-green-500/10">
                        <Avatar className="w-24 h-24 lg:w-28 lg:h-28 border-4 border-primary">
                            <AvatarImage src="/images/placeholder-image.jpeg" />
                        </Avatar>
                        <p className="mt-4 text-lg font-medium">New Member Soon</p>
                        <div className="mt-4 h-8" />
                    </div>
                )}
            </div>

            <Pagination>
                <PaginationContent className="flex flex-wrap gap-2 justify-center">
                    <PaginationItem>
                        <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationLink href="#">16</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#" />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
};

const MemberCard = ({ member, index }: { member: Member; index: number }) => (
    <div
        key={index}
        className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10 transition-all hover:scale-105 hover:shadow-lg"
    >
        <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-4 border-primary">
            <AvatarImage
                src={member.image || "/images/placeholder-image.jpeg"}
                className="object-cover object-top"
            />
        </Avatar>
        <h3 className="mt-3 md:mt-4 text-base md:text-lg text-center font-medium line-clamp-2">
            {member.name}
        </h3>
        <Badge variant="default" className="mt-2 md:mt-4 text-xs md:text-sm">
            {member.title}
        </Badge>
        <div className="flex flex-wrap gap-3 justify-center items-center mt-3 md:mt-4">
            {member.social_media.map((socmed, idx) => (
                <Link
                    href={socmed.link}
                    key={idx}
                    className={`bg-white rounded-full p-1.5 transition-all hover:opacity-80 hover:scale-110 ${!socmed.link && 'opacity-50 cursor-not-allowed'
                        }`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        src={socmed.icon}
                        alt={`${member.name} - ${socmed.icon.split('/').pop()}`}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                    />
                </Link>
            ))}
        </div>
    </div>
);