import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import MobileNavigation from "./mobile-navigation";

import { auth } from "@/lib/next-auth";

const menuItems = [
  { title: "About", href: "/about" },
  { title: "Events", href: "/our-events" },
  { title: "Members", href: "/members" },
  { title: "Contributors", href: "/contributors" },
];

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="fixed top-0 w-full z-20 backdrop-blur-sm bg-black/10 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-xl font-bold">
              <Image
                src="/images/logo.png"
                alt="lampung-dev-logo"
                width={200}
                height={0}
                className="w-36 md:w-48 lg:w-52"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.title}
              </Link>
            ))}

            {session ? (
              <Link href="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90">Login</Button>
              </Link>
            )}
          </div>

          <MobileNavigation menuItems={menuItems} session={session} />
        </div>
      </div>
    </nav>
  );
}
