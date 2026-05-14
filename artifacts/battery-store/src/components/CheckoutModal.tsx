import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { placeOrder, OrderData } from "@/lib/orders";
import { sendOrderEmails } from "@/lib/email";
import { useCart } from "@/context/CartContext";
import { CheckCircle, Loader2 } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().min(5, "Enter your street address"),
  city: z.string().min(2, "Enter your city"),
  state: z.string().min(2, "Enter your state"),
  zip: z.string().min(4, "Enter a valid ZIP code"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { state, dispatch, subtotal } = useCart();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [orderId, setOrderId] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  async function onSubmit(values: CheckoutFormValues) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const id = await placeOrder(values as OrderData, state.items, subtotal);
      await sendOrderEmails(values as OrderData, state.items, subtotal, id);
      setOrderId(id);
      setStatus("success");
      dispatch({ type: "CLEAR_CART" });
    } catch (err) {
      setErrorMsg("Failed to place order. Please try again.");
      setStatus("error");
    }
  }

  function handleClose() {
    if (status !== "loading") {
      setStatus("idle");
      setOrderId("");
      setErrorMsg("");
      form.reset();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
            {status === "success" ? "Order Placed!" : "Checkout"}
          </DialogTitle>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center" data-testid="order-success">
            <CheckCircle className="h-16 w-16 text-primary" />
            <p className="text-lg font-semibold">Thank you for your order!</p>
            <p className="text-muted-foreground text-sm">
              Your order has been received and is being processed.
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
              Order ID: {orderId}
            </p>
            <Button className="mt-4 uppercase font-bold" onClick={handleClose} data-testid="button-close-success">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="border border-border rounded-md p-3 bg-muted/30">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2 text-muted-foreground">
                  Order Summary
                </p>
                {state.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm py-0.5">
                    <span className="text-foreground">{item.product.name} × {item.quantity}</span>
                    <span className="text-primary font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold border-t border-border mt-2 pt-2">
                  <span>Total</span>
                  <span className="text-primary">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" data-testid="input-name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" data-testid="input-email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+1 555 000 0000" data-testid="input-phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" data-testid="input-address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Atlanta" data-testid="input-city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="GA" data-testid="input-state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP</FormLabel>
                        <FormControl>
                          <Input placeholder="30301" data-testid="input-zip" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {status === "error" && (
                <p className="text-destructive text-sm" data-testid="text-error">{errorMsg}</p>
              )}

              <Button
                type="submit"
                className="w-full uppercase font-bold text-lg h-12"
                disabled={status === "loading"}
                data-testid="button-place-order"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  `Place Order — $${subtotal.toFixed(2)}`
                )}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
