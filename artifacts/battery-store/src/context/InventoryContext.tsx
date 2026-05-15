import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToInventory, StockStatus } from "@/lib/inventory";

interface InventoryContextValue {
  inventory: Record<string, StockStatus>;
  getStatus: (productId: string) => StockStatus;
}

const InventoryContext = createContext<InventoryContextValue>({
  inventory: {},
  getStatus: () => "in_stock",
});

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<Record<string, StockStatus>>({});

  useEffect(() => {
    const unsub = subscribeToInventory(setInventory);
    return unsub;
  }, []);

  function getStatus(productId: string): StockStatus {
    return inventory[productId] ?? "in_stock";
  }

  return (
    <InventoryContext.Provider value={{ inventory, getStatus }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  return useContext(InventoryContext);
}
