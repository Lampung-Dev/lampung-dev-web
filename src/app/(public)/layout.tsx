import Navbar from "@/components/navbar";
import SpaceCanvas from "@/components/space";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Space background canvas */}
      <div className="fixed inset-0">
        <SpaceCanvas />
      </div>

      {/* Main content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main content area */}
        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="w-full h-full flex items-start justify-center py-8">
            <div className="w-full max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
