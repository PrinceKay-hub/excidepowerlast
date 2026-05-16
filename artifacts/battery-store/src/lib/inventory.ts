import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryEntry {
  productId: string;
  status: StockStatus;
}

export async function setStockStatus(
  productId: string,
  status: StockStatus
): Promise<void> {
  await setDoc(doc(db, "inventory", productId), {
    productId,
    status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToInventory(
  callback: (inventory: Record<string, StockStatus>) => void
) {
  if (!isFirebaseConfigured) {
    callback({});
    return () => {};
  }
  return onSnapshot(collection(db, "inventory"), (snapshot) => {
    const map: Record<string, StockStatus> = {};
    snapshot.docs.forEach((d) => {
      const data = d.data() as { status: StockStatus };
      map[d.id] = data.status;
    });
    callback(map);
  });
}
