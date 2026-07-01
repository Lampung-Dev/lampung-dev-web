"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { TSponsor } from "@/lib/database/schema";
import { ArrowRight } from "lucide-react";

type SponsorsByCategory = {
  HIGH_PRIORITY: TSponsor[];
  GOLD: TSponsor[];
  SILVER: TSponsor[];
  COMMUNITY_PARTNER: TSponsor[];
};

function groupSponsorsByCategory(sponsors: TSponsor[]): SponsorsByCategory {
  return {
    HIGH_PRIORITY: sponsors.filter((s) => s.category === "HIGH_PRIORITY"),
    GOLD: sponsors.filter((s) => s.category === "GOLD"),
    SILVER: sponsors.filter((s) => s.category === "SILVER"),
    COMMUNITY_PARTNER: sponsors.filter((s) => s.category === "COMMUNITY_PARTNER"),
  };
}

function SponsorLogo({
  sponsor,
  size = "md",
}: {
  sponsor: TSponsor;
  size?: "lg" | "md" | "sm";
}) {
  const sizeClasses = {
    lg: "w-48 h-24 md:w-64 md:h-32",
    md: "w-36 h-20 md:w-44 md:h-24",
    sm: "w-28 h-16 md:w-32 md:h-18",
  };

  const content = (
    <motion.div
      className={`${sizeClasses[size]} relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 group cursor-pointer`}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Image
        src={sponsor.logoUrl}
        alt={sponsor.name}
        width={size === "lg" ? 240 : size === "md" ? 160 : 120}
        height={size === "lg" ? 120 : size === "md" ? 80 : 60}
        className="object-contain max-h-full max-w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        loading="lazy"
      />
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
    </motion.div>
  );

  if (sponsor.websiteUrl) {
    return (
      <Link
        href={sponsor.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${sponsor.name} website`}
        className="inline-block"
      >
        {content}
      </Link>
    );
  }

  return content;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function SponsorSection({
  sponsors,
}: {
  sponsors: TSponsor[];
}) {
  if (sponsors.length === 0) return null;

  const grouped = groupSponsorsByCategory(sponsors);
  const hasAnySponsors = Object.values(grouped).some((arr) => arr.length > 0);

  if (!hasAnySponsors) return null;

  return (
    <section className="w-full py-16 mt-12">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Didukung Oleh
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto">
          Terima kasih kepada para sponsor dan partner yang mendukung pertumbuhan komunitas LampungDev
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* High Priority Sponsors */}
        {grouped.HIGH_PRIORITY.length > 0 && (
          <motion.div
            className="flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="flex flex-wrap justify-center gap-6"
              variants={containerVariants}
            >
              {grouped.HIGH_PRIORITY.map((sponsor) => (
                <motion.div key={sponsor.id} variants={itemVariants}>
                  <SponsorLogo sponsor={sponsor} size="lg" />
                  <p className="text-center text-sm text-gray-400 mt-2 font-medium">
                    {sponsor.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Gold Sponsors */}
        {grouped.GOLD.length > 0 && (
          <motion.div
            className="flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-yellow-500/60 mb-4 font-semibold">
              Gold Sponsors
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-5"
              variants={containerVariants}
            >
              {grouped.GOLD.map((sponsor) => (
                <motion.div key={sponsor.id} variants={itemVariants}>
                  <SponsorLogo sponsor={sponsor} size="md" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Silver Sponsors */}
        {grouped.SILVER.length > 0 && (
          <motion.div
            className="flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-gray-500/60 mb-4 font-semibold">
              Silver Sponsors
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              variants={containerVariants}
            >
              {grouped.SILVER.map((sponsor) => (
                <motion.div key={sponsor.id} variants={itemVariants}>
                  <SponsorLogo sponsor={sponsor} size="sm" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Community Partners */}
        {grouped.COMMUNITY_PARTNER.length > 0 && (
          <motion.div
            className="flex flex-col items-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-xs uppercase tracking-widest text-blue-500/60 mb-4 font-semibold">
              Community Partners
            </p>
            <motion.div
              className="flex flex-wrap justify-center gap-3"
              variants={containerVariants}
            >
              {grouped.COMMUNITY_PARTNER.map((sponsor) => (
                <motion.div key={sponsor.id} variants={itemVariants}>
                  <SponsorLogo sponsor={sponsor} size="sm" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Link to dedicated sponsors page */}
      <motion.div
        className="text-center mt-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
      >
        <Link
          href="/sponsors"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-300 group"
        >
          Lihat semua sponsor
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  );
}
