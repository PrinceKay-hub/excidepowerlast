import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Product from "@/pages/product";
import Finder from "@/pages/finder";
import Admin from "@/pages/admin";
import { CartProvider } from "@/context/CartContext";
import { InventoryProvider } from "@/context/InventoryContext";
import { ProductsProvider } from "@/context/ProductsContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";

const queryClient = new QueryClient();

function Shell() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  if (isAdmin) {
    return (
      <Switch>
        <Route path="/admin" component={Admin} />
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/product/:id" component={Product} />
          <Route path="/finder" component={Finder} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <CartDrawer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <ProductsProvider>
            <InventoryProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Shell />
              </WouterRouter>
              <Toaster />
            </InventoryProvider>
          </ProductsProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
