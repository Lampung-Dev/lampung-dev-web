import "./globals.css";
import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-providers";
import { Toaster } from "@/components/ui/sonner"
import { AppLoader } from "@/components/app-loader";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
    title: {
        template: "%s | Lampung Dev",
        default: "Lampung Dev",
    },
    description:
        "Membangun ekosistem developer di Lampung melalui kolaborasi, pembelajaran, dan inovasi. Bergabunglah dengan komunitas teknologi terbesar di Provinsi Lampung.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-white`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    <AppLoader>
                        {children}
                    </AppLoader>
                    <Toaster
                        position="top-right"
                    />
                </ThemeProvider>
            </body>
        </html>
    );
}
