import { Skeleton } from "@/components/ui/skeleton";

const LoadingContributorCard = () => (
  <div className="w-full border border-white flex flex-col justify-center items-center p-4 md:p-6 rounded-lg backdrop-blur-sm bg-green-600/10">
    <Skeleton className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full" />
    <Skeleton className="mt-3 md:mt-4 h-6 w-32" />
    <Skeleton className="mt-2 md:mt-4 h-5 w-24" />
  </div>
);

export default function LoadingContributors() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Code Contributors</h1>
        <p className="text-gray-400 mt-2">
          Special thanks to these amazing developers who have contributed to our
          codebase.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <LoadingContributorCard key={i} />
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Design Contributors</h1>
        <p className="text-gray-400 mt-2">
          Our heartfelt appreciation to the creative minds behind our design.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-6">
          {Array.from({ length: 1 }).map((_, i) => (
            <LoadingContributorCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
