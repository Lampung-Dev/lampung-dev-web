// app/members/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { auth } from "@/lib/next-auth";
import { redirect } from "next/navigation";
import { getAllUserPagination } from "@/actions/users/get-all-users";
import AvatarClient from "../_components/avatar-client";

export const metadata: Metadata = {
    title: "Members",
};

interface Member {
    image: string;
    name: string;
    title: string;
    social_media: {
        platform: string;
        url: string;
    }[];
}

const MemberCard = ({ member, index }: { member: Member; index: number }) => (
    <div
        key={index}
        className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10 transition-all hover:scale-105 hover:shadow-lg"
    >
        <AvatarClient imageUrl={member.image} />
        <h3 className="mt-3 md:mt-4 text-base md:text-lg text-center font-medium line-clamp-2">
            {member.name}
        </h3>
        <Badge variant="default" className="mt-2 md:mt-4 text-xs md:text-sm">
            {member.title}
        </Badge>
        <div className="grid grid-cols-4 gap-2 mt-3 md:mt-4">
            {member.social_media.map((socmed, idx) => (
                <Link
                    href={socmed.url}
                    key={idx}
                    className={`bg-white rounded-full p-1.5 transition-all hover:opacity-80 hover:scale-110 ${!socmed.url && 'opacity-50 cursor-not-allowed'
                        }`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Image
                        src={socmed.platform}
                        alt={`${member.name} - ${socmed.platform.split('/').pop()}`}
                        width={16}
                        height={16}
                        className="w-4 h-4"
                    />
                </Link>
            ))}
        </div>
    </div>
);

export default async function Members({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const session = await auth();
    if (session) {
        redirect('/dashboard');
    }
    const paramPage = (await searchParams).page
    const page = typeof paramPage === 'string' ? parseInt(paramPage) : 1
    const limit = 8;

    const response = await getAllUserPagination({
        page: typeof page === 'string' ? parseInt(page) : 1,
        limit,
        orderBy: 'createdAt',
        order: 'asc'
    });

    if (!response) {
        return <div>Failed to load members</div>;
    }

    const { users, metadata } = response;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold">Our Members</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {users.map((user, i) => (
                    <MemberCard
                        key={user.id}
                        member={{
                            image: user.picture || "/images/placeholder-image.jpeg",
                            name: user.name || "Anonymous Member",
                            title: user.title || "Member",
                            social_media: user.socialMedia.map((link) => ({
                                platform: `/icons/${link.platform.toLowerCase()}.svg`,
                                url: link.link
                            }))
                        }}
                        index={i}
                    />
                ))}

                {users.length < limit && (
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
                    {metadata.hasPreviousPage && (
                        <PaginationItem>
                            <PaginationPrevious href={`?page=${page - 1}`} />
                        </PaginationItem>
                    )}

                    {Array.from({ length: metadata.totalPages }, (_, i) => i + 1).map((pageNum) => {
                        if (
                            pageNum === 1 ||
                            pageNum === metadata.totalPages ||
                            (pageNum >= page - 1 && pageNum <= page + 1)
                        ) {
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationLink
                                        href={`?page=${pageNum}`}
                                        isActive={pageNum === page}
                                    >
                                        {pageNum}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        } else if (
                            pageNum === page - 2 ||
                            pageNum === page + 2
                        ) {
                            return (
                                <PaginationItem key={pageNum}>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            );
                        }
                        return null;
                    })}

                    {metadata.hasNextPage && (
                        <PaginationItem>
                            <PaginationNext href={`?page=${page + 1}`} />
                        </PaginationItem>
                    )}
                </PaginationContent>
            </Pagination>
        </div>
    );
}