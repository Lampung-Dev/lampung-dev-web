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
        <div className="max-w-7xl mx-auto">
            <p>Coming Soon</p>
        </div>
    );
}
