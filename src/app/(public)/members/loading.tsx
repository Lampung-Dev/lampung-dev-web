// app/members/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

const LoadingMemberCard = () => (
    <div className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10">
        <Skeleton className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full" />
        <Skeleton className="mt-3 md:mt-4 h-6 w-32" />
        <Skeleton className="mt-2 md:mt-4 h-5 w-24" />
        <div className="flex gap-3 mt-3 md:mt-4">
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="w-7 h-7 rounded-full" />
            <Skeleton className="w-7 h-7 rounded-full" />
        </div>
    </div>
);

export default function LoadingMembers() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold">Our Members</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {Array.from({ length: 8 }).map((_, i) => (
                    <LoadingMemberCard key={i} />
                ))}
            </div>
        </div>
    );
}