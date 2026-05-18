import { useState } from "react";
import { Package, Search, Loader2, ChevronRight, Clock, CheckCircle2, Truck, XCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOrderById, getOrdersByEmail, Order, OrderStatus } from "@/lib/orders";

type SearchMode = "id" | "email";

const STATUS_STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

const STATUS_META: Record<OrderStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending:    { label: "Order Received",  icon: <Clock className="h-4 w-4" />,        color: "text-yellow-500" },
  processing: { label: "Processing",      icon: <RotateCcw className="h-4 w-4" />,     color: "text-blue-500" },
  shipped:    { label: "Shipped",          icon: <Truck className="h-4 w-4" />,         color: "text-primary" },
  delivered:  { label: "Delivered",        icon: <CheckCircle2 className="h-4 w-4" />,  color: "text-green-500" },
  cancelled:  { label: "Cancelled",        icon: <XCircle className="h-4 w-4" />,       color: "text-destructive" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold uppercase text-xs tracking-wide ${meta.color}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
}

function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-destructive text-sm font-medium">
        <XCircle className="h-4 w-4" /> This order has been cancelled.
      </div>
    );
  }
  const currentIdx = STATUS_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const meta = STATUS_META[step];
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors
                ${done ? "bg-primary border-primary text-white" : "border-border text-muted-foreground bg-background"}`}>
                {meta.icon}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap
                ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                {meta.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-5 mx-1 ${idx < currentIdx ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const date = order.createdAt
    ? new Date((order.createdAt as any).seconds * 1000).toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "—";

  return (
    <div className="border border-border bg-card rounded-none p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Order ID</p>
          <p className="font-mono text-sm font-bold text-foreground">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Placed</p>
          <p className="text-sm font-semibold">{date}</p>
        </div>
      </div>

      <StatusStepper status={order.status} />

      <div className="border-t border-border pt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items Ordered</p>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-foreground">{item.productName} <span className="text-muted-foreground">× {item.quantity}</span></span>
            <span className="font-medium">₵{item.lineTotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 flex justify-between items-center">
        <span className="text-sm font-bold uppercase tracking-wide">Total</span>
        <span className="text-lg font-extrabold text-primary">₵{order.subtotal.toFixed(2)}</span>
      </div>

      <div className="border-t border-border pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Shipping To</p>
        <p className="text-sm text-foreground">
          {order.customerName} — {order.address}, {order.city}, {order.state} {order.zip}
        </p>
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const [mode, setMode] = useState<SearchMode>("id");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [results, setResults] = useState<Order[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const val = query.trim();
    if (!val) return;
    setStatus("loading");
    setResults([]);
    setErrorMsg("");
    try {
      if (mode === "id") {
        const order = await getOrderById(val);
        if (!order) {
          setErrorMsg("No order found with that ID. Please check and try again.");
          setStatus("error");
          return;
        }
        setResults([order]);
      } else {
        const orders = await getOrdersByEmail(val);
        if (orders.length === 0) {
          setErrorMsg("No orders found for that email address.");
          setStatus("error");
          return;
        }
        setResults(orders);
      }
      setStatus("done");
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Package className="h-6 w-6" />
            <h1 className="text-3xl font-extrabold uppercase tracking-tight">Track Your Order</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Enter your order ID or the email used at checkout to see your order status.
          </p>
        </div>

        <div className="border border-border bg-card p-5 space-y-4">
          <div className="flex gap-0 border border-border w-fit">
            <button
              onClick={() => { setMode("id"); setQuery(""); setStatus("idle"); setResults([]); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors
                ${mode === "id" ? "bg-primary text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Order ID
            </button>
            <button
              onClick={() => { setMode("email"); setQuery(""); setStatus("idle"); setResults([]); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors
                ${mode === "email" ? "bg-primary text-white" : "bg-transparent text-muted-foreground hover:text-foreground"}`}
            >
              Email
            </button>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode === "id" ? "e.g. FpY0ggNhzEdQz8xbvtVx" : "e.g. john@example.com"}
              className="flex-1 font-mono text-sm"
              data-testid="input-track-query"
            />
            <Button type="submit" disabled={status === "loading" || !query.trim()} className="uppercase font-bold text-white" data-testid="button-track-search">
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-destructive text-sm" data-testid="text-track-error">{errorMsg}</p>
          )}
        </div>

        {status === "done" && results.length > 0 && (
          <div className="space-y-4">
            {results.length > 1 && (
              <p className="text-sm text-muted-foreground font-medium">
                Found <span className="text-foreground font-bold">{results.length}</span> orders for this email.
              </p>
            )}
            {results.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
