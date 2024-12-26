import Navbar from "@/components/navbar";
import SpaceCanvas from "@/components/space";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <div className="relative w-full h-screen overflow-x-hidden">
        <SpaceCanvas />
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-center" style={{ top: "64px" }}>
          {children}
        </div>
      </div>
    </>
  );
}
