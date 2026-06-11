"use client";

import { useEffect, useState } from "react";

export default function Starfield() {
  const [mounted, setMounted] = useState(false);
  const [stars, setStars] = useState<{ sm: string; md: string; lg: string }>({
    sm: "",
    md: "",
    lg: "",
  });

  useEffect(() => {
    const generateStars = (count: number) => {
      const shadows = [];
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 100);
        const y = Math.floor(Math.random() * 100);
        shadows.push(`${x}vw ${y}vh rgba(255, 255, 255, 0.8)`);
      }
      return shadows.join(", ");
    };

    setStars({
      sm: generateStars(80),
      md: generateStars(40),
      lg: generateStars(20),
    });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
      <div
        className="absolute rounded-full transition-opacity duration-1000"
        style={{
          width: "1px",
          height: "1px",
          boxShadow: stars.sm,
          opacity: 0.4,
        }}
      />
      <div
        className="absolute rounded-full transition-opacity duration-1000"
        style={{
          width: "2px",
          height: "2px",
          boxShadow: stars.md,
          opacity: 0.6,
        }}
      />
      <div
        className="absolute rounded-full transition-opacity duration-1000"
        style={{
          width: "3px",
          height: "3px",
          boxShadow: stars.lg,
          opacity: 0.8,
        }}
      />
    </div>
  );
}
