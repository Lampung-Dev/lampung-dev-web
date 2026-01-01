"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { LoadingScreen } from "./loading-screen";

export function AppLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  // Use sessionStorage to only show loading screen once per session if desired, 
  // but usually for premium feels we show it once per visit.
  // For now, let's just use it once per hard refresh.

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>
      <div className={isLoading ? "hidden" : "block"}>
        {children}
      </div>
    </>
  );
}
