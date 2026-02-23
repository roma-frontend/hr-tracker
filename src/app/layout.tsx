import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/lib/convex";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HR Leave Monitor — Smart HR Platform",
  description: "Modern HR Leave Monitoring System for managing vacations, sick leaves, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
            />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
