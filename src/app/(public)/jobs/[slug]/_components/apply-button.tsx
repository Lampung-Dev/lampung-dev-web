"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ApplyButton({
  jobSlug,
  hasApplied,
}: {
  jobSlug: string;
  hasApplied?: boolean;
  jobTitle?: string;
  company?: string;
}) {
  const router = useRouter();

  if (hasApplied) {
    return (
      <Button
        disabled
        className="bg-muted text-muted-foreground gap-2 shrink-0 border border-white/10"
      >
        Sudah Melamar
      </Button>
    );
  }

  return (
    <Button
      className="bg-primary hover:bg-primary/90 gap-2 shrink-0"
      onClick={() => router.push(`/jobs/${jobSlug}/apply`)}
    >
      <Send className="w-4 h-4" />
      Lamar Sekarang
    </Button>
  );
}
