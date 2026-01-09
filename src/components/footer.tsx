import Link from "next/link";
import { Github } from "lucide-react";
import { FaInstagram, FaDiscord, FaWhatsapp, FaTelegram } from "react-icons/fa";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/lampungdevorg",
    icon: FaInstagram,
  },
  {
    name: "Discord",
    href: "https://lampungdev.org/join-discord",
    icon: FaDiscord,
  },
  {
    name: "WhatsApp",
    href: "https://chat.whatsapp.com/H6NSjCJGwQ09E5TKwW4qvp",
    icon: FaWhatsapp,
  },
  {
    name: "Telegram",
    href: "https://t.me/lampungdevorg",
    icon: FaTelegram,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Copyright */}
          <div className="text-gray-400 text-sm">
            © {currentYear} LampungDev. All rights reserved.
          </div>

          {/* Center: Open Source Badge */}
          <Link
            href="https://github.com/Lampung-Dev/lampung-dev-web"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 group"
          >
            <Github className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
              Open Source
            </span>
          </Link>

          {/* Right: Social Links */}
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
                aria-label={social.name}
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
