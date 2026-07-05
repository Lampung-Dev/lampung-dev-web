"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

export function ApplyButton({
  jobId,
}: {
  jobId: number;
  jobTitle?: string;
  company?: string;
}) {
  const router = useRouter();

  return (
    <Button
      className="bg-primary hover:bg-primary/90 gap-2 shrink-0"
      onClick={() => router.push(`/career/${jobId}/apply`)}
    >
      <Send className="w-4 h-4" />
      Lamar Sekarang
    </Button>
  );
}
