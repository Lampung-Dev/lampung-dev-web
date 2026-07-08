"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm max-w-lg mx-auto shadow-2xl transition-all duration-300 hover:border-white/20 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 animate-pulse">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-white tracking-wide mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
