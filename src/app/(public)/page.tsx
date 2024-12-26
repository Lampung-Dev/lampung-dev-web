import { auth } from "@/lib/next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {

  const session = await auth();
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col">
        <h1 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative z-20 font-bold tracking-tight">
          LampungDev.org
        </h1>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
          A vibrant tech community connecting and empowering developers in Lampung, Indonesia. We build, learn, and grow together.
        </p>
        <div className="flex space-x-4 text-center w-full justify-center mt-4">
          <Link href="/events" className="mt-4 bg-primary hover:bg-primary/90 text-black cursor-pointer px-8 py-2 rounded-lg">Explore Events</Link>
        </div>
      </div>
    </div>
  );
}