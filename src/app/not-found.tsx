import { getSettingsCached } from "@/lib/settings";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default async function NotFound() {
  const s = await getSettingsCached();
  return (
    <div className="hero-dark text-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl text-center py-20">
        <p className="font-display text-7xl md:text-8xl font-bold gold-gradient-text">404</p>
        <h1 className="font-display text-2xl md:text-3xl font-bold mt-4">Page Not Found</h1>
        <p className="mt-3 text-cream/70 leading-relaxed">
          The page you are looking for doesn&apos;t exist or may have moved.
          Try searching our resin products or explore the categories below.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="btn-gold">
            <Link href="/"><Home className="h-4 w-4" /> Go Home</Link>
          </Button>
          <Button asChild className="btn-outline-light bg-transparent">
            <Link href="/products"><Search className="h-4 w-4" /> Browse Products</Link>
          </Button>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-cream/60">
          <Link href="/resin" className="hover:text-gold">Resin Categories</Link>
          <Link href="/blog" className="hover:text-gold">Blog</Link>
          <Link href="/about" className="hover:text-gold">About</Link>
          <Link href="/inquiry" className="hover:text-gold">Send Inquiry</Link>
        </div>
      </div>
    </div>
  );
}
