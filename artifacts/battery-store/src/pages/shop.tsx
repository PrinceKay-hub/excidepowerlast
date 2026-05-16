import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useProducts } from "@/context/ProductsContext";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const CATEGORIES = ["All", "Car", "Truck", "Marine", "Industrial"];
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "CCA: High to Low", value: "cca-desc" },
];

export default function Shop() {
  const { products } = useProducts();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const initialCategory = searchParams.get("category") || "All";
  
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) || 
                          product.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || product.category === category;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "cca-desc") return (b.cca || 0) - (a.cca || 0);
    return 0; // featured (default order)
  });

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("featured");
    // reset to dynamic max based on current products
    const max = Math.max(10000, ...products.map((p) => Number(p.price || 0)));
    setPriceRange([0, max]);
  };

  // Ensure the price filter upper bound covers the most expensive product
  useEffect(() => {
    const max = Math.max(10000, ...products.map((p) => Number(p.price || 0)));
    if (priceRange[1] < max) {
      setPriceRange([priceRange[0], max]);
    }
    // only run when products change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  const FilterSidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-bold uppercase tracking-tight mb-4 text-lg">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3 className="font-bold uppercase tracking-tight mb-4 text-lg">Category</h3>
        <div className="space-y-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                category === c 
                  ? "bg-primary text-primary-foreground font-bold" 
                  : "hover:bg-muted font-medium"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-bold uppercase tracking-tight mb-4 text-lg">Price Range</h3>
        <div className="px-2">
          <Slider
            min={0}
            max={10000}
            step={100}
            value={[priceRange[1]]}
            onValueChange={(val) => setPriceRange([0, val[0]])}
            className="mb-6"
          />
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>₵0</span>
            <span className="text-foreground font-bold">₵{priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full uppercase font-bold" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight">The Arsenal</h1>
          <p className="text-muted-foreground mt-2">Professional grade power for every application.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Mobile Filters Trigger */}
          <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden flex-1 uppercase font-bold">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:max-w-xs border-r border-border">
              <SheetHeader className="mb-6">
                <SheetTitle className="uppercase font-black text-2xl text-left">Filters</SheetTitle>
              </SheetHeader>
              <FilterSidebar />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <div className="w-full md:w-48">
            <Label htmlFor="sort" className="sr-only">Sort by</Label>
            <select
              id="sort"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FilterSidebar />
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-xl">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">No batteries found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                We couldn't find any products matching your current filters.
              </p>
              <Button onClick={resetFilters} className="uppercase font-bold">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
