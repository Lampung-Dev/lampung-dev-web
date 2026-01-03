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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image Skeleton */}
        <div className="space-y-4">
          <Skeleton className="aspect-square rounded-2xl w-full shadow-xl" />
        </div>

        {/* Right Column - Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>

          {/* Info Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-border " />

          <Skeleton className="h-12 w-full rounded-xl" />

          <div className="h-px bg-border " />

          {/* Description Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
