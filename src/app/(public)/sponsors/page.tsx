import { getActiveSponsorsService } from "@/services/sponsor";
import SponsorHero from "@/components/sponsors/SponsorHero";
import JetorbitSpotlight from "@/components/sponsors/JetorbitSpotlight";
import ImpactStrip from "@/components/sponsors/ImpactStrip";
import BecomeSponsorCTA from "@/components/sponsors/BecomeSponsorCTA";

export const metadata = {
  title: "Sponsors — LampungDev",
  description:
    "Terima kasih kepada Jetorbit, presenting sponsor LampungDev yang mendukung infrastruktur komunitas developer Lampung.",
  openGraph: {
    title: "Sponsors — LampungDev",
    description:
      "Jetorbit adalah presenting sponsor LampungDev — infrastruktur yang membuat komunitas tetap mengudara.",
    type: "website",
  },
};

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsorsService();
  const jetorbitSponsor = sponsors.find((s) =>
    s.name.toLowerCase().includes("jetorbit")
  );

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[28rem] -z-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, oklch(0.78 0.18 75 / 0.18), transparent 70%)",
        }}
      />

      {/* Hero Header */}
      <SponsorHero />

      {/* Jetorbit Spotlight */}
      <JetorbitSpotlight logoUrl={jetorbitSponsor?.logoUrl} />

      {/* Impact Strip */}
      <ImpactStrip />

      {/* Become a Sponsor CTA */}
      <BecomeSponsorCTA />
    </div>
  );
}
