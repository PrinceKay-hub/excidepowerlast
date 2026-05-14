import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Wrench, ArrowRight, BatteryCharging, CheckCircle2 } from "lucide-react";
import { products } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-zinc-950 py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/20 z-10" />
          {/* Abstract industrial pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>
        
        <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col gap-6">
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide w-fit">
                <Zap className="h-4 w-4 fill-primary" />
                INDUSTRIAL GRADE POWER
              </motion.div>
              
              <motion.h1 variants={fadeInUp} className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white uppercase">
                The Last Battery <br/>
                <span className="text-primary">You'll Ever Need.</span>
              </motion.h1>
              
              <motion.p variants={fadeInUp} className="text-lg leading-8 text-zinc-300">
                VoltEdge builds unyielding, high-performance batteries for automotive, marine, and industrial applications. When failure isn't an option, professionals choose VoltEdge.
              </motion.p>
              
              <motion.div variants={fadeInUp} className="mt-4 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="h-14 px-8 text-base font-bold uppercase tracking-wider">
                  <Link href="/shop">Shop Now</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base font-bold uppercase tracking-wider bg-transparent text-white border-zinc-700 hover:bg-zinc-800 hover:text-white">
                  <a href="#applications">Explore Specs</a>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="border-y border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 lg:justify-between items-center opacity-60 grayscale">
            {/* Generic looking partner logos using text */}
            <div className="text-xl font-black tracking-tighter">MOTORWORKS</div>
            <div className="text-xl font-black tracking-widest uppercase">Apex Marine</div>
            <div className="text-xl font-bold font-serif italic">Ironclad Logistics</div>
            <div className="text-xl font-black uppercase tracking-tight">KINETIC AUTO</div>
            <div className="text-xl font-bold tracking-widest">GRIFFIN</div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
          >
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Maximum Cranking Amps</h3>
              <p className="text-muted-foreground">Engineered with high-density plates to deliver explosive starting power in the harshest sub-zero conditions.</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Vibration Resistant</h3>
              <p className="text-muted-foreground">Reinforced internal components prevent plate separation and structural failure during heavy off-road or marine use.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight mb-3">Maintenance Free</h3>
              <p className="text-muted-foreground">Fully sealed, spill-proof designs mean you install it once and forget about it. Zero water checks required.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Featured Arsenal</h2>
              <p className="text-muted-foreground max-w-2xl">Our top-selling power units, trusted by mechanics and fleet managers.</p>
            </div>
            <Button asChild variant="link" className="text-primary hover:text-primary/80 font-bold uppercase">
              <Link href="/shop" className="flex items-center gap-2">View Full Lineup <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Applications / Categories */}
      <section id="applications" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-center mb-16">Built For Your Domain</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl group min-h-[400px] border border-border">
              <div className="absolute inset-0 bg-zinc-900 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10" />
              </div>
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold uppercase text-white mb-2">Automotive & Truck</h3>
                <p className="text-zinc-300 mb-6 max-w-md">Unrelenting starting power for daily drivers, heavy-duty pickups, and commercial rigs.</p>
                <Button asChild variant="outline" className="w-fit bg-white/10 hover:bg-white/20 text-white border-white/20 uppercase font-bold">
                  <Link href="/shop?category=Car">Shop Auto Batteries</Link>
                </Button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl group min-h-[400px] border border-border">
              <div className="absolute inset-0 bg-zinc-900 z-0">
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent z-10" />
              </div>
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end">
                <h3 className="text-2xl font-bold uppercase text-white mb-2">Marine & Deep Cycle</h3>
                <p className="text-zinc-300 mb-6 max-w-md">Dual-purpose and deep cycle units that power trolling motors and electronics all day long.</p>
                <Button asChild variant="outline" className="w-fit bg-white/10 hover:bg-white/20 text-white border-white/20 uppercase font-bold">
                  <Link href="/shop?category=Marine">Shop Marine Batteries</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Specs Callout */}
      <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
            <div className="flex-1 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-6 text-black">The AGM Advantage</h2>
              <p className="text-lg text-black/80 font-medium mb-8 leading-relaxed">
                Our Elite series utilizes Advanced Absorbent Glass Mat technology. Instead of free-flowing liquid acid, the electrolyte is suspended in fiberglass mats. The result?
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "2x longer cycle life than standard flooded batteries",
                  "100% spill-proof and mountable in virtually any position",
                  "Superior performance in vehicles with start-stop technology",
                  "Faster recharge rates from high-output alternators"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-black shrink-0" />
                    <span className="text-black font-bold">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Button asChild size="lg" className="bg-black text-white hover:bg-black/90 font-bold uppercase h-14 px-8">
                <Link href="/shop?category=Car">Shop AGM Series</Link>
              </Button>
            </div>
            
            <div className="flex-1 relative w-full aspect-square max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-black/5 rounded-full blur-3xl" />
              <div className="relative h-full w-full flex items-center justify-center">
                <BatteryCharging className="w-64 h-64 text-black opacity-90" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 py-16 text-zinc-400 border-t border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-6">
                <Zap className="h-6 w-6 fill-primary text-primary" />
                <span>VOLTEDGE</span>
              </Link>
              <p className="max-w-sm mb-6">
                Premium automotive, marine, and industrial batteries built for extreme conditions and uncompromising reliability.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-4">Products</h4>
              <ul className="space-y-3">
                <li><Link href="/shop?category=Car" className="hover:text-primary transition-colors">Automotive</Link></li>
                <li><Link href="/shop?category=Truck" className="hover:text-primary transition-colors">Commercial Truck</Link></li>
                <li><Link href="/shop?category=Marine" className="hover:text-primary transition-colors">Marine & RV</Link></li>
                <li><Link href="/shop?category=Industrial" className="hover:text-primary transition-colors">Industrial</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-primary transition-colors">Warranty Info</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Battery Finder</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Dealer Portal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; {new Date().getFullYear()} VoltEdge Batteries. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
