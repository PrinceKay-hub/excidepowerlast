import { StockStatus } from "@/lib/inventory";
import { CircleDot } from "lucide-react";

const CONFIG: Record<
  StockStatus,
  { label: string; classes: string; dotClass: string }
> = {
  in_stock: {
    label: "In Stock",
    classes: "bg-green-500/10 text-green-400 border-green-500/30",
    dotClass: "bg-green-400",
  },
  low_stock: {
    label: "Low Stock",
    classes: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    dotClass: "bg-yellow-400",
  },
  out_of_stock: {
    label: "Out of Stock",
    classes: "bg-red-500/10 text-red-400 border-red-500/30",
    dotClass: "bg-red-400",
  },
};

export default function StockBadge({
  status,
  size = "sm",
}: {
  status: StockStatus;
  size?: "sm" | "md";
}) {
  const cfg = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-semibold uppercase tracking-wide rounded-none ${
        size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]"
      } ${cfg.classes}`}
      data-testid={`badge-stock-${status}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}
