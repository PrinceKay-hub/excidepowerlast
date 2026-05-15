import { Link } from "wouter";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useInventory } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import StockBadge from "@/components/StockBadge";
import { Zap, ShieldCheck, Eye } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();
  const { getStatus } = useInventory();
  const status = getStatus(product.id);
  const isOutOfStock = status === "out_of_stock";

  return (
    <div
      className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors"
      data-testid={`card-product-${product.id}`}
    >
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square w-full bg-muted p-6 relative cursor-pointer">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-contain object-center mix-blend-multiply transition-transform group-hover:scale-105 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="inline-flex items-center rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
              {product.category}
            </span>
            <StockBadge status={status} size="sm" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="flex items-center gap-1.5 text-white text-sm font-semibold uppercase tracking-wide">
              <Eye className="h-4 w-4" /> View Details
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/product/${product.id}`}>
          <div className="flex justify-between items-start gap-4 cursor-pointer hover:text-primary transition-colors">
            <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
            <p className="text-lg font-bold text-primary flex-shrink-0">${product.price.toFixed(2)}</p>
          </div>
        </Link>

        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-6">
          {product.cca && (
            <div className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border">
              <Zap className="h-3 w-3 text-primary" />
              <span className="font-medium text-foreground">{product.cca} CCA</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-background p-1.5 rounded border border-border">
            <Zap className="h-3 w-3 text-primary" />
            <span className="font-medium text-foreground">{product.voltage}V</span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 bg-background p-1.5 rounded border border-border">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="font-medium text-foreground">{product.warranty} Warranty</span>
          </div>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <Link href={`/product/${product.id}`}>
            <Button
              variant="outline"
              className="w-full font-bold uppercase rounded-none border-border"
              data-testid={`button-view-${product.id}`}
            >
              Details
            </Button>
          </Link>
          <Button
            className="w-full font-bold uppercase rounded-none"
            onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
            disabled={isOutOfStock}
            data-testid={`button-addcart-${product.id}`}
          >
            {isOutOfStock ? "Unavailable" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
}
