"use client";

import { motion } from "framer-motion";
import { Server, Wifi, HeartHandshake } from "lucide-react";

const IMPACTS = [
  {
    icon: Server,
    title: "Server Andal",
    desc: "VPS yang menjaga website & layanan komunitas tetap online 24/7.",
  },
  {
    icon: Wifi,
    title: "Akses Cepat",
    desc: "Bandwidth memadai agar member dapat akses tanpa hambatan.",
  },
  {
    icon: HeartHandshake,
    title: "Dukungan Tulus",
    desc: "Komitmen jangka panjang untuk ekosistem developer Lampung.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function ImpactStrip() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-20 z-10">
      <div className="mb-10 text-center">
        <h3 className="text-2xl font-bold text-white sm:text-3xl">Dampak Dukungan</h3>
        <p className="mt-2 text-sm text-white/60">
          Apa yang dukungan Jetorbit aktifkan untuk komunitas
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid gap-6 sm:grid-cols-3"
      >
        {IMPACTS.map(({ icon: Icon, title, desc }) => (
          <motion.div
            key={title}
            variants={cardVariants}
            whileHover={{ y: -5 }}
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur transition-all duration-300 hover:border-[oklch(0.82_0.16_85_/_0.3)] hover:bg-white/[0.05]"
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.82_0.16_85_/_0.12)] text-gold transition-colors duration-300 group-hover:bg-[oklch(0.82_0.16_85_/_0.2)]">
              <Icon className="h-5 w-5" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-white transition-colors duration-300 group-hover:text-gold">
              {title}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
