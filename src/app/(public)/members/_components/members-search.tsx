"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function MembersSearch({ initialSearch = "" }: { initialSearch?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialSearch);

    useEffect(() => {
        setQuery(initialSearch);
    }, [initialSearch]);

    const handleSearch = (searchTerm: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (searchTerm.trim()) {
            params.set("search", searchTerm.trim());
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        router.push(`/members?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch(query);
        }
    };

    const handleClear = () => {
        setQuery("");
        handleSearch("");
    };

    return (
        <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
                placeholder="Cari nama, email, atau title anggota..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 pr-24 bg-white/5 border-white/20 focus-visible:ring-primary text-sm"
            />
            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={handleClear}
                    >
                        <X className="w-3.5 h-3.5" />
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => handleSearch(query)}
                >
                    Cari
                </Button>
            </div>
        </div>
    );
}
