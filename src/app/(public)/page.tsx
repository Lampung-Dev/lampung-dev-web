import { auth } from "@/lib/next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SparklesText } from "@/components/sparkles-text";
import LampungMap from "@/components/maps/lampung-maps";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="flex flex-col items-center max-w-3xl mx-auto text-center space-y-8">
        <LampungMap />

        {/* Main Heading */}
        <SparklesText
          text="LampungDev.org"
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary"
          colors={{ first: "#ffffff", second: "#f0880a" }}
          sparklesCount={8}
        />

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-300/80 max-w-2xl leading-relaxed">
          A vibrant tech community connecting and empowering developers in
          Lampung, Indonesia. We build, learn, and grow together.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/our-events"
            className="group bg-white text-black hover:bg-white/90 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
          >
            Explore Events
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/members"
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all"
          >
            Meet Our Members
          </Link>
        </div>
      </div>
    </div>
  );
}
