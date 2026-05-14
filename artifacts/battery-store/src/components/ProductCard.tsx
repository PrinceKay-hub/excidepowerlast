import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck } from "lucide-react";

export default function ProductCard({ product }: { product: Product }) {
  const { dispatch } = useCart();

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-square w-full bg-muted p-6 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain object-center mix-blend-multiply transition-transform group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="inline-flex items-center rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
            {product.category}
          </span>
        </div>
      </div>
      
      <div className="flex flex-1 flex-col p-5">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
          <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
        </div>
        
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
        
        <div className="mt-auto">
          <Button 
            className="w-full font-bold uppercase" 
            onClick={() => dispatch({ type: "ADD_ITEM", payload: product })}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
