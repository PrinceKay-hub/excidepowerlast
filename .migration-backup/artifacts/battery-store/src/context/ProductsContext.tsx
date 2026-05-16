import { createContext, useContext, useEffect, useState } from "react";
import { Product, subscribeToProducts, seedIfEmpty } from "@/lib/products-db";
import { products as fallback } from "@/data/products";

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextValue>({
  products: fallback,
  loading: false,
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedIfEmpty().catch(() => {});
    const unsub = subscribeToProducts(
      (data) => {
        console.log("Received products data:", data);
        if (data.length > 0) setProducts(data);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
