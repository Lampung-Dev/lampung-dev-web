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

const members = [
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
];

export default async function Members() {
    const session = await auth();
    if (session) {
        redirect('/dashboard')
    }
    return (
        <div className="max-w-7xl mx-auto">
            <div className="w-full h-full overflow-y-auto px-8">
                <div className="py-8 md:py-12 mt-12">
                    <h1 className="text-xl md:text-2xl font-semibold mb-6">Our Members</h1>

                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                        {members.map((member, i) => (
                            <div
                                key={i}
                                className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10 transition-transform hover:scale-105 max-w-72 md:max-w-none mx-auto"
                            >
                                <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-4 border-primary">
                                    <AvatarImage
                                        src={member.image || "/images/placeholder-image.jpeg"}
                                        className="object-cover object-top"
                                    />
                                </Avatar>
                                <p className="mt-3 md:mt-4 text-base md:text-lg text-center line-clamp-2">{member.name}</p>
                                <Badge variant="default" className="mt-2 md:mt-4 text-xs md:text-sm">{member.title}</Badge>
                                <div className="flex flex-wrap gap-2 justify-center items-center mt-3 md:mt-4 w-full max-w-[112px]">
                                    {member.social_media.map((socmed, idx) => (
                                        <Link
                                            href={socmed.link}
                                            key={idx}
                                            className={`bg-white rounded-full p-1 transition-opacity hover:opacity-80 ${!socmed.link && 'opacity-50 cursor-not-allowed'}`}
                                            target="_blank"
                                        >
                                            <Image
                                                src={socmed.icon}
                                                alt="social-media-icon"
                                                width={14}
                                                height={14}
                                                className="w-3 h-3 md:w-3.5 md:h-3.5"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {members.length < 4 && (
                            <div className="w-full border border-white hidden md:flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-500/10 max-w-72 md:max-w-none mx-auto">
                                <Avatar className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 border-4 border-primary">
                                    <AvatarImage src="/images/placeholder-image.jpeg" />
                                </Avatar>
                                <p className="mt-3 md:mt-4 text-base md:text-lg">New Member Soon</p>
                                <div className="mt-4 h-8"></div>
                            </div>
                        )}
                    </div>

                    <Pagination className="mt-8 md:mt-12 lg:mt-16 hidden lg:block">
                        <PaginationContent className="flex flex-wrap gap-2 justify-center">
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">1</PaginationLink>
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
            </div>
        </div>
    );
}