import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getActiveSponsorsService } from "@/services/sponsor";
import { TSponsor } from "@/lib/database/schema";

export const metadata = {
  title: "Sponsors — LampungDev",
  description:
    "Terima kasih kepada para sponsor dan partner yang mendukung pertumbuhan komunitas LampungDev.",
};

const CATEGORY_INFO: Record<
  string,
  { label: string; sublabel: string; gridCols: string; logoSize: string }
> = {
  HIGH_PRIORITY: {
    label: "⭐ High Priority Sponsors",
    sublabel: "Sponsor utama yang memberikan dukungan terbesar bagi komunitas",
    gridCols: "grid-cols-1 sm:grid-cols-2",
    logoSize: "h-32 md:h-40",
  },
  GOLD: {
    label: "🥇 Gold Sponsors",
    sublabel: "Sponsor tingkat gold yang mendukung kegiatan komunitas",
    gridCols: "grid-cols-2 sm:grid-cols-3",
    logoSize: "h-24 md:h-28",
  },
  SILVER: {
    label: "🥈 Silver Sponsors",
    sublabel: "Sponsor tingkat silver yang turut berkontribusi",
    gridCols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    logoSize: "h-20 md:h-24",
  },
  COMMUNITY_PARTNER: {
    label: "🤝 Community Partners",
    sublabel: "Partner komunitas yang berkolaborasi dengan LampungDev",
    gridCols: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    logoSize: "h-16 md:h-20",
  },
};

function SponsorCard({
  sponsor,
  logoSize,
}: {
  sponsor: TSponsor;
  logoSize: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 flex flex-col items-center text-center transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]">
      {/* Logo */}
      <div
        className={`${logoSize} w-full flex items-center justify-center mb-4`}
      >
        <Image
          src={sponsor.logoUrl}
          alt={sponsor.name}
          width={300}
          height={150}
          className="object-contain max-h-full max-w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          loading="lazy"
        />
      </div>

      {/* Name */}
      <h3 className="text-white font-semibold text-lg mb-1">{sponsor.name}</h3>

      {/* Description */}
      {sponsor.description && (
        <p className="text-gray-400 text-sm leading-relaxed mb-3">
          {sponsor.description}
        </p>
      )}

      {/* Website Link */}
      {sponsor.websiteUrl && (
        <Link
          href={sponsor.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-300 mt-auto"
        >
          <ExternalLink size={14} />
          Kunjungi Website
        </Link>
      )}

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
    </div>
  );
}

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsorsService();

  const grouped: Record<string, TSponsor[]> = {
    HIGH_PRIORITY: [],
    GOLD: [],
    SILVER: [],
    COMMUNITY_PARTNER: [],
  };

  sponsors.forEach((s) => {
    if (grouped[s.category]) {
      grouped[s.category].push(s);
    }
  });

  const hasSponsors = sponsors.length > 0;

  return (
    <div className="min-h-[60vh] py-8">
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Our Sponsors & Partners
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Terima kasih kepada para sponsor dan partner yang mendukung
          pertumbuhan dan keberlanjutan komunitas LampungDev 🚀
        </p>
      </div>

      {!hasSponsors ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">
            Belum ada sponsor saat ini.
          </p>
          <p className="text-gray-600 text-sm">
            Tertarik menjadi sponsor? Hubungi kami melalui{" "}
            <Link
              href="https://www.instagram.com/lampungdevorg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Instagram
            </Link>{" "}
            atau{" "}
            <Link
              href="https://lampungdev.org/join-discord"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Discord
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-16 max-w-6xl mx-auto">
          {Object.entries(grouped).map(([category, categorySponsors]) => {
            if (categorySponsors.length === 0) return null;
            const info = CATEGORY_INFO[category];

            return (
              <section key={category}>
                {/* Category Header */}
                <div className="text-center mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {info.label}
                  </h2>
                  <p className="text-sm text-gray-500">{info.sublabel}</p>
                </div>

                {/* Sponsors Grid */}
                <div className={`grid ${info.gridCols} gap-6`}>
                  {categorySponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.id}
                      sponsor={sponsor}
                      logoSize={info.logoSize}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Become a Sponsor CTA */}
      <div className="text-center mt-20 py-12 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm max-w-2xl mx-auto px-6">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
          Ingin Menjadi Sponsor?
        </h3>
        <p className="text-gray-400 mb-6 leading-relaxed">
          Dukung komunitas developer di Lampung dan dapatkan exposure untuk
          brand kamu. Hubungi kami untuk informasi lebih lanjut.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="https://www.instagram.com/lampungdevorg"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-purple-600 via-red-500 to-yellow-500 hover:from-purple-700 hover:via-red-600 hover:to-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Hubungi via Instagram
          </Link>
          <Link
            href="https://lampungdev.org/join-discord"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
          >
            Hubungi via Discord
          </Link>
        </div>
      </div>
    </div>
  );
}
