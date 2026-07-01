import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button Skeleton */}
      <div className="inline-flex items-center gap-2 text-muted-foreground mb-6 opacity-50">
        <ArrowLeft size={18} />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-12 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}
