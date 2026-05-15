import { useParams, Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import StockBadge from "@/components/StockBadge";
import ReviewSection from "@/components/ReviewSection";
import {
  Zap,
  ShieldCheck,
  ChevronLeft,
  Plus,
  Minus,
  CheckCircle2,
  Weight,
  Ruler,
  Battery,
  Tag,
} from "lucide-react";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const { dispatch } = useCart();
  const { getStatus } = useInventory();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);
  const related = products.filter((p) => p.id !== id && p.category === product?.category).slice(0, 3);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl font-bold uppercase">Product not found</p>
        <Link href="/shop">
          <Button variant="outline" className="rounded-none uppercase">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    for (let i = 0; i < qty; i++) {
      dispatch({ type: "ADD_ITEM", payload: product! });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const specs = [
    { icon: Battery, label: "Type", value: product.type },
    { icon: Zap, label: "Voltage", value: `${product.voltage}V` },
    { icon: Zap, label: "CCA", value: product.cca ? `${product.cca} A` : "Deep Cycle" },
    { icon: Battery, label: "Capacity", value: product.capacity },
    { icon: Weight, label: "Weight", value: product.weight },
    { icon: Ruler, label: "Dimensions", value: product.dimensions },
    { icon: ShieldCheck, label: "Warranty", value: product.warranty },
    { icon: Tag, label: "Category", value: product.category },
  ];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-10">
      <Link href="/shop">
        <button
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 uppercase tracking-wide font-medium"
          data-testid="link-back-to-shop"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Shop
        </button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="border border-border bg-card p-10 flex items-center justify-center aspect-square"
          data-testid="img-product"
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1">
                {product.category}
              </span>
              <StockBadge status={getStatus(product.id)} size="md" />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight leading-none mb-2" data-testid="text-product-name">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary" data-testid="text-product-price">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed border-l-2 border-primary pl-4">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {specs.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 bg-muted/30 border border-border px-3 py-2">
                <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-xs text-muted-foreground">{label}:</span>
                <span className="text-xs font-semibold text-foreground truncate">{value}</span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Quantity</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border">
                <button
                  className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  data-testid="button-qty-decrease"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 text-center font-bold" data-testid="text-qty">{qty}</span>
                <button
                  className="h-10 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                  onClick={() => setQty((q) => q + 1)}
                  data-testid="button-qty-increase"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                className="flex-1 uppercase font-bold h-10 text-base transition-all"
                onClick={handleAddToCart}
                disabled={getStatus(product.id) === "out_of_stock"}
                data-testid="button-add-to-cart"
              >
                {getStatus(product.id) === "out_of_stock" ? (
                  "Out of Stock"
                ) : added ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Added to Cart
                  </span>
                ) : (
                  `Add to Cart — $${(product.price * qty).toFixed(2)}`
                )}
              </Button>
            </div>
          </div>

          <div className="border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Fits These Vehicles
            </p>
            <div className="flex flex-wrap gap-2">
              {product.compatibility.map((c) => (
                <span
                  key={c}
                  className="text-xs border border-border bg-muted/30 px-2.5 py-1 font-medium"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-border p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
              Key Features
            </p>
            <ul className="space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-6 border-b border-border pb-4">
            More {product.category} Batteries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/product/${r.id}`}>
                <div
                  className="group border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer flex gap-4 p-4 items-center"
                  data-testid={`card-related-${r.id}`}
                >
                  <div className="h-20 w-20 flex-shrink-0 bg-muted flex items-center justify-center p-2">
                    <img src={r.image} alt={r.name} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{r.name}</p>
                    <p className="text-primary font-bold mt-0.5">${r.price.toFixed(2)}</p>
                    {r.cca && <p className="text-xs text-muted-foreground mt-1">{r.cca} CCA · {r.voltage}V</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ReviewSection productId={product.id} />
    </div>
  );
}
