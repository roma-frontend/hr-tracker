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
  description: "Modern HR Leave Monitoring System for managing vacations, sick leaves, and more. Track employee absences with real-time analytics and intelligent automation.",
  keywords: ["HR software", "leave management", "vacation tracking", "employee monitoring", "HR platform", "absence management"],
  authors: [{ name: "HRLeave Team" }],
  creator: "HRLeave",
  publisher: "HRLeave",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hrleave.com",
    title: "HR Leave Monitor — Smart HR Platform",
    description: "Modern HR Leave Monitoring System for managing vacations, sick leaves, and more. Track employee absences with real-time analytics and intelligent automation.",
    siteName: "HR Leave Monitor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HR Leave Monitor Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HR Leave Monitor — Smart HR Platform",
    description: "Modern HR Leave Monitoring System for managing vacations, sick leaves, and more.",
    images: ["/og-image.png"],
    creator: "@hrleave",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HR Leave Monitor",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "29",
                "priceCurrency": "USD",
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "500",
              },
              "description": "Modern HR Leave Monitoring System for managing vacations, sick leaves, and more. Track employee absences with real-time analytics and intelligent automation.",
            }),
          }}
        />
      </head>
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
