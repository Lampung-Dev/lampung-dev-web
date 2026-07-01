"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function SponsorHero() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pt-6 pb-12 text-center z-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur"
      >
        <Sparkles className="h-3.5 w-3.5 text-gold" />
        Powered by 1 amazing partner
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl"
      >
        Our Sponsors <span className="text-gradient-gold">&amp; Partners</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25 }}
        className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg"
      >
        Terima kasih kepada para sponsor dan partner yang mendukung pertumbuhan
        dan keberlanjutan komunitas LampungDev 🚀
      </motion.p>
    </section>
  );
}
