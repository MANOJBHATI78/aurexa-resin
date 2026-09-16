import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { getSettingsCached } from "@/lib/settings";
import { TrackingHead, TrackingBodyStart, TrackingBodyEnd } from "@/components/site/tracking";
import { organizationSchema, websiteSchema, absoluteUrl } from "@/lib/seo";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0b3d2e",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettingsCached();
  return {
    metadataBase: new URL(absoluteUrl("/")),
    title: {
      default: s.siteTitle,
      template: `%s | ${s.brandName}`,
    },
    description: s.siteMetaDescription,
    keywords: s.siteKeywords.split(",").map((k) => k.trim()).filter(Boolean),
    icons: { icon: s.favicon || "/uploads/aurexa-favicon.png" },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: s.brandName,
      title: s.siteTitle,
      description: s.siteMetaDescription,
      images: [{ url: absoluteUrl(s.ogDefaultImage) }],
    },
    twitter: {
      card: "summary_large_image",
      title: s.siteTitle,
      description: s.siteMetaDescription,
      images: [absoluteUrl(s.ogDefaultImage)],
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const s = await getSettingsCached();
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <TrackingHead s={s} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationSchema(s), websiteSchema(s)]),
          }}
        />
      </head>
      <body className={`${cinzel.variable} ${inter.variable} antialiased bg-background text-foreground`}>
        <TrackingBodyStart s={s} />
        {children}
        <TrackingBodyEnd s={s} />
        <Toaster />
      </body>
    </html>
  );
}
