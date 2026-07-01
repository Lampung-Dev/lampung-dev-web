"use client";

import { motion } from "framer-motion";
import { Rocket, Instagram, MessageSquare } from "lucide-react";

export default function BecomeSponsorCTA() {
  return (
    <section className="relative mx-auto max-w-3xl px-6 pb-24 z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-[oklch(0.16_0.03_265)]/80 p-8 text-center backdrop-blur-xl sm:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at top, oklch(0.55 0.18 280 / 0.2), transparent 60%)",
          }}
        />

        <div className="relative">
          <Rocket className="mx-auto h-8 w-8 text-gold animate-bounce" />
          <h3 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
            Ingin Menjadi Sponsor?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Dukung komunitas developer di Lampung dan dapatkan exposure untuk brand
            kamu. Hubungi kami untuk informasi lebih lanjut.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/lampungdevorg"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 hover:from-purple-700 hover:via-red-600 hover:to-yellow-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03]"
            >
              <Instagram className="h-4 w-4" />
              Hubungi via Instagram
            </a>
            <a
              href="https://lampungdev.org/join-discord"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              <MessageSquare className="h-4 w-4" />
              Hubungi via Discord
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
