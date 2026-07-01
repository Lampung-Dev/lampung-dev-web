"use client";

import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import Image from "next/image";

interface JetorbitSpotlightProps {
  logoUrl?: string;
}

export default function JetorbitSpotlight({ logoUrl }: JetorbitSpotlightProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-20 z-10">
      {/* Category Heading */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[oklch(0.82_0.16_85)]" />
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
          <Award className="h-4 w-4" />
          Presenting Sponsor
        </span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[oklch(0.82_0.16_85)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="group relative"
      >
        {/* Animated gold gradient border */}
        <div
          aria-hidden
          className="absolute -inset-px rounded-3xl opacity-80 blur-[2px] transition-all duration-700 group-hover:opacity-100 group-hover:blur-[3px]"
          style={{
            background:
              "conic-gradient(from 0deg, oklch(0.88 0.14 92), oklch(0.65 0.17 70), oklch(0.88 0.14 92), oklch(0.55 0.12 60), oklch(0.88 0.14 92))",
          }}
        />

        <div className="relative overflow-hidden rounded-3xl border border-gold/15 bg-[#16140f]/90 shadow-premium backdrop-blur-xl">
          {/* Inner subtle gradient */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60"
            style={{
              background:
                "radial-gradient(circle at top left, oklch(0.82 0.16 85 / 0.12), transparent 50%)",
            }}
          />

          <div className="relative grid gap-10 p-8 md:grid-cols-[1fr_1.2fr] md:gap-12 md:p-14 lg:p-16">
            {/* Logo panel */}
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#060b1e] md:aspect-auto min-h-[260px]">
              <div
                aria-hidden
                className="absolute inset-0 animate-halo-pulse"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(43, 136, 255, 0.2), transparent 60%)",
                }}
              />
              <div
                aria-hidden
                className="absolute -inset-10 animate-spin-slow opacity-25"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent, rgba(43, 136, 255, 0.4), transparent 30%)",
                }}
              />

              <div className="relative z-10 animate-float-slow flex flex-col items-center justify-center p-6 text-center">
                {logoUrl ? (
                  <div className="relative w-[240px] h-[120px] transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={logoUrl}
                      alt="Jetorbit Logo"
                      fill
                      className="object-contain filter brightness-0 invert drop-shadow-[0_0_20px_rgba(43, 136, 255, 0.3)]"
                      priority
                    />
                  </div>
                ) : (
                  <>
                    <div
                      className="text-4xl sm:text-5xl font-black tracking-wider text-[#2b88ff] drop-shadow-[0_0_20px_rgba(43,136,255,0.7)] font-sans"
                      style={{
                        letterSpacing: "0.08em",
                      }}
                    >
                      JETORBIT
                    </div>
                    <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.4em] text-white/50">
                      VPS · CLOUD · HOSTING
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[oklch(0.82_0.16_85_/_0.3)] bg-[oklch(0.82_0.16_85_/_0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[oklch(0.82_0.16_85)] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[oklch(0.82_0.16_85)]" />
                </span>
                Infrastructure Partner
              </div>

              <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Jetorbit
              </h2>
              <p className="mt-3 text-lg font-medium text-gradient-gold">
                Infrastruktur yang membuat LampungDev tetap mengudara.
              </p>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                Jetorbit menyediakan VPS dan dukungan infrastruktur yang menjadi
                alasan website LampungDev tetap aktif hingga hari ini. Tanpa
                mereka, komunitas ini tidak akan punya rumah online untuk
                bertumbuh.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {["VPS Hosting", "Cloud Server", "Dukungan Komunitas"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="https://www.jetorbit.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 rounded-xl bg-gradient-gold px-6 py-3 text-sm font-semibold text-[oklch(0.18_0.05_60)] shadow-glow-gold transition-all duration-300 hover:scale-[1.03]"
                >
                  Kunjungi Jetorbit
                  <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
                <a
                  href="https://www.jetorbit.com/cloud-vps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Lihat Layanan VPS
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Thank-you ribbon */}
      <p className="mt-6 text-center text-sm text-white/50">
        ❤️ Terima kasih, Jetorbit — atas dukungan yang membuat semua ini mungkin.
      </p>
    </section>
  );
}
