import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SparklesText } from "@/components/sparkles-text";
import LampungMap from "@/components/maps/lampung-maps";
import { FaInstagram, FaDiscord, FaWhatsapp, FaTelegram } from "react-icons/fa";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/lampungdevorg",
    icon: FaInstagram,
    hoverColor: "hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600",
  },
  {
    name: "Discord",
    href: "https://lampungdev.org/join-discord",
    icon: FaDiscord,
    hoverColor: "hover:bg-[#5865F2]",
  },
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/H6NSjCJGwQ09E5TKwW4qvp",
    icon: FaWhatsapp,
    hoverColor: "hover:bg-[#25D366]",
  },
  {
    name: "Telegram",
    href: "https://t.me/lampungdevorg",
    icon: FaTelegram,
    hoverColor: "hover:bg-[#0088cc]",
  },
];

export default async function Home() {
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

        {/* Social Media Icons */}
        <div className="flex items-center gap-4 mt-4">
          {socialLinks.map((social) => (
            <Link
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3 rounded-full bg-white/10 text-white transition-all duration-300 ${social.hoverColor} hover:scale-110 hover:shadow-lg`}
              aria-label={social.name}
            >
              <social.icon className="w-6 h-6" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
