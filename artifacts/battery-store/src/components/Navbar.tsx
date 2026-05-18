import { Link } from "wouter";
import { ShoppingCart, Menu, X, Search, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const { dispatch, totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-primary uppercase">
          
          <img src="/Logo.png" alt="Exide Powerlast Logo" className="h-6 w-auto" />
          <span>YESUDEM POWER BATTERY</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <Link href="/shop" className="transition-colors hover:text-primary">Shop</Link>
          <Link href="/finder" className="transition-colors hover:text-primary flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Battery Finder
          </Link>
          <Link href="/track-order" className="transition-colors hover:text-primary flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" />
            Track Order
          </Link>
          <a href="#about" className="transition-colors hover:text-primary">About</a>
          <a href="#contact" className="transition-colors hover:text-primary">Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/shop" className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 uppercase">
            Shop Now
          </Link>

          <Button variant="ghost" size="icon" className="relative" onClick={() => dispatch({ type: "OPEN_CART" })} data-testid="button-open-cart">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center" data-testid="text-cart-count">
                {totalItems}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col space-y-4">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary">Home</Link>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary">Shop</Link>
          <Link href="/finder" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" /> Battery Finder
          </Link>
          <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary flex items-center gap-1.5">
            <Package className="h-3.5 w-3.5" /> Track Order
          </Link>
          <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary">About</a>
          <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium hover:text-primary">Contact</a>
          <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)}>
            <Button className="w-full uppercase font-bold text-white">Shop Now</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
