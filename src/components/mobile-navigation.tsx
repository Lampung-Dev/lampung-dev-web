'use client'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";

export default function MobileNavigation({ menuItems }: { menuItems: { title: string; href: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen} >
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 bg-black/95 backdrop-blur-lg border-gray-800">
                    <SheetHeader>
                        <SheetTitle className="text-left">Navigation Menu</SheetTitle>
                        <SheetDescription className="text-left sr-only">
                            Navigate through the website using the links below.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-4 mt-8">
                        <Link href="/login">
                            <Button className="bg-primary">Login</Button>
                        </Link>
                        {menuItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/10"
                            >
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}