import { SparklesText } from "@/components/sparkles-text";
import { auth } from "@/lib/next-auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
    title: "Events",
};

export default async function Events() {
    const session = await auth();
    if (session) {
        redirect('/dashboard')
    }
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <SparklesText
                text="Coming Soon"
                className="text-4xl md:text-6xl lg:text-7xl font-bold"
            />
        </div>
    );
}
