import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const { state, dispatch, subtotal } = useCart();

  return (
    <Sheet open={state.isOpen} onOpenChange={(open) => !open && dispatch({ type: "CLOSE_CART" })}>
      <SheetContent className="w-full sm:max-w-md flex flex-col border-border bg-card">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold uppercase tracking-tight">Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto py-6">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-border bg-muted p-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium">
                      <h3 className="line-clamp-2">{item.product.name}</h3>
                      <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.product.category}</p>
                    
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center gap-2 rounded-md border border-border">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-none"
                          onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.product.id, quantity: item.quantity - 1 } })}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-4 text-center font-medium">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 rounded-none"
                          onClick={() => dispatch({ type: "UPDATE_QUANTITY", payload: { id: item.product.id, quantity: item.quantity + 1 } })}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.product.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="border-t border-border pt-6">
          <div className="flex justify-between text-lg font-bold">
            <p>Subtotal</p>
            <p>${subtotal.toFixed(2)}</p>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Shipping and taxes calculated at checkout.
          </p>
          <div className="mt-6">
            <Button 
              className="w-full uppercase font-bold text-lg h-12" 
              disabled={state.items.length === 0}
            >
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
