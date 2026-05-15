import { useState, useEffect, useCallback } from "react";
import { subscribeToOrders, updateOrderStatus, Order, OrderStatus } from "@/lib/orders";
import { subscribeToInventory, setStockStatus, StockStatus } from "@/lib/inventory";
import { subscribeToProducts, deleteProduct, Product } from "@/lib/products-db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import StockBadge from "@/components/StockBadge";
import ProductFormSheet from "@/components/ProductFormSheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDown,
  ChevronRight,
  Lock,
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Clock,
  TrendingUp,
  Package,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

const ADMIN_PIN = "voltedge2024";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  shipped: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatDate(ts: Order["createdAt"]): string {
  if (!ts) return "—";
  const d =
    typeof ts === "object" && "toDate" in ts
      ? (ts as { toDate: () => Date }).toDate()
      : new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-border rounded-none bg-card p-5 flex items-start gap-4">
      <div className="p-2 bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleStatus(status: OrderStatus) {
    setUpdating(true);
    await onStatusChange(order.id, status);
    setUpdating(false);
  }

  return (
    <>
      <TableRow
        className="cursor-pointer hover:bg-muted/30 border-border"
        onClick={() => setExpanded((e) => !e)}
        data-testid={`row-order-${order.id}`}
      >
        <TableCell className="w-4 text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {order.id.slice(0, 8)}…
        </TableCell>
        <TableCell className="font-medium">{order.customerName}</TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {order.email}
        </TableCell>
        <TableCell className="text-sm">{formatDate(order.createdAt)}</TableCell>
        <TableCell className="font-bold text-primary">
          ${order.subtotal.toFixed(2)}
        </TableCell>
        <TableCell>
          <Badge
            className={`border text-xs uppercase font-semibold tracking-wide rounded-none ${STATUS_COLORS[order.status]}`}
          >
            {order.status}
          </Badge>
        </TableCell>
        <TableCell onClick={(e) => e.stopPropagation()} className="w-40">
          <Select
            value={order.status}
            onValueChange={(v) => handleStatus(v as OrderStatus)}
            disabled={updating}
          >
            <SelectTrigger
              className="h-8 text-xs border-border bg-background rounded-none"
              data-testid={`select-status-${order.id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {(
                [
                  "pending",
                  "processing",
                  "shipped",
                  "delivered",
                  "cancelled",
                ] as OrderStatus[]
              ).map((s) => (
                <SelectItem key={s} value={s} className="text-xs uppercase">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow className="border-border bg-muted/10">
          <TableCell colSpan={8} className="py-4 px-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Shipping Address
                </p>
                <p className="text-sm">{order.address}</p>
                <p className="text-sm">
                  {order.city}, {order.state} {order.zip}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.phone}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                  Items Ordered
                </p>
                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.productName}{" "}
                        <span className="text-muted-foreground">
                          × {item.quantity}
                        </span>
                      </span>
                      <span className="text-primary font-medium">
                        ${item.lineTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-2">
                    <span>Total</span>
                    <span className="text-primary">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function InventoryTab() {
  const [inventory, setInventory] = useState<Record<string, StockStatus>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsub = subscribeToInventory(setInventory);
    return unsub;
  }, []);

  async function handleChange(productId: string, status: StockStatus) {
    setSaving((s) => ({ ...s, [productId]: true }));
    await setStockStatus(productId, status);
    setSaving((s) => ({ ...s, [productId]: false }));
  }

  const inStockCount = products.filter(
    (p) => (inventory[p.id] ?? "in_stock") === "in_stock"
  ).length;
  const lowCount = products.filter(
    (p) => (inventory[p.id] ?? "in_stock") === "low_stock"
  ).length;
  const outCount = products.filter(
    (p) => (inventory[p.id] ?? "in_stock") === "out_of_stock"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Package} label="In Stock" value={String(inStockCount)} sub="available products" />
        <StatCard icon={AlertTriangle} label="Low Stock" value={String(lowCount)} sub="limited availability" />
        <StatCard icon={XCircle} label="Out of Stock" value={String(outCount)} sub="unavailable products" />
      </div>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Product</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Category</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Price</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Current Status</TableHead>
              <TableHead className="text-xs uppercase tracking-widest text-muted-foreground w-52">Update Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status: StockStatus = inventory[product.id] ?? "in_stock";
              const isSaving = saving[product.id];
              return (
                <TableRow
                  key={product.id}
                  className="border-border hover:bg-muted/20"
                  data-testid={`row-inventory-${product.id}`}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted flex items-center justify-center flex-shrink-0 border border-border">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <span className="font-semibold text-sm">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.category}
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StockBadge status={status} size="md" />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={status}
                      onValueChange={(v) => handleChange(product.id, v as StockStatus)}
                      disabled={isSaving}
                    >
                      <SelectTrigger
                        className="h-8 text-xs border-border bg-background rounded-none w-48"
                        data-testid={`select-stock-${product.id}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        <SelectItem value="in_stock" className="text-xs">
                          In Stock
                        </SelectItem>
                        <SelectItem value="low_stock" className="text-xs">
                          Low Stock
                        </SelectItem>
                        <SelectItem value="out_of_stock" className="text-xs">
                          Out of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Changes save instantly to Firestore and update the storefront in real time — no page reload needed.
      </p>
    </div>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProducts(
      (data) => { setProducts(data); setLoading(false); },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  function openAdd() { setEditing(null); setFormOpen(true); }
  function openEdit(p: Product) { setEditing(p); setFormOpen(true); }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await deleteProduct(deleteTarget.id);
    setDeleting(false);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{products.length} product{products.length !== 1 ? "s" : ""} in catalogue</p>
        </div>
        <Button
          className="uppercase font-bold rounded-none gap-2"
          onClick={openAdd}
          data-testid="button-add-product"
        >
          <PlusCircle className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="border border-border">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" /> Loading products…
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground w-14">Image</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Category</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Price</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Voltage</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">CCA</TableHead>
                <TableHead className="text-xs uppercase tracking-widest text-muted-foreground w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="border-border hover:bg-muted/20" data-testid={`row-product-${p.id}`}>
                  <TableCell>
                    <div className="h-10 w-10 bg-muted border border-border flex items-center justify-center">
                      <img src={p.image} alt={p.name} className="h-8 w-8 object-contain" />
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.category}</TableCell>
                  <TableCell className="font-bold text-primary">${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.voltage}V</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.cca ? `${p.cca} A` : "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-none hover:bg-muted"
                        onClick={() => openEdit(p)}
                        data-testid={`button-edit-${p.id}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-none hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(p)}
                        data-testid={`button-delete-${p.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <ProductFormSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        product={editing}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="dark bg-background border-border rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Delete Product?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span> from the storefront. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="rounded-none uppercase"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-none uppercase"
              onClick={confirmDelete}
              disabled={deleting}
              data-testid="button-confirm-delete"
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting…</> : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center dark">
      <div className="border border-border bg-card p-10 w-full max-w-sm flex flex-col items-center gap-6">
        <div className="p-4 bg-primary/10 text-primary">
          <Lock className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold uppercase tracking-tight">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter the admin PIN to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <Input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            autoFocus
            className="rounded-none text-center text-lg tracking-widest"
            data-testid="input-admin-pin"
          />
          {error && (
            <p
              className="text-destructive text-sm text-center"
              data-testid="text-pin-error"
            >
              Incorrect PIN. Try again.
            </p>
          )}
          <Button
            type="submit"
            className="w-full uppercase font-bold rounded-none"
            data-testid="button-admin-unlock"
          >
            Unlock Dashboard
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          Hint: voltedge2024
        </p>
      </div>
    </div>
  );
}

type Tab = "orders" | "inventory" | "products";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("admin_unlocked") === "1"
  );
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!unlocked) return;
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
      setLastRefresh(new Date());
    });
    return unsub;
  }, [unlocked]);

  function handleUnlock() {
    sessionStorage.setItem("admin_unlocked", "1");
    setUnlocked(true);
  }

  const handleStatusChange = useCallback(
    async (id: string, status: OrderStatus) => {
      await updateOrderStatus(id, status);
    },
    []
  );

  if (!unlocked) return <PinGate onUnlock={handleUnlock} />;

  const filtered = orders.filter((o) => {
    const matchesFilter = filter === "all" || o.status === filter;
    const matchesSearch =
      !search ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.email.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalRevenue = orders.reduce((s, o) => s + o.subtotal, 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      <div className="border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-primary font-black text-xl tracking-tight uppercase">
            VoltEdge
          </span>
          <span className="text-muted-foreground text-sm">/ Admin</span>
        </div>
        <div className="flex items-center gap-3 text-muted-foreground text-xs">
          <RefreshCw className="h-3 w-3" />
          Live — updated {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      <div className="px-8 py-6 max-w-screen-xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage orders and inventory in real time.
          </p>
        </div>

        <div className="flex gap-1 border-b border-border">
          {(["orders", "inventory", "products"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-${tab}`}
            >
              {tab === "orders" ? (
                <span className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> Orders
                  {orders.length > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                      {orders.length}
                    </span>
                  )}
                </span>
              ) : tab === "inventory" ? (
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" /> Inventory
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" /> Products
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "orders" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={ShoppingBag} label="Total Orders" value={String(orders.length)} />
              <StatCard icon={DollarSign} label="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
              <StatCard icon={Clock} label="Pending" value={String(pendingCount)} sub="awaiting action" />
              <StatCard icon={TrendingUp} label="Delivered" value={String(deliveredCount)} sub="completed orders" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Search by name, email, or order ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-none max-w-xs"
                data-testid="input-search-orders"
              />
              <Select
                value={filter}
                onValueChange={(v) => setFilter(v as OrderStatus | "all")}
              >
                <SelectTrigger
                  className="w-44 rounded-none border-border"
                  data-testid="select-filter-status"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {(
                    [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ] as OrderStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-border">
              {loading ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground text-sm gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading orders…
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                  <ShoppingBag className="h-8 w-8 opacity-30" />
                  <p className="text-sm">
                    {orders.length === 0
                      ? "No orders yet."
                      : "No orders match your filter."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-4" />
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Order ID</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Customer</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Email</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Date</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Total</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Status</TableHead>
                      <TableHead className="text-xs uppercase tracking-widest text-muted-foreground">Update</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}

        {activeTab === "inventory" && <InventoryTab />}

        {activeTab === "products" && <ProductsTab />}
      </div>
    </div>
  );
}
